const axios = require("axios");
const config = require("../../config/chatbot");
const {
  retrieveKnowledge,
  buildSystemPrompt,
  resolveProductSuggestions,
} = require("../../helpers/chatbotKnowledge");
const { classifyIntent } = require("../../helpers/chatbotIntentRouter");

const activeLLM = config.resolveActiveLLM();
const GREETING_REPLY =
  "Xin chào! Mình là trợ lý AI của Vô Thường. Bạn cần tư vấn laptop, điện thoại hay phụ kiện nào ạ?";

if (!activeLLM) {
  console.warn(
    "⚠️  Chatbot: chưa có OPENROUTER_API_KEY hoặc GROQ_API_KEY. Chatbot sẽ không hoạt động."
  );
} else {
  console.log(
    `✅ Chatbot: ${activeLLM.provider} — model ${activeLLM.model} @ ${activeLLM.chatUrl}` +
      (config.IS_VERCEL ? " (Vercel serverless)" : "")
  );
}

const MAX_MESSAGE_LENGTH = 500;
const SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_SESSIONS = 2000;
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX_REQUESTS = 12;

/** sessionId → { history, lastProductSlugs, lastQuery, at } */
const sessions = new Map();
/** ip → { count, start } */
const rateBuckets = new Map();
let lastSweepAt = 0;

/** Dọn phiên hết hạn và bucket rate-limit cũ (tối đa 1 lần/phút) */
function sweepState(now) {
  if (now - lastSweepAt < 60 * 1000) return;
  lastSweepAt = now;
  for (const [id, s] of sessions) {
    if (now - s.at > SESSION_TTL_MS) sessions.delete(id);
  }
  for (const [ip, b] of rateBuckets) {
    if (now - b.start > RATE_WINDOW_MS) rateBuckets.delete(ip);
  }
}

function getClientIp(req) {
  const fwd = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
  return fwd || req.ip || req.socket?.remoteAddress || "unknown";
}

function isRateLimited(ip, now) {
  const bucket = rateBuckets.get(ip);
  if (!bucket || now - bucket.start > RATE_WINDOW_MS) {
    rateBuckets.set(ip, { count: 1, start: now });
    return false;
  }
  bucket.count += 1;
  return bucket.count > RATE_MAX_REQUESTS;
}

function getSession(sessionId, now) {
  const id = /^[\w-]{1,64}$/.test(String(sessionId || "")) ? sessionId : null;
  if (!id) return { history: [], lastProductSlugs: [], lastQuery: "", at: now };

  let session = sessions.get(id);
  if (!session || now - session.at > SESSION_TTL_MS) {
    if (sessions.size >= MAX_SESSIONS) {
      // Map giữ thứ tự chèn → xoá phiên cũ nhất
      sessions.delete(sessions.keys().next().value);
    }
    session = { history: [], lastProductSlugs: [], lastQuery: "", at: now };
    sessions.set(id, session);
  }
  session.at = now;
  return session;
}

function pushHistory(session, userMessage, reply) {
  session.history.push({ role: "user", content: userMessage });
  session.history.push({ role: "assistant", content: reply });
  if (session.history.length > 10) session.history = session.history.slice(-10);
}

/** Bỏ khối suy luận (<think>…</think>) mà một số model trả kèm */
function cleanModelText(text) {
  return String(text || "")
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .trim();
}

const convertHistoryToOpenAIFormat = (history) =>
  history.slice(-6).map((msg) => ({
    role: msg.role === "user" ? "user" : "assistant",
    content: msg.content,
  }));

async function callLLM(messages) {
  const llm = activeLLM || config.resolveActiveLLM();
  if (!llm) {
    throw new Error(
      config.IS_VERCEL
        ? "Trên Vercel cần GROQ_API_KEY (OPENROUTER localhost không dùng được). Cấu hình trong Environment Variables."
        : "OPENROUTER_API_KEY hoặc GROQ_API_KEY chưa được cấu hình"
    );
  }

  const headers = {
    Authorization: `Bearer ${llm.apiKey}`,
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": "BanHangExpress-Chatbot/1.0",
  };

  if (llm.provider === "openrouter" || llm.provider === "openrouter-local") {
    if (process.env.OPENROUTER_HTTP_REFERER) {
      headers["HTTP-Referer"] = process.env.OPENROUTER_HTTP_REFERER;
    }
    if (process.env.OPENROUTER_APP_TITLE) {
      headers["X-Title"] = process.env.OPENROUTER_APP_TITLE;
    }
  }

  const { data, status } = await axios.post(
    llm.chatUrl,
    {
      model: llm.model,
      messages,
      max_tokens: config.MAX_TOKENS,
      temperature: config.TEMPERATURE,
    },
    {
      headers,
      timeout: config.LLM_TIMEOUT_MS,
      validateStatus: () => true,
    }
  );

  if (status === 403) {
    throw new Error(
      llm.provider === "groq"
        ? "403: Groq từ chối request — kiểm tra GROQ_API_KEY trên Vercel."
        : "403: API từ chối request — kiểm tra OPENROUTER_API_KEY."
    );
  }
  if (status === 404) {
    throw new Error(`404: Không tìm thấy ${llm.chatUrl}`);
  }
  if (status >= 400) {
    const msg =
      data?.error?.message || data?.message || JSON.stringify(data).slice(0, 200);
    throw new Error(`${status}: ${msg}`);
  }

  const choice = data?.choices?.[0];
  const text = cleanModelText(choice?.message?.content);
  if (!text) {
    throw new Error(
      choice?.finish_reason === "length"
        ? "Model hết token trước khi trả lời — tăng CHATBOT_MAX_TOKENS (model reasoning cần ≥ 2000)."
        : "API không trả về nội dung"
    );
  }
  return text;
}

const handleChat = async (req, res) => {
  const started = Date.now();

  try {
    const now = Date.now();
    sweepState(now);

    const { sessionId } = req.body || {};
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({
        error: "Tin nhắn không được để trống.",
      });
    }
    if (message.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        error: "Tin nhắn quá dài.",
        response: `Tin nhắn hơi dài, bạn rút gọn dưới ${MAX_MESSAGE_LENGTH} ký tự giúp mình nhé.`,
      });
    }
    if (isRateLimited(getClientIp(req), now)) {
      return res.status(429).json({
        error: "Quá nhiều yêu cầu.",
        response: "Bạn gửi hơi nhanh rồi, đợi khoảng một phút rồi hỏi tiếp giúp mình nhé.",
      });
    }

    const session = getSession(sessionId, now);

    const intent = classifyIntent(message);
    if (intent === "greeting") {
      pushHistory(session, message, GREETING_REPLY);
      return res.json({ response: GREETING_REPLY, productSuggestions: [] });
    }

    const knowledge = await retrieveKnowledge(message, {
      lastProductSlugs: session.lastProductSlugs,
      lastQuery: session.lastQuery,
    });
    const systemPrompt = buildSystemPrompt(knowledge);

    const messages = [
      { role: "system", content: systemPrompt },
      ...convertHistoryToOpenAIFormat(session.history),
      { role: "user", content: message },
    ];

    const response = await callLLM(messages);

    const productSuggestions =
      knowledge.ragProducts?.length || /\/products\/detail\//i.test(response)
        ? await resolveProductSuggestions(response, knowledge.ragProducts || [])
        : [];

    pushHistory(session, message, response);
    // Ghi nhớ sản phẩm khách vừa thấy để hiểu câu hỏi nối tiếp ("cái thứ 2", "máy đó"…)
    if (productSuggestions.length) {
      session.lastProductSlugs = productSuggestions.map((p) => p.slug).slice(0, 5);
    }
    if (knowledge.searchQuery) session.lastQuery = knowledge.searchQuery;

    return res.json({ response, productSuggestions });
  } catch (error) {
    const elapsed = Date.now() - started;
    const isTimeout =
      error.code === "ECONNABORTED" ||
      /timeout|timed out/i.test(String(error.message || ""));

    console.error("Chatbot error:", error.message || error, `(${elapsed}ms)`);

    let userMessage =
      "Xin lỗi, trợ lý ảo đang gặp sự cố. Vui lòng thử lại sau.";
    if (isTimeout && config.IS_VERCEL) {
      userMessage =
        "Phản hồi quá lâu (Vercel giới hạn ~10 giây). Thử câu hỏi ngắn hơn hoặc kiểm tra GROQ_API_KEY trên Vercel.";
    } else if (
      config.IS_VERCEL &&
      config.isLocalUrl(process.env.OPENROUTER_BASE_URL) &&
      !(process.env.GROQ_API_KEY || "").trim()
    ) {
      userMessage =
        "Chatbot trên Vercel cần GROQ_API_KEY — OPENROUTER localhost không chạy được trên server.";
    }

    return res.status(isTimeout ? 504 : 500).json({
      error: error.message || "Không thể kết nối AI.",
      response: userMessage,
    });
  }
};

module.exports = {
  handleChat,
};

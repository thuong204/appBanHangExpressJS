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
    "⚠️  Chatbot: chưa có GROQ_API_KEY hoặc OPENROUTER (HTTPS). Chatbot sẽ không hoạt động."
  );
} else {
  console.log(
    `✅ Chatbot: ${activeLLM.provider} — model ${activeLLM.model}` +
      (config.IS_VERCEL ? " (Vercel serverless)" : "")
  );
}

const chatHistory = new Map();

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

  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("API không trả về nội dung");
  return text;
}

const handleChat = async (req, res) => {
  const started = Date.now();

  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Tin nhắn không được để trống.",
      });
    }

    let history = chatHistory.get(sessionId) || [];

    const intent = classifyIntent(message);
    if (intent === "greeting") {
      history.push({ role: "user", content: message });
      history.push({ role: "assistant", content: GREETING_REPLY });
      if (history.length > 10) history = history.slice(-10);
      chatHistory.set(sessionId, history);
      return res.json({ response: GREETING_REPLY, productSuggestions: [] });
    }

    const knowledge = await retrieveKnowledge(message);
    const systemPrompt = buildSystemPrompt(knowledge);

    const messages = [
      { role: "system", content: systemPrompt },
      ...convertHistoryToOpenAIFormat(history),
      { role: "user", content: message },
    ];

    const response = await callLLM(messages);

    const productSuggestions =
      knowledge.ragProducts?.length || /\/products\/detail\//i.test(response)
        ? await resolveProductSuggestions(response, knowledge.ragProducts || [])
        : [];

    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: response });
    if (history.length > 10) history = history.slice(-10);
    chatHistory.set(sessionId, history);

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

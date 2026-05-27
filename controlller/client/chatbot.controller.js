const axios = require("axios");
const config = require("../../config/chatbot");
const {
  retrieveKnowledge,
  buildSystemPrompt,
  resolveProductSuggestions,
} = require("../../helpers/chatbotKnowledge");

const apiKey = (config.OPENROUTER_API_KEY || "").trim();
const baseURL = (config.OPENROUTER_BASE_URL || "").replace(/\/$/, "");
const chatUrl = `${baseURL}/chat/completions`;

if (!apiKey) {
  console.warn("⚠️  OPENROUTER_API_KEY chưa cấu hình — chatbot không hoạt động.");
} else {
  const host = baseURL.replace(/^https?:\/\//, "").split("/")[0];
  console.log(`✅ Chatbot RAG: ${host} — model ${config.OPENROUTER_MODEL}`);
}

const chatHistory = new Map();

const convertHistoryToOpenAIFormat = (history) =>
  history.slice(-8).map((msg) => ({
    role: msg.role === "user" ? "user" : "assistant",
    content: msg.content,
  }));

async function callLLM(messages) {
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY chưa được cấu hình");
  }

  const { data, status } = await axios.post(
    chatUrl,
    {
      model: config.OPENROUTER_MODEL,
      messages,
      max_tokens: config.MAX_TOKENS,
      temperature: config.TEMPERATURE,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "BanHangExpress-Chatbot/1.0",
      },
      timeout: 60000,
      validateStatus: () => true,
    }
  );

  if (status === 403) {
    throw new Error(
      "403: API từ chối request. Kiểm tra 9router đang chạy tại localhost:20128."
    );
  }
  if (status === 404) {
    throw new Error(
      `404: Không tìm thấy ${chatUrl}. Kiểm tra OPENROUTER_BASE_URL trong .env.`
    );
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
  try {
    const { message, sessionId } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "Tin nhắn không được để trống.",
      });
    }

    let history = chatHistory.get(sessionId) || [];

    const knowledge = await retrieveKnowledge(message);
    const systemPrompt = buildSystemPrompt(knowledge);

    const messages = [
      { role: "system", content: systemPrompt },
      ...convertHistoryToOpenAIFormat(history),
      { role: "user", content: message },
    ];

    const response = await callLLM(messages);

    const productSuggestions = await resolveProductSuggestions(
      response,
      knowledge.ragProducts || []
    );

    history.push({ role: "user", content: message });
    history.push({ role: "assistant", content: response });
    if (history.length > 10) history = history.slice(-10);
    chatHistory.set(sessionId, history);

    return res.json({ response, productSuggestions });
  } catch (error) {
    console.error("Chatbot error:", error.message || error);
    return res.status(500).json({
      error: error.message || "Không thể kết nối AI.",
      response: "Xin lỗi, trợ lý ảo đang gặp sự cố. Vui lòng thử lại sau.",
    });
  }
};

module.exports = {
  handleChat,
};

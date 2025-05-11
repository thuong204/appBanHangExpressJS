const OpenAI = require("openai");
const config = require("../config/chatbot");

const openai = new OpenAI({
  apiKey: config.OPENAI_API_KEY,
});

// Lưu trữ lịch sử chat
const chatHistory = new Map();

// Hàm xử lý chat với AI
async function handleChat(req, res) {
  try {
    const { message, sessionId } = req.body;

    // Lấy lịch sử chat của session
    let history = chatHistory.get(sessionId) || [];

    // Thêm tin nhắn của user vào lịch sử
    history.push({ role: "user", content: message });

    // Gọi API OpenAI
    const completion = await openai.chat.completions.create({
      model: config.MODEL,
      messages: [
        {
          role: "system",
          content: `Bạn là trợ lý ảo của cửa hàng Vô Thường, chuyên bán các sản phẩm công nghệ.
                    Hãy trả lời ngắn gọn, thân thiện và hữu ích.
                    Nếu không biết câu trả lời, hãy đề nghị liên hệ hotline 1900 1234.`,
        },
        ...history,
      ],
      max_tokens: config.MAX_TOKENS,
      temperature: config.TEMPERATURE,
    });

    // Lấy câu trả lời từ AI
    const aiResponse = completion.choices[0].message.content;

    // Thêm câu trả lời vào lịch sử
    history.push({ role: "assistant", content: aiResponse });

    // Giới hạn lịch sử chat (giữ 10 tin nhắn gần nhất)
    if (history.length > 10) {
      history = history.slice(-10);
    }

    // Cập nhật lịch sử chat
    chatHistory.set(sessionId, history);

    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({
      error: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
    });
  }
}

module.exports = {
  handleChat,
};

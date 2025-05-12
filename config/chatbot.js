// Cấu hình Gemini API
module.exports = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "default",
  MODEL: "gemini-2.0-flash", // Sử dụng model mới nhất của Gemini API
  MAX_TOKENS: 1024, // Giới hạn token đầu ra
  TEMPERATURE: 0.7, // Độ sáng tạo trong câu trả lời (0.0-1.0)
};

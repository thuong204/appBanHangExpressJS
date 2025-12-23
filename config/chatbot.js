// Cấu hình AI Chatbot - Sử dụng Gemma qua Groq API
// Gemma là model mã nguồn mở của Google, miễn phí và nhanh qua Groq
module.exports = {
  // Groq API Key - Đăng ký tại: https://console.groq.com/
  // LƯU Ý: KHÔNG hardcode API key ở đây! Luôn dùng environment variable
  GROQ_API_KEY: process.env.GROQ_API_KEY || "",
  
  // Model - Các model có sẵn trên Groq:
  // llama-3.1-8b-instant (mặc định - rất nhanh, miễn phí)
  // llama-3.1-70b-versatile (mạnh hơn)
  // mixtral-8x7b-32768 (tốt cho tiếng Việt)
  // gemma-7b-it, gemma-2b-it (Gemma models)
  MODEL: "llama-3.1-8b-instant",
  
  // Groq API endpoint
  API_BASE_URL: "https://api.groq.com/openai/v1/chat/completions",
  
  MAX_TOKENS: 1024, // Giới hạn token đầu ra
  TEMPERATURE: 0.7, // Độ sáng tạo trong câu trả lời (0.0-1.0)
};


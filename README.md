# Vô Thường E-Commerce Website

Trang web thương mại điện tử bán điện thoại, laptop và phụ kiện công nghệ. Được xây dựng với Node.js, Express, MongoDB và Pug.

## Tính năng chính

- Hiển thị sản phẩm theo danh mục
- Tìm kiếm sản phẩm
- Giỏ hàng và thanh toán
- Đăng nhập/Đăng ký tài khoản
- Quản lý đơn hàng
- Panel quản trị
- Chatbot trợ lý ảo thông minh

## Chatbot AI (OpenRouter hoặc Groq)

Chatbot gọi API tương thích OpenAI: **ưu tiên [OpenRouter](https://openrouter.ai/)** nếu có `OPENROUTER_API_KEY`; nếu OpenRouter lỗi và có `GROQ_API_KEY` thì **fallback Groq**. Dữ liệu sản phẩm lấy từ MongoDB để bổ sung ngữ cảnh.

### Cấu hình `.env`

```env
# OpenRouter (khuyên dùng — nhiều model, ví dụ DeepSeek)
OPENROUTER_API_KEY=sk-or-v1-...
OPENROUTER_MODEL=deepseek/deepseek-chat-v3-0324
OPENROUTER_HTTP_REFERER=https://your-site.com

# Groq (dự phòng / không dùng OpenRouter)
GROQ_API_KEY=gsk_...
```

Xem thêm biến trong `config/chatbot.js`.

### Tính năng

- Tư vấn sản phẩm theo tin nhắn + truy vấn MongoDB
- Lịch sử hội thoại ngắn (giữ bối cảnh)
- Phản hồi dự phòng khi API lỗi

## Cài đặt và Sử dụng

### Yêu cầu hệ thống

- Node.js (v14+)
- MongoDB
- NPM hoặc Yarn

### Cài đặt

1. Clone repository:

```bash
git clone <repository-url>
cd appBanHangExpressJS
```

2. Cài đặt dependencies:

```bash
npm install
```

3. Tạo file .env với các thông tin cần thiết:
   MONGO_URL=<your-mongodb-connection-string>
   GEMINI_API_KEY=<your-gemini-api-key>

4. Khởi động server:

```bash
npm start
```

### Cấu hình Chatbot

1. Lấy key tại [OpenRouter](https://openrouter.ai/) hoặc [Groq](https://console.groq.com/)
2. Thêm vào `.env` như mục trên
3. Chatbot tích hợp dữ liệu sản phẩm từ MongoDB

## Công nghệ sử dụng

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Frontend**: HTML, CSS, JavaScript, Pug templates
- **AI Services**: OpenRouter (OpenAI SDK) hoặc Groq
- **Authentication**: Passport.js
- **Payment**: (Thêm thông tin nếu có)

## Cấu trúc dự án

```
appBanHangExpressJS/
├── config/             # Cấu hình database, passport, chatbot
├── controlller/        # Controllers cho client và admin
├── middlewares/        # Middlewares cho authentication, authorization
├── models/             # Mongoose models
├── public/             # Static files (CSS, JS, images)
├── routes/             # Routes cho client và admin
├── views/              # Pug templates
└── app.js              # Entry point
```

## Tác giả

- Tran Cong Thuong

## License

MIT

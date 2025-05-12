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

## Chatbot AI với Google Gemini

Hệ thống chatbot thông minh sử dụng Google Gemini API kết hợp với dữ liệu sản phẩm từ MongoDB để tư vấn khách hàng:

### Tính năng của Chatbot

- Tư vấn sản phẩm dựa trên yêu cầu của khách hàng
- Truy vấn thông tin sản phẩm thực tế từ database MongoDB
- Trả lời các câu hỏi về giá cả, thông số kỹ thuật, màu sắc sản phẩm
- Xử lý ngôn ngữ tự nhiên thông qua Google Gemini API
- Hệ thống phản hồi dự phòng thông minh khi API gặp sự cố

### Cách hoạt động

1. Khi người dùng gửi tin nhắn, hệ thống phân tích nội dung tin nhắn
2. Truy vấn MongoDB để tìm sản phẩm phù hợp (theo danh mục, thương hiệu, mức giá)
3. Kết hợp thông tin sản phẩm thực tế với Google Gemini API để tạo phản hồi thông minh
4. Trả về phản hồi được cá nhân hóa dựa trên dữ liệu sản phẩm thực tế

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

Để cấu hình Chatbot với Google Gemini API:

1. Đăng ký Google API Key tại: https://ai.google.dev/
2. Cập nhật API key trong file `.env` hoặc trong `config/chatbot.js`
3. Chatbot sẽ tự động tích hợp với dữ liệu sản phẩm từ MongoDB

## Công nghệ sử dụng

- **Backend**: Node.js, Express.js
- **Database**: MongoDB, Mongoose
- **Frontend**: HTML, CSS, JavaScript, Pug templates
- **AI Services**: Google Gemini API
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

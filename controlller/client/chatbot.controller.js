const axios = require("axios");
const config = require("../../config/chatbot");
const Product = require("../../models/product.model");

// Lưu trữ lịch sử chat
const chatHistory = new Map();

// Hàm để truy vấn dữ liệu sản phẩm từ MongoDB
const getProductsInfo = async (message) => {
  try {
    const lowerMessage = message.toLowerCase();
    let productsData = "";
    let query = {
      // Mặc định chỉ lấy sản phẩm còn hoạt động và chưa bị xóa
      status: "active",
      delete: false,
    };

    // Tạo query dựa trên nội dung tin nhắn
    if (
      lowerMessage.includes("điện thoại") ||
      lowerMessage.includes("phone") ||
      lowerMessage.includes("smartphone")
    ) {
      query.categoryProduct = { $regex: /điện thoại|phone|smartphone/i };
    } else if (
      lowerMessage.includes("laptop") ||
      lowerMessage.includes("máy tính")
    ) {
      query.categoryProduct = { $regex: /laptop|máy tính/i };
    } else if (
      lowerMessage.includes("tai nghe") ||
      lowerMessage.includes("headphone")
    ) {
      query.categoryProduct = { $regex: /tai nghe|headphone/i };
    }

    // Tìm kiếm theo tên sản phẩm
    const productKeywords = lowerMessage.match(
      /(iphone|samsung|xiaomi|oppo|macbook|apple|asus|acer)/gi
    );
    if (productKeywords && productKeywords.length > 0) {
      const regex = new RegExp(productKeywords.join("|"), "i");
      query.title = { $regex: regex };
    }

    // Truy vấn theo mức giá
    if (lowerMessage.includes("giá rẻ") || lowerMessage.includes("giá thấp")) {
      query.price = { $lt: 5000000 };
    } else if (
      lowerMessage.includes("tầm trung") ||
      lowerMessage.includes("giá tầm trung")
    ) {
      query.price = { $gte: 5000000, $lt: 15000000 };
    } else if (
      lowerMessage.includes("cao cấp") ||
      lowerMessage.includes("giá cao")
    ) {
      query.price = { $gte: 15000000 };
    }

    // Truy vấn dữ liệu từ MongoDB - chỉ lấy sản phẩm đang hoạt động và chưa bị xóa
    const products = await Product.find(
      query,
      "title price discountPercentage description variations storage screen"
    )
      .sort({ createdAt: -1 })
      .limit(5);

    // Nếu có kết quả truy vấn, thêm thông tin vào dữ liệu
    if (products && products.length > 0) {
      productsData = "Thông tin sản phẩm liên quan:\n\n";
      products.forEach((product, index) => {
        const discountPrice = product.discountPercentage
          ? Math.round(product.price * (1 - product.discountPercentage / 100))
          : product.price;

        productsData += `${index + 1}. ${product.title}\n`;
        productsData += `   - Giá: ${product.price.toLocaleString("vi-VN")}đ`;

        if (product.discountPercentage) {
          productsData += ` (Giảm ${
            product.discountPercentage
          }%, còn ${discountPrice.toLocaleString("vi-VN")}đ)`;
        }

        productsData += `\n`;

        if (product.storage) {
          productsData += `   - Dung lượng: ${product.storage}\n`;
        }

        if (product.screen) {
          productsData += `   - Màn hình: ${product.screen}\n`;
        }

        if (product.variations && product.variations.length > 0) {
          const colors = product.variations.map((v) => v.color).join(", ");
          productsData += `   - Màu sắc: ${colors}\n`;
        }

        productsData += "\n";
      });
    }

    return { productsData, products };
  } catch (error) {
    console.error("Error querying MongoDB:", error);
    return { productsData: "", products: [] };
  }
};

// Tạo phản hồi dự phòng từ MongoDB khi API không khả dụng
const generateFallbackResponse = (message, productsInfo) => {
  const { productsData, products } = productsInfo;
  const lowerMessage = message.toLowerCase();

  // Nếu không có dữ liệu sản phẩm nào
  if (!products || products.length === 0) {
    if (
      lowerMessage.includes("chào") ||
      lowerMessage.includes("hello") ||
      lowerMessage.includes("hi")
    ) {
      return "Xin chào! Tôi là trợ lý ảo của cửa hàng Vô Thường. Tôi có thể giúp bạn tìm hiểu về các sản phẩm điện thoại, laptop và phụ kiện của chúng tôi. Bạn cần tư vấn về sản phẩm nào?";
    }

    return "Xin lỗi, hiện tại dịch vụ trợ lý ảo đang gặp sự cố. Tuy nhiên, tôi có thể cho bạn biết chúng tôi có nhiều sản phẩm điện thoại, laptop và phụ kiện với đa dạng mẫu mã và giá cả. Bạn có thể ghé thăm website hoặc gọi hotline 1900 1234 để được tư vấn chi tiết hơn.";
  }

  // Nếu có dữ liệu sản phẩm
  let response = "";

  if (lowerMessage.includes("máy tính") || lowerMessage.includes("laptop")) {
    response =
      "Dựa trên yêu cầu của bạn về máy tính, đây là một số sản phẩm phù hợp từ cửa hàng Vô Thường:\n\n";
  } else if (
    lowerMessage.includes("điện thoại") ||
    lowerMessage.includes("smartphone") ||
    lowerMessage.includes("phone")
  ) {
    response =
      "Dựa trên yêu cầu của bạn về điện thoại, đây là một số sản phẩm phù hợp từ cửa hàng Vô Thường:\n\n";
  } else if (
    lowerMessage.includes("tai nghe") ||
    lowerMessage.includes("headphone")
  ) {
    response =
      "Dựa trên yêu cầu của bạn về tai nghe, đây là một số sản phẩm phù hợp từ cửa hàng Vô Thường:\n\n";
  } else if (
    lowerMessage.includes("giá") ||
    lowerMessage.includes("bao nhiêu") ||
    lowerMessage.includes("tiền")
  ) {
    response =
      "Về thông tin giá cả mà bạn quan tâm, đây là một số sản phẩm tại cửa hàng Vô Thường:\n\n";
  } else {
    response =
      "Tôi đã tìm thấy một số sản phẩm có thể phù hợp với nhu cầu của bạn:\n\n";
  }

  response += productsData;
  response +=
    "\nBạn cần thêm thông tin gì về các sản phẩm trên không? Hoặc bạn muốn tôi giới thiệu sản phẩm khác?";

  return response;
};

// Hàm xử lý chat với Gemini API
const handleChat = async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    console.log(req.body);

    // Validate message parameter
    if (!message) {
      return res.status(400).json({
        error: "Tin nhắn không được để trống.",
        response:
          "Xin lỗi, tôi không nhận được tin nhắn của bạn. Vui lòng thử lại.",
      });
    }

    // Lấy lịch sử chat của session
    let history = chatHistory.get(sessionId) || [];

    // Thêm tin nhắn của user vào lịch sử
    history.push({ role: "user", content: message });

    try {
      // Truy vấn thông tin sản phẩm từ MongoDB
      const productsInfo = await getProductsInfo(message);
      const { productsData } = productsInfo;

      // Chuẩn bị prompt cho Gemini
      const systemPrompt =
        "Bạn là trợ lý ảo của cửa hàng Vô Thường, một cửa hàng bán điện thoại và phụ kiện công nghệ. Hãy trả lời thân thiện, ngắn gọn và hữu ích. Nếu được hỏi về thông tin bạn không biết, hãy gợi ý khách hàng liên hệ hotline 1900 1234.";

      // Thêm thông tin sản phẩm vào prompt nếu có
      let contextPrompt = systemPrompt;
      if (productsData) {
        contextPrompt += `\n\nDưới đây là thông tin sản phẩm từ cửa hàng Vô Thường:\n${productsData}`;
      }

      try {
        // Cấu trúc request theo định dạng mới của Gemini API
        const requestData = {
          contents: [
            {
              parts: [
                { text: contextPrompt },
                { text: `Tin nhắn của khách hàng: ${message}` },
              ],
            },
          ],
          generationConfig: {
            temperature: config.TEMPERATURE,
            maxOutputTokens: config.MAX_TOKENS,
          },
        };

        // Gửi request đến Gemini API
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${config.MODEL}:generateContent?key=${config.GEMINI_API_KEY}`;
        const apiResponse = await axios.post(apiUrl, requestData);

        // Xử lý phản hồi từ API
        const response = apiResponse.data.candidates[0].content.parts[0].text;

        // Thêm phản hồi vào lịch sử
        history.push({ role: "assistant", content: response });

        // Giới hạn lịch sử chat (giữ 10 tin nhắn gần nhất)
        if (history.length > 10) {
          history = history.slice(-10);
        }

        // Cập nhật lịch sử chat
        chatHistory.set(sessionId, history);

        res.json({ response });
      } catch (apiError) {
        console.error(
          "Gemini API error:",
          apiError.response?.data || apiError.message
        );

        // Tạo phản hồi dự phòng dựa trên dữ liệu MongoDB khi API lỗi
        const fallbackResponse = generateFallbackResponse(
          message,
          productsInfo
        );

        // Thêm phản hồi dự phòng vào lịch sử
        history.push({ role: "assistant", content: fallbackResponse });

        // Cập nhật lịch sử chat
        chatHistory.set(sessionId, history);

        res.status(200).json({
          response: fallbackResponse,
        });
      }
    } catch (mongoError) {
      console.error("MongoDB error:", mongoError);

      // Trả về thông báo lỗi khi cả MongoDB và API đều lỗi
      const genericResponse =
        "Xin lỗi, dịch vụ trợ lý ảo đang gặp sự cố. Vui lòng thử lại sau hoặc liên hệ hotline 1900 1234 để được hỗ trợ.";

      // Thêm phản hồi vào lịch sử
      history.push({ role: "assistant", content: genericResponse });

      // Cập nhật lịch sử chat
      chatHistory.set(sessionId, history);

      res.status(200).json({
        response: genericResponse,
      });
    }
  } catch (error) {
    console.error("Chatbot error:", error);
    res.status(500).json({
      error: "Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.",
    });
  }
};

module.exports = {
  handleChat,
};

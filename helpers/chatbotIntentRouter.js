/**
 * Định tuyến ý định tin nhắn — quyết định luồng xử lý (RAG sản phẩm / chào hỏi / chung).
 */
function classifyIntent(message) {
  const text = String(message || "").trim().toLowerCase();
  if (!text) return "empty";

  const greetings = /^(chào|xin chào|hello|hi|hey|chao|alo|a lô)\b|^chào bạn|^hi\b|^hello\b/;
  if (greetings.test(text) && text.length < 80) {
    return "greeting";
  }

  const productHints =
    /sản phẩm|mua |giá |bao nhiêu|điện thoại|laptop|iphone|samsung|xiaomi|oppo|macbook|tai nghe|headphone|rẻ |đắt |tầm trung|cao cấp|còn hàng|kho|danh sách|triệu| gaming|so sánh|tư vấn|gợi ý|dưới |trên |tầm /;
  if (productHints.test(text)) {
    return "product";
  }

  return "general";
}

module.exports = { classifyIntent };

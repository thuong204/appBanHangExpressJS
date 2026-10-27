/**
 * Kiến thức tĩnh về cửa hàng cho chatbot (địa chỉ, giờ mở cửa, bảo hành, đổi trả, giao hàng…).
 * Không query DB: lấy từ helpers/siteContent.js (cùng nguồn với các trang chính sách/FAQ trên web,
 * nên bot và website luôn khớp nhau). Thông tin chỉ dành cho bot thì thêm vào CHATBOT_EXTRA.
 */
const { COMPANY, POLICIES, FAQS, STORES, NEWS } = require("./siteContent");

/** Thông tin bổ sung chỉ chatbot dùng (không có trang riêng trên web) */
const CHATBOT_EXTRA = [
  "Hàng chính hãng, nguồn gốc rõ ràng, có hoá đơn.",
  "Trả góp 0% qua thẻ tín dụng (áp dụng theo chương trình).",
  "Kiểm tra hàng trước khi thanh toán khi nhận hàng COD.",
];

/** Chủ đề → từ khoá nhận diện + nội dung lấy từ siteContent */
const TOPICS = [
  { key: "doi-tra", re: /đổi|trả hàng|trả lại|hoàn tiền|hoàn trả|lỗi|1 đổi 1/i, policy: "doi-tra", faq: "Bảo hành & đổi trả" },
  { key: "bao-hanh", re: /bảo hành|sửa|hỏng|hư|tem|mất hoá đơn|mất hóa đơn/i, policy: "bao-hanh", faq: "Bảo hành & đổi trả" },
  { key: "bao-mat", re: /bảo mật|thông tin cá nhân|dữ liệu|xoá tài khoản|xóa tài khoản/i, policy: "bao-mat" },
  { key: "thanh-vien", re: /thành viên|tích điểm|điểm thưởng|hạng|thân thiết|sinh nhật|vip/i, policy: "khach-hang-than-thiet" },
  { key: "thanh-toan", re: /thanh toán|cod|chuyển khoản|qr|payos|trả góp|huỷ đơn|hủy đơn|đặt hàng/i, faq: "Đặt hàng & thanh toán" },
  { key: "giao-hang", re: /giao|ship|vận chuyển|phí ship|phí giao|nhận hàng|nhận được hàng|freeship|mấy ngày/i, faq: "Giao hàng" },
  { key: "tai-khoan", re: /tài khoản|mật khẩu|đăng nhập|đăng ký|otp|google|facebook/i, faq: "Tài khoản" },
  { key: "khuyen-mai", re: /khuyến mãi|ưu đãi|giảm giá|sale|voucher|mã giảm/i, news: "khuyen-mai" },
];

/** HTML chính sách → văn bản gọn, giữ gạch đầu dòng và tiêu đề */
function htmlToText(html) {
  return String(html || "")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gi, "\n**$1**\n")
    .replace(/<li[^>]*>/gi, "\n- ")
    .replace(/<\/(p|ul|ol)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

/** Khối liên hệ — luôn gửi kèm (ngắn) */
const CONTACT_BLOCK = [
  "## Thông tin cửa hàng",
  `- ${COMPANY.name} · Hotline ${COMPANY.hotline} · Email ${COMPANY.email}`,
  `- Giờ mở cửa: ${COMPANY.hours}`,
  ...STORES.map((s) => `- Cửa hàng${s.main ? " chính" : ""}: ${s.name} — ${s.address} (ĐT ${s.phone})`),
  ...CHATBOT_EXTRA.map((line) => `- ${line}`),
  "- Trang chính sách: /policy/doi-tra, /policy/bao-hanh · Câu hỏi thường gặp: /faq · Liên hệ: /contact",
].join("\n");

/** Tóm tắt mọi chính sách — dùng khi câu hỏi chung không rõ chủ đề */
const POLICY_SUMMARY = [
  "## Tóm tắt chính sách",
  ...POLICIES.map((p) => `- ${p.title}: ${p.summary} (chi tiết /policy/${p.slug})`),
].join("\n");

/** Dựng sẵn từng phần theo chủ đề (siteContent là dữ liệu tĩnh → tính 1 lần) */
const TOPIC_SECTIONS = new Map(
  TOPICS.map((t) => {
    const parts = [];
    const policy = t.policy && POLICIES.find((p) => p.slug === t.policy);
    if (policy) parts.push(`## ${policy.title}\n${htmlToText(policy.content)}`);

    const faq = t.faq && FAQS.find((g) => g.group === t.faq);
    if (faq) {
      parts.push(`## Hỏi đáp: ${faq.group}\n${faq.items.map((i) => `- H: ${i.q}\n  Đ: ${i.a}`).join("\n")}`);
    }

    if (t.news) {
      const items = NEWS.filter((n) => n.category === t.news).slice(0, 2);
      if (items.length) {
        parts.push(`## Khuyến mãi đang chạy\n${items.map((n) => `- ${n.title}\n${htmlToText(n.content)}`).join("\n")}`);
      }
    }
    return [t.key, parts];
  })
);

/**
 * Tài liệu cửa hàng cho câu hỏi hiện tại: luôn có khối liên hệ, cộng thêm chính sách/FAQ đúng chủ đề.
 * @param {string} message
 * @returns {string}
 */
function buildStoreInfoDocument(message) {
  const text = String(message || "");
  const seen = new Set();
  const sections = [CONTACT_BLOCK];

  for (const t of TOPICS) {
    if (!t.re.test(text)) continue;
    for (const part of TOPIC_SECTIONS.get(t.key)) {
      // Đổi trả & bảo hành dùng chung nhóm FAQ → tránh lặp
      if (!seen.has(part)) {
        seen.add(part);
        sections.push(part);
      }
    }
  }

  if (sections.length === 1) sections.push(POLICY_SUMMARY);
  return sections.join("\n\n");
}

module.exports = {
  STORE_HOTLINE: COMPANY.hotline,
  buildStoreInfoDocument,
};

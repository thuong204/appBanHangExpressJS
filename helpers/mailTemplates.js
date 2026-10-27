// Mẫu email HTML gửi cho khách. Dùng inline style vì nhiều trình đọc mail bỏ qua <style>.

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
}

/**
 * Email cảm ơn sau khi khách gửi form liên hệ.
 * @param {{fullName: string, subject: string, message: string}} contact
 * @param {{name: string, hotline: string, hotlineTel: string, email: string, address: string, hours: string}} company
 * @param {string} baseUrl địa chỉ website (không có dấu / cuối)
 */
module.exports.contactThankYou = (contact, company, baseUrl) => {
    const name = escapeHtml(contact.fullName)
    const subject = escapeHtml(contact.subject || "Liên hệ chung")
    const message = escapeHtml(contact.message).replace(/\n/g, "<br>")

    return `<!doctype html>
<html lang="vi">
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:#111827;padding:20px 28px;">
            <span style="color:#ffc107;font-size:20px;font-weight:bold;">${escapeHtml(company.name)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <h1 style="margin:0 0 12px;font-size:22px;">Cảm ơn ${name} đã liên hệ!</h1>
            <p style="margin:0 0 16px;font-size:15px;line-height:1.6;color:#374151;">
              Chúng tôi đã nhận được lời nhắn của bạn và sẽ phản hồi trong vòng <strong>24 giờ làm việc</strong>.
              Nếu cần hỗ trợ gấp, bạn có thể gọi hotline <a href="tel:${escapeHtml(company.hotlineTel)}" style="color:#b45309;font-weight:bold;text-decoration:none;">${escapeHtml(company.hotline)}</a>.
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff7db;border-radius:12px;">
              <tr><td style="padding:16px 18px;font-size:14px;line-height:1.6;color:#374151;">
                <div style="font-size:12px;font-weight:bold;text-transform:uppercase;color:#92400e;margin-bottom:6px;">Nội dung bạn đã gửi</div>
                <div><strong>Chủ đề:</strong> ${subject}</div>
                <div style="margin-top:6px;">${message}</div>
              </td></tr>
            </table>
            <p style="margin:24px 0 0;text-align:center;">
              <a href="${baseUrl}/products" style="display:inline-block;background:#ffc107;color:#111827;font-weight:bold;text-decoration:none;padding:12px 24px;border-radius:10px;">Tiếp tục mua sắm</a>
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 28px;background:#f9fafb;font-size:12px;line-height:1.6;color:#6b7280;">
            ${escapeHtml(company.address)}<br>
            Hotline: ${escapeHtml(company.hotline)} · Email: ${escapeHtml(company.email)} · ${escapeHtml(company.hours)}<br>
            Bạn có thể trả lời trực tiếp email này để bổ sung thông tin.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

/**
 * Email admin phản hồi liên hệ của khách, kèm trích dẫn lời nhắn gốc.
 * @param {{fullName: string, subject: string, message: string}} contact
 * @param {string} replyMessage nội dung admin nhập (văn bản thuần)
 */
module.exports.contactReply = (contact, replyMessage, company) => {
    const name = escapeHtml(contact.fullName || "bạn")
    const reply = escapeHtml(replyMessage).replace(/\n/g, "<br>")
    const original = escapeHtml(contact.message).replace(/\n/g, "<br>")

    return `<!doctype html>
<html lang="vi">
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:#111827;padding:20px 28px;">
            <span style="color:#ffc107;font-size:20px;font-weight:bold;">${escapeHtml(company.name)}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;font-size:15px;line-height:1.7;color:#374151;">
            <p style="margin:0 0 14px;">Xin chào ${name},</p>
            <div style="margin:0 0 20px;">${reply}</div>
            <p style="margin:0;">Trân trọng,<br><strong>${escapeHtml(company.name)}</strong></p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-left:3px solid #e5e7eb;">
              <tr><td style="padding:4px 0 4px 14px;font-size:13px;color:#6b7280;">
                <div style="font-weight:bold;margin-bottom:4px;">Lời nhắn của bạn${contact.subject ? ` · ${escapeHtml(contact.subject)}` : ""}</div>
                ${original}
              </td></tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:18px 28px;background:#f9fafb;font-size:12px;line-height:1.6;color:#6b7280;">
            ${escapeHtml(company.address)}<br>
            Hotline: ${escapeHtml(company.hotline)} · Email: ${escapeHtml(company.email)}<br>
            Bạn có thể trả lời trực tiếp email này nếu cần hỗ trợ thêm.
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

const Contact = require("../../models/contact.model");
const paginationHelpers = require("../../helpers/pagination");
const sendMailHelper = require("../../helpers/sendmail");
const mailTemplates = require("../../helpers/mailTemplates");
const { COMPANY } = require("../../helpers/siteContent");
const systemConfig = require("../../config/system");

const STATUSES = {
  new: "Mới",
  read: "Đã xem",
  replied: "Đã phản hồi",
};

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// [GET] /admin/contacts
module.exports.index = async (req, res) => {
  const type = req.query.type === "newsletter" ? "newsletter" : "contact";
  const status = STATUSES[req.query.status] ? req.query.status : "";
  const keyword = String(req.query.keyword || "").trim();

  const find = { type };
  if (type === "contact" && status) find.status = status;
  if (keyword) {
    const regex = new RegExp(escapeRegex(keyword), "i");
    find.$or = [{ fullName: regex }, { email: regex }, { phone: regex }, { message: regex }];
  }

  const [total, counts] = await Promise.all([
    Contact.countDocuments(find),
    Contact.aggregate([
      { $group: { _id: { type: "$type", status: "$status" }, count: { $sum: 1 } } },
    ]),
  ]);

  const stats = { contact: 0, newsletter: 0, new: 0, read: 0, replied: 0 };
  counts.forEach(({ _id, count }) => {
    if (_id.type === "newsletter") {
      stats.newsletter += count;
    } else {
      stats.contact += count;
      if (stats[_id.status] !== undefined) stats[_id.status] += count;
    }
  });

  const pagination = paginationHelpers({ currentPage: 1, limitItems: 15 }, req.query, total);
  const items = await Contact.find(find)
    .sort({ createdAt: -1 })
    .skip(pagination.skip)
    .limit(pagination.limitItems)
    .lean();

  res.render("admin/pages/contacts/index", {
    pageTitle: type === "newsletter" ? "Đăng ký nhận tin" : "Liên hệ khách hàng",
    items,
    type,
    status,
    keyword,
    stats,
    statuses: STATUSES,
    pagination,
  });
};

// [GET] /admin/contacts/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, type: "contact" });
    if (!contact) {
      req.flash("Error", "Không tìm thấy liên hệ");
      return res.redirect(`${systemConfig.prefixAdmin}/contacts`);
    }
    // Mở xem lần đầu thì chuyển sang "Đã xem"
    if (contact.status === "new") {
      contact.status = "read";
      contact.readAt = new Date();
      await contact.save();
    }
    res.render("admin/pages/contacts/detail", {
      pageTitle: `Liên hệ từ ${contact.fullName || contact.email}`,
      contact,
      statuses: STATUSES,
    });
  } catch (error) {
    console.error("Admin contact detail error:", error);
    req.flash("Error", "Không tải được liên hệ");
    res.redirect(`${systemConfig.prefixAdmin}/contacts`);
  }
};

// [POST] /admin/contacts/reply/:id — gửi email phản hồi cho khách
module.exports.reply = async (req, res) => {
  const back = `${systemConfig.prefixAdmin}/contacts/detail/${req.params.id}`;
  const message = String(req.body.message || "").trim();
  if (!message) {
    req.flash("Error", "Vui lòng nhập nội dung phản hồi");
    return res.redirect(back);
  }

  const contact = await Contact.findOne({ _id: req.params.id, type: "contact" }).catch(() => null);
  if (!contact) {
    req.flash("Error", "Không tìm thấy liên hệ");
    return res.redirect(`${systemConfig.prefixAdmin}/contacts`);
  }

  try {
    await sendMailHelper.sendMailAsync(
      contact.email,
      `Phản hồi từ ${COMPANY.name}${contact.subject ? `: ${contact.subject}` : ""}`,
      mailTemplates.contactReply(contact, message, COMPANY)
    );
  } catch (error) {
    console.error("Admin contact reply mail error:", error.message);
    req.flash(
      "Error",
      error.code === "EAUTH"
        ? "Không gửi được email: tài khoản Gmail (EMAIL_USER/EMAIL_PASS) bị từ chối đăng nhập."
        : "Không gửi được email phản hồi, vui lòng thử lại."
    );
    return res.redirect(back);
  }

  contact.status = "replied";
  contact.reply = {
    message,
    repliedAt: new Date(),
    account_id: res.locals.user ? String(res.locals.user._id) : "",
    accountName: res.locals.user ? res.locals.user.fullName : "",
  };
  await contact.save();
  req.flash("Success", `Đã gửi phản hồi tới ${contact.email}`);
  res.redirect(back);
};

// [PATCH] /admin/contacts/change-status/:id
module.exports.changeStatus = async (req, res) => {
  const status = req.body.status;
  if (!STATUSES[status]) {
    req.flash("Error", "Trạng thái không hợp lệ");
    return res.redirect("back");
  }
  await Contact.updateOne({ _id: req.params.id, type: "contact" }, { status });
  req.flash("Success", "Cập nhật trạng thái thành công");
  res.redirect("back");
};

// [DELETE] /admin/contacts/delete/:id
module.exports.deleteItem = async (req, res) => {
  try {
    const item = await Contact.findByIdAndDelete(req.params.id);
    req.flash("Success", "Đã xoá");
    const type = item && item.type === "newsletter" ? "?type=newsletter" : "";
    res.redirect(`${systemConfig.prefixAdmin}/contacts${type}`);
  } catch (error) {
    console.error("Admin contact delete error:", error);
    req.flash("Error", "Xoá thất bại");
    res.redirect("back");
  }
};

// [GET] /admin/contacts/export-newsletter — tải danh sách email nhận tin (CSV)
module.exports.exportNewsletter = async (req, res) => {
  const items = await Contact.find({ type: "newsletter" }).sort({ createdAt: -1 }).lean();
  const rows = [["Email", "Ngày đăng ký"]].concat(
    items.map((item) => [item.email, new Date(item.createdAt).toISOString()])
  );
  // Bọc ngoặc kép, nhân đôi ngoặc kép bên trong; chặn công thức Excel (=, +, -, @)
  const cell = (v) => `"${String(v || "").replace(/^[=+\-@]/, "'$&").replace(/"/g, '""')}"`;
  const csv = "﻿" + rows.map((r) => r.map(cell).join(",")).join("\r\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="dang-ky-nhan-tin.csv"');
  res.send(csv);
};

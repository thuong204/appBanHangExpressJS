const Contact = require("../../models/contact.model")
const sendMailHelper = require("../../helpers/sendmail")
const mailTemplates = require("../../helpers/mailTemplates")
const {
    COMPANY,
    NEWS,
    NEWS_CATEGORIES,
    POLICIES,
    FAQS,
    STORES,
    JOBS,
} = require("../../helpers/siteContent")

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
}

function formatNewsDate(date) {
    return new Date(date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

function decorateNews(item) {
    const category = NEWS_CATEGORIES.find(c => c.slug === item.category)
    return { ...item, categoryTitle: category ? category.title : "", dateText: formatNewsDate(item.date) }
}

const sortedNews = () => [...NEWS].sort((a, b) => new Date(b.date) - new Date(a.date)).map(decorateNews)

// [GET] /news
module.exports.news = (req, res) => {
    const category = NEWS_CATEGORIES.find(c => c.slug === req.query.category)
    const list = sortedNews().filter(item => !category || item.category === category.slug)
    res.render("clients/pages/site/news", {
        pageTitle: "Tin tức",
        newsList: list,
        newsCategories: NEWS_CATEGORIES,
        currentCategory: category ? category.slug : "",
    })
}

// [GET] /news/:slug
module.exports.newsDetail = (req, res) => {
    const all = sortedNews()
    const article = all.find(item => item.slug === req.params.slug)
    if (!article) {
        return res.redirect("/news")
    }
    res.render("clients/pages/site/news-detail", {
        pageTitle: article.title,
        article,
        relatedNews: all.filter(item => item.slug !== article.slug).slice(0, 3),
    })
}

// [GET] /contact
module.exports.contact = (req, res) => {
    res.render("clients/pages/site/contact", {
        pageTitle: "Liên hệ",
        company: COMPANY,
    })
}

// [POST] /contact
module.exports.contactPost = async (req, res) => {
    const fullName = String(req.body.fullName || "").trim()
    const email = String(req.body.email || "").trim()
    const phone = String(req.body.phone || "").trim()
    const subject = String(req.body.subject || "").trim()
    const message = String(req.body.message || "").trim()

    if (!fullName || !message || !EMAIL_RE.test(email)) {
        req.flash("Error", "Vui lòng nhập họ tên, email hợp lệ và nội dung liên hệ.")
        return res.redirect("/contact")
    }

    try {
        await Contact.create({ type: "contact", fullName, email, phone, subject, message })
        if (process.env.EMAIL_USER) {
            sendMailHelper.sendMail(
                process.env.EMAIL_USER,
                `[Liên hệ] ${subject || "Khách hàng gửi liên hệ"}`,
                `<p><b>Họ tên:</b> ${escapeHtml(fullName)}</p>
<p><b>Email:</b> ${escapeHtml(email)}</p>
<p><b>Số điện thoại:</b> ${escapeHtml(phone)}</p>
<p><b>Nội dung:</b></p><p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>`
            )
            // Email cảm ơn gửi cho khách (gửi nền, lỗi chỉ ghi log trong sendmail.js)
            const baseUrl = (process.env.BASE_URL || `${req.protocol}://${req.get("host")}`).replace(/\/$/, "")
            sendMailHelper.sendMail(
                email,
                `${COMPANY.name} đã nhận được liên hệ của bạn`,
                mailTemplates.contactThankYou({ fullName, subject, message }, COMPANY, baseUrl)
            )
        }
        req.flash("Success", "Cảm ơn bạn! Chúng tôi đã gửi email xác nhận và sẽ phản hồi trong thời gian sớm nhất.")
    } catch (error) {
        console.log(error)
        req.flash("Error", "Không gửi được liên hệ, vui lòng thử lại sau.")
    }
    res.redirect("/contact")
}

// [POST] /newsletter
module.exports.newsletterPost = async (req, res) => {
    const email = String(req.body.email || "").trim()
    const back = req.get("Referer") || "/"
    if (!EMAIL_RE.test(email)) {
        req.flash("Error", "Email không hợp lệ.")
        return res.redirect(back)
    }
    try {
        const exists = await Contact.exists({ type: "newsletter", email })
        if (!exists) {
            await Contact.create({ type: "newsletter", email })
        }
        req.flash("Success", "Đăng ký nhận tin thành công!")
    } catch (error) {
        console.log(error)
        req.flash("Error", "Không đăng ký được, vui lòng thử lại sau.")
    }
    res.redirect(back)
}

// [GET] /about
module.exports.about = (req, res) => {
    res.render("clients/pages/site/about", {
        pageTitle: "Giới thiệu",
        company: COMPANY,
    })
}

// [GET] /stores
module.exports.stores = (req, res) => {
    res.render("clients/pages/site/stores", {
        pageTitle: "Hệ thống cửa hàng",
        stores: STORES,
        company: COMPANY,
    })
}

// [GET] /careers
module.exports.careers = (req, res) => {
    res.render("clients/pages/site/careers", {
        pageTitle: "Tuyển dụng",
        jobs: JOBS,
        company: COMPANY,
    })
}

// [GET] /faq
module.exports.faq = (req, res) => {
    res.render("clients/pages/site/faq", {
        pageTitle: "Câu hỏi thường gặp",
        faqs: FAQS,
        company: COMPANY,
    })
}

// [GET] /policy/:slug
module.exports.policy = (req, res) => {
    const policy = POLICIES.find(p => p.slug === req.params.slug)
    if (!policy) {
        return res.redirect(`/policy/${POLICIES[0].slug}`)
    }
    res.render("clients/pages/site/policy", {
        pageTitle: policy.title,
        policy,
        policies: POLICIES,
        company: COMPANY,
    })
}

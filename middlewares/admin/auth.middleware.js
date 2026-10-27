const Account = require("../../models/accounts.model")
const Role = require("../../models/roles.model")
const systemConfig = require("../../config/system")
const Contact = require("../../models/contact.model")
module.exports.requireAuth = async (req, res, next) => {
    if (!req.cookies.token) {
        res.redirect(`${systemConfig.prefixAdmin}/auth/login`)
    }
    else {
        const user = await Account.findOne({ token: req.cookies.token })
        if (!user) {
            res.redirect(`${systemConfig.prefixAdmin}/auth/login`)
        }
        else {
            const role = await Role.findOne({_id: user.role_id}).select("title permissions")
            res.locals.role = role
            res.locals.user = user
            // Số liên hệ mới, hiện badge ở menu "Liên hệ"
            res.locals.newContactCount = await Contact.countDocuments({ type: "contact", status: "new" }).catch(() => 0)
            next()
        }
    }
}
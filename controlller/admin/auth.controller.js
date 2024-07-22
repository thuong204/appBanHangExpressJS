const Account = require("../../models/accounts.model")
const Role = require("../../models/roles.model")
const systemConfig = require("../../config/system")
module.exports.login = async (req, res) => {
    // if (req.cookies.token) {
    //     const user = await Account.findOne({ token: req.cookies.token })
    //     if (user) {
    //         res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
    //     } 
    // } else {
        res.render("admin/pages/auth/login", {
            pageTitle: "Login"
        })
    // }

}
module.exports.loginPost = async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const user = await Account.findOne({
        email: email,
        deleted: false
    })
    if (!user) {
        req.flash("Error", "Email không tồn tại")
        res.redirect("back")
        return
    }
    if (password != user.password) {
        req.flash("Error", "Sai mật khẩu!")
        res.redirect("back")
        return
    }
    if (user.status != "active") {
        req.flash("Error", "Tài khoản đã bị khóa")
        res.redirect("back")
        return
    }
    res.cookie("token", user.token)
    res.redirect(`${systemConfig.prefixAdmin}/dashboard`)
}
module.exports.logout = (req, res) => {
    res.clearCookie("token")
    res.redirect(`${systemConfig.prefixAdmin}/auth/login`)
}
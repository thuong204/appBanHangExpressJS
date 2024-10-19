const User = require("../../models/users.model")
const ForgotPassword = require("../../models/forgot-password.model")
const generate = require("../../helpers/generate")
const sendMailHelper = require("../../helpers/sendmail")
const Cart = require("../../models/carts.model")
module.exports.register = async (req, res) => {
    res.render("clients/pages/users/register")

}
module.exports.login = async (req, res) => {
    res.render("clients/pages/users/login")

}
module.exports.logout = async (req, res) => {
    res.clearCookie("tokenUser")
    res.clearCookie("cartId")
    res.redirect("/")
}
module.exports.registerPost = async (req, res) => {
    const existEmail = await User.findOne({
        email: req.body.email,
        deleted: false
    })
    if (existEmail) {
        req.flash("Error", "Email đã tồn tại")
        res.redirect("back")
    }
    else {
        const user = new User(req.body)
        await user.save()
        req.flash("Success", "Đăng kí tài khoản thành công")
        res.redirect("/user/login")

    }


}
module.exports.loginPost = async (req, res) => {
    const existEmail = await User.findOne({
        email: req.body.email,
        deleted: false
    })
    if (!existEmail) {
        req.flash("Error", "Email không chính xác")
        res.redirect("back")
    }
    else {
        const user = await User.findOne({
            email: req.body.email,
            password: req.body.password
        })
        if (user) {
            if (user.status == "inactive") {
                req.flash("Tài khoản đã bị khóa")
            }
            else {
                res.cookie("tokenUser", user.userToken)
                
                res.redirect("/")
            }

        }
        else {
            req.flash("Error", "Mật khẩu không chính xác")
            res.redirect("back")

        }
    }
}
module.exports.forgot = (req, res) => {
    res.render("clients/pages/users/forgot-password", {
        pageTitle: "Lấy lại mật khẩu"
    })
}
module.exports.forgotPost = async (req, res) => {
    const email = req.body.email
    const user = await User.findOne({
        email: email,
        deleted: false
    })
    if (!user) {
        req.flash("Error", "Email không tồn tại. Vui lòng thử lại.")
        res.redirect("back")
        return;
    }
    const objectForgotPassword = {
        email: email,
        otp: "",
        expireAt: Date.now()
    }
    objectForgotPassword.otp = generate.generateRandomNumber(4)
    const forgotPassword = new ForgotPassword(objectForgotPassword)
    await forgotPassword.save()

    //send email
    const subject = `Mã OTP xác minh lấy lại mật khẩu`
    const html = `
        Mã OTP xác minh lấy lại mật khẩu là <b> ${objectForgotPassword.otp} </b>. Lưu ý không để lộ mã OTP. Thời hạn sử dụng mã là 3 phút
    `

    sendMailHelper.sendMail(email, subject, html)
    res.redirect(`/user/password/otp?email=${email}`)
}
module.exports.otpPassword = async (req, res) => {
    const email = req.query.email
    res.render("clients/pages/users/otp-password", {
        pageTitle: "Nhạp mã OTP",
        email: email
    })
}
module.exports.otpPasswordPost = async (req, res) => {
    const email = req.body.email
    const otp = req.body.otp
    const forgotPassword = await ForgotPassword.findOne({
        email: email,
        otp: otp
    })
    if (!forgotPassword) {
        req.flash("Error", "OTP không hợp lệ hoặc đã hết hạn.")
        res.redirect("back")
        return;
    }
    const user = await User.findOne({
        email: email
    })
    res.cookie("tokenUser", user.userToken)
    res.redirect("/user/password/reset")
}
module.exports.resetPassword = (req, res) => {
    res.render("clients/pages/users/reset-password")
}
module.exports.resetPasswordPost = async (req, res) => {
    const password = req.body.password
    await User.updateOne({
        userToken: req.cookies.tokenUser
    }, {
        password: password
    })
    req.flash("Success", "Thay đổi mật khẩu thành công")
    res.redirect("/")
}

module.exports.info = (req, res) => {
    res.render("clients/pages/users/info", {
        pageTitle: "Thông tin cá nhân"
    })
}
module.exports.loginSuccessGoogle = async(req,res) =>{

    if (req.user) {
        if (req.user.status == "inactive") {
            req.flash("Tài khoản đã bị khóa")
        }
        else {
            res.cookie("tokenUser", req.user.userToken)
            
            res.redirect("/")
        }

    }else{
        res.redirect("/user/login")

    }

   

}
module.exports.loginSuccessFacebook = async(req,res) =>{
    if (req.user) {
        if (req.user.status == "inactive") {
            req.flash("Tài khoản đã bị khóa")
        }
        else {
            res.cookie("tokenUser", req.user.userToken)
            res.redirect("/")
        }

    }else{
        res.redirect("/user/login")

    }

   

}
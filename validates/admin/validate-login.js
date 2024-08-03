const validateEmail = require("../admin/validate-email")
const validatePassword = require("../admin/validate-password")
module.exports.validateLogin = (req,res,next) =>{
    if(!req.body.email){
        req.flash("Error","Vui lòng nhập email")
        res.redirect("back")
        return 
    }
    if(!req.body.password){
        req.flash("Error","Vui lòng nhập mật khẩu")
        res.redirect("back")
        return 
    }
    if(!validateEmail.validateEmail(req.body.email)){
        req.flash("Error","Email không hợp lệ")
        res.redirect("back")
        return 
    }
    next()

}
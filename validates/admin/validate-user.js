const validateEmail = require("../admin/validate-email")
const validatePassword = require("../admin/validate-password")
const validatePhoneNumber = require("../admin/validate-phone")
module.exports.validateRegister = (req,res,next) =>{
    if(!req.body.fullName){
        req.flash("Error","Vui lòng nhập họ tên")
        res.redirect("back")
        return 
    }
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
    }if(!validatePassword.validatePassword(req.body.password)){
        req.flash("Error","Mật khẩu không hợp lệ")
        res.redirect("back")
        return 
    }
    if(!validatePhoneNumber.validatePhoneNumber(req.body.phone)){
        req.flash("Error","Số điện thoại không hợp lệ")
        res.redirect("back")
        return 
    }
    next()

}
module.exports.resetPassword = (req,res,next) =>{
    if(!req.body.password){
        req.flash("Error","Mật khẩu không được để trống")
        res.redirect("back")
        return
    }
    if(!req.body.confirmpassword){
        req.flash("Error","Vui lòng nhập xác nhận mật khẩu")
        res.redirect("back")
        return
    }
    if(!validatePassword.validatePassword(req.body.password)){
        req.flash("Error","Mật khẩu quá dễ")
        res.redirect("back")
        return 
    }
    if(req.body.password != req.body.confirmpassword){
        req.flash("Error","Mật khẩu phải giống xác nhận mật khẩu")
        res.redirect("back")
        return
    }
    next()

}
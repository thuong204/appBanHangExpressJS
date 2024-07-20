const validateEmail = require("../admin/validate-email")
const validatePassword = require("../admin/validate-password")
module.exports.createPost = (req,res,next) =>{
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
    next()

}
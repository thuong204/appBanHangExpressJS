const Account = require("../../models/accounts.model")
const Role = require("../../models/roles.model")

module.exports.index = (req,res) =>{
    res.render("admin/pages/my-account/index")
}
module.exports.edit = async (req,res) =>{
    const roles = await Role.find({ deleted: false })
    res.render("admin/pages/my-account/edit",{
        roles:roles
    })
}
module.exports.editPatch= async(req,res) =>{
    try {
        const emailExist = await Account.findOne({
            _id: { $ne: res.locals.user.id },
            email: req.body.email,
            deleted: false
        })
        if (emailExist) {
            req.flash("Error", `Email ${req.body.email} đã tồn tại`)
            res.redirect("back")
        }
        else {
            const updatedBy = {
                account_id: res.locals.user.id,
                updatedAt: new Date()
            }
            const id = res.locals.user.id
            await Account.updateOne({
                _id: id,
            }, {
                ...req.body,
                $push:{updatedBy: updatedBy}
            })
            req.flash("Success", "Cập nhật tài khoản thành công")
            res.redirect("/admin/my-account")
        }
    } catch (error) {
        req.flash("Error", "Cập nhật tài khoản không thành công")
        res.redirect("back")

    }

}
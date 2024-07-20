const Account = require("../../models/accounts.model")
const Role = require("../../models/roles.model")
const systemConfig = require("../../config/system")
module.exports.index = async (req, res) => {
    let find = {
        deleted: false
    }
    const accounts = await Account.find(find).select("-password -token")
    for (const account of accounts) {
        const role = await Role.findOne({
            _id: account.role_id,
            deleted: false,
        })
        account.role = role
    }
    res.render("admin/pages/accounts/index", {
        pageTitle: "Danh sách tài khoản",
        accounts: accounts
    })
}
module.exports.create = async (req, res) => {
    const roles = await Role.find({ deleted: false })
    res.render("admin/pages/accounts/create", {
        pageTitle: "Thêm mới tài khoản",
        roles: roles
    })
}
module.exports.createPost = async (req, res) => {

    try {
        const emailExist = await Account.findOne({ email: req.body.email, deleted: false })
        if (emailExist) {
            req.flash("Error", `Email ${req.body.email} đã tồn tại`)
            res.redirect("back")
        }
        else {
            const accounts = new Account(req.body)
            await accounts.save()
            req.flash("Success", "Thêm tài khoản thành công")
            res.redirect(`${systemConfig.prefixAdmin}/accounts`)
        }

    } catch (error) {
        req.flash("Error", "Thêm tài khoản thất bại")
        res.redirect(`${systemConfig.prefixAdmin}/accounts`)
    }
}
module.exports.edit = async (req, res) => {

    try {
        const id = req.params.id
        const account = await Account.findOne({ deleted: false, _id: id })
        const roles = await Role.find({ deleted: false })
        res.render("admin/pages/accounts/edit", {
            pageTitle: "Edit Account",
            account: account,
            roles: roles
        })
    } catch (error) {
        req.flash("Error", "Không tồn tại tài khoản này này")
        res.redirect('/admin/accounts')
    }


}
module.exports.editPatch = async (req, res) => {
    try {
        const emailExist = await Account.findOne({
            _id: {$ne: req.params.id},
            email: req.body.email,
            deleted: false
        })
        if (emailExist) {
            req.flash("Error", `Email ${req.body.email} đã tồn tại`)
            res.redirect("back")
        }
        else {
            const id = req.params.id
            await Account.updateOne({
                _id: id,
            }, req.body)
            req.flash("Success", "Cập nhật tài khoản thành công")
            res.redirect("/admin/accounts")
        }
    } catch (error) {
        req.flash("Error", "Cập nhật tài khoản không thành công")
        res.redirect("/admin/accounts")

    }
}
module.exports.delete = async(req,res) =>{
    try {
        const id = req.params.id
        await Account.updateOne({_id:id},{deleted:true, deletedAt: new Date()})
        req.flash("Success","Xóa tài khoản thành công")
        
    } catch (error) {
        req.flash("Success","xóa tài khoản không thành công")
        
    }
    res.redirect("back")
}
//ChangeStatus PATCH
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status
    const id = req.params.id
    let statusVN = ""
    if (status == "active") {
        statusVN = "Hoạt Động"
    }
    else {
        statusVN = "Dừng Hoạt Động"
    }

    await Account.updateOne({ _id: id }, { status: status })

    req.flash("Success", `Cập nhật trạng thái "${statusVN}" thành công`);
    res.redirect('back')

}
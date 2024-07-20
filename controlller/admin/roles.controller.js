const Role = require("../../models/roles.model")
const systemConfig = require("../../config/system")
const system = require("../../config/system")
module.exports.index = async (req, res) => {
    let find = {
        deleted: false,
    }
    const records = await Role.find(find)
    res.render("admin/pages/roles/index", {
        pageTitle: "Nhóm quyền",
        records: records
    })
}
module.exports.create = async (req, res) => {
    res.render("admin/pages/roles/create", {
        pageTitle: "Tạo nhóm quyền",
    })
}
module.exports.createPost = async (req, res) => {
    const records = new Role(req.body)
    await records.save()
    res.redirect(`${systemConfig.prefixAdmin}/roles`)
}
module.exports.edit = async (req, res) => {
    try {
        let find = {
            deleted: false,
            _id: req.params.id
        }
        const editRole = await Role.findOne(find)
        res.render("admin/pages/roles/edit", {
            role: editRole
        })

    } catch (error) {
        req.flash("Error", "Không tồn tại nhóm quyền này")
        res.redirect('/admin/roles')
    }
}
module.exports.update = async (req, res) => {
    const id = req.params.id
    try {
        await Role.updateOne({
            _id: id
        },
            req.body)
        req.flash("Success", "Cập nhật nhóm quyền thành công!")
    } catch (error) {
        req.flash("Error", "Cập nhật nhóm quyền không thành công")
    }
    res.redirect("/admin/roles")
}
module.exports.delete = async (req, res) => {
    const id = req.params.id
    try {
        await Role.updateOne({
            _id: id
        }, { deleted: true, deletedAt: new Date() })
        req.flash("Success", "Xóa nhóm quyền thành công!")
    } catch (error) {
        req.flash("Error", "Xóa nhóm quyền không thành công")
    }
    res.redirect('back')
}
module.exports.permissions = async (req, res) => {
    let find = {
        deleted: false,
    }
    const records = await Role.find(find)
    res.render("admin/pages/roles/permissions", {
        pageTitle: "Phan quyền",
        records: records
    })

}
module.exports.permissionsPatch = async (req, res) => {


    try {
        const permissions = JSON.parse(req.body.permissions)
        for (const item of permissions) {
            const id = item.id
            const permissions = item.permissions
            await Role.updateOne({ _id: id }, { permissions: permissions })
        }
        req.flash("Success", "Cập nhật phân quyền thành công")
    } catch (error) {
        req.flash("Error","Cập nhật phân quyền thất bại")

    }
    res.redirect("back")
}
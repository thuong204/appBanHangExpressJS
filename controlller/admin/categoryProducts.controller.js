const CategoryProduct = require("../../models/category-product.model")
const Product = require("../../models/product.model")

const filterStatusHelpers = require("../../helpers/filterStatus")
const searchHelpers = require("../../helpers/search")
const paginationHelpers = require("../../helpers/pagination")
const tree = require("../../helpers/createtree")
const Account = require("../../models/accounts.model")


module.exports.index = async (req, res) => {
    const filterStatus = filterStatusHelpers(req.query);


    let find = {
        delete: false
    }

    const objectSearch = searchHelpers(req.query)
    if (req.query.status) {
        find.status = req.query.status
    }
    if (objectSearch.regex) {
        find.title = objectSearch.regex
    }

    //sort
    const sortKey = req.query.sortKey
    const sortValue = req.query.sortValue
    let sort = {}
    if (sortKey && sortValue) {
        sort[sortKey] = sortValue
    }
    else {
        sort.position = "desc"
    }


    const countProducts = await CategoryProduct.find(find).count()
    let objectPagination = paginationHelpers({
        currentPage: 1,
        limitItems: 4,
    }, req.query, countProducts)


    const records = await CategoryProduct.find(find).sort(sort)
    for (const record of records) {
        const userCreated = await Account.findOne({
            _id: record.createdBy.account_id
        }).select("-password")
        if (userCreated) {
            record.createdName = userCreated.fullName
        }
        const obj = JSON.stringify(record.updatedBy)
        const objchange = JSON.parse(obj)
        if (objchange.length > 0) {
            const userUpdated = await Account.findOne({
                _id: objchange[objchange.length - 1].account_id
            }).select("-password")
            if (userUpdated) {
                record.updatedName = userUpdated.fullName
            }

        }


    }
    const newRecords = tree.createTree(records)
    res.render("admin/pages/category-products/index", {
        pageTitle: "Category Products",
        records: newRecords,
        filterStatus: filterStatus,
        pagination: objectPagination
    })
};
module.exports.createItem = async (req, res) => {
    let find = {
        delete: false,
    }

    const categoryProduct = await CategoryProduct.find(find)
    const newCategoryProduct = tree.createTree(categoryProduct)

    res.render("admin/pages/category-products/create", {
        pageTitle: "Create Category Products",
        categoryProduct: newCategoryProduct


    })

};
module.exports.saveItem = async (req, res) => {
    if (req.body.position == "") {
        const countCategoryProducts = await CategoryProduct.find().count()
        req.body.position = countCategoryProducts + 1
    } else {
        req.body.position = parseInt(req.body.position)
    }
    req.body.createdBy = {
        account_id: res.locals.user.id
    }

    const categoryProduct = new CategoryProduct(req.body)

    await categoryProduct.save()
    res.redirect("/admin/category-products")

    // await product.save()
    // res.redirect('/admin/products')

};
module.exports.editItem = async (req, res) => {
    try {
        let find = {
            _id: req.params.id,
            delete: false
        }
        let findCategory = {
            delete: false,
        }

        const allCategoryProduct = await CategoryProduct.find(findCategory)
        const categoryProduct = await CategoryProduct.findOne(find)
        const newAllCategoryProduct = tree.createTree(allCategoryProduct)

        res.render("admin/pages/category-products/edit",
            {
                categoryProduct: categoryProduct,
                newAllCategoryProduct: newAllCategoryProduct
            }
        )

    } catch (error) {
        req.flash("Error", "Không tồn tại sản phẩm này")
        res.redirect('/admin/category-products')

    }
}
module.exports.updateItem = async (req, res) => {
    req.body.position = parseInt(req.body.position)
    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    }
    if (req.params.id == req.body.parent_id) {
        req.flash("Error", "Cập nhật  không thành công vì danh mục sản phẩm không được trùng với danh mục cha")
        res.redirect("back")
        return;
    }
    try {
        await CategoryProduct.updateOne({
            _id: req.params.id
        }, {
            ...req.body,
            $push: { updatedBy: updatedBy }
        })
        req.flash("Success", "Cập nhật thành công!")
    } catch (error) {
        req.flash("Error", "Cập nhật không thành công")
    }
    res.redirect("/admin/category-products")

}

//Change status
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status
    const id = req.params.id
    let statusVN = ""
    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    }
    if (status == "active") {
        statusVN = "Hoạt Động"
    }
    else {
        statusVN = "Dừng Hoạt Động"
    }

    await CategoryProduct.updateOne({ _id: id }, { status: status, $push: { updatedBy: updatedBy } })

    req.flash("Success", `Cập nhật trạng thái "${statusVN}" thành công`);
    res.redirect('back')

}
module.exports.deleteItem = async (req, res) => {
    const find = {
        delete: false,
        parent_id: req.params.id
    }

    const findProduct = {
        delete: false,
        categoryProduct: req.params.id
    }
    const allCategoryInCateDelete = await CategoryProduct.find(find).count()
    const allProductInCateDelete = await Product.find(findProduct).count()
    if (allProductInCateDelete >= 1) {
        req.flash("Error", "Xóa danh mục không thành công vì có sản phẩm trong danh mục này")
        res.redirect("back")
        return;
    }
    if (allCategoryInCateDelete >= 1 || allProductInCateDelete >= 1) {
        req.flash("Error", "Xóa danh mục không thành công vì có danh mục con trong danh mục này")
        res.redirect("back")
        return;
    }

    const iddelete = req.params.id
    await CategoryProduct.updateOne({ _id: iddelete }, {
        delete: true,
        deletedBy: {
            account_id: res.locals.user.id,
            deletedAt: new Date()
        }
    })
    req.flash("Success", "Xóa danh mục sản phẩm thành công")
    res.redirect("back")
}
//change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type
    const ids = req.body.ids.split(", ")
    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    }

    switch (type) {
        case "active":
            await CategoryProduct.updateMany({
                _id: { $in: ids }
            },
                {
                    status: "active",
                    $push: { updatedBy: updatedBy }
                })
            req.flash("Success", `Cập nhật trạng thái  "Hoạt Động"${ids.length} sản phẩm thành công`)

            break;
        case "inactive":
            await CategoryProduct.updateMany({
                _id: { $in: ids }
            },
                {
                    status: "inactive", $push: { updatedBy: updatedBy }
                })
            req.flash("Success", `Cập nhật trạng thái "Dừng Hoạt Động" ${ids.length} sản phẩm thành công`)
            break;
        case "delete-all":
            await CategoryProduct.updateMany(
                { _id: { $in: ids } },
                {
                    delete: true,
                    deletedBy: {
                        account_id: res.locals.user.id,
                        deletedAt: new Date()
                    }
                }
            )
            req.flash("Success", `Xóa ${ids.length} sản phẩm thành công`)
            break;
        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-")
                position = parseInt(position)
                await CategoryProduct.updateOne(
                    { _id: id },
                    {
                        position: position,
                        $push: { updatedBy: updatedBy }
                    }
                )
            }
            req.flash("Success", `Thay đổi vị trí ${ids.length} sản phẩm thành công`)
            break;
        default:
            break;
    }
    res.redirect("back")
}

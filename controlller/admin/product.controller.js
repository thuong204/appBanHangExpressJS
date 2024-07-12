const Product = require("../../models/product.model")
const filterStatusHelpers = require("../../helpers/filterStatus")
const searchHelpers = require("../../helpers/search")
const paginationHelpers = require("../../helpers/pagination")


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
    //Pagination
    const countProducts = await Product.find(find).count()
    let objectPagination = paginationHelpers({
        currentPage: 1,
        limitItems: 4,
    }, req.query, countProducts)


    //End pagination



    const products = await Product.find(find).sort({ position: "asc" }).limit(objectPagination.limitItems).skip(objectPagination.skip)
    res.render("admin/pages/products/index", {
        pageTitle: "Manage Products",
        products: products,
        filterStatus: filterStatus,
        keyworld: objectSearch.keyworld,
        pagination: objectPagination
    })
};
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

    await Product.updateOne({ _id: id }, { status: status })

    req.flash("Success", `Cập nhật trạng thái "${statusVN}" thành công`);
    res.redirect('back')

}

//ChangeMulti PATCH
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type
    const ids = req.body.ids.split(", ")

    switch (type) {
        case "active":
            await Product.updateMany({
                _id: { $in: ids }
            },
                {
                    status: "active"
                })
            req.flash("Success", `Cập nhật trạng thái  "Hoạt Động"${ids.length} sản phẩm thành công`)

            break;
        case "inactive":
            await Product.updateMany({
                _id: { $in: ids }
            },
                {
                    status: "inactive"
                })
            req.flash("Success", `Cập nhật trạng thái "Dừng Hoạt Động" ${ids.length} sản phẩm thành công`)
            break;
        case "delete-all":
            await Product.updateMany(
                { _id: { $in: ids } },
                {
                    delete: true,
                    deletedAt: new Date()
                }
            )
            req.flash("Success", `Xóa ${ids.length} sản phẩm thành công`)
            break;
        case "change-position":
            for (const item of ids) {
                let [id, position] = item.split("-")
                position = parseInt(position)
                await Product.updateOne(
                    { _id: id },
                    { position: position }
                )
            }
            req.flash("Success", `Thay đổi vị trí ${ids.length} sản phẩm thành công`)
            break;

        default:
            break;
    }
    res.redirect("back")

}
//delete item
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id
    await Product.updateOne({ _id: id }, { delete: true, deletedAt: new Date() })
    res.redirect("back")
}
module.exports.createItem = async (req, res) => {
    res.render("admin/pages/products/create", {
        pageTitle: "Thêm sản phẩm"
    })
}
module.exports.saveItem = async (req, res) => {

    req.body.price = parseInt(req.body.price)
    req.body.discountPercentage = parseInt(req.body.discountPercentage)
    req.body.quantity = parseInt(req.body.quantity)

    if (req.body.position == "") {
        const countProducts = await Product.find().count()
        req.body.position = countProducts + 1
    }
    else {
        req.body.position = parseInt(req.body.position)
    }

    const product = new Product(req.body)
    await product.save()
    res.redirect('/admin/products')
}


module.exports.editItem = async (req, res) => {
    try {
        const product_edit = await Product.findOne({ _id: req.params.id, delete: false })
        res.render("admin/pages/products/edit", {
            pageTitle: "Edit Product",
            product: product_edit
        })
    } catch (error) {
        req.flash("Error", "Không tồn tại sản phẩm này")
        res.redirect('/admin/products')
    }

}
module.exports.updateItem = async (req, res) => {
    const id =  req.params.id
    req.body.price = parseInt(req.body.price)
    req.body.discountPercentage = parseInt(req.body.discountPercentage)
    req.body.quantity = parseInt(req.body.quantity)
    req.body.position = parseInt(req.body.position)
    if (req.file) {
        req.body.thumbnail =  `/uploads/${req.file.filename}`
    }
    try {
        await Product.updateOne({
            _id:id
        },
            req.body)
        req.flash("Success","Cập nhật thành công!")
    } catch (error) {
        req.flash("Error","Cập nhật không thành công")
    }
    res.redirect("/admin/products")
}

module.exports.detailItem = async (req, res) => {
    try {
        const product_edit = await Product.findOne({ _id: req.params.id, delete: false })
        res.render("admin/pages/products/detail", {
            pageTitle: "Detail Product",
            product: product_edit,
            id: req.params.id
        })
    } catch (error) {
        req.flash("Error", "Không tồn tại sản phẩm này")
        res.redirect('/admin/products')
    }

}


const CategoryProduct = require("../../models/category-product.model")
const filterStatusHelpers = require("../../helpers/filterStatus")
const searchHelpers = require("../../helpers/search")
const paginationHelpers = require("../../helpers/pagination")
const tree= require("../../helpers/createtree")


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
    let sort ={}
    if(sortKey && sortValue){
        sort[sortKey] = sortValue
    }
    else{
        sort.position= "desc"
    }
   

    const countProducts = await CategoryProduct.find(find).count()
    let objectPagination = paginationHelpers({
        currentPage: 1,
        limitItems: 4,
    }, req.query, countProducts)


    const records = await CategoryProduct.find(find).sort(sort)
    const newRecords = tree.createTree(records)
    res.render("admin/pages/category-products/index", {
        pageTitle: "Category Products",
        records: newRecords,
        filterStatus: filterStatus,
        pagination: objectPagination
    })
};
module.exports.createItem = async (req, res) => {
    let find ={
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
        const categoryProduct = await CategoryProduct.findOne(find)
        res.render("admin/pages/category-products/edit",
            {
                categoryProduct: categoryProduct,
            }
        )

    } catch (error) {
        req.flash("Error", "Không tồn tại sản phẩm này")
        res.redirect('/admin/category-products')

    }
}
module.exports.updateItem = async (req, res) => {
    req.body.position = parseInt(req.body.position)
    try {
        await CategoryProduct.updateOne({
            _id: req.params.id
        },
            req.body)
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
    if (status == "active") {
        statusVN = "Hoạt Động"
    }
    else {
        statusVN = "Dừng Hoạt Động"
    }

    await CategoryProduct.updateOne({ _id: id }, { status: status })

    req.flash("Success", `Cập nhật trạng thái "${statusVN}" thành công`);
    res.redirect('back')

}
module.exports.deleteItem = async (req,res) => {
    const iddelete = req.params.id
    await CategoryProduct.updateOne({_id:iddelete},{delete: true})
    res.redirect("back")
}
//change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type
    const ids = req.body.ids.split(", ")

    switch (type) {
        case "active":
            await CategoryProduct.updateMany({
                _id: { $in: ids }
            },
                {
                    status: "active"
                })
            req.flash("Success", `Cập nhật trạng thái  "Hoạt Động"${ids.length} sản phẩm thành công`)

            break;
        case "inactive":
            await CategoryProduct.updateMany({
                _id: { $in: ids }
            },
                {
                    status: "inactive"
                })
            req.flash("Success", `Cập nhật trạng thái "Dừng Hoạt Động" ${ids.length} sản phẩm thành công`)
            break;
        case "delete-all":
            await CategoryProduct.updateMany(
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
                await CategoryProduct.updateOne(
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

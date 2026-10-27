const ProductCategory = require("../../models/category-product.model")
const createTreeHelpers = require("../../helpers/createtree")
const { PROFILES, detectKind } = require("../../helpers/productProfile")
module.exports.category = async (req, res, next) => {
    const productsCategory = await ProductCategory.find({
        delete: false,
        status: "active",
        parent_id:""
    }).sort({position:1}).lean()
    // Icon theo loại danh mục cho thanh điều hướng
    productsCategory.forEach(item => {
        item.icon = PROFILES[detectKind({ title: "" }, [item])].icon
    })
    res.locals.categoryProducts = productsCategory

    next()

}
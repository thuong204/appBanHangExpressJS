const ProductCategory = require("../../models/category-product.model")
const createTreeHelpers = require("../../helpers/createtree")
module.exports.category = async (req, res, next) => {
    const productsCategory = await ProductCategory.find({
        delete: false,
        parent_id:""
    })
    res.locals.categoryProducts = productsCategory

    next()

}
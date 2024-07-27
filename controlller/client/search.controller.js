const priceNew = require("../../helpers/priceNew")
const Product = require("../../models/product.model")
module.exports.index = async(req, res) => {
    const keyword= req.query.keyword
    let newProducts =[]
    if(keyword){
        const keywordRegex = new RegExp(keyword,"i")

        const products = await Product.find({
            title: keywordRegex,
            delete:false,
            status:"active"
        })
        newProducts = priceNew(products)
    }
    res.render("clients/pages/search/index", {
        pageTitle: "Trang tìm kiếm",
        keyword: req.query.keyword,
        products: newProducts
    }
    )
}
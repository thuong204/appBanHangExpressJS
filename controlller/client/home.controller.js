const Product = require("../../models/product.model")
const priceNew= require("../../helpers/priceNew")
module.exports.index = async (req, res) => {
    const productsFeatured = await Product.find({
        featured: "1",
        delete:false,
        status:"active"
    }).limit(8)
    const productsFeaturedNewPrice = priceNew(productsFeatured)

    const productsNew= await Product.find({
        delete:false,
        status:"active"
    }).limit(8).sort({position:"desc"})
    const productsNew_NewPrice = priceNew(productsNew)
    res.render("clients/pages/home/index",{
        pageTitle:"Trang chủ",
        productsFeatured: productsFeaturedNewPrice,
        productsNew: productsNew_NewPrice
    })
 };

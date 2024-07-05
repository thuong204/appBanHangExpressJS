const Product = require("../../models/product.model")
module.exports.index = async (req, res) => {
    const  products =  await Product.find({
    })
    products.forEach(item =>{
        item.priceNew = (item.price*(100-item.discountPercentage)/100).toFixed(0)
    }
    )
    res.render("clients/pages/products/index",{
        pageTitle:"Trang sản phẩm",
        products: products

    }
    )
 };
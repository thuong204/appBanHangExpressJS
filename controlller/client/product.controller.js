const Product = require("../../models/product.model")
const priceNew= require("../../helpers/priceNew")

module.exports.index = async (req, res) => {
    const  products =  await Product.find({
        status:"active",
        delete:false
    }).sort({position:"asc"})
    
    const productsNewPrice = priceNew(products)
    console.log(productsNewPrice)
    res.render("clients/pages/products/index",{
        pageTitle:"Trang sản phẩm",
        products: productsNewPrice,
    }
    )
 };
 
module.exports.detailItem = async (req, res) => {
    try {
        const product_detail = await Product.findOne({slug: req.params.slug, delete: false })
        if(product_detail == undefined) 
            res.redirect('/products')
        product_detail.priceNew = (product_detail.price*(100-product_detail.discountPercentage)/100).toFixed(0)
        res.render("clients/pages/products/detail", {
            pageTitle: "Detail Product",
            product: product_detail,
            status:"active"
        })
            
    } catch (error) {
        req.flash("Error", "Không tồn tại sản phẩm này")
        res.redirect('/products')
    }

}


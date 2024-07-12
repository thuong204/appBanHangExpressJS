const Product = require("../../models/product.model")
module.exports.index = async (req, res) => {
    const  products =  await Product.find({
        status:"active",
        delete:false
    }).sort({position:"asc"})
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


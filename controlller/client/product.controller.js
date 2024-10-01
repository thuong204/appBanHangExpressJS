const Product = require("../../models/product.model")
const priceNew= require("../../helpers/priceNew")
const CategoryProduct = require("../../models/category-product.model")
const productsCategoryHelper = require("../../helpers/products-category");
const formatPrice = require("../../helpers/formatPrice");

module.exports.index = async (req, res) => {

    const  products =  await Product.find({
        status:"active",
        delete:false
    }).sort({position:"asc"})

    const productsNewPrice = priceNew(products)
    res.render("clients/pages/products/index",{
        pageTitle:"Danh sách sản phẩm",
        products: productsNewPrice,
    }
    )
 };
 
module.exports.detailItem = async (req, res) => {
    try {
        const product_detail = await Product.findOne({slug: req.params.slug, delete: false })
        if(product_detail == undefined) {
            res.redirect('/products')
        }
        const productPriceNew = formatPrice.formatPrice(product_detail)
       
        res.render("clients/pages/products/detail", {
            pageTitle: "Detail Product",
            product: productPriceNew,
            status:"active"
        })
            
    } catch (error) {
        req.flash("Error", "Không tồn tại sản phẩm này")
        console.log(error)
        res.redirect('/products')
    }

}
module.exports.category = async (req,res) =>{
    const category = await CategoryProduct.findOne({delete:false, status: "active", slug: req.params.slugCategory})

    const listSubCategory = await productsCategoryHelper.getSubCategory(category.id)
    const listSubCategoryId = listSubCategory.map(item => item.id)
    const productsCategory = await Product.find({
        delete:false,
        status:"active",
        categoryProduct: { $in: [category.id , ...listSubCategoryId]}
    }).sort({position:"desc"})



    const productsNewCategory = priceNew(productsCategory)
    res.render("clients/pages/products/index", {
        pageTitle: category.title,
        products: productsNewCategory,
        status:"active"
    })
}


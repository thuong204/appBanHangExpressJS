const Product = require("../../models/product.model")
const priceNew = require("../../helpers/priceNew")
const CategoryProduct = require("../../models/category-product.model")
const productsCategoryHelper = require("../../helpers/products-category");
const formatPrice = require("../../helpers/formatPrice");
const { listSearchIndexes } = require("../../models/accounts.model");

module.exports.index = async (req, res) => {

    const products = await Product.find({
        status: "active",
        delete: false
    }).sort({ position: "asc" })

    const productsNewPrice = priceNew(products)
    res.render("clients/pages/products/index", {
        pageTitle: "Danh sách sản phẩm",
        products: productsNewPrice,
    }
    )
};

module.exports.detailItem = async (req, res) => {
    try {

        const slug = req.params.slug;

        const newSlug = slug.replace(/\d+gb/gi, '').replace(/--/g, '-').replace(/^-|-$/g, '');
        const product_detail = await Product.findOne({ slug: slug, delete: false }).select("-updatedBy -CreatedBy")
        if (product_detail == undefined) {
            res.redirect('/products')
        }

        const productPriceNew = formatPrice.formatPrice(product_detail)
        const categoryProduct = await CategoryProduct.findOne({
            delete: false,
            status: "active",
            _id: product_detail.categoryProduct
        })


        const productRelated = await Product.find({
            delete: false,
            status: "active",
            categoryProduct: categoryProduct._id,
            _id: { $ne: product_detail._id }  // Loại bỏ sản phẩm hiện tại
        }).limit(6).sort({ position: -1 }).select("title slug price discountPercentage thumbnail")

        const productNewPriceRelated = priceNew(productRelated)

        const productList = await Product.find({
            delete: false,
            slug: { $regex: newSlug, $options: 'i' },
            status: "active"
        }).select("title slug storage color")




        res.render("clients/pages/products/detail", {
            pageTitle: "Detail Product",
            product: productPriceNew,
            productstRelated: productNewPriceRelated,
            productList: productList,
            status: "active"
        })

    } catch (error) {
        req.flash("Error", "Không tồn tại sản phẩm này")
        console.log(error)
        res.redirect('/products')
    }

}
module.exports.category = async (req, res) => {
    const category = await CategoryProduct.findOne({ delete: false, status: "active", slug: req.params.slugCategory })

    const listSubCategory = await productsCategoryHelper.getSubCategory(category.id)
    const listSubCategoryId = listSubCategory.map(item => item.id)
    const productsCategory = await Product.find({
        delete: false,
        status: "active",
        categoryProduct: { $in: [category.id, ...listSubCategoryId] }
    }).sort({ position: "desc" })





    const productsNewCategory = priceNew(productsCategory)
    res.render("clients/pages/products/index", {
        pageTitle: category.title,
        products: productsNewCategory,
        status: "active"
    })
}


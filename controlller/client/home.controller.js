const Product = require("../../models/product.model")
const priceNew= require("../../helpers/priceNew")
const { loadCategoryMap, attachProfiles, categoryChain, detectKind, PROFILES } = require("../../helpers/productProfile")
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


    const productDiscount = await Product.find({
        delete:false,
        status:"active",
    }).limit(8).sort({ discountPercentage:-1})
    
    const productDiscountNewPrice = priceNew(productDiscount)

    const categoryMap = await loadCategoryMap()
    for (const list of [productsFeaturedNewPrice, productsNew_NewPrice, productDiscountNewPrice]) {
        await attachProfiles(list, categoryMap)
    }

    // Ô danh mục: danh mục gốc kèm số sản phẩm (gồm cả danh mục con)
    const countRows = await Product.aggregate([
        { $match: { delete: false, status: "active" } },
        { $group: { _id: "$categoryProduct", count: { $sum: 1 } } },
    ])
    const rootCount = new Map()
    for (const row of countRows) {
        const root = categoryChain(row._id, categoryMap).pop()
        if (root) rootCount.set(String(root._id), (rootCount.get(String(root._id)) || 0) + row.count)
    }
    const categoryTiles = [...categoryMap.values()]
        .filter(c => !c.parent_id && rootCount.get(String(c._id)))
        .map(c => ({
            title: c.title,
            slug: c.slug,
            count: rootCount.get(String(c._id)),
            icon: PROFILES[detectKind({ title: "" }, [c])].icon,
        }))
        .sort((a, b) => b.count - a.count)
    res.render("clients/pages/home/index",{
        pageTitle:"Trang chủ",
        productsFeatured: productsFeaturedNewPrice,
        productsNew: productsNew_NewPrice,
        productDiscount: productDiscountNewPrice,
        categoryTiles
    })
 };

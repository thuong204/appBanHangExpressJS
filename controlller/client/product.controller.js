const Product = require("../../models/product.model")
const priceNew = require("../../helpers/priceNew")
const CategoryProduct = require("../../models/category-product.model")
const productsCategoryHelper = require("../../helpers/products-category");
const formatPrice = require("../../helpers/formatPrice");
const {
    normalizeProductDetail,
    normalizeProductList,
} = require("../../helpers/productDetailMock");
const {
    loadCategoryMap,
    categoryChain,
    detectKind,
    attachProfiles,
} = require("../../helpers/productProfile");

const SORT_OPTIONS = [
    { value: "new", label: "Mới nhất", sort: { position: -1 } },
    { value: "price-asc", label: "Giá thấp → cao", sort: { price: 1 } },
    { value: "price-desc", label: "Giá cao → thấp", sort: { price: -1 } },
    { value: "discount", label: "Giảm giá nhiều", sort: { discountPercentage: -1, position: -1 } },
];

function resolveSort(value) {
    return SORT_OPTIONS.find(o => o.value === value) || SORT_OPTIONS[0];
}

/** Danh mục con trực tiếp kèm số sản phẩm (tính cả danh mục cháu) để làm bộ lọc nhanh */
function buildCategoryChips(parentId, categoryMap, countByCategory) {
    const children = [...categoryMap.values()].filter(c => String(c.parent_id || "") === String(parentId || ""))
    return children
        .map(child => {
            const ids = [String(child._id), ...descendantIds(child._id, categoryMap)]
            const count = ids.reduce((sum, id) => sum + (countByCategory.get(id) || 0), 0)
            return { title: child.title, slug: child.slug, count }
        })
        .filter(chip => chip.count > 0)
}

function descendantIds(parentId, categoryMap) {
    const result = []
    for (const c of categoryMap.values()) {
        if (String(c.parent_id || "") === String(parentId)) {
            result.push(String(c._id), ...descendantIds(c._id, categoryMap))
        }
    }
    return result
}

async function countProductsByCategory() {
    const rows = await Product.aggregate([
        { $match: { delete: false, status: "active" } },
        { $group: { _id: "$categoryProduct", count: { $sum: 1 } } },
    ])
    return new Map(rows.map(r => [String(r._id), r.count]))
}

module.exports.index = async (req, res) => {

    const sortOption = resolveSort(req.query.sort)
    const [products, categoryMap, countByCategory] = await Promise.all([
        Product.find({ status: "active", delete: false }).sort(sortOption.sort),
        loadCategoryMap(),
        countProductsByCategory(),
    ])

    const productsNewPrice = priceNew(products)
    await attachProfiles(productsNewPrice, categoryMap)
    res.render("clients/pages/products/index", {
        pageTitle: "Danh sách sản phẩm",
        products: productsNewPrice,
        categoryChips: buildCategoryChips("", categoryMap, countByCategory),
        sortOptions: SORT_OPTIONS,
        currentSort: sortOption.value,
        breadcrumbs: [],
    }
    )
};

module.exports.detailItem = async (req, res) => {
    try {

        const slug = req.params.slug;

        const newSlug = slug.replace(/\d+gb/gi, '').replace(/--/g, '-').replace(/^-|-$/g, '');
        const product_detail = await Product.findOne({ slug: slug, delete: false }).select("-updatedBy -CreatedBy")
        if (!product_detail) {
            return res.redirect('/products')
        }

        const categoryMap = await loadCategoryMap()
        const chain = categoryChain(product_detail.categoryProduct, categoryMap)
        const kind = detectKind(product_detail, chain)

        let productPriceNew = normalizeProductDetail(product_detail, kind, chain[0]?.title || "")
        productPriceNew = formatPrice.formatPrice(productPriceNew)

        // Sản phẩm tương tự: cùng danh mục trước, thiếu thì lấy thêm từ danh mục cha
        const relatedFields = "title slug price discountPercentage thumbnail categoryProduct screen storage variations totalQuantity quantity"
        let productRelated = []
        for (const cat of chain) {
            if (productRelated.length >= 4) break
            const ids = [String(cat._id), ...descendantIds(cat._id, categoryMap)]
            const more = await Product.find({
                delete: false,
                status: "active",
                categoryProduct: { $in: ids },
                _id: { $nin: [product_detail._id, ...productRelated.map(p => p._id)] }
            }).limit(8 - productRelated.length).sort({ position: -1 }).select(relatedFields)
            productRelated = productRelated.concat(more)
        }

        if (!productRelated.length) {
            productRelated = await Product.find({
                delete: false,
                status: "active",
                _id: { $ne: product_detail._id }
            }).limit(8).sort({ position: -1 }).select(relatedFields)
        }

        const productNewPriceRelated = priceNew(productRelated)
        await attachProfiles(productNewPriceRelated, categoryMap)

        const productListRaw = await Product.find({
            delete: false,
            slug: { $regex: newSlug, $options: 'i' },
            status: "active"
        }).select("title slug storage color")

        const productList = normalizeProductList(productListRaw, productPriceNew)

        res.render("clients/pages/products/detail", {
            pageTitle: productPriceNew.title,
            product: productPriceNew,
            productstRelated: productNewPriceRelated,
            productList: productList,
            breadcrumbs: [...chain].reverse().map(c => ({ title: c.title, href: `/products/${c.slug}` })),
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
    if (!category) {
        return res.redirect('/products')
    }

    const sortOption = resolveSort(req.query.sort)
    const listSubCategory = await productsCategoryHelper.getSubCategory(category.id)
    const listSubCategoryId = listSubCategory.map(item => item.id)
    const [productsCategory, categoryMap, countByCategory] = await Promise.all([
        Product.find({
            delete: false,
            status: "active",
            categoryProduct: { $in: [category.id, ...listSubCategoryId] }
        }).sort(sortOption.sort),
        loadCategoryMap(),
        countProductsByCategory(),
    ])

    const productsNewCategory = priceNew(productsCategory)
    await attachProfiles(productsNewCategory, categoryMap)

    const chain = categoryChain(category.id, categoryMap)
    const parent = chain[1]
    res.render("clients/pages/products/index", {
        pageTitle: category.title,
        products: productsNewCategory,
        categoryDescription: category.description,
        // Danh mục lá: hiện các danh mục "anh em" để chuyển nhanh
        categoryChips: buildCategoryChips(category.id, categoryMap, countByCategory).length
            ? buildCategoryChips(category.id, categoryMap, countByCategory)
            : parent ? buildCategoryChips(parent._id, categoryMap, countByCategory) : [],
        currentCategorySlug: category.slug,
        sortOptions: SORT_OPTIONS,
        currentSort: sortOption.value,
        breadcrumbs: [{ title: "Sản phẩm", href: "/products" }, ...chain.slice(1).reverse().map(c => ({ title: c.title, href: `/products/${c.slug}` }))],
        status: "active"
    })
}


const ProductCategory = require("../models/category-product.model")
module.exports.getSubCategory = async (parentId) => {
    const getCategory = async (parentId) => {

        const subs = await ProductCategory.find({
            parent_id: parentId,
            delete: false,
            status: "active"
        })
        let allSub = [...subs]
        for (const sub of subs) {
            const childs = await this.getSubCategory(sub.id)
            allSub = allSub.concat(childs)
        }
        return allSub;
    }
    const result= await getCategory(parentId)
    return result;
}
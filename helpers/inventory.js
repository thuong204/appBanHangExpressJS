const Product = require("../models/product.model")

/**
 * Tồn kho sản phẩm:
 * - Có màu (variations): tồn theo từng màu, totalQuantity = tổng các màu.
 * - Không có màu: dùng totalQuantity (hoặc quantity với dữ liệu cũ).
 * Trường `quantity` gốc luôn được giữ bằng totalQuantity để tương thích dữ liệu cũ.
 */

const toInt = (value) => {
    const n = Number(value)
    return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0
}

/** Màu khớp trong variations (so sánh không phân biệt hoa thường, bỏ khoảng trắng thừa) */
function findVariation(product, color) {
    const list = Array.isArray(product.variations) ? product.variations : []
    const key = String(color || "").trim().toLowerCase()
    if (!list.length) return null
    const found = list.find((v) => String(v.color || "").trim().toLowerCase() === key)
    if (found) return found
    // Sản phẩm chỉ có 1 màu: giỏ hàng cũ có thể không lưu màu
    return !key && list.length === 1 ? list[0] : null
}

/** Tổng tồn kho của sản phẩm */
function totalStock(product) {
    const list = Array.isArray(product.variations) ? product.variations : []
    if (list.length) return list.reduce((sum, v) => sum + toInt(v.quantity), 0)
    // Dữ liệu cũ có thể lệch giữa 2 trường; mọi lần trừ/hoàn kho đều cập nhật cả hai nên lấy giá trị lớn hơn
    return Math.max(toInt(product.totalQuantity), toInt(product.quantity))
}

/** Tồn kho cho đúng màu khách chọn (sản phẩm không có màu thì là tổng tồn) */
function stockOf(product, color) {
    const list = Array.isArray(product.variations) ? product.variations : []
    if (!list.length) return totalStock(product)
    const variation = findVariation(product, color)
    return variation ? toInt(variation.quantity) : 0
}

/** Cập nhật tồn kho 1 dòng; delta âm là trừ (chỉ trừ khi còn đủ hàng). Trả về true nếu thành công */
async function adjustOne(item, delta) {
    const product = await Product.findById(item.product_id).select("variations totalQuantity quantity")
    if (!product) return false
    const amount = Math.abs(delta)
    const variation = findVariation(product, item.color)

    if (product.variations && product.variations.length) {
        if (!variation) return false
        // Điều kiện "còn đủ hàng" nằm trong chính câu lệnh update nên 2 người mua cùng lúc không thể cùng trừ
        const filter = delta < 0
            ? { _id: product._id, variations: { $elemMatch: { _id: variation._id, quantity: { $gte: amount } } } }
            : { _id: product._id, "variations._id": variation._id }
        const result = await Product.updateOne(filter, {
            $inc: { "variations.$.quantity": delta, totalQuantity: delta, quantity: delta },
        })
        return result.modifiedCount === 1
    }

    // Sản phẩm không có màu: totalQuantity là tồn kho. Dữ liệu cũ thiếu/lệch totalQuantity thì đồng bộ
    // một lần theo totalStock() — điều kiện là 2 trường chưa bị ai đổi kể từ lúc đọc (xem scripts/normalize-stock.js)
    const current = totalStock(product)
    if (product.totalQuantity !== current || product.quantity !== current) {
        await Product.updateOne(
            { _id: product._id, totalQuantity: product.totalQuantity ?? null, quantity: product.quantity ?? null },
            { $set: { totalQuantity: current, quantity: current } }
        )
    }
    const filter = { _id: product._id }
    if (delta < 0) filter.totalQuantity = { $gte: amount }
    const result = await Product.updateOne(filter, { $inc: { totalQuantity: delta, quantity: delta } })
    return result.modifiedCount === 1
}

/**
 * Trừ kho cho danh sách {product_id, color, quantity}. Nếu một dòng không đủ hàng thì
 * hoàn lại các dòng đã trừ và trả về { ok: false, failed }.
 */
async function reserve(items) {
    const done = []
    for (const item of items) {
        const qty = toInt(item.quantity)
        if (!qty) continue
        const ok = await adjustOne(item, -qty)
        if (!ok) {
            await release(done)
            return { ok: false, failed: item }
        }
        done.push(item)
    }
    return { ok: true }
}

/** Hoàn kho (khi huỷ đơn hoặc khi trừ kho thất bại giữa chừng) */
async function release(items) {
    for (const item of items) {
        const qty = toInt(item.quantity)
        if (qty) await adjustOne(item, qty)
    }
}

module.exports = {
    findVariation,
    totalStock,
    stockOf,
    reserve,
    release,
}

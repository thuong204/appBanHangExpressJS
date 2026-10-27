// Chuẩn hoá tồn kho: totalQuantity = tổng tồn các màu (hoặc tồn gốc nếu không có màu), quantity = totalQuantity.
// Chạy thử (không ghi):  node scripts/normalize-stock.js
// Ghi vào DB:            node scripts/normalize-stock.js --apply
require("dotenv").config()
const mongoose = require("mongoose")
const Product = require("../models/product.model")

const APPLY = process.argv.includes("--apply")
const toInt = (v) => (Number.isFinite(Number(v)) ? Math.max(0, Math.floor(Number(v))) : 0)

;(async () => {
    await mongoose.connect(process.env.MONGO_URL)
    const products = await Product.find({}).select("title quantity totalQuantity variations delete").lean()
    let changed = 0

    for (const p of products) {
        const variations = Array.isArray(p.variations) ? p.variations : []
        // Không có màu: lấy giá trị lớn hơn giữa quantity/totalQuantity (giống cách web hiển thị trước đây)
        const total = variations.length
            ? variations.reduce((sum, v) => sum + toInt(v.quantity), 0)
            : Math.max(toInt(p.quantity), toInt(p.totalQuantity))
        const badVariation = variations.some((v) => toInt(v.quantity) !== v.quantity)

        if (p.totalQuantity === total && p.quantity === total && !badVariation) continue
        changed++
        console.log(
            `${p.delete ? "[đã xoá] " : ""}${String(p.title).slice(0, 60).padEnd(60)} ` +
            `quantity ${String(p.quantity).padStart(9)} → ${total} | totalQuantity ${String(p.totalQuantity).padStart(9)} → ${total}` +
            (variations.length ? ` | ${variations.length} màu` : " | không có màu")
        )
        if (APPLY) {
            const update = { quantity: total, totalQuantity: total }
            if (badVariation) {
                update.variations = variations.map((v) => ({ ...v, quantity: toInt(v.quantity) }))
            }
            await Product.updateOne({ _id: p._id }, { $set: update })
        }
    }

    console.log(`\n${products.length} sản phẩm, ${changed} cần chuẩn hoá. ${APPLY ? "ĐÃ GHI vào DB." : "Chạy thử, chưa ghi (thêm --apply để ghi)."}`)
    await mongoose.disconnect()
})().catch((e) => {
    console.error(e)
    process.exit(1)
})

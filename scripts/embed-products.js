// Tạo embedding Gemini cho sản phẩm + Atlas Vector Search index (chatbot RAG).
// Chạy:            node scripts/embed-products.js     (chỉ embed SP mới / đã đổi nội dung)
// Embed lại hết:   node scripts/embed-products.js --force
require("dotenv").config()
const mongoose = require("mongoose")
const Product = require("../models/product.model")
const CategoryProduct = require("../models/category-product.model")
const {
    EMBEDDING_DIMENSIONS,
    VECTOR_INDEX_NAME,
    hasEmbeddingKey,
    embedTexts,
    buildProductEmbeddingText,
    hashText,
} = require("../helpers/embedding")

const FORCE = process.argv.includes("--force")

async function ensureVectorIndex() {
    const collection = Product.collection
    const existing = await collection.listSearchIndexes(VECTOR_INDEX_NAME).toArray()
    if (existing.length) {
        console.log(`Index "${VECTOR_INDEX_NAME}" đã có (trạng thái: ${existing[0].status})`)
        return
    }
    await collection.createSearchIndex({
        name: VECTOR_INDEX_NAME,
        type: "vectorSearch",
        definition: {
            fields: [
                { type: "vector", path: "embedding", numDimensions: EMBEDDING_DIMENSIONS, similarity: "cosine" },
                { type: "filter", path: "status" },
                { type: "filter", path: "delete" },
                { type: "filter", path: "categoryProduct" },
            ],
        },
    })
    console.log(`Đã tạo index "${VECTOR_INDEX_NAME}" — Atlas cần ~1 phút để build xong`)
}

;(async () => {
    if (!hasEmbeddingKey()) throw new Error("Thiếu GEMINI_API_KEY trong .env")
    await mongoose.connect(process.env.MONGO_URL)

    const categories = await CategoryProduct.find({}).select("_id title").lean()
    const categoryTitle = new Map(categories.map((c) => [String(c._id), c.title]))

    const products = await Product.find({ delete: false })
        .select("title description content storage screen screenType categoryProduct +embeddingHash")
        .lean()

    const pending = []
    for (const p of products) {
        const text = buildProductEmbeddingText(p, categoryTitle.get(String(p.categoryProduct)))
        const hash = hashText(text)
        if (FORCE || p.embeddingHash !== hash) pending.push({ id: p._id, text, hash })
    }
    console.log(`${products.length} sản phẩm, cần embed ${pending.length}`)

    if (pending.length) {
        const vectors = await embedTexts(pending.map((x) => x.text), "RETRIEVAL_DOCUMENT")
        await Product.bulkWrite(
            pending.map((x, i) => ({
                updateOne: {
                    filter: { _id: x.id },
                    update: { $set: { embedding: vectors[i], embeddingHash: x.hash } },
                    timestamps: false,
                },
            }))
        )
        console.log(`Đã lưu ${pending.length} embedding`)
    }

    await ensureVectorIndex()
    await mongoose.disconnect()
})().catch(async (err) => {
    console.error("Lỗi:", err.message)
    await mongoose.disconnect()
    process.exit(1)
})

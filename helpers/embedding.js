// Embedding ngữ nghĩa qua Gemini (REST) — dùng cho vector search của chatbot RAG
const crypto = require("crypto");
const axios = require("axios");

const EMBEDDING_MODEL = process.env.EMBEDDING_MODEL || "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 768;
const BATCH_SIZE = 100;
const VECTOR_INDEX_NAME = "product_embedding_index";

const QUERY_CACHE_MAX = 300;
const queryCache = new Map();

function hasEmbeddingKey() {
  return Boolean((process.env.GEMINI_API_KEY || "").trim());
}

/**
 * @param {string[]} texts
 * @param {"RETRIEVAL_DOCUMENT"|"RETRIEVAL_QUERY"} taskType
 * @param {number} timeout
 * @returns {Promise<number[][]>}
 */
async function embedTexts(texts, taskType, timeout = 20000) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:batchEmbedContents`;
  const out = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const batch = texts.slice(i, i + BATCH_SIZE);
    const { data, status } = await axios.post(
      url,
      {
        requests: batch.map((text) => ({
          model: `models/${EMBEDDING_MODEL}`,
          content: { parts: [{ text }] },
          taskType,
          outputDimensionality: EMBEDDING_DIMENSIONS,
        })),
      },
      {
        headers: { "x-goog-api-key": process.env.GEMINI_API_KEY },
        timeout,
        validateStatus: () => true,
      }
    );
    if (status >= 400 || !Array.isArray(data?.embeddings)) {
      const msg = data?.error?.message || JSON.stringify(data).slice(0, 200);
      throw new Error(`Gemini embedding ${status}: ${msg}`);
    }
    out.push(...data.embeddings.map((e) => e.values));
  }
  return out;
}

/** Embedding câu hỏi khách (có cache — câu hỏi lặp lại không gọi API) */
async function embedQuery(text, timeout) {
  const key = String(text || "").trim().toLowerCase();
  if (queryCache.has(key)) return queryCache.get(key);

  const [vector] = await embedTexts([key], "RETRIEVAL_QUERY", timeout);
  if (queryCache.size >= QUERY_CACHE_MAX) {
    queryCache.delete(queryCache.keys().next().value);
  }
  queryCache.set(key, vector);
  return vector;
}

function plainText(html, max) {
  const s = String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return s.length > max ? s.slice(0, max) : s;
}

/** Văn bản đại diện sản phẩm để embedding (tên, danh mục, cấu hình, mô tả) */
function buildProductEmbeddingText(product, categoryTitle) {
  return [
    `Sản phẩm: ${product.title || ""}`,
    categoryTitle ? `Danh mục: ${categoryTitle}` : "",
    product.storage ? `Bộ nhớ: ${product.storage}` : "",
    product.screen ? `Màn hình: ${product.screen}` : "",
    product.screenType ? `Loại màn hình: ${product.screenType}` : "",
    product.description ? `Mô tả: ${plainText(product.description, 1200)}` : "",
    product.content ? `Chi tiết: ${plainText(product.content, 1500)}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function hashText(text) {
  return crypto
    .createHash("sha1")
    .update(`${EMBEDDING_MODEL}:${EMBEDDING_DIMENSIONS}:${text}`)
    .digest("hex");
}

/**
 * Cập nhật embedding 1 sản phẩm sau khi admin thêm/sửa (gọi không await — lỗi chỉ ghi log).
 * Nội dung không đổi (hash trùng) thì bỏ qua, không tốn API.
 */
async function refreshProductEmbedding(productId) {
  if (!hasEmbeddingKey()) return;
  const Product = require("../models/product.model");
  const CategoryProduct = require("../models/category-product.model");
  try {
    const product = await Product.findById(productId)
      .select("title description content storage screen screenType categoryProduct +embeddingHash")
      .lean();
    if (!product) return;
    const category = product.categoryProduct
      ? await CategoryProduct.findById(product.categoryProduct).select("title").lean().catch(() => null)
      : null;
    const text = buildProductEmbeddingText(product, category?.title);
    const hash = hashText(text);
    if (product.embeddingHash === hash) return;
    const [vector] = await embedTexts([text], "RETRIEVAL_DOCUMENT");
    await Product.updateOne(
      { _id: productId },
      { $set: { embedding: vector, embeddingHash: hash } },
      { timestamps: false }
    );
  } catch (err) {
    console.warn(`Embedding sản phẩm ${productId} lỗi:`, err.message);
  }
}

module.exports = {
  EMBEDDING_DIMENSIONS,
  refreshProductEmbedding,
  VECTOR_INDEX_NAME,
  hasEmbeddingKey,
  embedTexts,
  embedQuery,
  buildProductEmbeddingText,
  hashText,
};

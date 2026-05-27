const Product = require("../models/product.model");
const CategoryProduct = require("../models/category-product.model");
const productsCategoryHelper = require("./products-category");
const { classifyIntent } = require("./chatbotIntentRouter");

const STORE_NAME = "Vô Thường";
const STORE_HOTLINE = "1900 1234";

/** Cache danh mục + số lượng SP (giảm tải DB) */
const CACHE_TTL_MS = 5 * 60 * 1000;
let categoryIndexCache = { at: 0, data: null };
let totalProductsCache = { at: 0, value: 0 };

const STOP_WORDS = new Set([
  "cho", "tôi", "mình", "bạn", "có", "không", "nào", "gì", "muốn", "mua",
  "cần", "với", "và", "của", "được", "là", "thì", "như", "để", "hay", "hoặc",
  "xin", "chào", "hello", "hi", "hey", "alo", "về", "thì", "ạ", "nhé", "giúp",
  "tư", "vấn", "gợi", "ý", "sản", "phẩm", "shop", "store", "please",
  "dưới", "trên", "tầm", "triệu", "tr", "m", "từ", "đến", "khoảng", "ngân",
  "sách", "bao", "nhiêu", "tiền", "vnd", "đồng",
]);

const CATEGORY_HINTS = [
  { pattern: /điện thoại|smartphone|phone|iphone|android/i, search: /điện thoại|phone|smartphone/i },
  { pattern: /laptop|máy tính|macbook|notebook|gaming/i, search: /laptop|máy tính|macbook/i },
  { pattern: /tai nghe|headphone|earphone|airpod/i, search: /tai nghe|headphone|phụ kiện/i },
  { pattern: /tablet|ipad|máy tính bảng/i, search: /tablet|ipad|máy tính bảng/i },
  { pattern: /phụ kiện|sạc|cáp|ốp/i, search: /phụ kiện|sạc|cáp/i },
];

const BRAND_PATTERN =
  /iphone|samsung|xiaomi|oppo|vivo|realme|macbook|apple|asus|acer|dell|hp|lenovo|sony|jbl|beats/gi;

const LAPTOP_CAT_RE =
  /laptop|macbook|mackbook|dell|asus|acer|lenovo|hp|msi|surface|vostro|inspiron|thinkpad|pavilion|predator|nitro|legion|gaming|notebook|workstation/i;
const PHONE_CAT_RE =
  /dien-thoai|điện thoại|iphone|samsung|xiaomi|oppo|vivo|realme|google|pixel/i;

function getEffectivePrice(product) {
  const price = Number(product.price) || 0;
  const discount = Number(product.discountPercentage) || 0;
  if (discount > 0) return Math.round(price * (1 - discount / 100));
  return price;
}

function formatVnd(amount) {
  return `${Number(amount).toLocaleString("vi-VN")}đ`;
}

function asText(value) {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

function stripHtml(html) {
  return asText(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getStockInfo(product) {
  const fromRootQty = Number(product.quantity);
  const fromTotalQty = Number(product.totalQuantity);
  let qty = Math.max(
    Number.isFinite(fromRootQty) && fromRootQty >= 0 ? fromRootQty : 0,
    Number.isFinite(fromTotalQty) && fromTotalQty >= 0 ? fromTotalQty : 0
  );
  if (product.variations?.length) {
    const fromVariants = product.variations.reduce(
      (sum, v) => sum + (Number(v.quantity) || 0),
      0
    );
    qty = Math.max(qty, fromVariants);
  }
  return {
    quantity: qty,
    label: qty > 0 ? `Còn hàng (${qty})` : "Hết hàng",
    inStock: qty > 0,
  };
}

function parseBudget(text) {
  const lower = text.toLowerCase().replace(/,/g, ".");
  let min = null;
  let max = null;

  let m = lower.match(/dưới\s+(\d+(?:\.\d+)?)\s*(triệu|tr|m)\b/);
  if (m) max = parseFloat(m[1]) * 1_000_000;

  m = lower.match(/(?:trên|hơn|từ)\s+(\d+(?:\.\d+)?)\s*(triệu|tr|m)\b/);
  if (m && !lower.includes("đến")) min = parseFloat(m[1]) * 1_000_000;

  m = lower.match(/(\d+(?:\.\d+)?)\s*(?:-\s*|đến\s+)(\d+(?:\.\d+)?)\s*(triệu|tr|m)\b/);
  if (m) {
    min = parseFloat(m[1]) * 1_000_000;
    max = parseFloat(m[2]) * 1_000_000;
  }

  m = lower.match(/tầm\s+(\d+(?:\.\d+)?)\s*(triệu|tr|m)\b/);
  if (m) {
    const center = parseFloat(m[1]) * 1_000_000;
    min = center * 0.85;
    max = center * 1.15;
  }

  if (lower.includes("giá rẻ") || lower.includes("rẻ nhất")) max = max ?? 5_000_000;
  if (lower.includes("tầm trung") && min == null && max == null) {
    min = 5_000_000;
    max = 15_000_000;
  }
  if (lower.includes("cao cấp") || lower.includes("flagship")) min = min ?? 15_000_000;

  return { min, max };
}

function extractSearchTerms(message) {
  const words = String(message || "")
    .toLowerCase()
    .replace(/[^\w\sà-ỹ]/gi, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));

  const brands = message.match(BRAND_PATTERN) || [];
  return [...new Set([...words, ...brands.map((b) => b.toLowerCase())])].slice(0, 12);
}

/** Dòng sản phẩm chính từ câu hỏi — dùng lọc danh mục chặt */
function detectProductLine(message) {
  const m = String(message || "").toLowerCase();

  const wantsTablet = /tablet|ipad|máy tính bảng/i.test(m);
  const wantsAccessory =
    /tai nghe|headphone|phụ kiện|sạc|cáp|ốp|airpod|earphone/i.test(m);

  const wantsLaptop =
    /laptop|macbook|mackbook|notebook|máy tính(?!\s*bảng)|thinkpad|surface|vostro|inspiron|pavilion|predator|nitro|legion|workstation/i.test(
      m
    ) || (/gaming/i.test(m) && /laptop|macbook|máy tính|notebook|pc/i.test(m));

  const wantsPhone =
    /điện thoại|smartphone|iphone|android|redmi|galaxy\s|oppo reno|realme|pixel/i.test(
      m
    ) && !wantsLaptop;

  if (wantsTablet) return "tablet";
  if (wantsAccessory) return "accessory";
  if (wantsLaptop && !wantsPhone) return "laptop";
  if (wantsPhone && !wantsLaptop) return "phone";
  if (wantsLaptop && wantsPhone) return null;
  return null;
}

function categoryIdsForLine(line, categories) {
  const ids = new Set();
  if (!line) return ids;

  for (const c of categories) {
    const blob = `${c.slug || ""} ${c.title || ""}`.toLowerCase();
    const laptopHit = LAPTOP_CAT_RE.test(blob);
    const phoneHit = PHONE_CAT_RE.test(blob);

    if (line === "laptop") {
      if (laptopHit && !/sim-the|tai-nghe|phu-kien|tablet|may-in|dieu-hoa|tra\b/i.test(blob))
        ids.add(String(c._id));
    } else if (line === "phone") {
      if (phoneHit && !laptopHit) ids.add(String(c._id));
    } else if (line === "tablet") {
      if (/tablet|ipad|máy tính bảng/i.test(blob)) ids.add(String(c._id));
    } else if (line === "accessory") {
      if (/phụ kiện|tai nghe|sạc|cáp|ốp|phu-kien/i.test(blob)) ids.add(String(c._id));
    }
  }
  return ids;
}

async function expandWithSubcategories(rootIds) {
  const all = new Set([...rootIds].map(String));
  for (const id of rootIds) {
    try {
      const subs = await productsCategoryHelper.getSubCategory(id);
      for (const sub of subs) {
        all.add(String(sub._id || sub.id));
      }
    } catch (_) {
      /* ignore */
    }
  }
  return [...all];
}

async function loadCategoryIndex() {
  const now = Date.now();
  if (categoryIndexCache.data && now - categoryIndexCache.at < CACHE_TTL_MS) {
    return categoryIndexCache.data;
  }

  const categories = await CategoryProduct.find({
    status: "active",
    delete: false,
  })
    .select("_id title slug parent_id description")
    .sort({ position: 1 })
    .lean();

  const byId = new Map();
  categories.forEach((c) => byId.set(String(c._id), c));

  const counts = await Product.aggregate([
    { $match: { status: "active", delete: false } },
    { $group: { _id: "$categoryProduct", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((r) => [String(r._id), r.count]));

  const data = { categories, byId, countMap };
  categoryIndexCache = { at: now, data };
  return data;
}

async function getTotalProductsCached() {
  const now = Date.now();
  if (now - totalProductsCache.at < CACHE_TTL_MS) {
    return totalProductsCache.value;
  }
  const n = await Product.countDocuments({ status: "active", delete: false });
  totalProductsCache = { at: now, value: n };
  return n;
}

async function findCategoryIdsFromHints(message) {
  const ids = new Set();
  const orTitle = [];

  for (const hint of CATEGORY_HINTS) {
    if (hint.pattern.test(message)) {
      orTitle.push({ title: hint.search });
    }
  }

  for (const term of extractSearchTerms(message)) {
    if (term.length >= 3) {
      orTitle.push({ title: { $regex: term, $options: "i" } });
    }
  }

  if (!orTitle.length) return { ids, categories: [] };

  const categories = await CategoryProduct.find({
    delete: false,
    status: "active",
    $or: orTitle,
  })
    .select("_id title slug")
    .lean();

  categories.forEach((c) => ids.add(String(c._id)));
  return { ids, categories };
}

function buildTextOrConditions(terms) {
  const or = [];
  for (const term of terms) {
    if (term.length < 2) continue;
    const regex = { $regex: term, $options: "i" };
    or.push(
      { title: regex },
      { description: regex },
      { content: regex },
      { storage: regex },
      { screen: regex }
    );
  }
  return or;
}

function scoreProduct(product, message, terms, categoryById, searchMode) {
  let score = 0;
  const lowerMsg = message.toLowerCase();
  const title = asText(product.title).toLowerCase();
  const desc = stripHtml(product.description).toLowerCase();
  const contentTxt = stripHtml(product.content || "").toLowerCase();
  const storage = asText(product.storage).toLowerCase();

  for (const term of terms) {
    if (title.includes(term)) score += 10;
    if (desc.includes(term)) score += 4;
    if (contentTxt.includes(term)) score += 3;
    if (storage.includes(term)) score += 3;
  }

  if (/gaming|game|chơi game/i.test(message)) {
    if (/gaming|rtx|gtx|nitro|legion|rog|tuf|omen|katana|predator/i.test(title))
      score += 18;
  }

  if (searchMode === "laptop_strict") {
    if (
      /redmi note|galaxy a\d|iphone\s|oppo a\d|realme c/i.test(title) &&
      !/macbook|surface|laptop|dell|asus|acer|hp|lenovo|thinkpad|vostro|inspiron|pavilion|nitro|legion|predator|msi|gaming/i.test(
        title
      )
    ) {
      score -= 80;
    }
  }

  if (product.featured === "1" || product.featured === 1) score += 2;
  score += Math.max(0, 5 - (Number(product.position) || 0) / 10);

  const cat = categoryById.get(String(product.categoryProduct));
  if (cat?.title && lowerMsg.includes(cat.title.toLowerCase())) score += 6;

  if (getStockInfo(product).inStock) score += 1;

  return score;
}

function buildProductRecord(product, categoryById, index) {
  const cat = categoryById.get(String(product.categoryProduct));
  const priceOriginal = Number(product.price) || 0;
  const discount = Number(product.discountPercentage) || 0;
  const priceFinal = getEffectivePrice(product);
  const stock = getStockInfo(product);
  const desc = stripHtml(product.description);
  const contentPlain = stripHtml(product.content || "");

  const lines = [
    `### Sản phẩm #${index} — ${product.title}`,
    "",
    "| Trường | Giá trị (từ database) |",
    "|--------|----------------------|",
    `| Mã tham chiếu | ${product._id} |`,
    `| Tên | ${product.title} |`,
    `| Slug | ${product.slug} |`,
    `| Danh mục | ${cat?.title || "Chưa phân loại"} |`,
    `| Link danh mục | ${cat?.slug ? `/products/category/${cat.slug}` : "—"} |`,
    `| Giá niêm yết | ${formatVnd(priceOriginal)} |`,
    `| Giảm giá | ${discount > 0 ? `${discount}%` : "Không"} |`,
    `| Giá sau giảm | ${formatVnd(priceFinal)} |`,
    `| Tình trạng kho | ${stock.label} |`,
    `| Số lượng (DB: quantity / totalQuantity / biến thể) | ${stock.quantity} |`,
  ];

  if (product.thumbnail) {
    lines.push(`| Ảnh đại diện | ${asText(product.thumbnail)} |`);
  }

  if (product.storage) lines.push(`| Bộ nhớ / Dung lượng | ${asText(product.storage)} |`);
  if (product.screen) lines.push(`| Màn hình | ${asText(product.screen)} |`);
  if (product.screenType) lines.push(`| Loại màn hình | ${asText(product.screenType)} |`);

  if (product.variations?.length) {
    const variants = product.variations
      .map((v) => `${v.color}: ${Number(v.quantity) || 0} chiếc`)
      .join("; ");
    lines.push(`| Biến thể màu | ${variants} |`);
  }

  if (desc) {
    const short = desc.length > 220 ? `${desc.slice(0, 220)}…` : desc;
    lines.push(`| Mô tả (description) | ${short} |`);
  }

  if (contentPlain) {
    const shortC = contentPlain.length > 280 ? `${contentPlain.slice(0, 280)}…` : contentPlain;
    lines.push(`| Nội dung chi tiết (content) | ${shortC} |`);
  }

  lines.push(`| Link chi tiết | /products/detail/${product.slug} |`);
  lines.push("");

  return lines.join("\n");
}

function formatBudgetLine(budget) {
  if (budget.min == null && budget.max == null) return "Không áp dụng bộ lọc giá.";
  const parts = [];
  if (budget.min != null) parts.push(`từ ${formatVnd(budget.min)}`);
  if (budget.max != null) parts.push(`đến ${formatVnd(budget.max)}`);
  return parts.join(" ");
}

function buildStoreDocument({
  message,
  intent,
  terms,
  budget,
  products,
  categoryIndex,
  totalProducts,
  productLine,
  searchMode,
}) {
  const { categories, byId, countMap } = categoryIndex;
  const now = new Date().toISOString();

  const doc = [];

  doc.push(`# TÀI LIỆU TƯ VẤN — ${STORE_NAME}`);
  doc.push("");
  doc.push("> **Nguồn dữ liệu:** MongoDB (`products`, `category-products`)");
  doc.push(`> **Thời điểm truy vấn:** ${now}`);
  doc.push(`> **Câu hỏi khách hàng:** "${message}"`);
  doc.push(`> **Ý định:** ${intent}`);
  doc.push(
    `> **Lọc dòng sản phẩm:** ${productLine || "tự do (theo từ khóa + danh mục gợi ý)"} | **Chế độ tìm:** ${searchMode}`
  );
  doc.push("");
  doc.push("---");
  doc.push("");
  doc.push("## 1. Thông tin cửa hàng");
  doc.push("");
  doc.push(`- **Tên:** ${STORE_NAME}`);
  doc.push(`- **Hotline:** ${STORE_HOTLINE}`);
  doc.push(`- **Tổng sản phẩm đang bán:** ${totalProducts}`);
  doc.push("- **Trang sản phẩm:** /products");
  doc.push("");
  doc.push("## 2. Danh mục hàng hóa (database)");
  doc.push("");
  doc.push("| STT | Danh mục | Slug | Số SP |");
  doc.push("|-----|----------|------|-------|");

  categories.forEach((c, i) => {
    const count = countMap.get(String(c._id)) || 0;
    doc.push(`| ${i + 1} | ${c.title} | ${c.slug} | ${count} |`);
  });

  doc.push("");
  doc.push("## 3. Bộ lọc suy luận từ câu hỏi");
  doc.push("");
  doc.push(`- **Từ khóa tìm kiếm:** ${terms.length ? terms.join(", ") : "(không có)"}`);
  doc.push(`- **Ngân sách:** ${formatBudgetLine(budget)}`);
  doc.push("");
  doc.push("## 4. Sản phẩm phù hợp (chỉ được phép tư vấn các mục dưới đây)");
  doc.push("");

  if (!products.length) {
    doc.push(
      "_Không có sản phẩm nào trong database khớp bộ lọc trên. Thông báo khách và gợi ý xem danh mục ở mục 2 hoặc gọi hotline._"
    );
  } else {
    doc.push(`_Tìm thấy ${products.length} sản phẩm. Sắp xếp theo mức độ liên quan._`);
    doc.push("");
    products.forEach((p, i) => {
      doc.push(buildProductRecord(p, byId, i + 1));
    });
  }

  doc.push("---");
  doc.push("");
  doc.push("## 5. Quy tắc sử dụng tài liệu (cho AI)");
  doc.push("");
  doc.push("- Chỉ trích dẫn sản phẩm có trong **Mục 4**.");
  doc.push("- Giá bán = cột **Giá sau giảm**; không tự tính lại.");
  doc.push("- Không có trong Mục 4 = cửa hàng **không có** sản phẩm đó trong DB.");
  doc.push("- Luôn kèm **Link chi tiết** khi gợi ý sản phẩm.");
  doc.push("- Không bịa thông số, không thêm sản phẩm ngoài tài liệu.");

  return doc.join("\n");
}

async function fetchProductsForQuery(baseQuery, queryExtra, limit) {
  return Product.find({ ...baseQuery, ...queryExtra })
    .select(
      "title slug price quantity totalQuantity discountPercentage description content variations storage screen screenType categoryProduct featured position thumbnail"
    )
    .sort({ featured: -1, position: -1, createdAt: -1 })
    .limit(limit)
    .lean();
}

function applyBudgetFilter(products, budget) {
  if (budget.min == null && budget.max == null) return products;
  return products.filter((p) => {
    const price = getEffectivePrice(p);
    if (budget.min != null && price < budget.min) return false;
    if (budget.max != null && price > budget.max) return false;
    return true;
  });
}

function rankAndSlice(products, message, terms, categoryById, searchMode, slice = 6) {
  return products
    .map((p) => ({
      product: p,
      score: scoreProduct(p, message, terms, categoryById, searchMode),
    }))
    .sort((a, b) => b.score - a.score)
    .filter((x) => x.score > -50)
    .slice(0, slice)
    .map((x) => x.product);
}

async function retrieveKnowledge(message) {
  const intent = classifyIntent(message);
  const terms = extractSearchTerms(message);
  const budget = parseBudget(message);
  const categoryIndex = await loadCategoryIndex();
  const productLine = detectProductLine(message);

  let strictCategoryIds = categoryIdsForLine(productLine, categoryIndex.categories);
  if (strictCategoryIds.size) {
    strictCategoryIds = new Set(await expandWithSubcategories([...strictCategoryIds]));
  }

  const { ids: hintCategoryIds } = await findCategoryIdsFromHints(message);
  const mergedCategoryFilter = new Set([
    ...strictCategoryIds,
    ...hintCategoryIds,
  ]);

  const baseQuery = { status: "active", delete: false };
  const textOr = buildTextOrConditions(terms);

  let products = [];
  let searchMode = "broad";

  if (strictCategoryIds.size && textOr.length) {
    searchMode = `${productLine}_strict`;
    products = await fetchProductsForQuery(
      baseQuery,
      {
        categoryProduct: { $in: [...strictCategoryIds] },
        $or: textOr,
      },
      50
    );
    if (products.length < 2) {
      products = await fetchProductsForQuery(
        baseQuery,
        { categoryProduct: { $in: [...strictCategoryIds] } },
        40
      );
    }
  } else if (strictCategoryIds.size) {
    searchMode = `${productLine}_category_only`;
    products = await fetchProductsForQuery(
      baseQuery,
      { categoryProduct: { $in: [...strictCategoryIds] } },
      40
    );
  }

  if (!products.length && mergedCategoryFilter.size && textOr.length) {
    searchMode = "hint_category_text";
    products = await fetchProductsForQuery(
      baseQuery,
      {
        categoryProduct: { $in: [...mergedCategoryFilter] },
        $or: textOr,
      },
      45
    );
  }

  if (!products.length && textOr.length) {
    searchMode = "text_only";
    products = await fetchProductsForQuery(baseQuery, { $or: textOr }, 40);
  }

  if (!products.length) {
    searchMode = "featured_fallback";
    products = await fetchProductsForQuery(baseQuery, {}, 18);
  }

  products = applyBudgetFilter(products, budget);

  const modeForScore =
    productLine === "laptop" && strictCategoryIds.size ? "laptop_strict" : "normal";
  products = rankAndSlice(
    products,
    message,
    terms,
    categoryIndex.byId,
    modeForScore,
    6
  );

  const totalProducts = await getTotalProductsCached();

  const document = buildStoreDocument({
    message,
    intent,
    terms,
    budget,
    products,
    categoryIndex,
    totalProducts,
    productLine,
    searchMode,
  });

  return {
    intent,
    document,
    productCount: products.length,
    /** Dùng ghép ảnh sản phẩm dưới bubble chat theo slug trong câu trả lời */
    ragProducts: products.map((p) => ({
      slug: p.slug,
      title: p.title,
      thumbnail: p.thumbnail || "",
    })),
  };
}

function extractProductDetailSlugs(text) {
  const re = /\/products\/detail\/([a-z0-9]+(?:-[a-z0-9]+)*)/gi;
  const slugs = [];
  const seen = new Set();
  let m;
  const s = String(text || "");
  while ((m = re.exec(s)) !== null) {
    const slug = m[1];
    if (!seen.has(slug)) {
      seen.add(slug);
      slugs.push(slug);
    }
  }
  return slugs;
}

/**
 * Theo thứ tự xuất hiện trong câu trả lời bot, lấy slug /products/detail/...
 * Ưu tiên dữ liệu RAG; slug không có trong RAG thì tra DB một lần.
 */
async function resolveProductSuggestions(responseText, ragProducts = []) {
  const slugs = extractProductDetailSlugs(responseText);
  if (!slugs.length) return [];

  const bySlug = new Map(ragProducts.map((p) => [String(p.slug), p]));
  const missing = slugs.filter((slug) => !bySlug.has(slug));

  if (missing.length) {
    const extra = await Product.find({
      slug: { $in: missing },
      status: "active",
      delete: false,
    })
      .select("slug title thumbnail")
      .lean();
    for (const p of extra) {
      bySlug.set(String(p.slug), p);
    }
  }

  return slugs.map((slug) => {
    const p = bySlug.get(slug);
    return {
      slug,
      href: `/products/detail/${slug}`,
      title: p?.title || slug,
      thumbnail: p?.thumbnail ? String(p.thumbnail) : "",
    };
  });
}

function buildSystemPrompt(knowledge) {
  return `Bạn là trợ lý bán hàng ${STORE_NAME}.

Nhiệm vụ: đọc TÀI LIỆU TƯ VẤN bên dưới (100% từ database) và trả lời khách bằng tiếng Việt.

Quy tắc:
- Tuân thủ mục "Quy tắc sử dụng tài liệu" cuối tài liệu.
- Trả lời ngắn gọn, thân thiện (3–6 câu), gợi ý 1–3 sản phẩm phù hợp nhất từ Mục 4.
- Nêu rõ giá sau giảm; mỗi sản phẩm gợi ý phải có một dòng (hoặc cuối câu) chứa đúng đường dẫn /products/detail/<slug> — slug phải khớp cột "Slug" trong tài liệu (để giao diện hiển thị ảnh + link).
- Không có sản phẩm phù hợp → nói rõ và gợi ý danh mục (Mục 2) hoặc hotline ${STORE_HOTLINE}.

${knowledge.document}`;
}

module.exports = {
  retrieveKnowledge,
  buildSystemPrompt,
  buildStoreDocument,
  getEffectivePrice,
  resolveProductSuggestions,
};

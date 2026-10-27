const CategoryProduct = require("../models/category-product.model");
const inventory = require("./inventory");

/**
 * Hồ sơ hiển thị theo loại sản phẩm: quyết định trang chi tiết / thẻ sản phẩm
 * có hiện màn hình, dung lượng, màu sắc hay không và dùng nhãn, icon nào.
 */
const PROFILES = {
  phone: {
    label: "Điện thoại",
    icon: "fa-mobile-alt",
    hasScreen: true,
    hasStorage: true,
    storageLabel: "Dung lượng",
    colorLabel: "Màu sắc",
    perks: ["Bảo hành chính hãng 12 tháng", "1 đổi 1 trong 30 ngày nếu lỗi", "Hỗ trợ trả góp 0%"],
    highlights: ["Màn hình sắc nét, màu sắc trung thực", "Hiệu năng ổn định, đa nhiệm mượt mà", "Pin dung lượng lớn, sạc nhanh", "Camera chụp đẹp trong nhiều điều kiện ánh sáng"],
  },
  tablet: {
    label: "Máy tính bảng",
    icon: "fa-tablet-alt",
    hasScreen: true,
    hasStorage: true,
    storageLabel: "Dung lượng",
    colorLabel: "Màu sắc",
    perks: ["Bảo hành chính hãng 12 tháng", "1 đổi 1 trong 30 ngày nếu lỗi", "Hỗ trợ trả góp 0%"],
    highlights: ["Màn hình lớn cho học tập và giải trí", "Hiệu năng mượt mà", "Pin dùng cả ngày"],
  },
  laptop: {
    label: "Laptop",
    icon: "fa-laptop",
    hasScreen: true,
    hasStorage: true,
    storageLabel: "Ổ cứng",
    colorLabel: "Màu sắc",
    perks: ["Bảo hành chính hãng 12 - 24 tháng", "Cài đặt phần mềm miễn phí", "Hỗ trợ trả góp 0%"],
    highlights: ["Cấu hình mạnh cho học tập và làm việc", "Thiết kế mỏng nhẹ, dễ mang theo", "Bàn phím gõ êm, thời lượng pin tốt"],
  },
  accessory: {
    label: "Phụ kiện",
    icon: "fa-headphones",
    hasScreen: false,
    hasStorage: false,
    colorLabel: "Màu sắc",
    perks: ["Hàng chính hãng", "Đổi mới trong 7 ngày nếu lỗi", "Giao nhanh 2 giờ nội thành"],
    highlights: ["Chất liệu bền bỉ", "Tương thích nhiều thiết bị", "Nhỏ gọn, tiện mang theo"],
  },
  ac: {
    label: "Điều hòa",
    icon: "fa-snowflake",
    hasScreen: false,
    hasStorage: false,
    colorLabel: "Màu sắc",
    perks: ["Miễn phí lắp đặt nội thành", "Bảo hành máy nén lên đến 7 năm", "Giao hàng tận nơi"],
    highlights: ["Làm lạnh nhanh, vận hành êm", "Tiết kiệm điện năng", "Lọc không khí, bảo vệ sức khoẻ"],
  },
  printer: {
    label: "Máy in",
    icon: "fa-print",
    hasScreen: false,
    hasStorage: false,
    colorLabel: "Màu sắc",
    perks: ["Bảo hành chính hãng 12 tháng", "Hỗ trợ cài đặt driver miễn phí", "Giao hàng tận nơi"],
    highlights: ["In nhanh, bản in sắc nét", "Vận hành ổn định cho văn phòng", "Chi phí vật tư hợp lý"],
  },
  sim: {
    label: "Sim, Thẻ cào",
    icon: "fa-sim-card",
    hasScreen: false,
    hasStorage: false,
    colorLabel: "Phân loại",
    perks: ["Kích hoạt nhanh chóng", "Đăng ký chính chủ tại cửa hàng", "Hỗ trợ 24/7"],
    highlights: ["Ưu đãi data hấp dẫn", "Phủ sóng toàn quốc", "Giá tốt"],
  },
  other: {
    label: "Sản phẩm",
    icon: "fa-box",
    hasScreen: false,
    hasStorage: false,
    colorLabel: "Phân loại",
    perks: ["Hàng chính hãng", "Đổi trả trong 7 ngày", "Giao hàng toàn quốc"],
    highlights: ["Chất lượng đảm bảo", "Thiết kế đẹp mắt", "Giá cạnh tranh"],
  },
};

// Thứ tự quan trọng: rule đầu tiên khớp sẽ thắng
const KIND_RULES = [
  ["ac", /dieu hoa|may lanh|air ?con/],
  ["printer", /may in|printer/],
  ["sim", /\bsim\b|the cao/],
  ["other", /dong ho|watch|rolex/],
  ["accessory", /phu kien|tai nghe|op lung|cu sac|sac du phong|cap sac|airpods|gay chup|de sac/],
  ["tablet", /tablet|ipad|\btab\b|may tinh bang/],
  ["laptop", /laptop|macbook|mackbook|\bdell\b|asus|lenovo|matebook|\bhp\b/],
  ["phone", /dien thoai|iphone|samsung|xiaomi|oppo|realme|vivo|galaxy|redmi/],
];

const COLOR_HEX = {
  den: "#1f2937",
  trang: "#f9fafb",
  bac: "#d1d5db",
  xam: "#6b7280",
  "xam khong gian": "#4b5563",
  vang: "#facc15",
  "anh sao": "#f5ecd7",
  dong: "#b87333",
  do: "#dc2626",
  hong: "#f472b6",
  tim: "#9333ea",
  "tim man": "#7e3a5f",
  "tim khoi": "#8b7fa8",
  xanh: "#2563eb",
  "xanh la": "#16a34a",
  "xanh ngoc": "#14b8a6",
  "xanh sierra": "#7ea3c4",
  "xanh celestial": "#3b5b8c",
  cam: "#f97316",
  "trang ngoc trai": "#f3f0e8",
};

function normalize(text) {
  return String(text || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}

function matchKind(text) {
  const s = normalize(text);
  if (!s) return null;
  const rule = KIND_RULES.find(([, re]) => re.test(s));
  return rule ? rule[0] : null;
}

/** Màu: nhận mã hex trực tiếp hoặc tên màu tiếng Việt ("Màu đen", "Xanh Sierra") */
function colorSwatch(name) {
  const raw = String(name || "").trim();
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(raw)) return raw;
  const key = normalize(raw).replace(/^mau\s+/, "");
  if (COLOR_HEX[key]) return COLOR_HEX[key];
  const first = Object.keys(COLOR_HEX)
    .sort((a, b) => b.length - a.length)
    .find((k) => key.startsWith(k));
  return first ? COLOR_HEX[first] : null;
}

async function loadCategoryMap() {
  const categories = await CategoryProduct.find({ delete: false, status: "active" })
    .select("title slug parent_id")
    .lean();
  return new Map(categories.map((c) => [String(c._id), c]));
}

/** Chuỗi danh mục từ danh mục của sản phẩm lên tới gốc */
function categoryChain(categoryId, categoryMap) {
  const chain = [];
  let current = categoryMap.get(String(categoryId || ""));
  while (current && chain.length < 10) {
    chain.push(current);
    current = categoryMap.get(String(current.parent_id || ""));
  }
  return chain;
}

function detectKind(product, chain) {
  // Tên sản phẩm ưu tiên cho các loại dễ bị xếp nhầm (vd. đồng hồ nằm trong Tablet)
  const byTitle = matchKind(product.title);
  if (byTitle === "other" || byTitle === "accessory") return byTitle;
  for (const cat of chain) {
    const kind = matchKind(cat.title);
    if (kind) return kind;
  }
  return byTitle || "other";
}

function buildCardSpecs(product, profile) {
  const specs = [];
  if (profile.hasScreen && product.screen) {
    specs.push({ icon: profile.icon, label: product.screen });
  }
  if (profile.hasStorage && product.storage && typeof product.storage === "string") {
    specs.push({ icon: "fa-hdd", label: product.storage });
  }
  return specs;
}

/**
 * Gắn thông tin danh mục + loại sản phẩm cho danh sách (dùng cho thẻ sản phẩm).
 * Truyền sẵn categoryMap khi đã load để tránh query lặp.
 */
async function attachProfiles(products, categoryMap) {
  const map = categoryMap || (await loadCategoryMap());
  for (const item of products) {
    const chain = categoryChain(item.categoryProduct, map);
    const kind = detectKind(item, chain);
    const profile = PROFILES[kind];
    item.kind = kind;
    item.kindLabel = profile.label;
    item.kindIcon = profile.icon;
    if (chain[0]) item.category = { title: chain[0].title, slug: chain[0].slug };
    item.cardSpecs = buildCardSpecs(item, profile);
    item.inStock = inventory.totalStock(item) > 0;
  }
  return products;
}

module.exports = {
  PROFILES,
  colorSwatch,
  loadCategoryMap,
  categoryChain,
  detectKind,
  attachProfiles,
};

const { PROFILES, colorSwatch } = require("./productProfile");
const inventory = require("./inventory");

const MOCK_THUMBNAIL =
  "https://res.cloudinary.com/dwk6tmsmh/image/upload/v1726925743/bsquy6vj7ktij4aheyzw.jpg";

const MOCK_GALLERY = [
  MOCK_THUMBNAIL,
  "https://res.cloudinary.com/dwk6tmsmh/image/upload/v1726925866/dclwzzorvxdehvhgorzw.webp",
  "https://res.cloudinary.com/dwk6tmsmh/image/upload/v1729341273/zrzv5lyvnzpyfslzncoj.png",
];

const MOCK_STORAGE_OPTIONS = {
  phone: ["128GB", "256GB", "512GB"],
  tablet: ["64GB", "128GB", "256GB"],
  laptop: ["256GB", "512GB", "1TB"],
};

const MOCK_SCREEN = {
  phone: { screen: '6.67 inch', screenType: "IPS LCD, 90Hz" },
  tablet: { screen: "10.9 inch", screenType: "IPS LCD" },
  laptop: { screen: "15.6 inch", screenType: "Full HD IPS" },
};

function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasText(value) {
  return stripHtml(value).length > 0;
}

function buildMockDescription(title, profile) {
  const name = title || "Sản phẩm";
  const items = profile.highlights.map((h) => `  <li>${h}</li>`).join("\n");
  return `<p><strong>${name}</strong> là lựa chọn đáng cân nhắc trong nhóm ${profile.label.toLowerCase()}, cân bằng giữa chất lượng và giá thành.</p>
<ul>
${items}
</ul>`;
}

function buildMockContent(title) {
  const name = title || "Sản phẩm";
  return `<h3>Giới thiệu ${name}</h3>
<p>Sản phẩm được trưng bày tại <strong>Vô Thường</strong> với chính sách bảo hành chính hãng và hỗ trợ đổi trả theo quy định cửa hàng.</p>
<p>Liên hệ hotline <strong>1900 1234</strong> để được tư vấn thêm về sản phẩm và chương trình khuyến mãi.</p>`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Bảng thông số từ dữ liệu thật của sản phẩm, chỉ gồm các dòng phù hợp với loại */
function buildSpecsHtml(product, profile) {
  const rows = [["fa-tag", "Loại sản phẩm", profile.label]];
  if (product.categoryTitle) rows.push(["fa-folder", "Danh mục", product.categoryTitle]);
  if (profile.hasScreen) {
    if (product.screen) rows.push([profile.icon, "Kích thước màn hình", product.screen]);
    if (product.screenType) rows.push(["fa-desktop", "Công nghệ màn hình", product.screenType]);
  }
  if (profile.hasStorage && product.storage) {
    rows.push(["fa-hdd", profile.storageLabel, product.storage]);
  }
  if (product.variations.length) {
    rows.push(["fa-palette", profile.colorLabel, product.variations.map((v) => v.color).join(", ")]);
  }
  rows.push(["fa-boxes", "Tình trạng", product.stock > 0 ? "Còn hàng" : "Hết hàng"]);

  const body = rows
    .map(
      ([icon, label, value]) =>
        `<tr><th scope="row" class="w-50"><i class="fas ${icon} me-2 text-warning"></i>${label}</th><td>${escapeHtml(value)}</td></tr>`
    )
    .join("");
  return `<table class="table table-bordered align-middle"><tbody>${body}</tbody></table>`;
}

function normalizeProductList(productList, product) {
  const profile = PROFILES[product.kind] || PROFILES.other;
  if (!profile.hasStorage) return [];

  const list = Array.isArray(productList)
    ? productList.filter((item) => item && typeof item.storage === "string" && item.storage.trim())
    : [];
  if (list.length > 0) return list;

  // Không có phiên bản khác: chỉ hiện dung lượng hiện tại, không bịa thêm lựa chọn
  return product.storage
    ? [{ slug: product.slug || "#", storage: product.storage, title: product.title, active: true }]
    : [];
}

/**
 * @param rawProduct document sản phẩm
 * @param kind loại sản phẩm (xem PROFILES trong productProfile.js)
 * @param categoryTitle tên danh mục để hiện trong bảng thông số
 */
function normalizeProductDetail(rawProduct, kind = "other", categoryTitle = "") {
  const product =
    rawProduct && typeof rawProduct.toObject === "function"
      ? rawProduct.toObject()
      : { ...(rawProduct || {}) };
  const profile = PROFILES[kind] || PROFILES.other;

  const title = hasText(product.title)
    ? product.title
    : product.slug
      ? product.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Sản phẩm mẫu";

  product.title = title;
  product.kind = kind;
  product.categoryTitle = categoryTitle;
  product.kindLabel = profile.label;
  product.kindIcon = profile.icon;
  product.perks = profile.perks;
  product.storageLabel = profile.storageLabel;
  product.colorLabel = profile.colorLabel;

  if (!hasText(product.thumbnail)) {
    product.thumbnail = MOCK_THUMBNAIL;
  }

  const images = Array.isArray(product.listImage)
    ? product.listImage.filter((img) => hasText(img) && img !== product.thumbnail)
    : [];
  product.listImage =
    images.length > 0 || product.thumbnail !== MOCK_THUMBNAIL
      ? images
      : MOCK_GALLERY.filter((img) => img !== product.thumbnail);

  if (!Number(product.price)) {
    product.price = 9_999_000;
    product.discountPercentage = Number(product.discountPercentage) || 10;
  }

  if (profile.hasScreen) {
    const mock = MOCK_SCREEN[kind] || MOCK_SCREEN.phone;
    if (!hasText(product.screen)) product.screen = mock.screen;
    if (!hasText(product.screenType)) product.screenType = mock.screenType;
  } else {
    product.screen = "";
    product.screenType = "";
  }

  if (Array.isArray(product.storage)) {
    product.storage = product.storage.filter(hasText).join(", ");
  }
  if (profile.hasStorage) {
    if (!hasText(product.storage)) {
      // Ưu tiên dung lượng ghi trong tên (vd. "Redmi Note 13 (6GB 128GB)" → 128GB)
      const fromTitle = title.match(/\d+\s?(?:GB|TB)/gi);
      product.storage = fromTitle
        ? fromTitle[fromTitle.length - 1].replace(/\s/g, "").toUpperCase()
        : MOCK_STORAGE_OPTIONS[kind]?.[1] || "";
    }
  } else {
    product.storage = "";
  }

  const variations = Array.isArray(product.variations)
    ? product.variations.filter((v) => hasText(v.color))
    : [];
  // Chỉ hiển thị màu có thật trong dữ liệu (không bịa màu/tồn kho)
  product.variations = variations.map((v) => ({
    ...v,
    quantity: Math.max(0, Number(v.quantity) || 0),
    swatch: colorSwatch(v.color),
  }));
  // Chỉ một lựa chọn "Mặc định" thì không cần cho khách chọn
  product.showVariations = !(
    product.variations.length === 1 && /mặc định|mac dinh/i.test(product.variations[0].color)
  ) && product.variations.length > 0;

  // Màu chọn sẵn: màu đầu tiên còn hàng
  if (!product.color && product.variations.length) {
    product.color = (product.variations.find((v) => v.quantity > 0) || product.variations[0]).color;
  }

  // Tồn kho thật (xem helpers/inventory.js); stockSelected là tồn của màu đang chọn
  product.stock = inventory.totalStock(product);
  product.stockSelected = product.variations.length
    ? inventory.stockOf(product, product.color)
    : product.stock;

  if (!hasText(product.description)) {
    product.description = buildMockDescription(title, profile);
  }

  if (!hasText(product.content)) {
    product.content = buildMockContent(title);
  }

  if (!hasText(product.specsHtml)) {
    product.specsHtml = buildSpecsHtml(product, profile);
  }

  if (product.id == null && product._id != null) {
    product.id = String(product._id);
  }

  return product;
}

module.exports = {
  normalizeProductDetail,
  normalizeProductList,
  MOCK_THUMBNAIL,
};

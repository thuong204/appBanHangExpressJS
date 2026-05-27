const MOCK_THUMBNAIL =
  "https://res.cloudinary.com/dwk6tmsmh/image/upload/v1726925743/bsquy6vj7ktij4aheyzw.jpg";

const MOCK_GALLERY = [
  MOCK_THUMBNAIL,
  "https://res.cloudinary.com/dwk6tmsmh/image/upload/v1726925866/dclwzzorvxdehvhgorzw.webp",
  "https://res.cloudinary.com/dwk6tmsmh/image/upload/v1729341273/zrzv5lyvnzpyfslzncoj.png",
];

const MOCK_STORAGE_OPTIONS = ["128GB", "256GB", "512GB"];

const MOCK_VARIATIONS = [
  { color: "#1a1a1a", quantity: 12 },
  { color: "#ffffff", quantity: 10 },
  { color: "#2563eb", quantity: 8 },
];

const MOCK_SPECS = [
  { icon: "fa-mobile-alt", label: 'Màn hình 6.67" HD+' },
  { icon: "fa-desktop", label: "Tấm nền IPS LCD, 90Hz" },
  { icon: "fa-microchip", label: "Chip xử lý 8 nhân" },
  { icon: "fa-camera", label: "Camera chính 50MP" },
  { icon: "fa-battery-full", label: "Pin 5000mAh, sạc nhanh" },
];

function stripHtml(html) {
  return String(html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasText(value) {
  return stripHtml(value).length > 0;
}

function getStockQuantity(product) {
  const fromRootQty = Number(product.quantity);
  const fromTotalQty = Number(product.totalQuantity);
  let qty = Math.max(
    Number.isFinite(fromRootQty) && fromRootQty >= 0 ? fromRootQty : 0,
    Number.isFinite(fromTotalQty) && fromTotalQty >= 0 ? fromTotalQty : 0
  );

  if (Array.isArray(product.variations) && product.variations.length) {
    const fromVariants = product.variations.reduce(
      (sum, v) => sum + (Number(v.quantity) || 0),
      0
    );
    qty = Math.max(qty, fromVariants);
  }

  return qty > 0 ? qty : 99;
}

function buildMockDescription(title) {
  const name = title || "Sản phẩm";
  return `<p><strong>${name}</strong> là lựa chọn cân bằng giữa hiệu năng và thiết kế, phù hợp nhu cầu học tập, làm việc và giải trí hằng ngày.</p>
<ul>
  <li>Màn hình sắc nét, màu sắc trung thực</li>
  <li>Hiệu năng ổn định, xử lý đa tác vụ mượt mà</li>
  <li>Pin dung lượng lớn, sạc nhanh tiện lợi</li>
  <li>Camera sắc nét trong nhiều điều kiện ánh sáng</li>
</ul>`;
}

function buildMockContent(title) {
  const name = title || "Sản phẩm";
  return `<h3>Giới thiệu ${name}</h3>
<p>Sản phẩm được trưng bày tại <strong>Vô Thường</strong> với chính sách bảo hành chính hãng và hỗ trợ đổi trả theo quy định cửa hàng.</p>
<p>Thiết kế gọn nhẹ, dễ cầm nắm; hệ thống âm thanh rõ ràng; kết nối Wi‑Fi, Bluetooth và cổng sạc tiêu chuẩn.</p>
<p>Liên hệ hotline <strong>1900 1234</strong> để được tư vấn thêm về cấu hình, màu sắc và chương trình khuyến mãi.</p>`;
}

function buildMockSpecsHtml() {
  const rows = MOCK_SPECS.map(
    (s) =>
      `<tr><td><i class="fas ${s.icon} me-2"></i>${s.label}</td><td>Thông số mẫu</td></tr>`
  ).join("");
  return `<table class="table table-bordered"><tbody>${rows}</tbody></table>`;
}

function normalizeProductList(productList, product) {
  const list = Array.isArray(productList) ? productList.filter(Boolean) : [];
  if (list.length > 0) return list;

  const slug = product.slug || "#";
  const activeStorage = product.storage || "256GB";

  return MOCK_STORAGE_OPTIONS.map((storage) => ({
    slug,
    storage,
    title: product.title,
    color: product.color,
    active: storage === activeStorage,
  }));
}

function normalizeProductDetail(rawProduct) {
  const product =
    rawProduct && typeof rawProduct.toObject === "function"
      ? rawProduct.toObject()
      : { ...(rawProduct || {}) };

  const title = hasText(product.title)
    ? product.title
    : product.slug
      ? product.slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
      : "Sản phẩm mẫu";

  product.title = title;

  if (!hasText(product.thumbnail)) {
    product.thumbnail = MOCK_THUMBNAIL;
  }

  const images = Array.isArray(product.listImage)
    ? product.listImage.filter((img) => hasText(img))
    : [];
  product.listImage =
    images.length > 0
      ? images
      : MOCK_GALLERY.filter((img) => img !== product.thumbnail);

  if (!Number(product.price)) {
    product.price = 9_999_000;
    product.discountPercentage = Number(product.discountPercentage) || 10;
  }

  if (!hasText(product.screen)) {
    product.screen = MOCK_SPECS[0].label;
  }

  if (!hasText(product.screenType)) {
    product.screenType = MOCK_SPECS[1].label;
  }

  if (!hasText(product.storage)) {
    product.storage = "256GB";
  }

  if (!Array.isArray(product.variations) || product.variations.length === 0) {
    product.variations = MOCK_VARIATIONS.map((v) => ({ ...v }));
  }

  if (!product.color && product.variations[0]?.color) {
    product.color = product.variations[0].color;
  }

  product.stock = getStockQuantity(product);

  if (!hasText(product.description)) {
    product.description = buildMockDescription(title);
  }

  if (!hasText(product.content)) {
    product.content = buildMockContent(title);
  }

  if (!hasText(product.specsHtml)) {
    product.specsHtml = buildMockSpecsHtml();
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

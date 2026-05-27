const mongoose = require("mongoose");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const CategoryProduct = require("../../models/category-product.model");
const User = require("../../models/users.model");

function waitForMongo(maxMs = 8000) {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("MongoDB chưa kết nối")),
      maxMs
    );
    mongoose.connection.once("connected", () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

function orderTimestamp(o) {
  if (o.createdAt) return new Date(o.createdAt);
  if (o.dateOrder) return new Date(o.dateOrder);
  return null;
}

function lineTotal(p) {
  const price = Number(p.price) || 0;
  const disc = Number(p.discountPercentage) || 0;
  const qty = Number(p.quantity) || 0;
  const unit = Math.round((price * (100 - disc)) / 100);
  return unit * qty;
}

function orderTotal(o) {
  return (o.products || []).reduce((sum, p) => sum + lineTotal(p), 0);
}

function formatVnd(n) {
  return `${Math.round(Number(n) || 0).toLocaleString("vi-VN")} ₫`;
}

function startOfMonth(d) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function startOfYear(d) {
  return new Date(d.getFullYear(), 0, 1, 0, 0, 0, 0);
}

function endOfYear(d) {
  return new Date(d.getFullYear() + 1, 0, 1, 0, 0, 0, 0);
}

function monthLabelWithYear(monthIndex, year) {
  return `${monthIndex + 1}/${year}`;
}

function parseChartYear(query, fallbackYear) {
  const raw = query.chartYear ?? query.year;
  const y = parseInt(raw, 10);
  if (Number.isFinite(y) && y >= 2000 && y <= 2100) return y;
  return fallbackYear;
}

function boundsForCalendarYear(y) {
  const start = new Date(y, 0, 1, 0, 0, 0, 0);
  const end = new Date(y + 1, 0, 1, 0, 0, 0, 0);
  return { start, end };
}

function statusBadgeClass(status) {
  const s = String(status || "");
  if (s === "Đã thanh toán" || s === "Paid" || s === "delivered")
    return "success";
  if (s === "Chưa thanh toán" || s === "pending") return "warning";
  if (s === "Đang xử lý" || s === "processing") return "primary";
  if (s === "Đang giao hàng" || s === "shipping") return "info";
  if (s === "Đã hủy" || s === "canceled") return "danger";
  return "secondary";
}

function statusLabelVi(status) {
  const s = String(status || "");
  const map = {
    "Chưa thanh toán": "Chưa thanh toán",
    "Đã thanh toán": "Đã thanh toán",
    "Đang xử lý": "Đang xử lý",
    "Đang giao hàng": "Đang giao hàng",
    "Đã giao hàng": "Đã giao hàng",
    "Đã hủy": "Đã hủy",
    pending: "Chờ xác nhận",
    Paid: "Đã thanh toán",
    processing: "Đang xử lý",
    shipping: "Đang giao hàng",
    delivered: "Đã giao hàng",
    canceled: "Đã hủy",
  };
  return map[s] || s || "Không xác định";
}

/** Số sản phẩm đang bán theo danh mục (category-products), không phụ thuộc đơn hàng */
async function buildCategoryProductChart() {
  const categories = await CategoryProduct.find({
    delete: false,
    status: "active",
  })
    .select("title position")
    .sort({ position: "desc" })
    .lean();

  const products = await Product.find({
    delete: false,
    status: "active",
  })
    .select("categoryProduct")
    .lean();

  const countByCategoryId = new Map();
  let uncategorized = 0;

  for (const p of products) {
    const cid = p.categoryProduct ? String(p.categoryProduct) : "";
    if (!cid) {
      uncategorized += 1;
    } else {
      countByCategoryId.set(cid, (countByCategoryId.get(cid) || 0) + 1);
    }
  }

  const labels = [];
  const data = [];

  for (const cat of categories) {
    const count = countByCategoryId.get(String(cat._id)) || 0;
    if (count > 0) {
      labels.push(cat.title || "—");
      data.push(count);
    }
  }

  const knownIds = new Set(categories.map((c) => String(c._id)));
  let orphanCount = 0;
  for (const [cid, count] of countByCategoryId) {
    if (!knownIds.has(cid)) orphanCount += count;
  }

  if (orphanCount > 0) {
    labels.push("Danh mục không còn hiệu lực");
    data.push(orphanCount);
  }
  if (uncategorized > 0) {
    labels.push("Chưa phân loại");
    data.push(uncategorized);
  }

  const total = data.reduce((a, b) => a + b, 0);
  if (labels.length === 0 || total === 0) {
    return {
      labels: ["Chưa có sản phẩm"],
      data: [1],
      total: 0,
    };
  }

  return { labels, data, total };
}

module.exports.index = async (req, res) => {
  const now = new Date();
  const currentCalendarYear = now.getFullYear();
  const chartYear = parseChartYear(req.query, currentCalendarYear);
  const { start: chartYearStart, end: chartYearEnd } =
    boundsForCalendarYear(chartYear);

  const monthStart = startOfMonth(now);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const yearStart = startOfYear(now);
  const yearEnd = endOfYear(now);

  const defaults = {
    pageTitle: "Tổng quan",
    revenueMonth: formatVnd(0),
    revenueYear: formatVnd(0),
    revenueSelectedYear: formatVnd(0),
    chartYear: currentCalendarYear,
    currentCalendarYear,
    availableChartYears: [currentCalendarYear],
    newOrdersCount: 0,
    newUsersCount: 0,
    recentOrders: [],
    topProducts: [],
    revenueByMonthMillions: Array(12).fill(0),
    monthLabels: Array.from({ length: 12 }, (_, i) =>
      monthLabelWithYear(i, currentCalendarYear)
    ),
    categoryChartLabels: ["Chưa có sản phẩm"],
    categoryChartData: [1],
    categoryProductTotal: 0,
    updatedAt: now.toLocaleString("vi-VN"),
  };

  try {
    await waitForMongo();

    const allOrdersLean = await Order.find({}).sort({ createdAt: -1 }).lean();

    const availableYearsSet = new Set();
    for (const o of allOrdersLean) {
      const ts = orderTimestamp(o);
      if (ts && !Number.isNaN(ts.getTime())) {
        availableYearsSet.add(ts.getFullYear());
      }
    }
    availableYearsSet.add(currentCalendarYear);
    availableYearsSet.add(chartYear);
    const availableChartYears = [...availableYearsSet].sort((a, b) => b - a);

    let revenueMonth = 0;
    let revenueYear = 0;
    const revenueByMonth = Array(12).fill(0);

    for (const o of allOrdersLean) {
      const ts = orderTimestamp(o);
      if (!ts || Number.isNaN(ts.getTime())) continue;
      const total = orderTotal(o);

      if (ts >= monthStart && ts < monthEnd) {
        revenueMonth += total;
      }
      if (ts >= yearStart && ts < yearEnd) {
        revenueYear += total;
      }
      if (ts >= chartYearStart && ts < chartYearEnd) {
        const m = ts.getMonth();
        if (m >= 0 && m < 12) revenueByMonth[m] += total;
      }
    }

    const revenueSelectedYear = revenueByMonth.reduce((a, b) => a + b, 0);

    const newOrdersCount = allOrdersLean.filter((o) => {
      const ts = orderTimestamp(o);
      return ts && ts >= monthStart && ts < monthEnd;
    }).length;

    const newUsersCount = await User.countDocuments({
      deleted: { $ne: true },
      createdAt: { $gte: monthStart, $lt: monthEnd },
    });

    const recentRaw = allOrdersLean.slice(0, 6);

    const recentOrders = recentRaw.map((o) => {
      const ts = orderTimestamp(o);
      return {
        id: String(o._id),
        code: String(o._id).slice(-6).toUpperCase(),
        customer: o.userInfo?.fullName || "—",
        status: o.status,
        statusClass: statusBadgeClass(o.status),
        statusLabel: statusLabelVi(o.status),
        total: formatVnd(orderTotal(o)),
        time: ts
          ? ts.toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })
          : "—",
      };
    });

    const productAgg = new Map();
    for (const o of allOrdersLean) {
      for (const p of o.products || []) {
        const pid = String(p.product_id);
        const rev = lineTotal(p);
        const qty = Number(p.quantity) || 0;
        const cur = productAgg.get(pid) || { qty: 0, revenue: 0 };
        cur.qty += qty;
        cur.revenue += rev;
        productAgg.set(pid, cur);
      }
    }

    const topIds = [...productAgg.entries()]
      .sort((a, b) => b[1].qty - a[1].qty)
      .slice(0, 5)
      .map(([id]) => id);

    const productsTop =
      topIds.length > 0
        ? await Product.find({
            _id: { $in: topIds },
          })
            .select("title categoryProduct quantity totalQuantity")
            .lean()
        : [];

    const catIds = [
      ...new Set(productsTop.map((p) => String(p.categoryProduct)).filter(Boolean)),
    ];
    const cats = await CategoryProduct.find({ _id: { $in: catIds } })
      .select("title")
      .lean();
    const catTitleById = new Map(cats.map((c) => [String(c._id), c.title || "—"]));

    const topProducts = topIds.map((id) => {
      const agg = productAgg.get(id) || { qty: 0, revenue: 0 };
      const prod = productsTop.find((p) => String(p._id) === id);
      const q = Number(prod?.quantity) || 0;
      const tq = Number(prod?.totalQuantity) || 0;
      const stock = Math.max(q, tq);
      return {
        title: prod?.title || "Sản phẩm đã xóa",
        category: prod?.categoryProduct
          ? catTitleById.get(String(prod.categoryProduct)) || "—"
          : "—",
        soldQty: agg.qty,
        revenue: formatVnd(agg.revenue),
        stock: stock || "—",
      };
    });

    const categoryChartRows = await buildCategoryProductChart();

    const revenueByMonthMillions = revenueByMonth.map((v) =>
      Math.round((v / 1_000_000) * 10) / 10
    );
    const monthLabels = Array.from({ length: 12 }, (_, i) =>
      monthLabelWithYear(i, chartYear)
    );

    res.render("admin/pages/dashboard/index", {
      pageTitle: "Tổng quan",
      revenueMonth: formatVnd(revenueMonth),
      revenueYear: formatVnd(revenueYear),
      revenueSelectedYear: formatVnd(revenueSelectedYear),
      chartYear,
      availableChartYears,
      currentCalendarYear,
      newOrdersCount,
      newUsersCount,
      recentOrders,
      topProducts,
      revenueByMonthMillions,
      monthLabels,
      categoryChartLabels: categoryChartRows.labels,
      categoryChartData: categoryChartRows.data,
      categoryProductTotal: categoryChartRows.total,
      updatedAt: now.toLocaleString("vi-VN"),
    });
  } catch (err) {
    console.error("Dashboard error:", err.message || err);
    res.render("admin/pages/dashboard/index", {
      ...defaults,
      pageTitle: "Tổng quan",
      chartYear: parseChartYear(req.query, new Date().getFullYear()),
      revenueSelectedYear: formatVnd(0),
      currentCalendarYear: new Date().getFullYear(),
      categoryProductTotal: 0,
    });
  }
};

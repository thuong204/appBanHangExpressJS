const mongoose = require("mongoose");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const paginationHelpers = require("../../helpers/pagination");
const productsHelper = require("../../helpers/products");
const { priceInter } = require("../../helpers/priceInter");
const formatDate = require("../../helpers/formatDate");
const systemConfig = require("../../config/system");
const inventory = require("../../helpers/inventory");

const CANCELED = ["Đã hủy", "canceled"];

/** Huỷ đơn: hoàn kho đúng 1 lần (lật cờ có điều kiện trước rồi mới cộng kho) */
async function releaseStock(orderId) {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, stockReserved: true },
    { $set: { stockReserved: false, stockReleased: true } }
  );
  if (order) await inventory.release(order.products);
}

/** Khôi phục đơn đã huỷ: trừ kho lại; trả về false nếu không đủ hàng */
async function reserveStockAgain(orderId) {
  const order = await Order.findOneAndUpdate(
    { _id: orderId, stockReleased: true },
    { $set: { stockReleased: false } }
  );
  if (!order) return true;
  const result = await inventory.reserve(order.products);
  if (!result.ok) {
    await Order.updateOne({ _id: orderId }, { $set: { stockReleased: true } });
    return false;
  }
  await Order.updateOne({ _id: orderId }, { $set: { stockReserved: true } });
  return true;
}

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

async function enrichOrder(order) {
  const doc = order.toObject ? order.toObject() : { ...order };

  for (const item of doc.products) {
    const productInfo = await Product.findOne({ _id: item.product_id }).select(
      "title thumbnail slug"
    );
    item.productInfo = productInfo || {
      title: "Sản phẩm không còn tồn tại",
      thumbnail: "",
      slug: "",
    };

    const priceRow = {
      price: item.price,
      discountPercentage: item.discountPercentage || 0,
    };
    item.priceNew = productsHelper.priceNewProduct(priceRow);
    item.priceInter = priceRow.priceInter;
    item.totalPrice = Number(item.priceNew) * (item.quantity || 0);
    item.totalPriceInter = priceInter(item.totalPrice);
  }

  doc.date = doc.dateOrder
    ? formatDate(doc.dateOrder)
    : formatDate(doc.createdAt);
  doc.totalPrice = doc.products.reduce(
    (sum, item) => sum + (item.totalPrice || 0),
    0
  );
  doc.totalPriceInter = priceInter(doc.totalPrice);
  doc.id = String(doc._id);
  doc.orderCode = doc._id.toString().slice(-6).toUpperCase();

  return doc;
}

module.exports.index = async (req, res) => {
  try {
    await waitForMongo();

    const countOrders = await Order.countDocuments();

    const objectPagination = paginationHelpers(
      {
        currentPage: 1,
        limitItems: 10,
      },
      req.query,
      countOrders
    );

    const orderDocs = await Order.find()
      .sort({ createdAt: -1 })
      .limit(objectPagination.limitItems)
      .skip(objectPagination.skip)
      .lean();

    const orders = orderDocs.map((item) => ({
      ...item,
      id: String(item._id),
    }));

    res.render("admin/pages/order/index", {
      pageTitle: "Quản lý đơn hàng",
      orders,
      pagination: objectPagination,
    });
  } catch (error) {
    console.error("Admin orders index error:", error);
    req.flash("Error", "Không tải được danh sách đơn hàng");
    res.render("admin/pages/order/index", {
      pageTitle: "Quản lý đơn hàng",
      orders: [],
      pagination: {
        currentPage: 1,
        limitItems: 10,
        totalPage: 0,
        skip: 0,
      },
    });
  }
};

module.exports.detailItem = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      req.flash("Error", "Không tồn tại đơn hàng này");
      return res.redirect(`${systemConfig.prefixAdmin}/orders`);
    }

    const enriched = await enrichOrder(order);

    res.render("admin/pages/order/detail", {
      pageTitle: `Chi tiết đơn hàng #${enriched.orderCode}`,
      order: enriched,
      id: req.params.id,
    });
  } catch (error) {
    console.error("Admin order detail error:", error);
    req.flash("Error", "Không tải được chi tiết đơn hàng");
    res.redirect(`${systemConfig.prefixAdmin}/orders`);
  }
};

module.exports.changeStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = [
      "Chưa thanh toán",
      "Đã thanh toán",
      "Đang xử lý",
      "Đang giao hàng",
      "Đã giao hàng",
      "Đã hủy",
      "pending",
      "processing",
      "shipping",
      "delivered",
      "canceled",
      "Paid",
    ];

    if (!status || !allowed.includes(status)) {
      req.flash("Error", "Trạng thái không hợp lệ");
      return res.redirect("back");
    }

    if (CANCELED.includes(status)) {
      await releaseStock(req.params.id);
    } else if (!(await reserveStockAgain(req.params.id))) {
      req.flash("Error", "Không thể khôi phục đơn: một số sản phẩm không còn đủ hàng");
      return res.redirect("back");
    }

    await Order.updateOne({ _id: req.params.id }, { status });
    req.flash("Success", CANCELED.includes(status) ? "Đã huỷ đơn và hoàn lại tồn kho" : "Cập nhật trạng thái đơn hàng thành công");
    res.redirect("back");
  } catch (error) {
    console.error("Admin order changeStatus error:", error);
    req.flash("Error", "Cập nhật trạng thái thất bại");
    res.redirect("back");
  }
};

module.exports.deleteItem = async (req, res) => {
  try {
    // Xoá đơn chưa huỷ thì trả hàng về kho
    await releaseStock(req.params.id);
    await Order.deleteOne({ _id: req.params.id });
    req.flash("Success", "Xóa đơn hàng thành công");
    res.redirect(`${systemConfig.prefixAdmin}/orders`);
  } catch (error) {
    console.error("Admin order delete error:", error);
    req.flash("Error", "Xóa đơn hàng thất bại");
    res.redirect("back");
  }
};

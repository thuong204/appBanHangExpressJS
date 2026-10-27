const Cart = require("../../models/carts.model");
const productsHelper = require("../../helpers/products");
const paymentHelper = require("../../helpers/payment");
const Product = require("../../models/product.model");
const Order = require("../../models/order.model");
const { priceInter } = require("../../helpers/priceInter");
const CategoryProduct = require("../../models/category-product.model");
const formatDate = require("../../helpers/formatDate");
const vnAddress = require("../../helpers/vnAddress");
const inventory = require("../../helpers/inventory");

/** Kiểm tra tồn kho các dòng giỏ hàng đã có productInfo; trả về danh sách thông báo lỗi */
function stockProblems(cartProducts) {
  const problems = [];
  for (const item of cartProducts) {
    const info = item.productInfo;
    if (!info) continue;
    const available = inventory.stockOf(info, item.color);
    if (item.quantity > available) {
      const label = item.color ? `${info.title} (${item.color})` : info.title;
      problems.push(available > 0 ? `${label} chỉ còn ${available} sản phẩm` : `${label} đã hết hàng`);
    }
  }
  return problems;
}
module.exports.index = async (req, res) => {
  const cartId = req.cookies.cartId;
  const cart = await Cart.findOne({
    _id: cartId,
  });
  console.log(req.cookies.cartId);
  if (cart) {
    for (let i = cart.products.length - 1; i >= 0; i--) {
      const cartproduct = cart.products[i];
      const productInCart = await Product.findOne({
        _id: cartproduct.product_id,
        delete: false,
        status: "active",
      }).select("-description -content -createdBy -updatedBy");

      // Sản phẩm đã ngừng bán / bị xoá: không hiển thị (trước đây làm lỗi trang)
      if (!productInCart) {
        cart.products.splice(i, 1);
        continue;
      }
      productInCart.priceNew = productsHelper.priceNewProduct(productInCart);
      cartproduct.productInfo = productInCart;
      cartproduct.available = inventory.stockOf(productInCart, cartproduct.color);
      cartproduct.totalPrice = cartproduct.quantity * productInCart.priceNew;
      cartproduct.totalPriceInter = priceInter(cartproduct.totalPrice);
    }
    cart.total = cart.products.reduce((sum, item) => sum + item.totalPrice, 0);

    cart.totalInter = priceInter(cart.total);
  }

  res.render("clients/pages/cart/index", {
    pageTitle: "Trang giỏ hàng",
    cart: cart,
  });
};
module.exports.addPost = async (req, res) => {
  const cartId = req.cookies.cartId;
  const quantity = parseInt(req.body.quantity, 10);
  if (!Number.isInteger(quantity) || quantity < 1) {
    req.flash("Error", "Số lượng không hợp lệ");
    return res.redirect("back");
  }

  const [cart, product] = await Promise.all([
    Cart.findOne({ _id: cartId }),
    Product.findOne({ _id: req.params.productId, delete: false, status: "active" })
      .select("title variations totalQuantity quantity")
      .catch(() => null),
  ]);
  if (!cart || !product) {
    req.flash("Error", "Thêm vào giỏ hàng thất bại");
    return res.redirect("back");
  }

  // Sản phẩm có màu thì phải chọn đúng một màu đang bán; lưu tên màu chuẩn theo dữ liệu sản phẩm
  let color = String(req.body.color || "");
  if (product.variations && product.variations.length) {
    const variation = inventory.findVariation(product, color);
    if (!variation) {
      req.flash("Error", "Vui lòng chọn màu sắc");
      return res.redirect("back");
    }
    color = variation.color;
  }

  const existing = cart.products.find(
    (item) => item.product_id == req.params.productId && (item.color || "") == color
  );
  const inCart = existing ? existing.quantity : 0;
  const available = inventory.stockOf(product, color);
  if (inCart + quantity > available) {
    req.flash(
      "Error",
      available <= 0
        ? "Sản phẩm đã hết hàng"
        : `Chỉ còn ${available} sản phẩm${inCart ? ` (giỏ hàng đã có ${inCart})` : ""}`
    );
    return res.redirect("back");
  }

  if (existing) {
    await Cart.updateOne(
      { _id: cartId, products: { $elemMatch: { product_id: req.params.productId, color: existing.color } } },
      { $set: { "products.$.quantity": inCart + quantity } }
    );
  } else {
    await Cart.updateOne(
      { _id: cartId },
      { $push: { products: { product_id: req.params.productId, quantity, color } } }
    );
  }
  if (req.body.buyNow) {
    return res.redirect("/cart");
  }
  req.flash("Success", "Thêm vào giỏ hàng thành công");
  res.redirect("back");
};
module.exports.delete = async (req, res) => {
  const productId = req.params.product_id;
  await Cart.updateOne(
    {
      _id: req.cookies.cartId,
      "products.product_id": productId,
    },
    {
      $pull: {
        products: { product_id: productId },
      },
    }
  );
  req.flash("Success", "Đã xóa sản phẩm khỏi giỏ hàng");
  res.redirect("back");
};
module.exports.update = async (req, res) => {
  const productId = req.params.product_id;
  const color = String(req.query.color || "");
  let quantity = parseInt(req.query.quantity, 10);
  if (!Number.isInteger(quantity) || quantity < 1) quantity = 1;

  const product = await Product.findById(productId)
    .select("variations totalQuantity quantity")
    .catch(() => null);
  if (product) {
    const available = inventory.stockOf(product, color);
    if (quantity > available) {
      quantity = Math.max(1, available);
      req.flash("Error", available > 0 ? `Chỉ còn ${available} sản phẩm` : "Sản phẩm đã hết hàng");
    }
  }

  await Cart.updateOne(
    {
      _id: req.cookies.cartId,
      // Giỏ hàng cũ có thể lưu màu là null thay vì chuỗi rỗng
      products: { $elemMatch: { product_id: productId, color: color || { $in: ["", null] } } },
    },
    { $set: { "products.$.quantity": quantity } }
  );
  res.redirect("back");
};
module.exports.order = async (req, res) => {
  const cartId = req.cookies.cartId;
  const cart = await Cart.findOne({
    _id: cartId,
  });
  if (!req.body.selectedProduct) {
    req.flash("Error", "Không có sản phẩm để đặt hàng");
    return res.redirect("back");
  }

  if (cart.products.length > 0) {
    for (let i = cart.products.length - 1; i >= 0; i--) {
      const cartproduct = cart.products[i];

      if (
        !req.body.selectedProduct.includes(cartproduct.product_id.toString())
      ) {
        cart.products.splice(i, 1);
        continue;
      }

      const productInCart = await Product.findOne({
        _id: cartproduct.product_id,
        delete: false,
        status: "active",
      }).select("-description -content -createdBy -updatedBy");

      if (productInCart) {
        productInCart.priceNew = productsHelper.priceNewProduct(productInCart);
        cartproduct.productInfo = productInCart;
        cartproduct.totalPrice = cartproduct.quantity * productInCart.priceNew;
        cartproduct.totalPriceInter = priceInter(cartproduct.totalPrice);
      } else {
        // Sản phẩm đã ngừng bán / bị xoá
        cart.products.splice(i, 1);
      }
    }
  }

  const problems = stockProblems(cart.products);
  if (problems.length || !cart.products.length) {
    req.flash("Error", problems.length ? `${problems.join("; ")}. Vui lòng cập nhật giỏ hàng.` : "Sản phẩm đã ngừng kinh doanh");
    return res.redirect("/cart");
  }
  cart.total = cart.products.reduce((sum, item) => sum + item.totalPrice, 0);
  cart.totalInter = priceInter(cart.total);

  const paymentCode = `DH${Date.now().toString(36).toUpperCase().slice(-8)}`;
  const baseUrl = paymentHelper.getAppBaseUrl(req);
  const orderCode = paymentHelper.generateOrderCode();

  let objectQR;
  try {
    objectQR = await paymentHelper.createPayOSPayment({
      orderCode,
      amount: cart.total,
      description: paymentCode,
      returnUrl: `${baseUrl}/cart/checkout/payos-return?orderCode=${orderCode}`,
      cancelUrl: `${baseUrl}/cart`,
    });
    objectQR.paymentCode = paymentCode;
  } catch (err) {
    console.error("payOS error:", err.message);
    req.flash(
      "Error",
      err.message.includes("Thiếu cấu hình")
        ? "Chưa cấu hình payOS. Liên hệ quản trị viên."
        : "Không tạo được link thanh toán payOS. Vui lòng thử lại."
    );
    return res.redirect("/cart");
  }

  req.session.checkout = {
    orderCode,
    qr: objectQR,
    productIds: cart.products.map((p) => p.product_id.toString()),
    paid: false,
  };

  cart.total = cart.products.reduce((sum, item) => sum + item.totalPrice, 0);
  cart.totalInter = priceInter(cart.total);
  res.render("clients/pages/cart/order", {
    pageTitle: "Trang đặt hàng",
    cart: cart,
    qr: objectQR,
    payosPaid: false,
  });
};

async function buildCheckoutCart(cartId, productIds) {
  const cart = await Cart.findOne({ _id: cartId });
  if (!cart) return null;

  const ids = Array.isArray(productIds) ? productIds : [productIds];
  for (let i = cart.products.length - 1; i >= 0; i--) {
    const cartproduct = cart.products[i];
    if (!ids.includes(cartproduct.product_id.toString())) {
      cart.products.splice(i, 1);
      continue;
    }
    const productInCart = await Product.findOne({
      _id: cartproduct.product_id,
      delete: false,
      status: "active",
    }).select("-description -content -createdBy -updatedBy");

    if (productInCart) {
      productInCart.priceNew = productsHelper.priceNewProduct(productInCart);
      cartproduct.productInfo = productInCart;
      cartproduct.totalPrice = cartproduct.quantity * productInCart.priceNew;
      cartproduct.totalPriceInter = priceInter(cartproduct.totalPrice);
    }
  }

  cart.total = cart.products.reduce((sum, item) => sum + item.totalPrice, 0);
  cart.totalInter = priceInter(cart.total);
  return cart;
}

module.exports.orderResume = async (req, res) => {
  const checkout = req.session.checkout;
  if (!checkout?.productIds?.length) {
    req.flash("Error", "Phiên đặt hàng đã hết hạn. Vui lòng thử lại.");
    return res.redirect("/cart");
  }

  const cart = await buildCheckoutCart(req.cookies.cartId, checkout.productIds);
  if (!cart || !cart.products.length) {
    req.flash("Error", "Không tìm thấy sản phẩm để đặt hàng.");
    return res.redirect("/cart");
  }

  res.render("clients/pages/cart/order", {
    pageTitle: "Trang đặt hàng",
    cart,
    qr: checkout.qr,
    payosPaid: Boolean(checkout.paid),
  });
};
module.exports.orderPost = async (req, res) => {
  const userInfo = req.body;
  const productOrders = req.body.dataOrder; // Mảng chứa các sản phẩm được chọn từ client

  // Địa chỉ: tỉnh/thành → phường/xã → địa chỉ chi tiết (+ toạ độ trên bản đồ nếu có)
  const area = vnAddress.resolve(userInfo.provinceCode, userInfo.wardCode);
  const addressDetail = String(userInfo.addressDetail || "").trim();
  if (!area || !addressDetail) {
    req.flash("Error", "Vui lòng chọn tỉnh/thành, phường/xã và nhập địa chỉ chi tiết.");
    return res.redirect("/cart/order/resume");
  }
  const location = vnAddress.parseLocation(userInfo.lat, userInfo.lng);
  const cartId = req.cookies.cartId;
  const cart = await Cart.findOne({ _id: cartId });

  let products = [];

  // Duyệt qua các sản phẩm trong giỏ hàng
  for (let i = cart.products.length - 1; i >= 0; i--) {
    const cartproduct = cart.products[i];

    if (!productOrders.includes(cartproduct.product_id.toString())) {
      cart.products.splice(i, 1);
      continue;
    }
    const objectProduct = {
      product_id: cartproduct.product_id,
      price: 0,
      discountPercentage: 0,
      quantity: cartproduct.quantity,
      color: cartproduct.color,
    };

    // Tìm thông tin chi tiết sản phẩm
    const productInfo = await Product.findOne({
      _id: cartproduct.product_id,
    });

    // Nếu sản phẩm tồn tại, cập nhật giá và giảm giá
    if (productInfo) {
      objectProduct.price = productInfo.price;
      objectProduct.discountPercentage = productInfo.discountPercentage;
    }

    // Thêm sản phẩm hợp lệ vào mảng products
    products.push(objectProduct);
  }

  // Tạo đơn hàng
  const objOrder = new Order({
    cart_id: cartId,
    userInfo: {
      fullName: userInfo.fullname,
      phone: userInfo.phone,
      address: [addressDetail, area.ward, area.province].join(", "),
      addressDetail,
      ...area,
      ...(location ? { location } : {}),
    },
    payments: userInfo.payment,
    dateOrder: new Date(),
    note: userInfo.note,
    products: products,
  });
  if (userInfo.payment == "paymentcard") {
    const payosOrderCode = userInfo.payosOrderCode;
    if (!payosOrderCode) {
      req.flash("Error", "Vui lòng thanh toán payOS trước khi đặt hàng.");
      return res.redirect("back");
    }
    try {
      const paid = await paymentHelper.checkPayOSPayment(payosOrderCode);
      if (!paid) {
        req.flash("Error", "Chưa xác nhận thanh toán payOS. Vui lòng thử lại.");
        return res.redirect("back");
      }
      objOrder.status = "Đã thanh toán";
      objOrder.payosOrderCode = Number(payosOrderCode);
    } catch (err) {
      console.error("payOS verify error:", err.message);
      req.flash("Error", "Không xác minh được thanh toán payOS.");
      return res.redirect("back");
    }
  } else {
    objOrder.status = "Chưa thanh toán";
  }

  // Trừ kho. Đơn đã thanh toán payOS mà hết hàng giữa chừng thì vẫn lưu đơn và đánh dấu để shop xử lý
  const reservation = await inventory.reserve(products);
  if (reservation.ok) {
    objOrder.stockReserved = true;
  } else {
    const failed = await Product.findById(reservation.failed.product_id).select("title variations totalQuantity quantity").catch(() => null);
    const left = failed ? inventory.stockOf(failed, reservation.failed.color) : 0;
    const label = failed ? failed.title : "Một sản phẩm";
    if (objOrder.status !== "Đã thanh toán") {
      req.flash("Error", left > 0 ? `${label} chỉ còn ${left} sản phẩm. Vui lòng cập nhật giỏ hàng.` : `${label} vừa hết hàng. Vui lòng cập nhật giỏ hàng.`);
      return res.redirect("/cart");
    }
    objOrder.stockReserved = false;
    objOrder.stockShortage = true;
  }

  try {
    await objOrder.save();
  } catch (error) {
    if (objOrder.stockReserved) await inventory.release(products);
    throw error;
  }
  if (objOrder.stockShortage) {
    req.flash("Error", "Đơn đã thanh toán nhưng có sản phẩm vừa hết hàng. Cửa hàng sẽ liên hệ bạn để đổi hoặc hoàn tiền.");
  }
  delete req.session.checkout;
  req.flash("success", "Đặt hàng thành công");
  res.redirect(`checkout/success/${objOrder.id}`);
};
module.exports.success = async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.orderid,
  });
  if (order) {
    for (const product of order.products) {
      const productInfo = await Product.findOne({
        _id: product.product_id,
      }).select("title thumbnail");
      product.productInfo = productInfo;
      product.priceNew = productsHelper.priceNewProduct(product);
      product.priceInter = priceInter(product.priceNew);
      product.totalPrice = product.priceNew * product.quantity;
      product.totalPriceInter = priceInter(product.totalPrice);
    }

    order.date = formatDate(order.dateOrder || order.createdAt);

    order.totalPrice = order.products.reduce(
      (sum, item) => sum + item.totalPrice,
      0
    );
    order.totalPriceInter = priceInter(order.totalPrice);

    res.render("clients/pages/cart/success", {
      pageTitle: "Đơn hàng",
      order: order,
    });
  } else {
    res.send("Không tìm thấy trang");
  }
};
module.exports.checkPaymentStatus = async (req, res) => {
  const orderCode = req.query.orderCode;
  if (!orderCode) {
    return res.json({ paid: false });
  }
  try {
    const paid = await paymentHelper.checkPayOSPayment(orderCode);
    return res.json({ paid });
  } catch (err) {
    console.error("checkPaymentStatus:", err.message);
    return res.status(500).json({ paid: false });
  }
};

module.exports.payosReturn = async (req, res) => {
  const orderCode = req.query.orderCode;
  const checkout = req.session.checkout;

  if (!orderCode || !checkout || String(checkout.orderCode) !== String(orderCode)) {
    req.flash("Error", "Phiên thanh toán không hợp lệ.");
    return res.redirect("/cart");
  }

  try {
    const paid = await paymentHelper.checkPayOSPayment(orderCode);
    checkout.paid = paid;
    req.session.checkout = checkout;

    if (paid) {
      req.flash("success", "Thanh toán payOS thành công. Bạn có thể đặt hàng ngay.");
    } else {
      req.flash("Error", "Chưa nhận được xác nhận thanh toán từ payOS.");
    }
  } catch (err) {
    req.flash("Error", "Không kiểm tra được trạng thái thanh toán payOS.");
  }

  return res.redirect("/cart/order/resume");
};

module.exports.payosWebhook = async (req, res) => {
  try {
    const webhookData = await paymentHelper.verifyPayOSWebhook(req.body);
    if (webhookData?.orderCode && req.session.checkout) {
      if (String(req.session.checkout.orderCode) === String(webhookData.orderCode)) {
        req.session.checkout.paid = true;
      }
    }
    return res.json({ success: true });
  } catch (err) {
    console.error("payOS webhook:", err.message);
    return res.status(400).json({ success: false });
  }
};

module.exports.paymentCallback = async (req, res) => {
  const { orderId, paymentStatus } = req.body;
  if (paymentStatus === "success") {
    Order.updateOne({ _id: orderId }, { status: "Paid" }, (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Error updating order");
      }
      return res.send("Payment successful");
    });
  } else {
    // Xử lý khi thanh toán thất bại hoặc chưa hoàn thành
    return res.send("Payment failed or pending");
  }
};

module.exports.orderHistory = async (req, res) => {
  const cartId = req.cookies.cartId;
  const orderHistory = await Order.find({
    cart_id: cartId,
  });
  const productOrder = {};
  for (const order of orderHistory) {
    for (const product of order.products) {
      const productInfo = await Product.findOne({
        _id: product.product_id,
      }).select("title thumbnail categoryProduct slug");
      // Sản phẩm có thể đã bị xoá khỏi hệ thống sau khi đặt
      const category = productInfo?.categoryProduct
        ? await CategoryProduct.findOne({
          _id: productInfo.categoryProduct,
        }).select("title slug")
        : null;
      product.priceNew = productsHelper.priceNewProduct(product);
      product.priceOldInter = priceInter(product.price);
      product.priceInter = priceInter(product.priceNew);
      product.totalPrice = product.priceNew * product.quantity;
      product.totalPriceInter = priceInter(product.totalPrice);
      product.info = productInfo;
      product.category = category;
    }
  }
  orderHistory.forEach(order => {
    order.orderTotalInter = priceInter(order.products.reduce((sum, p) => sum + (p.totalPrice || 0), 0));
    order.date = formatDate(order.dateOrder || order.createdAt);
    order.isPaid = order.status === "Đã thanh toán" || order.status === "Paid";
  });
  orderHistory.reverse();
  res.render("clients/pages/cart/history", {
    pageTitle: "Lịch sử mua hàng",
    orderHistory: orderHistory,
  });
};

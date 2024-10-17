const Cart = require("../../models/carts.model")
const productsHelper = require("../../helpers/products")
const { VietQR } = require("vietqr")
const Product = require("../../models/product.model")
const Order = require("../../models/order.model")
const User = require("../../models/users.model")
const { priceInter } = require("../../helpers/priceInter")
module.exports.index = async (req, res) => {
    const cartId = req.cookies.cartId
    const cart = await Cart.findOne({
        _id: cartId
    })
    console.log(req.cookies.cartId)
    if (cart) {
        for (const cartproduct of cart.products) {
            const productInCart = await Product.findOne({
                _id: cartproduct.product_id,
                delete: false,
                status: "active"
            }).select("-description -content -createdBy -updatedBy")

            productInCart.priceNew = productsHelper.priceNewProduct(productInCart)
            cartproduct.productInfo = productInCart
            cartproduct.totalPrice = cartproduct.quantity * productInCart.priceNew
            cartproduct.totalPriceInter = priceInter(cartproduct.totalPrice)
        }
        cart.total = cart.products.reduce((sum, item) => sum + item.totalPrice, 0)

        cart.totalInter = priceInter(cart.total)
    }

    res.render("clients/pages/cart/index", {
        pageTitle: "Trang giỏ hàng",
        cart: cart,
    }
    )

}
module.exports.addPost = async (req, res) => {
    const cartId = req.cookies.cartId
    const objectCart = {
        product_id: req.params.productId,
        quantity: req.body.quantity,
        color: req.body.color
    }
    console.log(objectCart)

    const cart = await Cart.findOne({
        _id: cartId,
    })


    // const cartNew  = JSON.stringify(cart.products)
    if (cart) {


        const exsistProductinCart = cart.products.find(item =>
            item.product_id == req.params.productId && item.color == req.body.color);
        if (exsistProductinCart) {
            const newQuantity = parseInt(req.body.quantity) + exsistProductinCart.quantity

            await Cart.updateOne({
                _id: cartId,
                'products.product_id': req.params.productId,
                'products.color': req.body.color
            }, {
                'products.$.quantity': newQuantity
            })
            req.flash("Success", "Thêm vào giỏ hàng thành công")
            res.redirect("back")

        }

        else {
            await Cart.updateOne({
                _id: cartId,
            }, {
                $push: { products: objectCart }
            })
            req.flash("Success", "Thêm vào giỏ hàng thành công")
            res.redirect("back")
        }
    } else {
        req.flash("Error", "Thêm vào giỏ hàng thất bại")
        res.redirect("back")
    }

}
module.exports.delete = async (req, res) => {
    const productId = req.params.product_id
    await Cart.updateOne({
        _id: req.cookies.cartId,
        'products.product_id': productId,

    }, {
        "$pull": {
            products: { "product_id": productId }
        }
    })
    req.flash("Success", "Đã xóa sản phẩm khỏi giỏ hàng")
    res.redirect("back")
}
module.exports.update = async (req, res) => {
    const productId = req.params.product_id
    const quantity = req.query.quantity
    const cart = await Cart.findById(req.cookies.cartId);

    const productIndex = cart.products.findIndex(product =>
        product.product_id.toString() === productId && product.color === req.query.color
    );
    await Cart.updateOne({
        _id: req.cookies.cartId,
        'products.product_id': productId,
        'products.color': req.query.color
    }, {
        $set: { [`products.${productIndex}.quantity`]: quantity }
    })
    res.redirect("back")
}
module.exports.order = async (req, res) => {
  

    const cartId = req.cookies.cartId
    const cart = await Cart.findOne({
        _id: cartId
    })
    if (!req.body.selectedProduct) {
        req.flash("Error", "Không có sản phẩm để đặt hàng")
        return res.redirect("back")
    }


    if (cart.products.length > 0) {
        for (let i = cart.products.length - 1; i >= 0; i--) {
            const cartproduct = cart.products[i];

            if (!req.body.selectedProduct.includes(cartproduct.product_id.toString())) {
                cart.products.splice(i, 1);
                continue;
            }

            const productInCart = await Product.findOne({
                _id: cartproduct.product_id,
                delete: false,
                status: "active"
            }).select("-description -content -createdBy -updatedBy");

            if (productInCart) {
                productInCart.priceNew = productsHelper.priceNewProduct(productInCart);
                cartproduct.productInfo = productInCart;
                cartproduct.totalPrice = cartproduct.quantity * productInCart.priceNew;
                cartproduct.totalPriceInter = priceInter(cartproduct.totalPrice);
            }
        }
    }
    cart.total = cart.products.reduce((sum, item) => sum + item.totalPrice, 0)
    const total = cart.total.toString()
    cart.totalInter = priceInter(cart.total)

    const userOrder = await User.findOne({
        _id: cart.user_id
    })
      //tao ma qr thanh toan
      const vietQR = new VietQR({
        clientID: 'de8a0804-a76d-41e5-8ad6-31503ce7d5f4',
        apiKey: '17c29f09-4ea2-4417-b9c2-7f020d35de42',
    });

    let qr = {

    }
    await vietQR.genQRCodeBase64({
        bank: '970405',
        accountName: 'TRAN CONG THUONG',
        accountNumber: '20152220051510',
        amount: `5000`,
        memo: `${userOrder.fullName} thanh toán sản phẩm`,
        template: 'compact'
    }).then((data) => {
        qr = data;
    })

    const objectQR = {
        image: qr.data.data.qrDataURL,
        information: JSON.parse(qr.config.data)
    }
    


    cart.total = cart.products.reduce((sum, item) => sum + item.totalPrice, 0)
    cart.totalInter = priceInter(cart.total)
    res.render("clients/pages/cart/order", {
        pageTitle: "Trang đặt hàng",
        cart: cart,
        qr: objectQR
    }
    )
}
module.exports.orderPost = async (req, res) => {


    const userInfo = req.body;
    const productOrders = req.body.dataOrder;  // Mảng chứa các sản phẩm được chọn từ client
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
            color: cartproduct.color
        };

        // Tìm thông tin chi tiết sản phẩm
        const productInfo = await Product.findOne({
            _id: cartproduct.product_id
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
            address: userInfo.address
        },
        payments: userInfo.payment,
        note: userInfo.note,
        products: products
    });


    await objOrder.save()
    req.flash("success", "Đặt hàng thành công")
    res.redirect(`checkout/success/${objOrder.id}`)
}
module.exports.success = async (req, res) => {
    const order = await Order.findOne({
        _id: req.params.orderid
    })

    for (const product of order.products) {
        const productInfo = await Product.findOne({
            _id: product.product_id
        }).select("title thumbnail")
        product.productInfo = productInfo
        product.priceNew = productsHelper.priceNewProduct(product)
        product.totalPrice = product.priceNew * product.quantity
        product.totalPriceInter = priceInter(product.totalPrice)
    }

    order.totalPrice = order.products.reduce((sum, item) => sum + item.totalPrice, 0)
    order.totalPriceInter = priceInter(order.totalPrice)
    res.render("clients/pages/cart/success", {
        pageTitle: "Đơn hàng",
        order: order
    })
}
module.exports.paymentCallback = async(req,res) =>{
    const { orderId, paymentStatus } = req.body;
    if (paymentStatus === 'success') {

        Order.updateOne({ _id: orderId }, { status: 'Paid' }, (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error updating order');
            }
            return res.send('Payment successful');
        });
    } else {
        // Xử lý khi thanh toán thất bại hoặc chưa hoàn thành
        return res.send('Payment failed or pending');

}
}
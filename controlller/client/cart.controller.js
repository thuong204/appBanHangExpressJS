const Cart = require("../../models/carts.model")
const productsHelper= require("../../helpers/products")
const Product = require("../../models/product.model")
const Order = require("../../models/order.model")
module.exports.index = async (req, res) => {
    const cartId = req.cookies.cartId
    const cart = await Cart.findOne({
        _id: cartId
    })
    if (cart.products.length > 0) {
        for (const cartproduct of cart.products) {
            const productInCart = await Product.findOne({
                _id: cartproduct.product_id,
                delete:false,
                status: "active"
            }).select("-description -content -createdBy -updatedBy")
            productInCart.priceNew = productsHelper.priceNewProduct(productInCart)
            cartproduct.productInfo = productInCart
            cartproduct.totalPrice = cartproduct.quantity * productInCart.priceNew
        }
    }
    cart.total = cart.products.reduce((sum,item) => sum + item.totalPrice, 0)
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
        quantity: req.body.quantity
    }
    const cart = await Cart.findOne({
        _id: cartId,
        user_id: req.locals
    })


    // const cartNew  = JSON.stringify(cart.products)
    const exsistProductinCart = cart.products.find(item => item.product_id == req.params.productId)
    if (exsistProductinCart) {
        const newQuantity = parseInt(req.body.quantity) + exsistProductinCart.quantity
        await Cart.updateOne({
            _id: cartId,
            'products.product_id': req.params.productId
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

}
module.exports.delete = async  (req,res) =>{
    const productId = req.params.product_id
    await Cart.updateOne({
        _id: req.cookies.cartId,
        'products.product_id': productId
    },{
        "$pull" :{products: {"product_id":productId}
    }
    })
    req.flash("Success","Đã xóa sản phẩm khỏi giỏ hàng")
    res.redirect("back")
}
module.exports.update = async(req,res) =>{
    const productId = req.params.product_id
    const quantity = req.params.quantity
    await Cart.updateOne({
        _id: req.cookies.cartId,
        'products.product_id': productId
        },{
            'products.$.quantity' : quantity
        })
    res.redirect("back")
}
module.exports.order = async(req,res) =>{
    const cartId = req.cookies.cartId
    const cart = await Cart.findOne({
        _id: cartId
    })
    if (cart.products.length > 0) {
        for (const cartproduct of cart.products) {
            const productInCart = await Product.findOne({
                _id: cartproduct.product_id,
                delete:false,
                status: "active"
            }).select("-description -content -createdBy -updatedBy")
            productInCart.priceNew = productsHelper.priceNewProduct(productInCart)
            cartproduct.productInfo = productInCart
            cartproduct.totalPrice = cartproduct.quantity * productInCart.priceNew
        }
    }
    cart.total = cart.products.reduce((sum,item) => sum + item.totalPrice, 0)
    res.render("clients/pages/cart/order",{
        pageTitle: "Trang đặt hàng",
        cart: cart
    }
    )
}
module.exports.orderPost= async (req,res) =>{

    const userInfo = req.body
    const cartId = req.cookies.cartId


    const cart = await Cart.findOne({_id:cartId})
    let products  = []
    for(const product of cart.products){
        const objectProduct = {
            product_id: product.product_id,
            price:0,
            discountPercentage: 0,
            quantity: product.quantity
        }
        const productInfo = await Product.findOne({
            _id: product.product_id
        })
        objectProduct.price= productInfo.price
        objectProduct.discountPercentage = productInfo.discountPercentage
     
        products.push(objectProduct)
    }
    const objOrder = new Order({
        cart_id: cartId,
        userInfo:{
            fullName: userInfo.fullname,
            phone: userInfo.phone,
            address: userInfo.address
        },
        payments: userInfo.payment,
        note: userInfo.note,
        products: products

    })

    await objOrder.save()

    await Cart.updateOne({
        id: cartId
    },{
        products:[]
    })
    req.flash("success","Đặt hàng thành công")
    res.redirect(`checkout/success/${objOrder.id}`)
}
module.exports.success = async (req,res) =>{
    const order = await Order.findOne({
        _id: req.params.orderid
    })

    for(const product of order.products){
        const productInfo = await Product.findOne({
            _id: product.product_id
        }).select("title thumbnail")
        product.productInfo = productInfo
        product.priceNew = productsHelper.priceNewProduct(product)
        product.totalPrice = product.priceNew * product.quantity
    }

    order.totalPrice = order.products.reduce((sum,item) => sum + item.totalPrice, 0)
    res.render("clients/pages/cart/success",{
        pageTitle: "Đơn hàng",
        order: order
    })
}
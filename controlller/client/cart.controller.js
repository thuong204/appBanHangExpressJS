const Cart = require("../../models/carts.model")
const productsHelper= require("../../helpers/products")
const Product = require("../../models/product.model")
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
module.exports.delete = async = (req,res) =>{
    const productId = req.params.product_id
    req.flash("Success","xóa thành công")
    res.redirect("back")
}
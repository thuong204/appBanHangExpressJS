const Cart = require("../../models/carts.model")
module.exports.cartId = async (req,res,next) =>{
    if(!req.cookies.cartId){
        if(!res.locals.user){
            return next()
        }
        const cartExist = await Cart.findOne({
            user_id:res.locals.user._id
        })
        if(!cartExist){
        const cart = new Cart();
        cart.user_id = res.locals.user._id
        await cart.save()
        res.cookie("cartId", cart.id)
        }
        else{
            res.cookie("cartId", cartExist.id)
        }
    }
    else{
        // Số lượng hiển thị trên icon giỏ hàng ở header
        try {
            const cart = await Cart.findById(req.cookies.cartId).select("products").lean()
            res.locals.cartCount = (cart?.products || []).reduce((sum, item) => sum + (item.quantity || 0), 0)
        } catch (error) {
            res.locals.cartCount = 0
        }
    }
    next()
}
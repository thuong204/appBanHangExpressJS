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

    }
    next()
}
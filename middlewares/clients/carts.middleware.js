const Cart = require("../../models/carts.model")
module.exports.cartId = async (req,res,next) =>{
    if(!req.cookies.cartId){
        const cart = new Cart();
        await cart.save()
        const expiresTime= 1000 * 60 * 60 * 24 * 365
        res.cookie("cartId", cart.id,{
            expires: new Date(Date.now()+ expiresTime)
        })
    }
    else{

    }
    next()
}
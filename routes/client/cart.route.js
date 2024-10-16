const express = require('express')
const router = express.Router()
const cartsMiddleware = require("../../middlewares/clients/carts.middleware") 
const controller = require("../../controlller/client/cart.controller")

router.get('/', cartsMiddleware.cartId,controller.index)
router.post('/add/:productId', controller.addPost)
router.get('/delete/:product_id', controller.delete)
router.get('/update/:product_id', controller.update)
router.get('/order', controller.order)
router.post('/order', controller.orderPost)
router.get('/checkout/success/:orderid',controller.success)

 module.exports = router;
const express = require('express')
const router = express.Router()

const controller = require("../../controlller/client/cart.controller")

router.get('/', controller.index)
router.post('/add/:productId', controller.addPost)
router.get('/delete/:product_id', controller.delete)
router.get('/update/:product_id/:quantity', controller.update)
router.get('/order', controller.order)
router.post('/order', controller.orderPost)
router.get('/checkout/success/:orderid',controller.success)

 module.exports = router;
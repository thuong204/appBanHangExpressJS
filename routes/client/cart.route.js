const express = require('express')
const router = express.Router()

const controller = require("../../controlller/client/cart.controller")

router.get('/', controller.index)
router.post('/add/:productId', controller.addPost)
router.get('/delete/:product_id', controller.delete)
 module.exports = router;
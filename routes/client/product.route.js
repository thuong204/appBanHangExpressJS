const express = require('express')
const router = express.Router()

const controller = require("../../controlller/client/product.controller")

router.get('/', controller.index)
router.get('/detail/:slug', controller.detailItem)
router.get('/:slugCategory', controller.category)

 module.exports = router;
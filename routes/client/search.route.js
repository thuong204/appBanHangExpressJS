const express = require('express')
const router = express.Router()

const controller = require("../../controlller/client/search.controller")

router.get('/', controller.index)

 module.exports = router;
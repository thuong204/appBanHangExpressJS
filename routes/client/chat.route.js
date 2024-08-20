const express = require('express')
const router = express.Router()
const controller = require("../../controlller/client/chat.controller")


router.get('/', controller.index)
module.exports = router
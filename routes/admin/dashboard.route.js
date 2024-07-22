const express = require('express')
const router = express.Router()

const controller = require("../../controlller/admin/dashboard.controller")

router.get('/', 
    controller.index)

 module.exports = router;
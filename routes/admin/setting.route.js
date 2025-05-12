const express = require("express");
const router = express.Router();
const controller = require("../../controlller/admin/setting.controller");

router.get("/", controller.index);

module.exports = router;

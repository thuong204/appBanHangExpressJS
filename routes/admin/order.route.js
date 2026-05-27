const express = require("express");
const router = express.Router();
const controller = require("../../controlller/admin/order.controller");

router.get("/", controller.index);
router.get("/detail/:id", controller.detailItem);
router.patch("/change-status/:id", controller.changeStatus);
router.delete("/delete/:id", controller.deleteItem);

module.exports = router;

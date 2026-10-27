const express = require("express");
const router = express.Router();
const controller = require("../../controlller/admin/contact.controller");

router.get("/", controller.index);
router.get("/detail/:id", controller.detail);
router.post("/reply/:id", controller.reply);
router.patch("/change-status/:id", controller.changeStatus);
router.delete("/delete/:id", controller.deleteItem);
router.get("/export-newsletter", controller.exportNewsletter);

module.exports = router;

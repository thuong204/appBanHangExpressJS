const express = require('express')
const router = express.Router()
const controller = require("../../controlller/admin/my-account.controlller")
const multer = require("multer")
const upload = multer()
const uploadFile = require("../../middlewares/admin/uploadFile.middleware")
const validate = require("../../validates/admin/validate-account")

router.get("/",controller.index)
router.get("/edit",controller.edit)
router.patch("/edit", 
    upload.single("avatar"),
    uploadFile.upload,
    validate.createPost,
    controller.editPatch)


module.exports = router
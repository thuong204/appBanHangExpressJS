const express = require('express')
const router = express.Router()
const controller = require("../../controlller/admin/accounts.controller.js")

const multer = require("multer")
const upload = multer()
const uploadFile = require("../../middlewares/admin/uploadFile.middleware")
const validate = require("../../validates/admin/validate-account")


router.get('/', controller.index)
router.get('/create',controller.create)
router.post('/create',
    upload.single("avatar"),
    uploadFile.upload,
    validate.createPost,
    controller.createPost,
)
router.get("/edit/:id", controller.edit)
router.patch('/edit/:id',
    upload.single("avatar"),
    uploadFile.upload,
    validate.createPost,
    controller.editPatch,
)
router.delete('/delete/:id',controller.delete)
router.patch('/change-status/:status/:id', controller.changeStatus)

module.exports= router


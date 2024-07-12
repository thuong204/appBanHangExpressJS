const express = require('express')
const router = express.Router()
const multer = require("multer")
// const storageMulter = require("../../helpers/storage-multer")
const upload = multer()
const controller = require("../../controlller/admin/product.controller")
const uploadFile = require("../../middlewares/admin/uploadFile.middleware")
const validate = require("../../validates/admin/validate-product")


router.get('/', controller.index)
router.patch('/change-status/:status/:id', controller.changeStatus)
router.patch('/change-multi', controller.changeMulti)
router.delete('/delete/:id', controller.deleteItem)
router.get('/create', controller.createItem)
router.post(
    '/create',
    upload.single("thumbnail"),
    uploadFile.upload
    ,
    validate.createPost,
    controller.saveItem,
)
router.get(
    '/edit/:id',
    controller.editItem,
)
router.patch(
    '/edit/:id',
    upload.single("thumbnail"),
    validate.createPost,
    controller.updateItem,
)
router.get('/detail/:id', controller.detailItem,)

module.exports = router;
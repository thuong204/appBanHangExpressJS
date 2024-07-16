const express = require('express')
const router = express.Router()
const multer = require("multer")
// const storageMulter = require("../../helpers/storage-multer")
const controller = require("../../controlller/admin/categoryProducts.controller")
const upload = multer()
const uploadFile = require("../../middlewares/admin/uploadFile.middleware")
const validate = require("../../validates/admin/validate-category-product.js")


router.get('/', controller.index)
router.get('/create', controller.createItem)
router.post('/create',
    upload.single("thumbnail"),
    uploadFile.upload,
    validate.createPost,
    controller.saveItem)

router.get('/edit/:id', controller.editItem)
router.patch('/edit/:id',
    upload.single("thumbnail"),
    uploadFile.upload,
    validate.createPost,
    controller.updateItem)

router.patch('/change-status/:status/:id', controller.changeStatus)
router.delete('/delete/:id', controller.deleteItem)
router.patch('/change-multi', controller.changeMulti)


module.exports = router;
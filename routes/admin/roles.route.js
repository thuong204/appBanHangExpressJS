const express = require('express')
const router = express.Router()
const controller = require("../../controlller/admin/roles.controller.js")

router.get('/', controller.index)
router.get('/create', controller.create)
router.post('/create',controller.createPost)
router.get('/edit/:id', controller.edit)
router.patch('/edit/:id', controller.update)
router.delete('/delete/:id', controller.delete)
router.get('/permissions', controller.permissions)
router.patch('/permissions', controller.permissionsPatch)




module.exports = router
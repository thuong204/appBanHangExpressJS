const express = require('express')
const router = express.Router()

const controller = require("../../controlller/client/page.controller")

router.get('/news', controller.news)
router.get('/news/:slug', controller.newsDetail)
router.get('/contact', controller.contact)
router.post('/contact', controller.contactPost)
router.post('/newsletter', controller.newsletterPost)
router.get('/about', controller.about)
router.get('/stores', controller.stores)
router.get('/careers', controller.careers)
router.get('/faq', controller.faq)
router.get('/policy/:slug', controller.policy)

module.exports = router;

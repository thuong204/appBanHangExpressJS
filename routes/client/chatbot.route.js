const express = require("express");
const router = express.Router();
const chatbotController = require("../../controlller/client/chatbot.controller");

// POST /api/chatbot  (body: { message, sessionId })
router.post("/", chatbotController.handleChat);

module.exports = router;

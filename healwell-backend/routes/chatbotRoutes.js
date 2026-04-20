const express = require("express");
const router = express.Router();

const { chat } = require("../controllers/chatbotController");
const authMiddleware = require("../middleware/authMiddleware");

// 🔥 Chat route
router.post("/chat", authMiddleware, chat);

module.exports = router;
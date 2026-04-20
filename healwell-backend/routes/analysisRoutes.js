const express = require("express");
const router = express.Router();

const { generateAnalysis } = require("../controllers/analysisController");
const authMiddleware = require("../middleware/authMiddleware");

// 🔥 Generate health analysis
router.post("/generate-analysis", authMiddleware, generateAnalysis);

module.exports = router;
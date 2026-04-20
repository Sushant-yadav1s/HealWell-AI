const express = require("express");
const router = express.Router();

const { getReportsByUser, getReportById } = require("../controllers/reportController");
const authMiddleware = require("../middleware/authMiddleware");
const { deleteReport } = require("../controllers/reportController");

// 🔥 Routes
const { getAverageHealthScore } = require("../controllers/reportController");

router.get("/average-score/:userId", authMiddleware, getAverageHealthScore);
router.get("/user/:userId", authMiddleware, getReportsByUser);
router.get("/:id", authMiddleware, getReportById);

router.delete("/:id", authMiddleware, deleteReport);
module.exports = router;
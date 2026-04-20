const Report = require("../models/Report");

// 🔹 Get all reports of a user
exports.getReportsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const reports = await Report.find({ userId }).sort({ date: -1 });

    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 🔹 Get single report by ID
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await require("../models/Report").findByIdAndDelete(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    res.json({
      success: true,
      message: "Report deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getAverageHealthScore = async (req, res) => {
  try {
    const { userId } = req.params;

    const reports = await require("../models/Report").find({ userId });

    if (reports.length === 0) {
      return res.json({
        success: true,
        averageScore: 0
      });
    }

    const total = reports.reduce((sum, r) => sum + r.healthScore, 0);
    const avg = total / reports.length;

    res.json({
      success: true,
      averageScore: Math.round(avg)
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
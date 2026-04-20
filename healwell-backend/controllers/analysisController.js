const Report = require("../models/Report");

exports.generateAnalysis = async (req, res) => {
  try {
    const { userId, symptomsText } = req.body;

    const symptomsArray = symptomsText.split(",").map(s => s.trim());

    const reportData = {
      userId,
      symptoms: symptomsArray,
      causes: ["Dehydration", "Lack of sleep", "Stress"],
      deficiencies: ["Vitamin D", "Iron"],
      prevention: ["Drink more water", "Sleep well"],
      cure: ["Rest properly"],
      medicines: ["Paracetamol"],
      yoga: ["Pranayama"],
      exercises: ["Stretching"],
      foodsToEat: ["Fruits"],
      foodsToAvoid: ["Junk food"],
      thingsToFollow: ["Routine"],
      thingsToAvoid: ["Late nights"],
      naturalRemedies: ["Ginger tea"],
      healthScore: Math.floor(Math.random() * 40) + 60,
      summary: "Lifestyle improvements needed"
    };

    // 🔥 SAVE TO DB
    const savedReport = await Report.create(reportData);

    res.json({
      success: true,
      data: savedReport
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
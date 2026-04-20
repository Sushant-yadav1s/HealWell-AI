const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  userId: String,
  date: { type: Date, default: Date.now },

  symptoms: [String],
  causes: [String],
  deficiencies: [String],
  prevention: [String],
  cure: [String],
  medicines: [String],
  yoga: [String],
  exercises: [String],
  foodsToEat: [String],
  foodsToAvoid: [String],
  thingsToFollow: [String],
  thingsToAvoid: [String],
  naturalRemedies: [String],

  healthScore: Number,
  summary: String
});

module.exports = mongoose.model("Report", reportSchema);
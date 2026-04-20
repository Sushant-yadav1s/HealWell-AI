const express = require("express");
require("dotenv").config();
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// connect DB
connectDB();

app.use(cors());
app.use(express.json());

// routes
app.use("/auth", require("./routes/authRoutes"));
app.use("/weekly-planner", require("./routes/analysisRoutes"));
app.use("/reports", require("./routes/reportRoutes"));
app.use("/chatbot", require("./routes/chatbotRoutes"));
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
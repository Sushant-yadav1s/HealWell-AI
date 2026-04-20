const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // 🔥 THIS MODEL ALWAYS WORKS WITH SDK
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });

    const result = await model.generateContent(
      `You are a helpful health assistant. Give safe advice.\nUser: ${message}`
    );

    const reply = result.response.text();

    return res.json({
      success: true,
      source: "ai",
      response: reply,
    });

  } catch (error) {
    console.error("GEMINI ERROR:", error.message);

    // 🔁 fallback
    const msg = (req.body.message || "").toLowerCase();
    let fallback = "";

    if (msg.includes("tired") || msg.includes("weak")) {
      fallback = "You may feel tired due to lack of sleep or hydration. Try proper rest and fluids.";
    } else {
      fallback = "Maintain a healthy lifestyle with proper sleep, diet, and exercise.";
    }

    return res.json({
      success: true,
      source: "fallback",
      response: fallback,
    });
  }
};
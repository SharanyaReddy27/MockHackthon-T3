require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const consultationRoutes = require("./routes/consultationRoutes");
const riskAssessmentRoutes = require("./routes/riskAssessmentRoutes");

app.use("/api/consultations", consultationRoutes);
app.use("/api/risk-assessment", riskAssessmentRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Village Health Backend is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
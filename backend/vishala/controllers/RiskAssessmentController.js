const assessRisk = require("../services/riskAssessmentService");

const performRiskAssessment = async (req, res) => {
    try {
        const result = assessRisk(req.body);

        res.json({
            success: true,
            assessment: result
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    performRiskAssessment
};
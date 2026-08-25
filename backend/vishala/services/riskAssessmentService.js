const assessRisk = (data) => {
    const {
        temperature,
        heartRate,
        spo2,
        symptoms = []
    } = data;

    const reasons = [];

    // Example project decision-support rules.
    // These are NOT medical diagnostic rules.

    if (typeof spo2 === "number" && spo2 < 90) {
        reasons.push("SpO2 below the configured project threshold");
    }

    if (typeof temperature === "number" && temperature >= 39) {
        reasons.push("High temperature according to configured project threshold");
    }

    if (typeof heartRate === "number" && heartRate > 120) {
        reasons.push("Heart rate above the configured project threshold");
    }

    if (symptoms.includes("severe_breathing_difficulty")) {
        reasons.push("Severe breathing difficulty reported");
    }

    if (reasons.length > 0) {
        return {
            priority: "HIGH",
            reason: reasons.join("; "),
            recommendedAction: "Consider urgent clinical evaluation according to project protocol"
        };
    }

    if (
        (typeof temperature === "number" && temperature >= 38) ||
        (typeof heartRate === "number" && heartRate > 100)
    ) {
        return {
            priority: "MODERATE",
            reason: "One or more configured moderate-risk rules were triggered",
            recommendedAction: "Consider clinical review and follow-up according to project protocol"
        };
    }

    return {
        priority: "LOW",
        reason: "No configured high or moderate risk rules were triggered",
        recommendedAction: "Basic care and follow-up according to project protocol"
    };
};

module.exports = assessRisk;
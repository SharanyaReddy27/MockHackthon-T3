/**
 * Clinical decision-support rules for assessing patient risk level
 * based on vitals and symptoms.
 * 
 * IMPORTANT: This is for demonstration decision-support only.
 * It is not an autonomous medical diagnosis.
 * 
 * @param {Object} consultationData
 * @returns {Object} { level, reasons, recommendedAction }
 */
export function assessRisk(consultationData) {
  const reasons = [];
  const vitals = consultationData.vitals || {};
  const symptoms = consultationData.symptoms || [];

  const temp = Number(vitals.temperature);
  const heartRate = Number(vitals.heartRate);
  const spo2 = Number(vitals.spo2);
  const bp = vitals.bloodPressure || "";

  // --------------------------------------------------
  // HIGH RISK RULES
  // --------------------------------------------------

  // 1. SpO2 Level < 90%
  if (spo2 && spo2 < 90) {
    reasons.push(`Critical blood oxygen saturation: ${spo2}% (Expected >= 95%)`);
  }

  // 2. Severe breathing difficulty symptom
  if (symptoms.includes("severe_breathing_difficulty")) {
    reasons.push("Reported symptom: Severe breathing difficulty");
  }

  // 3. Extremely high temperature (> 39.5 °C)
  if (temp && temp > 39.5) {
    reasons.push(`Critically high body temperature: ${temp}°C`);
  }

  // 4. Critical heart rate (< 50 or > 130 bpm)
  if (heartRate && (heartRate < 50 || heartRate > 130)) {
    reasons.push(`Abnormal heart rate: ${heartRate} bpm (Expected 60-100)`);
  }

  // 5. Hypertensive Crisis (BP Systolic > 180 or Diastolic > 120)
  if (bp) {
    const parts = bp.split("/");
    if (parts.length === 2) {
      const systolic = Number(parts[0].trim());
      const diastolic = Number(parts[1].trim());
      if ((systolic && systolic > 180) || (diastolic && diastolic > 120)) {
        reasons.push(`Hypertensive crisis level Blood Pressure: ${bp} mmHg`);
      }
    }
  }

  if (reasons.length > 0) {
    return {
      level: "HIGH",
      reasons,
      recommendedAction: "Prioritized emergency referral"
    };
  }

  // --------------------------------------------------
  // MODERATE RISK RULES
  // --------------------------------------------------

  // 1. Moderate SpO2 (90% - 94%)
  if (spo2 && spo2 >= 90 && spo2 < 95) {
    reasons.push(`Low blood oxygen saturation: ${spo2}%`);
  }

  // 2. Elevated temperature (> 38.0 °C)
  if (temp && temp > 38.0) {
    reasons.push(`Elevated body temperature: ${temp}°C`);
  }

  // 3. Elevated heart rate (> 100 bpm)
  if (heartRate && heartRate > 100) {
    reasons.push(`Elevated heart rate: ${heartRate} bpm`);
  }

  // 4. Moderately abnormal BP (Systolic > 140 or Diastolic > 90)
  if (bp) {
    const parts = bp.split("/");
    if (parts.length === 2) {
      const systolic = Number(parts[0].trim());
      const diastolic = Number(parts[1].trim());
      if ((systolic && systolic > 140) || (diastolic && diastolic > 90)) {
        reasons.push(`Elevated Blood Pressure: ${bp} mmHg`);
      }
    }
  }

  // 5. Concerning symptoms (like vomiting or diarrhea)
  if (symptoms.includes("vomiting") || symptoms.includes("diarrhea")) {
    reasons.push("Reported gastrointestinal symptoms (vomiting/diarrhea) requiring hydration monitoring");
  }

  if (reasons.length > 0) {
    return {
      level: "MODERATE",
      reasons,
      recommendedAction: "Recommend appropriate nearby PHC/clinic referral."
    };
  }

  // --------------------------------------------------
  // LOW RISK
  // --------------------------------------------------
  return {
    level: "LOW",
    reasons: ["No abnormal vitals or critical symptoms detected."],
    recommendedAction: "Basic care and scheduled follow-up."
  };
}

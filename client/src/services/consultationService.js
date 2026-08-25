import { assessRisk as localAssessRisk } from "../utils/riskAssessment";
import { getMockPatients } from "../data/mockPatients";

// Initial mock consultation history
const initialConsultations = [
  {
    id: "C5001",
    patientId: "P1001",
    patientName: "Lakshmi Devi",
    date: "2026-08-20T09:15:00Z",
    symptoms: ["fever", "cough", "body_pain"],
    vitals: { temperature: 38.5, bloodPressure: "150/95", heartRate: 98, spo2: 94 },
    observations: "Patient complains of severe chest tightness and body pain. Heart sounds normal.",
    medication: ["Paracetamol 500mg twice daily", "ORS twice daily"],
    notes: "Follow up required in a week if BP remains elevated.",
    followUpRequired: true,
    followUpDate: "2026-08-27",
    followUpReason: "Check blood pressure and fever resolution",
    riskLevel: "MODERATE",
    riskReasons: ["Elevated body temperature: 38.5°C", "Elevated Blood Pressure: 150/95 mmHg", "Low blood oxygen saturation: 94%"],
    recommendedAction: "Recommend appropriate nearby PHC/clinic referral."
  },
  {
    id: "C5002",
    patientId: "P1003",
    patientName: "Sita Mahalakshmi",
    date: "2026-08-15T10:00:00Z",
    symptoms: ["fatigue"],
    vitals: { temperature: 36.8, bloodPressure: "115/75", heartRate: 72, spo2: 99 },
    observations: "Regular antenatal check-up. Fetal heart rate normal.",
    medication: ["Iron & Folic Acid", "Calcium Carbonate"],
    notes: "Patient is healthy. Advised regular diet.",
    followUpRequired: true,
    followUpDate: "2026-08-30",
    followUpReason: "Next routine antenatal visit",
    riskLevel: "LOW",
    riskReasons: ["No abnormal vitals or critical symptoms detected."],
    recommendedAction: "Basic care and scheduled follow-up."
  }
];

function getConsultations() {
  const local = localStorage.getItem("vh_consultations");
  if (local) {
    return JSON.parse(local);
  }
  localStorage.setItem("vh_consultations", JSON.stringify(initialConsultations));
  return initialConsultations;
}

export const createConsultation = async (data) => {
  const list = getConsultations();
  const patients = getMockPatients();
  const patient = patients.find(p => p.id === data.patientId) || { name: "Unknown" };

  // Run risk assessment locally
  const assessment = localAssessRisk(data);

  const newConsultation = {
    id: `C${5000 + list.length + 1}`,
    patientId: data.patientId,
    patientName: patient.name,
    date: new Date().toISOString(),
    symptoms: data.symptoms || [],
    vitals: data.vitals || {},
    observations: data.observations || "",
    medication: data.medication || [],
    notes: data.notes || "",
    followUpRequired: !!data.followUpDate,
    followUpDate: data.followUpDate || "",
    followUpReason: data.followUpReason || "Post-consultation follow-up",
    riskLevel: assessment.level,
    riskReasons: assessment.reasons,
    recommendedAction: assessment.recommendedAction
  };

  list.push(newConsultation);
  localStorage.setItem("vh_consultations", JSON.stringify(list));

  // Also update patient's local profile with this consultation if possible
  if (patient.id) {
    // Add to medication history
    if (data.medication && data.medication.length > 0) {
      patient.medications = [
        ...patient.medications,
        ...data.medication.map(med => ({
          name: med,
          dosage: "As directed",
          duration: "As prescribed",
          instructions: ""
        }))
      ];
    }
    // Add follow-up
    if (data.followUpDate) {
      patient.followUps = [
        ...patient.followUps,
        {
          id: `FOL-${2000 + patient.followUps.length + 1}`,
          date: data.followUpDate,
          type: "GENERAL",
          status: "PENDING",
          notes: data.followUpReason || "Post-consultation follow-up"
        }
      ];
    }
    // Update local storage for patients
    const allPatients = patients.map(p => p.id === patient.id ? patient : p);
    localStorage.setItem("vh_patients", JSON.stringify(allPatients));
  }

  return { success: true, consultation: newConsultation };
};

export const assessRisk = async (data) => {
  const assessment = localAssessRisk({
    vitals: {
      temperature: data.temperature,
      heartRate: data.heartRate,
      spo2: data.spo2
    },
    symptoms: data.symptoms
  });
  return { success: true, assessment };
};

export const getConsultation = async (consultationId) => {
  const list = getConsultations();
  const found = list.find(c => c.id === consultationId);
  return { success: !!found, consultation: found };
};

export const getPatientConsultations = async (patientId) => {
  const list = getConsultations();
  const found = list.filter(c => c.patientId === patientId);
  return { success: true, consultations: found };
};

export const updateConsultation = async (consultationId, data) => {
  const list = getConsultations();
  const index = list.findIndex(c => c.id === consultationId);
  if (index !== -1) {
    list[index] = { ...list[index], ...data };
    localStorage.setItem("vh_consultations", JSON.stringify(list));
    return { success: true, consultation: list[index] };
  }
  return { success: false, message: "Consultation not found" };
};
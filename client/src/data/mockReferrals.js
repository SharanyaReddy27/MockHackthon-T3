// Referral urgency follows the PS decision flow:
// LOW -> monitored locally (rarely referred)
// MODERATE -> nearby PHC/clinic referral
// HIGH -> prioritized emergency referral

export const REFERRAL_STATUSES = [
  "Pending",
  "Accepted",
  "In Transit",
  "Arrived",
  "Completed",
  "Cancelled",
];

export const URGENCY_LEVELS = ["Low", "Moderate", "High"];

export let mockReferrals = [
  {
    id: "REF-1001",
    patientName: "Lakshmi Devi",
    patientAge: 58,
    patientGender: "Female",
    village: "Rampur",
    reason: "Suspected cardiac symptoms, chest pain and breathlessness",
    urgency: "High",
    status: "In Transit",
    healthcareCenter: { id: "HC003", name: "District General Hospital", type: "Hospital" },
    createdBy: "Health Worker: Anita Rao",
    createdAt: "2026-08-20T09:15:00Z",
    notes: "Patient referred for emergency cardiac evaluation. Ambulance dispatched.",
  },
  {
    id: "REF-1002",
    patientName: "Ravi Kumar",
    patientAge: 34,
    patientGender: "Male",
    village: "Kondapur",
    reason: "Persistent fever for 5 days, suspected typhoid",
    urgency: "Moderate",
    status: "Accepted",
    healthcareCenter: { id: "HC001", name: "Village Primary Health Centre", type: "PHC" },
    createdBy: "Health Worker: Anita Rao",
    createdAt: "2026-08-19T14:30:00Z",
    notes: "Referred for lab testing and further evaluation.",
  },
  {
    id: "REF-1003",
    patientName: "Sita Mahalakshmi",
    patientAge: 27,
    patientGender: "Female",
    village: "Rampur",
    reason: "Antenatal check-up, high-risk pregnancy monitoring",
    urgency: "Moderate",
    status: "Completed",
    healthcareCenter: { id: "HC002", name: "Sunrise Community Health Center", type: "Community Health Center" },
    createdBy: "Health Worker: Suresh Babu",
    createdAt: "2026-08-15T10:00:00Z",
    notes: "Follow-up antenatal care completed successfully.",
  },
  {
    id: "REF-1004",
    patientName: "Ganesh Rao",
    patientAge: 6,
    patientGender: "Male",
    village: "Kondapur",
    reason: "Suspected dengue, high fever and low platelet count",
    urgency: "High",
    status: "Pending",
    healthcareCenter: { id: "HC003", name: "District General Hospital", type: "Hospital" },
    createdBy: "Health Worker: Suresh Babu",
    createdAt: "2026-08-24T11:45:00Z",
    notes: "Awaiting facility acceptance.",
  },
  {
    id: "REF-1005",
    patientName: "Padma Rani",
    patientAge: 45,
    patientGender: "Female",
    village: "Anandapuram",
    reason: "Uncontrolled diabetes, needs specialist review",
    urgency: "Low",
    status: "Cancelled",
    healthcareCenter: { id: "HC004", name: "Green Valley Clinic", type: "Clinic" },
    createdBy: "Health Worker: Anita Rao",
    createdAt: "2026-08-10T08:20:00Z",
    notes: "Patient managed locally; referral no longer required.",
  },
];

export function _setMockReferrals(next) {
  mockReferrals = next;
}
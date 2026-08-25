export const mockPatients = [
  {
    id: "P1001",
    name: "Lakshmi Devi",
    age: 58,
    gender: "Female",
    village: "Rampur",
    phone: "+91-9123456701",
    bloodGroup: "O+",
    conditions: ["Hypertension", "Osteoarthritis"],
    allergies: ["Penicillin"],
    medications: [
      { name: "Amlodipine 5mg", dosage: "Once daily", duration: "Ongoing", instructions: "Take in the morning" }
    ],
    referrals: [
      { id: "REF-1001", status: "In Transit", date: "2026-08-20", facility: "District General Hospital", reason: "Suspected cardiac symptoms" }
    ],
    followUps: [
      { id: "FOL-2001", date: "2026-09-01", type: "REFERRAL", status: "PENDING", notes: "Check platelet stabilization after discharge" }
    ]
  },
  {
    id: "P1002",
    name: "Ravi Kumar",
    age: 34,
    gender: "Male",
    village: "Kondapur",
    phone: "+91-9123456702",
    bloodGroup: "B+",
    conditions: ["Diabetes Type 2"],
    allergies: ["None"],
    medications: [
      { name: "Metformin 500mg", dosage: "Twice daily", duration: "Ongoing", instructions: "Take with meals" }
    ],
    referrals: [
      { id: "REF-1002", status: "Accepted", date: "2026-08-19", facility: "Village Primary Health Centre", reason: "Persistent fever for 5 days" }
    ],
    followUps: [
      { id: "FOL-2002", date: "2026-08-28", type: "MEDICATION_REVIEW", status: "PENDING", notes: "Review antibiotic response" }
    ]
  },
  {
    id: "P1003",
    name: "Sita Mahalakshmi",
    age: 27,
    gender: "Female",
    village: "Rampur",
    phone: "+91-9123456703",
    bloodGroup: "A+",
    conditions: ["Pregnancy (Antenatal Care)"],
    allergies: ["Sulfa drugs"],
    medications: [
      { name: "Iron & Folic Acid", dosage: "Once daily", duration: "90 Days", instructions: "Take at bedtime" },
      { name: "Calcium Carbonate", dosage: "Once daily", duration: "90 Days", instructions: "Take with food" }
    ],
    referrals: [
      { id: "REF-1003", status: "Completed", date: "2026-08-15", facility: "Sunrise Community Health Center", reason: "Routine Antenatal check-up" }
    ],
    followUps: [
      { id: "FOL-2003", date: "2026-08-30", type: "CONSULTATION", status: "PENDING", notes: "Regular antenatal follow-up" }
    ]
  },
  {
    id: "P1004",
    name: "Ganesh Rao",
    age: 6,
    gender: "Male",
    village: "Kondapur",
    phone: "+91-9123456704",
    bloodGroup: "AB+",
    conditions: ["Mild Asthma"],
    allergies: ["Dust/Pollen"],
    medications: [
      { name: "Salbutamol Inhaler", dosage: "As needed", duration: "As needed", instructions: "1-2 puffs during wheezing" }
    ],
    referrals: [
      { id: "REF-1004", status: "Pending", date: "2026-08-24", facility: "District General Hospital", reason: "Suspected dengue" }
    ],
    followUps: [
      { id: "FOL-2004", date: "2026-08-27", type: "VACCINATION", status: "PENDING", notes: "Check platelet counts & hydration" }
    ]
  },
  {
    id: "P1005",
    name: "Padma Rani",
    age: 45,
    gender: "Female",
    village: "Anandapuram",
    phone: "+91-9123456705",
    bloodGroup: "O-",
    conditions: ["Hypothyroidism"],
    allergies: ["Aspirin"],
    medications: [
      { name: "Thyroxine 75mcg", dosage: "Once daily", duration: "Ongoing", instructions: "Take on empty stomach" }
    ],
    referrals: [
      { id: "REF-1005", status: "Cancelled", date: "2026-08-10", facility: "Green Valley Clinic", reason: "Uncontrolled diabetes review" }
    ],
    followUps: [
      { id: "FOL-2005", date: "2026-08-20", type: "GENERAL", status: "COMPLETED", notes: "Blood glucose monitoring" }
    ]
  }
];

export function getMockPatients() {
  const local = localStorage.getItem("vh_patients");
  if (local) {
    return JSON.parse(local);
  }
  localStorage.setItem("vh_patients", JSON.stringify(mockPatients));
  return mockPatients;
}

export function savePatient(patient) {
  const current = getMockPatients();
  current.push(patient);
  localStorage.setItem("vh_patients", JSON.stringify(current));
  return patient;
}

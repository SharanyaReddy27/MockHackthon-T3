import { getMockPatients, savePatient } from "../data/mockPatients";

// Initial Health Worker accounts
const initialHealthWorkers = [
  {
    name: "Anita Rao",
    phone: "+91-9876543210",
    email: "anita@vh.org",
    password: "password123",
    village: "Rampur",
    healthWorkerId: "HW001",
    preferredLanguage: "Telugu"
  },
  {
    name: "Suresh Babu",
    phone: "+91-9876543211",
    email: "suresh@vh.org",
    password: "password123",
    village: "Kondapur",
    healthWorkerId: "HW002",
    preferredLanguage: "Telugu"
  }
];

function getHealthWorkers() {
  const local = localStorage.getItem("vh_health_workers");
  if (local) {
    return JSON.parse(local);
  }
  localStorage.setItem("vh_health_workers", JSON.stringify(initialHealthWorkers));
  return initialHealthWorkers;
}

export const authService = {
  healthWorkerRegister: async (data) => {
    const workers = getHealthWorkers();
    
    // Check if worker already exists
    if (workers.some(w => w.email === data.email || w.phone === data.phone)) {
      throw new Error("A health worker with this email or phone number is already registered.");
    }

    const newWorker = {
      name: data.fullName,
      phone: data.phone,
      email: data.email,
      password: data.password,
      village: data.village,
      healthWorkerId: data.healthWorkerId || `HW00${workers.length + 1}`,
      preferredLanguage: data.preferredLanguage || "English"
    };

    workers.push(newWorker);
    localStorage.setItem("vh_health_workers", JSON.stringify(workers));
    
    // Auto-login
    localStorage.setItem("vh_current_user", JSON.stringify({ ...newWorker, role: "health-worker" }));
    return newWorker;
  },

  healthWorkerLogin: async (emailOrPhone, password) => {
    const workers = getHealthWorkers();
    const worker = workers.find(
      w => (w.email === emailOrPhone || w.phone === emailOrPhone) && w.password === password
    );

    if (!worker) {
      throw new Error("Invalid email/phone or password.");
    }

    const user = { ...worker, role: "health-worker" };
    localStorage.setItem("vh_current_user", JSON.stringify(user));
    return user;
  },

  patientLogin: async (patientIdOrPhone, password) => {
    const patients = getMockPatients();
    const patient = patients.find(
      p => (p.id === patientIdOrPhone || p.phone === patientIdOrPhone)
    );

    if (!patient) {
      throw new Error("Invalid Patient ID or Phone Number.");
    }

    // Since it's mock login, we don't strictly enforce a password but let's assume 'password' or check if they entered something.
    if (!password) {
      throw new Error("Password is required.");
    }

    const user = { ...patient, role: "patient" };
    localStorage.setItem("vh_current_user", JSON.stringify(user));
    return user;
  },

  getCurrentUser: () => {
    const local = localStorage.getItem("vh_current_user");
    return local ? JSON.parse(local) : null;
  },

  logout: () => {
    localStorage.removeItem("vh_current_user");
  },

  getPatients: () => {
    return getMockPatients();
  },

  getPatientById: (id) => {
    const patients = getMockPatients();
    return patients.find(p => p.id === id) || null;
  },

  registerPatient: (patientData) => {
    const newPatient = {
      id: `P${1000 + getMockPatients().length + 1}`,
      name: patientData.name,
      age: Number(patientData.age),
      gender: patientData.gender,
      village: patientData.village,
      phone: patientData.phone,
      bloodGroup: patientData.bloodGroup || "O+",
      conditions: patientData.conditions ? patientData.conditions.split(",").map(c => c.trim()) : ["None"],
      allergies: patientData.allergies ? patientData.allergies.split(",").map(a => a.trim()) : ["None"],
      medications: [],
      referrals: [],
      followUps: []
    };
    return savePatient(newPatient);
  }
};

import api from "./api.js";

let mockFollowUps = [
  {
    id: "FOL-2001",
    patientName: "Lakshmi Devi",
    patientAge: 58,
    village: "Rampur",
    type: "REFERRAL",
    scheduledDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: "PENDING",
    notes: "Post-discharge cardiac check-up & BP check",
    urgency: "High",
    isOverdue: false,
  },
  {
    id: "FOL-2002",
    patientName: "Ravi Kumar",
    patientAge: 34,
    village: "Kondapur",
    type: "MEDICATION_REVIEW",
    scheduledDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: "PENDING",
    notes: "Review antibiotic response for persistent fever",
    urgency: "Moderate",
    isOverdue: true,
  },
  {
    id: "FOL-2003",
    patientName: "Sita Mahalakshmi",
    patientAge: 27,
    village: "Rampur",
    type: "CONSULTATION",
    scheduledDate: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: "PENDING",
    notes: "Follow-up antenatal check-up (2nd trimester)",
    urgency: "Moderate",
    isOverdue: false,
  },
  {
    id: "FOL-2004",
    patientName: "Ganesh Rao",
    patientAge: 6,
    village: "Kondapur",
    type: "VACCINATION",
    scheduledDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: "PENDING",
    notes: "Check platelet counts & hydration level",
    urgency: "High",
    isOverdue: true,
  },
  {
    id: "FOL-2005",
    patientName: "Padma Rani",
    patientAge: 45,
    village: "Anandapuram",
    type: "GENERAL",
    scheduledDate: new Date(Date.now() - 86400000 * 7).toISOString(),
    status: "COMPLETED",
    notes: "Blood glucose monitoring completed successfully",
    urgency: "Low",
    isOverdue: false,
  },
];

export async function getFollowUps(filters = {}) {
  try {
    const res = await api.get("/followups", { params: filters });
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data.map(normalizeFollowUp);
    }
  } catch {
    // Fallback
  }

  let list = [...mockFollowUps];
  if (filters.status) {
    if (filters.status === "OVERDUE") {
      list = list.filter((f) => f.isOverdue && f.status !== "COMPLETED");
    } else {
      list = list.filter((f) => f.status.toUpperCase() === filters.status.toUpperCase());
    }
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (f) =>
        f.patientName.toLowerCase().includes(q) ||
        f.village.toLowerCase().includes(q) ||
        f.notes.toLowerCase().includes(q)
    );
  }
  return list;
}

export async function getUpcomingFollowUps(days = 7) {
  try {
    const res = await api.get("/followups/upcoming", { params: { days } });
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data.map(normalizeFollowUp);
    }
  } catch {
    // Fallback
  }
  return mockFollowUps.filter((f) => !f.isOverdue && f.status === "PENDING");
}

export async function updateFollowUpStatus(id, status) {
  try {
    const res = await api.put(`/followups/${id}/status`, { status });
    if (res.data && res.data.success && res.data.data) {
      return normalizeFollowUp(res.data.data);
    }
  } catch {
    // Fallback
  }

  mockFollowUps = mockFollowUps.map((f) => (f.id === id ? { ...f, status, isOverdue: false } : f));
  return mockFollowUps.find((f) => f.id === id);
}

export async function createFollowUp(payload) {
  try {
    const res = await api.post("/followups", payload);
    if (res.data && res.data.success && res.data.data) {
      return normalizeFollowUp(res.data.data);
    }
  } catch {
    // Fallback
  }

  const newItem = {
    id: `FOL-${2000 + mockFollowUps.length + 1}`,
    patientName: payload.patientName || "Patient",
    patientAge: payload.patientAge || 30,
    village: payload.village || "Village",
    type: payload.type || "GENERAL",
    scheduledDate: payload.scheduledDate || new Date().toISOString(),
    status: "PENDING",
    notes: payload.notes || "Scheduled follow-up",
    urgency: payload.urgency || "Moderate",
    isOverdue: false,
  };
  mockFollowUps = [newItem, ...mockFollowUps];
  return newItem;
}

function normalizeFollowUp(f) {
  const isOverdue =
    f.isOverdue || (f.status === "PENDING" && new Date(f.scheduledDate) < new Date());
  return {
    id: f._id || f.id || f.followUpId,
    patientName: f.patientId?.name || f.patientName || "Patient",
    patientAge: f.patientId?.age || f.patientAge || 30,
    village: f.patientId?.village || f.village || "Village",
    type: f.type || "GENERAL",
    scheduledDate: f.scheduledDate || new Date().toISOString(),
    status: f.status || "PENDING",
    notes: f.notes || "Follow-up note",
    urgency: f.urgency || "Moderate",
    isOverdue,
  };
}

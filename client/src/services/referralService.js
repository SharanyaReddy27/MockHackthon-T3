import api from "./api.js";
import { mockReferrals as _list, _setMockReferrals } from "../data/mockReferrals.js";

const SIMULATED_DELAY_MS = 300;

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY_MS));
}

export async function getReferrals(filters = {}) {
  try {
    const res = await api.get("/referrals", { params: filters });
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data.map(normalizeReferral);
    }
  } catch {
    // Fallback to local mock data if server isn't connected
  }

  let results = [..._list];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (r) =>
        r.patientName.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        r.healthcareCenter.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
    );
  }
  if (filters.urgency) {
    results = results.filter((r) => r.urgency.toLowerCase() === filters.urgency.toLowerCase());
  }
  if (filters.status) {
    results = results.filter((r) => r.status.toLowerCase() === filters.status.toLowerCase());
  }
  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return delay(results);
}

export async function getReferralById(id) {
  try {
    const res = await api.get(`/referrals/${id}`);
    if (res.data && res.data.success && res.data.data) {
      return normalizeReferral(res.data.data);
    }
  } catch {
    // Fallback to local mock data
  }

  const found = _list.find((r) => r.id === id);
  return delay(found || null);
}

export async function createReferral(payload) {
  try {
    const res = await api.post("/referrals", payload);
    if (res.data && res.data.success && res.data.data) {
      return normalizeReferral(res.data.data);
    }
  } catch {
    // Fallback local creation
  }

  const newReferral = {
    id: `REF-${1000 + _list.length + 1}`,
    status: "Pending",
    createdAt: new Date().toISOString(),
    createdBy: "Health Worker: You",
    ...payload,
  };
  _setMockReferrals([newReferral, ..._list]);
  return delay(newReferral);
}

export async function updateReferralStatus(id, status) {
  try {
    const res = await api.put(`/referrals/${id}/status`, { status });
    if (res.data && res.data.success && res.data.data) {
      return normalizeReferral(res.data.data);
    }
  } catch {
    // Fallback status update
  }

  const next = _list.map((r) => (r.id === id ? { ...r, status } : r));
  _setMockReferrals(next);
  const updated = next.find((r) => r.id === id);
  return delay(updated);
}

function normalizeReferral(item) {
  return {
    id: item._id || item.id || item.referralId,
    patientName: item.patientId?.name || item.patientName || "Patient",
    patientAge: item.patientId?.age || item.patientAge || 30,
    patientGender: item.patientId?.gender || item.patientGender || "Female",
    village: item.patientId?.village || item.village || "Village",
    reason: item.reason || "General Referral",
    urgency: item.priority ? capitalize(item.priority) : (item.urgency || "Moderate"),
    status: capitalize(item.status || "Pending"),
    healthcareCenter: {
      id: item.healthcareCenterId?._id || item.healthcareCenterId?.id || item.healthcareCenter?.id || "HC-001",
      name: item.healthcareCenterId?.name || item.healthcareCenter?.name || "Primary Health Centre",
      type: item.healthcareCenterId?.type || item.healthcareCenter?.type || "PHC",
    },
    createdBy: item.createdBy || "Health Worker",
    createdAt: item.createdAt || item.timestamps?.created || new Date().toISOString(),
    notes: item.notes || item.clinicalSummary || "",
  };
}

function capitalize(str) {
  if (!str) return "";
  const s = str.toString().toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}
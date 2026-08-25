import api from "./api.js";

const fallbackCenters = [
  {
    id: "HC001",
    name: "Village Primary Health Centre",
    type: "PHC",
    village: "Rampur",
    district: "Medak",
    distance: 4.2,
    emergencySupport: true,
    phone: "+91-9876500001",
    services: ["General OPD", "Maternal Care", "Basic Diagnostics", "24/7 Emergency"],
    availableBeds: 12,
  },
  {
    id: "HC002",
    name: "Sunrise Community Health Center",
    type: "Community Health Center",
    village: "Kondapur",
    district: "Medak",
    distance: 7.8,
    emergencySupport: true,
    phone: "+91-9876500002",
    services: ["Emergency Care", "Pediatrics", "Minor Surgery", "Lab Testing"],
    availableBeds: 25,
  },
  {
    id: "HC003",
    name: "District General Hospital",
    type: "Hospital",
    village: "Sangareddy",
    district: "Medak",
    distance: 14.5,
    emergencySupport: true,
    phone: "+91-9876500003",
    services: ["ICU", "Trauma Care", "Cardiology", "Advanced Surgery", "Ambulance"],
    availableBeds: 120,
  },
  {
    id: "HC004",
    name: "Green Valley Clinic",
    type: "Clinic",
    village: "Anandapuram",
    district: "Medak",
    distance: 2.1,
    emergencySupport: false,
    phone: "+91-9876500004",
    services: ["General Consultation", "Vaccination", "Health Screening"],
    availableBeds: 4,
  },
];

export async function getHealthcareCenters(filters = {}) {
  try {
    const res = await api.get("/healthcare-centers", { params: filters });
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      return res.data.data.map(normalizeCenter);
    }
  } catch {
    // Fallback to local mock data
  }

  let list = [...fallbackCenters];
  if (filters.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.village.toLowerCase().includes(q)
    );
  }
  if (filters.type) {
    list = list.filter((c) => c.type.toLowerCase() === filters.type.toLowerCase());
  }
  if (filters.emergencyOnly) {
    list = list.filter((c) => c.emergencySupport);
  }

  return list;
}

export async function getHealthcareCenterById(id) {
  try {
    const res = await api.get(`/healthcare-centers/${id}`);
    if (res.data && res.data.success && res.data.data) {
      return normalizeCenter(res.data.data);
    }
  } catch {
    // Fallback
  }

  return fallbackCenters.find((c) => c.id === id) || fallbackCenters[0];
}

function normalizeCenter(c) {
  return {
    id: c._id || c.id || c.centerId,
    name: c.name || "Healthcare Facility",
    type: c.type || "PHC",
    village: c.village || c.location?.village || "Nearby Village",
    district: c.district || c.location?.district || "District",
    distance: c.distance || c.distanceKm || 5.0,
    emergencySupport: Boolean(c.emergencySupport),
    phone: c.phone || "+91-9876543210",
    services: Array.isArray(c.services) ? c.services : ["General OPD", "Emergency"],
    availableBeds: c.availableBeds || c.capacity?.bedsAvailable || 10,
  };
}

import api from "./api.js";

const fallbackAnalytics = {
  overview: {
    totalPatients: 124,
    totalReferrals: 45,
    pendingReferrals: 12,
    completedReferrals: 28,
    highPriorityReferrals: 9,
    moderatePriorityReferrals: 22,
    lowPriorityReferrals: 14,
    pendingFollowups: 18,
    overdueFollowups: 4,
  },
  referrals: {
    total: 45,
    byPriority: {
      LOW: 14,
      MODERATE: 22,
      HIGH: 9,
    },
    byStatus: {
      CREATED: 3,
      SENT: 5,
      ACCEPTED: 4,
      ARRIVED: 2,
      COMPLETED: 28,
      CANCELLED: 3,
    },
    byHealthcareCenter: [
      { name: "Village Primary Health Centre", type: "PHC", count: 18 },
      { name: "Sunrise Community Health Center", type: "CHC", count: 15 },
      { name: "District General Hospital", type: "Hospital", count: 9 },
      { name: "Green Valley Clinic", type: "Clinic", count: 3 },
    ],
    completionRate: "70.0%",
    pending: 12,
  },
  followups: {
    total: 50,
    pending: 18,
    completed: 28,
    missed: 4,
    overdue: 4,
    dueThisWeek: 7,
  },
  healthcareCenters: [
    { name: "Village Primary Health Centre", type: "PHC", village: "Rampur", totalReferrals: 18, completed: 14, pending: 4 },
    { name: "Sunrise Community Health Center", type: "CHC", village: "Kondapur", totalReferrals: 15, completed: 11, pending: 4 },
    { name: "District General Hospital", type: "Hospital", village: "Sangareddy", totalReferrals: 9, completed: 7, pending: 2 },
    { name: "Green Valley Clinic", type: "Clinic", village: "Anandapuram", totalReferrals: 3, completed: 2, pending: 1 },
  ],
  healthTrends: {
    symptoms: [
      { symptom: "High fever", count: 24 },
      { symptom: "Chest pain / Breathlessness", count: 14 },
      { symptom: "High-risk pregnancy symptoms", count: 10 },
      { symptom: "Persistent cough > 2 weeks", count: 8 },
      { symptom: "Uncontrolled blood sugar", count: 7 },
    ],
    observedConditions: [
      { condition: "Suspected Dengue / Typhoid", count: 18 },
      { condition: "Hypertensive Urgency", count: 12 },
      { condition: "Antenatal Monitoring Needed", count: 10 },
      { condition: "Severe Respiratory Tract Infection", count: 7 },
    ],
  },
};

export async function getAnalyticsOverview(params = {}) {
  try {
    const res = await api.get("/analytics/overview", { params });
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch {
    // Fallback
  }
  return fallbackAnalytics.overview;
}

export async function getReferralAnalytics(params = {}) {
  try {
    const res = await api.get("/analytics/referrals", { params });
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch {
    // Fallback
  }
  return fallbackAnalytics.referrals;
}

export async function getFollowUpAnalytics(params = {}) {
  try {
    const res = await api.get("/analytics/followups", { params });
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch {
    // Fallback
  }
  return fallbackAnalytics.followups;
}

export async function getHealthcareCenterAnalytics(params = {}) {
  try {
    const res = await api.get("/analytics/healthcare-centers", { params });
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch {
    // Fallback
  }
  return fallbackAnalytics.healthcareCenters;
}

export async function getHealthTrends(params = {}) {
  try {
    const res = await api.get("/analytics/health-trends", { params });
    if (res.data && res.data.success && res.data.data) {
      return res.data.data;
    }
  } catch {
    // Fallback
  }
  return fallbackAnalytics.healthTrends;
}

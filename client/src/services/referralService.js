import { mockReferrals as _list, _setMockReferrals } from "../data/mockReferrals.js";

// Service abstraction layer. Every function returns a Promise so swapping
// this file's internals for real `fetch`/axios calls to
//   GET  /api/referrals
//   GET  /api/referrals/:id
//   POST /api/referrals
//   PATCH /api/referrals/:id/status
// later requires no changes in any component that consumes this service.

const SIMULATED_DELAY_MS = 400;

function delay(value) {
  return new Promise((resolve) => setTimeout(() => resolve(value), SIMULATED_DELAY_MS));
}

export async function getReferrals(filters = {}) {
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
    results = results.filter((r) => r.urgency === filters.urgency);
  }

  if (filters.status) {
    results = results.filter((r) => r.status === filters.status);
  }

  results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return delay(results);
}

export async function getReferralById(id) {
  const found = _list.find((r) => r.id === id);
  return delay(found || null);
}

export async function createReferral(payload) {
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
  const next = _list.map((r) => (r.id === id ? { ...r, status } : r));
  _setMockReferrals(next);
  const updated = next.find((r) => r.id === id);
  return delay(updated);
}
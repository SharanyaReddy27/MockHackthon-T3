// Minimal subset — full healthcare center data model belongs to the
// Healthcare Center Discovery module. This is only what Referral needs
// to let a health worker pick a destination facility.

export const mockHealthcareCentersLite = [
  { id: "HC001", name: "Village Primary Health Centre", type: "PHC", distance: 4.2, emergencySupport: true },
  { id: "HC002", name: "Sunrise Community Health Center", type: "Community Health Center", distance: 7.8, emergencySupport: true },
  { id: "HC003", name: "District General Hospital", type: "Hospital", distance: 14.5, emergencySupport: true },
  { id: "HC004", name: "Green Valley Clinic", type: "Clinic", distance: 2.1, emergencySupport: false },
];
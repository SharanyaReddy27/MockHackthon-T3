import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

function HealthWorkerDashboard() {
  const navigate = useNavigate();
  const [worker] = useState(() => {
    const user = authService.getCurrentUser();
    return user && user.role === "health-worker" ? user : null;
  });

  useEffect(() => {
    if (!worker) {
      navigate("/health-worker/login");
    }
  }, [worker, navigate]);

  if (!worker) return null;

  // Fictional summary cards data
  const summaries = [
    { title: "Total Patients", count: 142, icon: "👥", color: "var(--color-primary)" },
    { title: "Today's Consultations", count: 6, icon: "📝", color: "var(--color-accent)" },
    { title: "Pending Follow-ups", count: 4, icon: "⏰", color: "var(--color-warning)" },
    { title: "Pending Referrals", count: 2, icon: "📋", color: "var(--color-danger)" }
  ];

  // Quick actions
  const quickActions = [
    { label: "Register Patient", icon: "➕", path: "/patients/register", desc: "Add a new resident profile" },
    { label: "Search Patient", icon: "🔍", path: "/patients", desc: "Find records and start consultations" },
    { label: "New Consultation", icon: "🩺", path: "/consultation", desc: "Start vital check & symptoms diagnosis" },
    { label: "Follow-ups", icon: "⏰", path: "/follow-ups", desc: "View schedule and overdue warnings" },
    { label: "Referrals", icon: "📋", path: "/referrals", desc: "Track emergency & routine facility referrals" },
    { label: "Healthcare Centers", icon: "🏥", path: "/healthcare-centers", desc: "Geospatial discovery of clinics & hospitals" }
  ];

  return (
    <div className="page" style={{ fontFamily: "var(--font-family)" }}>
      {/* Header banner */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p className="section-eyebrow" style={{ color: "rgba(255, 255, 255, 0.8)", margin: 0, textTransform: "uppercase" }}>FRONT-LINE CLINICAL PORTAL</p>
          <h1>Welcome, {worker.name}</h1>
          <p style={{ margin: "4px 0 0 0" }}>Health Worker ID: {worker.healthWorkerId} • Language: {worker.preferredLanguage}</p>
        </div>
        <button
          onClick={() => {
            authService.logout();
            navigate("/");
          }}
          className="btn btn-outline"
          style={{ borderColor: "white", color: "white", borderRadius: "10px", padding: "8px 16px" }}
        >
          Logout
        </button>
      </div>

      {/* Summary KPI section */}
      <div className="content-block" style={{ marginTop: "40px" }}>
        <h2 className="section-title" style={{ marginBottom: "16px" }}>System Overview Summary</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {summaries.map((s, idx) => (
            <div key={idx} className="card" style={{ display: "flex", alignItems: "center", gap: "16px", padding: "20px" }}>
              <div style={{ fontSize: "36px" }}>{s.icon}</div>
              <div>
                <span className="text-muted" style={{ fontSize: "12px", fontWeight: "700" }}>{s.title}</span>
                <h2 style={{ fontSize: "28px", margin: "4px 0 0 0", color: s.color }}>{s.count}</h2>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Action cards */}
      <div style={{ marginTop: "40px" }}>
        <h2 className="section-title" style={{ marginBottom: "16px" }}>Quick Launch Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, idx) => (
            <div
              key={idx}
              className="card"
              onClick={() => navigate(action.path)}
              style={{
                cursor: "pointer",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = "none";
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "28px" }}>{action.icon}</span>
                <span style={{ color: "var(--color-primary)", fontWeight: "700", fontSize: "18px" }}>→</span>
              </div>
              <h3 style={{ fontSize: "18px", color: "var(--color-primary-dark)" }}>{action.label}</h3>
              <p className="text-muted" style={{ margin: 0, fontSize: "14px" }}>{action.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HealthWorkerDashboard;

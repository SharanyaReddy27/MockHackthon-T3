import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { getPatientConsultations } from "../../services/consultationService";
import StatusBadge from "../../components/common/StatusBadge";

function PatientDashboard() {
  const navigate = useNavigate();
  const [patient] = useState(() => {
    const user = authService.getCurrentUser();
    return user && user.role === "patient" ? user : null;
  });
  const [consultations, setConsultations] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, record, consultations, medications, referrals, followups, profile

  useEffect(() => {
    if (!patient) {
      navigate("/patient/login");
    } else {
      getPatientConsultations(patient.id).then(res => {
        if (res.success) {
          setConsultations(res.consultations || []);
        }
      });
    }
  }, [patient, navigate]);

  if (!patient) return null;

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const renderDashboardOverview = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Short Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: "16px" }}>
        <div className="card" style={{ borderLeft: "4px solid var(--color-primary)" }}>
          <span className="text-muted" style={{ fontSize: "11px", fontWeight: "700" }}>MY MEDICATIONS</span>
          <h3 style={{ fontSize: "24px", margin: "4px 0 0 0" }}>{patient.medications?.length || 0} Prescribed</h3>
        </div>
        <div className="card" style={{ borderLeft: "4px solid var(--color-accent)" }}>
          <span className="text-muted" style={{ fontSize: "11px", fontWeight: "700" }}>TOTAL VISIT RECORDS</span>
          <h3 style={{ fontSize: "24px", margin: "4px 0 0 0" }}>{consultations.length} Consultations</h3>
        </div>
        <div className="card" style={{ borderLeft: "4px solid var(--color-warning)" }}>
          <span className="text-muted" style={{ fontSize: "11px", fontWeight: "700" }}>PENDING FOLLOW-UPS</span>
          <h3 style={{ fontSize: "24px", margin: "4px 0 0 0" }}>
            {patient.followUps?.filter(f => f.status === "PENDING").length || 0} Scheduled
          </h3>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
        {/* Core Record Summary */}
        <div className="card">
          <h3 className="section-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>🩺 My Health Profile</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>
              <span className="text-muted">Blood Group</span>
              <strong>{patient.bloodGroup}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--color-border)", paddingBottom: "8px" }}>
              <span className="text-muted">Existing Conditions</span>
              <strong style={{ color: "var(--color-primary)" }}>{patient.conditions?.join(", ") || "None"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "4px" }}>
              <span className="text-muted">Allergies</span>
              <strong style={{ color: "var(--color-danger)" }}>{patient.allergies?.join(", ") || "None"}</strong>
            </div>
          </div>
        </div>

        {/* Next Follow-up Alert */}
        <div className="card">
          <h3 className="section-title">📅 Next Follow-up Requirement</h3>
          {patient.followUps?.filter(f => f.status === "PENDING").length > 0 ? (
            <div style={{ marginTop: "14px", padding: "16px", borderRadius: "12px", background: "var(--color-bg)", border: "1.5px solid var(--color-warning)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <strong style={{ color: "var(--color-primary-dark)" }}>General Check-up</strong>
                <span className="badge badge-warning">Pending</span>
              </div>
              <p style={{ margin: "4px 0", fontSize: "14px" }}>
                <strong>Scheduled Date:</strong> {new Date(patient.followUps.filter(f => f.status === "PENDING")[0].date).toLocaleDateString()}
              </p>
              <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--color-text-muted)" }}>
                <strong>Reason/Notes:</strong> {patient.followUps.filter(f => f.status === "PENDING")[0].notes}
              </p>
            </div>
          ) : (
            <p className="text-muted" style={{ marginTop: "14px" }}>No follow-ups currently scheduled. Visit a health worker if you feel unwell.</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderHealthRecord = () => (
    <div className="card">
      <h3 className="section-title">📋 My Health Record</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
        <div style={{ padding: "12px", background: "var(--color-bg)", borderRadius: "8px" }}>
          <span className="text-muted" style={{ fontSize: "12px" }}>PATIENT ID</span>
          <h4 style={{ margin: "4px 0 0 0" }}>{patient.id}</h4>
        </div>
        <div style={{ padding: "12px", background: "var(--color-bg)", borderRadius: "8px" }}>
          <span className="text-muted" style={{ fontSize: "12px" }}>PHONE NUMBER</span>
          <h4 style={{ margin: "4px 0 0 0" }}>{patient.phone}</h4>
        </div>
        <div style={{ padding: "12px", background: "var(--color-bg)", borderRadius: "8px" }}>
          <span className="text-muted" style={{ fontSize: "12px" }}>VILLAGE</span>
          <h4 style={{ margin: "4px 0 0 0" }}>{patient.village}</h4>
        </div>
        <div style={{ padding: "12px", background: "var(--color-bg)", borderRadius: "8px" }}>
          <span className="text-muted" style={{ fontSize: "12px" }}>BLOOD GROUP</span>
          <h4 style={{ margin: "4px 0 0 0" }}>{patient.bloodGroup}</h4>
        </div>
      </div>

      <div style={{ marginTop: "24px" }}>
        <h4 style={{ marginBottom: "8px" }}>Existing Health Conditions</h4>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {patient.conditions?.map((c, i) => (
            <span key={i} className="badge badge-primary" style={{ padding: "6px 12px", fontSize: "13px" }}>{c}</span>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "24px" }}>
        <h4 style={{ marginBottom: "8px", color: "var(--color-danger)" }}>Known Allergies</h4>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {patient.allergies?.map((a, i) => (
            <span key={i} className="badge badge-danger" style={{ padding: "6px 12px", fontSize: "13px" }}>{a}</span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConsultations = () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <h3 className="section-title">📝 Consultation & Diagnostics History</h3>
      {consultations.length === 0 ? (
        <div className="empty-state card">
          <h3>No records found</h3>
          <p>No previous consultation records exist for this profile.</p>
        </div>
      ) : (
        consultations.map((c) => (
          <div key={c.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="text-muted">{new Date(c.date).toLocaleString()}</span>
              <span className={`badge ${c.riskLevel === "HIGH" ? "badge-danger" : c.riskLevel === "MODERATE" ? "badge-warning" : "badge-success"}`}>
                Risk Level: {c.riskLevel}
              </span>
            </div>
            
            <div>
              <strong>Main Symptoms Reported:</strong>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "4px" }}>
                {c.symptoms.map((s, idx) => (
                  <span key={idx} className="badge badge-neutral">{s.replace("_", " ")}</span>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "10px", padding: "10px", background: "var(--color-bg)", borderRadius: "8px" }}>
              <div>Temp: <strong>{c.vitals.temperature || "--"} °C</strong></div>
              <div>BP: <strong>{c.vitals.bloodPressure || "--"} mmHg</strong></div>
              <div>Pulse: <strong>{c.vitals.heartRate || "--"} bpm</strong></div>
              <div>SpO₂: <strong>{c.vitals.spo2 || "--"} %</strong></div>
            </div>

            <div>
              <strong>Prescribed Medication:</strong>
              <ul style={{ margin: "4px 0 0 0", paddingLeft: "20px" }}>
                {c.medication?.map((med, idx) => (
                  <li key={idx}>{med}</li>
                ))}
              </ul>
            </div>

            {c.followUpRequired && (
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "8px", fontSize: "13px", color: "var(--color-primary-dark)" }}>
                🔄 <strong>Follow-up Scheduled:</strong> {new Date(c.followUpDate).toLocaleDateString()} - {c.followUpReason}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderMedications = () => (
    <div className="card">
      <h3 className="section-title">💊 Prescribed Medications</h3>
      <p className="text-muted" style={{ marginBottom: "16px" }}>Take medications exactly as directed by health workers.</p>
      {patient.medications?.length === 0 ? (
        <p>No active prescriptions recorded.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {patient.medications?.map((med, i) => (
            <div key={i} style={{ padding: "16px", borderRadius: "12px", border: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              <h4 style={{ margin: "0 0 8px 0", color: "var(--color-primary)" }}>{med.name}</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "14px" }}>
                <div><strong>Dosage:</strong> {med.dosage}</div>
                <div><strong>Duration:</strong> {med.duration}</div>
                <div style={{ gridColumn: "1 / -1" }}><strong>Instructions:</strong> {med.instructions || "Take with water."}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderReferrals = () => (
    <div className="card">
      <h3 className="section-title">📋 My Referrals</h3>
      {patient.referrals?.length === 0 ? (
        <p>No referrals recorded.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
          {patient.referrals?.map((ref, i) => (
            <div key={i} style={{ padding: "16px", borderRadius: "12px", border: "1px solid var(--color-border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <strong>{ref.facility}</strong>
                <StatusBadge status={ref.status === "Completed" ? "completed" : ref.status === "Cancelled" ? "cancelled" : "pending"} label={ref.status} />
              </div>
              <div style={{ fontSize: "14px" }}>
                <div>Date: {ref.date}</div>
                <div>Reason: {ref.reason}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderFollowUps = () => (
    <div className="card">
      <h3 className="section-title">⏰ Follow-up Tasks</h3>
      {patient.followUps?.length === 0 ? (
        <p>No follow-ups recorded.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "14px" }}>
          {patient.followUps?.map((fol, i) => (
            <div key={i} style={{ padding: "16px", borderRadius: "12px", border: "1px solid var(--color-border)", background: "var(--color-bg)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                <strong>Scheduled for: {new Date(fol.date).toLocaleDateString()}</strong>
                <span className={`badge ${fol.status === "COMPLETED" ? "badge-success" : "badge-warning"}`}>
                  {fol.status}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: "14px" }}>Notes: {fol.notes}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div className="card">
      <h3 className="section-title">👤 Patient Profile Details</h3>
      <div style={{ marginTop: "16px" }}>
        <p><strong>Name:</strong> {patient.name}</p>
        <p><strong>Age:</strong> {patient.age}</p>
        <p><strong>Gender:</strong> {patient.gender}</p>
        <p><strong>Village:</strong> {patient.village}</p>
        <p><strong>Phone:</strong> {patient.phone}</p>
      </div>
    </div>
  );

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: "🏠" },
    { id: "record", label: "My Health Record", icon: "📋" },
    { id: "consultations", label: "Consultations", icon: "📝" },
    { id: "medications", label: "Medications", icon: "💊" },
    { id: "referrals", label: "Referrals", icon: "📋" },
    { id: "followups", label: "Follow-ups", icon: "⏰" },
    { id: "profile", label: "Profile", icon: "👤" }
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-bg)", fontFamily: "var(--font-family)" }}>
      {/* Sidebar navigation */}
      <aside style={{
        width: "260px",
        background: "var(--color-primary-dark)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        padding: "24px 0"
      }}>
        <div style={{ padding: "0 24px 24px 24px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <h3 style={{ margin: 0, fontSize: "20px" }}>Village Access</h3>
          <span style={{ fontSize: "12px", color: "var(--color-accent-light)" }}>Patient Portal</span>
        </div>
        
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "4px", padding: "16px 8px" }}>
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                border: "none",
                background: activeTab === item.id ? "rgba(255, 255, 255, 0.15)" : "transparent",
                color: "white",
                borderRadius: "8px",
                cursor: "pointer",
                textAlign: "left",
                fontWeight: activeTab === item.id ? "700" : "500",
                fontSize: "14px"
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "0 8px 16px 8px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 16px",
              border: "none",
              background: "transparent",
              color: "white",
              borderRadius: "8px",
              cursor: "pointer",
              textAlign: "left",
              width: "100%",
              fontSize: "14px"
            }}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main style={{ flex: 1, padding: "40px" }}>
        <header style={{ marginBottom: "32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <p className="text-muted" style={{ margin: 0, textTransform: "uppercase", fontSize: "12px", fontWeight: "700" }}>PATIENT PORTAL</p>
            <h1 style={{ margin: 0 }}>Welcome, {patient.name}</h1>
          </div>
          <div className="patient-id-badge" style={{ fontSize: "14px", padding: "8px 16px" }}>
            Patient ID: {patient.id}
          </div>
        </header>

        {activeTab === "dashboard" && renderDashboardOverview()}
        {activeTab === "record" && renderHealthRecord()}
        {activeTab === "consultations" && renderConsultations()}
        {activeTab === "medications" && renderMedications()}
        {activeTab === "referrals" && renderReferrals()}
        {activeTab === "followups" && renderFollowUps()}
        {activeTab === "profile" && renderProfile()}
      </main>
    </div>
  );
}

export default PatientDashboard;

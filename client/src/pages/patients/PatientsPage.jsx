import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

function PatientsPage() {
  const navigate = useNavigate();
  const [patients] = useState(() => authService.getPatients());
  const [search, setSearch] = useState("");

  const filtered = patients.filter(
    p => p.name.toLowerCase().includes(search.toLowerCase()) || 
         p.id.toLowerCase().includes(search.toLowerCase()) ||
         p.village.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page" style={{ fontFamily: "var(--font-family)" }}>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <p className="section-eyebrow" style={{ color: "rgba(255, 255, 255, 0.8)", margin: 0 }}>VILLAGE HEALTH RECORDS</p>
          <h1>Patients / Residents Directory</h1>
          <p style={{ margin: "4px 0 0 0" }}>Manage resident profiles and launch consultations.</p>
        </div>
        <button
          className="btn btn-outline"
          onClick={() => navigate("/patients/register")}
          style={{ borderColor: "white", color: "white", borderRadius: "10px" }}
        >
          + Register New Patient
        </button>
      </div>

      <div className="content-block" style={{ marginTop: "40px" }}>
        <input
          className="input"
          type="text"
          placeholder="Search by Patient Name, ID, or Village..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: "480px", marginBottom: "24px" }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(p => (
            <div key={p.id} className="card" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontSize: "18px", color: "var(--color-primary-dark)", margin: 0 }}>{p.name}</h3>
                  <span className="text-muted" style={{ fontSize: "13px" }}>ID: {p.id} • {p.village}</span>
                </div>
                <span className="badge badge-primary">{p.gender}</span>
              </div>

              <div style={{ fontSize: "14px", marginTop: "8px" }}>
                <div>Age: <strong>{p.age} years</strong></div>
                <div>Conditions: <strong style={{ color: "var(--color-primary)" }}>{p.conditions?.join(", ") || "None"}</strong></div>
              </div>

              <div style={{ marginTop: "auto", display: "flex", gap: "10px", paddingTop: "14px", borderTop: "1px solid var(--color-border)" }}>
                <button
                  className="btn btn-outline"
                  onClick={() => navigate(`/patients/${p.id}`)}
                  style={{ flex: 1, padding: "8px", fontSize: "13px" }}
                >
                  View Details
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate(`/consultation?patientId=${p.id}`)}
                  style={{ flex: 1, padding: "8px", fontSize: "13px" }}
                >
                  Start Consultation
                </button>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="empty-state card" style={{ gridColumn: "1 / -1" }}>
              <h3>No patients found</h3>
              <p>Try searching with a different name, village, or ID.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientsPage;

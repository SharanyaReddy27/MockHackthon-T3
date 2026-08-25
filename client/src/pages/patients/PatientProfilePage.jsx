import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import { getPatientConsultations } from "../../services/consultationService";

function PatientProfilePage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  const [patient, setPatient] = useState(() => authService.getPatientById(patientId));
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(() => !!authService.getPatientById(patientId));

  useEffect(() => {
    const found = authService.getPatientById(patientId);
    if (found) {
      setTimeout(() => {
        setPatient(found);
      }, 0);
      getPatientConsultations(patientId).then(res => {
        if (res.success) {
          setConsultations(res.consultations || []);
        }
        setLoading(false);
      });
    }
  }, [patientId]);

  if (loading) {
    return <div className="page"><p>Loading Patient Profile...</p></div>;
  }

  if (!patient) {
    return (
      <div className="page" style={{ fontFamily: "var(--font-family)", textAlign: "center" }}>
        <div className="empty-state card">
          <h3>Resident Profile Not Found</h3>
          <p>The patient profile ID "{patientId}" was not found in the local directory.</p>
          <button className="btn btn-primary" onClick={() => navigate("/patients")} style={{ marginTop: "16px" }}>
            Return to Patients List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ fontFamily: "var(--font-family)" }}>
      {/* Page Header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <button
            onClick={() => navigate("/patients")}
            style={{ background: "none", border: "none", color: "white", cursor: "pointer", marginBottom: "8px", fontSize: "14px", fontWeight: "600", padding: 0 }}
          >
            ← Back to Directory
          </button>
          <h1>{patient.name}</h1>
          <p style={{ margin: "4px 0 0 0" }}>Patient ID: {patient.id} • Village: {patient.village}</p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="btn btn-outline"
            onClick={() => navigate(`/consultation?patientId=${patient.id}`)}
            style={{ borderColor: "white", color: "white", borderRadius: "10px" }}
          >
            🩺 Start Consultation
          </button>
        </div>
      </div>

      <div className="content-block" style={{ marginTop: "40px", display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
        
        {/* Left Column: Health Profile Summary card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div className="card">
            <h3 className="section-title">🏥 Personal Record</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px", fontSize: "14px" }}>
              <div><strong>Age:</strong> {patient.age} years</div>
              <div><strong>Gender:</strong> {patient.gender}</div>
              <div><strong>Phone:</strong> {patient.phone}</div>
              <div><strong>Blood Group:</strong> {patient.bloodGroup}</div>
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "8px" }}>
                <strong>Existing Conditions:</strong>
                <p style={{ margin: "4px 0 0 0", color: "var(--color-primary-dark)" }}>{patient.conditions?.join(", ") || "None"}</p>
              </div>
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "8px" }}>
                <strong>Known Allergies:</strong>
                <p style={{ margin: "4px 0 0 0", color: "var(--color-danger)" }}>{patient.allergies?.join(", ") || "None"}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">💊 Active Medications</h3>
            {patient.medications?.length === 0 ? (
              <p className="text-muted" style={{ margin: "8px 0 0 0" }}>No medications currently prescribed.</p>
            ) : (
              <ul style={{ margin: "8px 0 0 0", paddingLeft: "16px", fontSize: "14px" }}>
                {patient.medications?.map((m, idx) => (
                  <li key={idx} style={{ marginBottom: "6px" }}>
                    <strong>{m.name}</strong> - {m.dosage}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card">
            <h3 className="section-title">📋 Referral Registry</h3>
            {patient.referrals?.length === 0 ? (
              <p className="text-muted" style={{ margin: "8px 0 0 0" }}>No referrals recorded.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px", fontSize: "13px" }}>
                {patient.referrals?.map((ref, idx) => (
                  <div key={idx} style={{ padding: "8px", border: "1px solid var(--color-border)", borderRadius: "6px" }}>
                    <strong>{ref.facility}</strong><br/>
                    Status: {ref.status} • {ref.date}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: consultations and followups */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          
          {/* Scheduled Follow-ups card */}
          <div className="card">
            <h3 className="section-title">📅 Scheduled Follow-ups</h3>
            {patient.followUps?.length === 0 ? (
              <p className="text-muted" style={{ margin: "8px 0 0 0" }}>No follow-ups recorded.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "12px" }}>
                {patient.followUps?.map((f, idx) => (
                  <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--color-bg)", border: "1px solid var(--color-border)", borderRadius: "8px" }}>
                    <div>
                      <strong>{new Date(f.date).toLocaleDateString()}</strong> — {f.notes}
                    </div>
                    <span className={`badge ${f.status === "COMPLETED" ? "badge-success" : "badge-warning"}`}>
                      {f.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Previous Consultations card */}
          <div className="card">
            <h3 className="section-title">📝 Consultation Intake Logs</h3>
            
            {consultations.length === 0 ? (
              <p className="text-muted" style={{ margin: "16px 0 0 0" }}>No previous consultations logged.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                {consultations.map(c => (
                  <div key={c.id} style={{ padding: "16px", border: "1.5px solid var(--color-border)", borderRadius: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <strong>Date: {new Date(c.date).toLocaleString()}</strong>
                      <span className={`badge ${c.riskLevel === "HIGH" ? "badge-danger" : c.riskLevel === "MODERATE" ? "badge-warning" : "badge-success"}`}>
                        {c.riskLevel}
                      </span>
                    </div>

                    <p style={{ margin: "6px 0", fontSize: "14px" }}>
                      <strong>Main Complaint:</strong> {c.mainComplaint}
                    </p>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px", background: "var(--color-bg)", padding: "10px", borderRadius: "8px", fontSize: "13px", margin: "10px 0" }}>
                      <div>Temp: <strong>{c.vitals.temperature || "--"} °C</strong></div>
                      <div>BP: <strong>{c.vitals.bloodPressure || "--"} mmHg</strong></div>
                      <div>HR: <strong>{c.vitals.heartRate || "--"} bpm</strong></div>
                      <div>SpO₂: <strong>{c.vitals.spo2 || "--"} %</strong></div>
                    </div>

                    {c.medication?.length > 0 && (
                      <div style={{ fontSize: "13px", marginTop: "8px" }}>
                        <strong>Medication Prescribed:</strong> {c.medication.join(", ")}
                      </div>
                    )}

                    {c.followUpRequired && (
                      <div style={{ fontSize: "13px", marginTop: "6px", color: "var(--color-primary)" }}>
                        🔄 <strong>Follow-up Scheduled:</strong> {new Date(c.followUpDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default PatientProfilePage;

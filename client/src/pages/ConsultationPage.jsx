import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { createConsultation } from "../services/consultationService";
import { assessRisk } from "../utils/riskAssessment";

const commonSymptoms = [
  { value: "fever", label: "Fever" },
  { value: "cough", label: "Cough" },
  { value: "headache", label: "Headache" },
  { value: "fatigue", label: "Fatigue" },
  { value: "vomiting", label: "Vomiting" },
  { value: "diarrhea", label: "Diarrhea" },
  { value: "body_pain", label: "Body Pain" },
  { value: "severe_breathing_difficulty", label: "Severe Breathing Difficulty" }
];

function ConsultationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const patientIdParam = searchParams.get("patientId");

  const [patients] = useState(() => authService.getPatients());
  const [selectedPatientId, setSelectedPatientId] = useState(patientIdParam || "");
  const [patient, setPatient] = useState(() => {
    if (patientIdParam) {
      const patientList = authService.getPatients();
      return patientList.find(p => p.id === patientIdParam) || null;
    }
    return null;
  });

  // Form Fields
  const [mainComplaint, setMainComplaint] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState("Mild");

  const [temperature, setTemperature] = useState("");
  const [bloodPressure, setBloodPressure] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [respiratoryRate, setRespiratoryRate] = useState("");
  const [spo2, setSpo2] = useState("");
  const [weight, setWeight] = useState("");

  const [generalObservations, setGeneralObservations] = useState("");
  const [physicalObservations, setPhysicalObservations] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const [medications, setMedications] = useState([]);
  const [currentMed, setCurrentMed] = useState({ name: "", dosage: "", frequency: "", duration: "", instructions: "" });

  const [followUpRequired, setFollowUpRequired] = useState("No");
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpReason, setFollowUpReason] = useState("");

  // UI States
  const [errors, setErrors] = useState({});
  const [isSaved, setIsSaved] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (patientIdParam) {
      setTimeout(() => {
        setSelectedPatientId(patientIdParam);
        const found = patients.find(p => p.id === patientIdParam);
        setPatient(found || null);
      }, 0);
    }
  }, [patientIdParam, patients]);

  const handlePatientChange = (e) => {
    const id = e.target.value;
    setSelectedPatientId(id);
    const found = patients.find(p => p.id === id);
    setPatient(found || null);
    setIsSaved(false);
  };

  const toggleSymptom = (val) => {
    setSymptoms(prev =>
      prev.includes(val) ? prev.filter(s => s !== val) : [...prev, val]
    );
  };

  const addMedication = () => {
    if (!currentMed.name.trim()) return;
    setMedications(prev => [...prev, currentMed]);
    setCurrentMed({ name: "", dosage: "", frequency: "", duration: "", instructions: "" });
  };

  const removeMedication = (idx) => {
    setMedications(prev => prev.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const nextErrors = {};
    if (!selectedPatientId) nextErrors.patient = "Please select a patient.";
    if (!mainComplaint.trim()) nextErrors.mainComplaint = "Main complaint is required.";
    if (symptoms.length === 0) nextErrors.symptoms = "Select at least one symptom.";
    
    // Vitals validation
    if (temperature && isNaN(Number(temperature))) nextErrors.temperature = "Must be a number.";
    if (heartRate && isNaN(Number(heartRate))) nextErrors.heartRate = "Must be a number.";
    if (respiratoryRate && isNaN(Number(respiratoryRate))) nextErrors.respiratoryRate = "Must be a number.";
    if (spo2 && (isNaN(Number(spo2)) || Number(spo2) < 0 || Number(spo2) > 100)) {
      nextErrors.spo2 = "Enter valid O₂ Saturation %.";
    }

    if (followUpRequired === "Yes") {
      if (!followUpDate) nextErrors.followUpDate = "Follow-up date is required.";
      if (!followUpReason.trim()) nextErrors.followUpReason = "Follow-up reason is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Run Risk Assessment locally using our helper
    const consultationData = {
      symptoms,
      vitals: {
        temperature,
        bloodPressure,
        heartRate,
        spo2
      }
    };
    
    const risk = assessRisk(consultationData);

    const consultationResult = {
      patientId: selectedPatientId,
      patientName: patient.name,
      date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
      symptoms: symptoms,
      mainComplaint,
      severity,
      duration,
      vitals: {
        temperature,
        bloodPressure,
        heartRate,
        respiratoryRate,
        spo2,
        weight
      },
      observations: {
        generalObservations,
        physicalObservations,
        additionalNotes
      },
      medications,
      followUp: {
        required: followUpRequired,
        date: followUpDate,
        reason: followUpReason
      },
      riskLevel: risk.level,
      riskReasons: risk.reasons,
      recommendedAction: risk.recommendedAction
    };

    // Save locally
    await createConsultation({
      patientId: selectedPatientId,
      symptoms,
      vitals: {
        temperature,
        bloodPressure,
        heartRate,
        spo2
      },
      observations: `${generalObservations} | ${physicalObservations} | ${additionalNotes}`,
      medication: medications.map(m => `${m.name} (${m.dosage}, ${m.frequency})`),
      followUpDate: followUpRequired === "Yes" ? followUpDate : null,
      followUpReason: followUpReason
    });

    setSummary(consultationResult);
    setIsSaved(true);
  };

  const handleReset = () => {
    setMainComplaint("");
    setSymptoms([]);
    setDuration("");
    setSeverity("Mild");
    setTemperature("");
    setBloodPressure("");
    setHeartRate("");
    setRespiratoryRate("");
    setSpo2("");
    setWeight("");
    setGeneralObservations("");
    setPhysicalObservations("");
    setAdditionalNotes("");
    setMedications([]);
    setFollowUpRequired("No");
    setFollowUpDate("");
    setFollowUpReason("");
    setErrors({});
    setIsSaved(false);
    setSummary(null);
  };

  return (
    <div className="consultation-page" style={{ fontFamily: "var(--font-family)", paddingBottom: "80px" }}>
      <header className="medical-header">
        <div className="header-content">
          <button className="header-back-button" onClick={() => window.history.back()} aria-label="Go back">
            ←
          </button>
          <div>
            <p className="header-label">Village Health Access System</p>
            <h1>Consultation & Risk Assessment</h1>
            <p className="header-subtitle"> Frontline clinical intake & priority decision-support </p>
          </div>
        </div>
      </header>

      <main className="consultation-container" style={{ marginTop: "40px", maxWidth: "800px", marginLeft: "auto", marginRight: "auto" }}>
        
        {/* Patient Selection section */}
        {!isSaved && (
          <section className="patient-summary-card">
            <h3 className="section-title">👤 Patient Selection</h3>
            <div className="form-field" style={{ marginTop: "12px" }}>
              <label>Select Resident Profile</label>
              <select className="input" value={selectedPatientId} onChange={handlePatientChange} style={{ marginTop: "6px" }}>
                <option value="">-- Choose Resident --</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id} - {p.village})
                  </option>
                ))}
              </select>
              {errors.patient && <p className="field-error">{errors.patient}</p>}
            </div>

            {patient && (
              <div style={{ display: "flex", gap: "16px", marginTop: "20px", padding: "16px", background: "var(--color-bg)", borderRadius: "12px" }}>
                <div style={{ fontSize: "20px" }}>👤</div>
                <div>
                  <h4 style={{ margin: 0 }}>{patient.name}</h4>
                  <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--color-text-muted)" }}>
                    {patient.age} years • {patient.gender} • {patient.village} • Blood: {patient.bloodGroup}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {!isSaved ? (
          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* SECTION 1 - SYMPTOMS */}
            <section className="form-card">
              <h3 className="section-title">🌡️ Section 1 — Symptoms & Complaint</h3>
              
              <div className="form-field" style={{ marginTop: "16px" }}>
                <label>Main Complaint / Reason for Visit</label>
                <input
                  className="input"
                  type="text"
                  value={mainComplaint}
                  onChange={(e) => setMainComplaint(e.target.value)}
                  placeholder="e.g. High fever with severe body chills"
                />
                {errors.mainComplaint && <p className="field-error">{errors.mainComplaint}</p>}
              </div>

              <div style={{ marginTop: "16px" }}>
                <label style={{ fontWeight: "700", fontSize: "14px", display: "block", marginBottom: "8px" }}>Select Symptoms</label>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {commonSymptoms.map(sym => (
                    <button
                      type="button"
                      key={sym.value}
                      className={`chip ${symptoms.includes(sym.value) ? "active" : ""}`}
                      onClick={() => toggleSymptom(sym.value)}
                    >
                      {symptoms.includes(sym.value) && "✓ "}
                      {sym.label}
                    </button>
                  ))}
                </div>
                {errors.symptoms && <p className="field-error" style={{ marginTop: "8px" }}>{errors.symptoms}</p>}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <div className="form-field">
                  <label>Duration</label>
                  <input
                    className="input"
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 3 days"
                  />
                </div>
                <div className="form-field">
                  <label>Severity</label>
                  <select className="input" value={severity} onChange={(e) => setSeverity(e.target.value)}>
                    <option>Mild</option>
                    <option>Moderate</option>
                    <option>Severe</option>
                  </select>
                </div>
              </div>
            </section>

            {/* SECTION 2 - VITALS */}
            <section className="form-card">
              <h3 className="section-title">🩺 Section 2 — Vitals</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "16px", marginTop: "16px" }}>
                
                <div className="form-field">
                  <label>Temperature</label>
                  <div className="input-with-unit">
                    <input className="input" type="text" value={temperature} onChange={(e) => setTemperature(e.target.value)} placeholder="37.2" />
                    <span>°C</span>
                  </div>
                  {errors.temperature && <p className="field-error">{errors.temperature}</p>}
                </div>

                <div className="form-field">
                  <label>Blood Pressure</label>
                  <div className="input-with-unit">
                    <input className="input" type="text" value={bloodPressure} onChange={(e) => setBloodPressure(e.target.value)} placeholder="120/80" />
                    <span>mmHg</span>
                  </div>
                </div>

                <div className="form-field">
                  <label>Heart Rate</label>
                  <div className="input-with-unit">
                    <input className="input" type="text" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} placeholder="72" />
                    <span>bpm</span>
                  </div>
                  {errors.heartRate && <p className="field-error">{errors.heartRate}</p>}
                </div>

                <div className="form-field">
                  <label>Respiratory Rate</label>
                  <div className="input-with-unit">
                    <input className="input" type="text" value={respiratoryRate} onChange={(e) => setRespiratoryRate(e.target.value)} placeholder="16" />
                    <span>bpm</span>
                  </div>
                  {errors.respiratoryRate && <p className="field-error">{errors.respiratoryRate}</p>}
                </div>

                <div className="form-field">
                  <label>Oxygen Saturation (SpO₂)</label>
                  <div className="input-with-unit">
                    <input className="input" type="text" value={spo2} onChange={(e) => setSpo2(e.target.value)} placeholder="98" />
                    <span>%</span>
                  </div>
                  {errors.spo2 && <p className="field-error">{errors.spo2}</p>}
                </div>

                <div className="form-field">
                  <label>Weight</label>
                  <div className="input-with-unit">
                    <input className="input" type="text" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="62" />
                    <span>kg</span>
                  </div>
                </div>

              </div>
            </section>

            {/* SECTION 3 - OBSERVATIONS */}
            <section className="form-card">
              <h3 className="section-title">📝 Section 3 — Clinical Observations</h3>
              
              <div className="form-field" style={{ marginTop: "16px" }}>
                <label>General Observations</label>
                <textarea
                  className="input"
                  rows="3"
                  value={generalObservations}
                  onChange={(e) => setGeneralObservations(e.target.value)}
                  placeholder="Note overall patient status, alertness..."
                />
              </div>

              <div className="form-field" style={{ marginTop: "16px" }}>
                <label>Physical Observations</label>
                <textarea
                  className="input"
                  rows="3"
                  value={physicalObservations}
                  onChange={(e) => setPhysicalObservations(e.target.value)}
                  placeholder="Note physical exam results (throat, chest sounds, skin rash...)"
                />
              </div>

              <div className="form-field" style={{ marginTop: "16px" }}>
                <label>Additional Notes</label>
                <textarea
                  className="input"
                  rows="2"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Any other comments or details..."
                />
              </div>
            </section>

            {/* SECTION 4 - MEDICATIONS */}
            <section className="form-card">
              <h3 className="section-title">💊 Section 4 — Medication & Care</h3>
              
              <div style={{ marginTop: "16px", padding: "16px", background: "var(--color-bg)", borderRadius: "12px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className="form-field">
                    <label>Medication Name</label>
                    <input className="input" type="text" value={currentMed.name} onChange={(e) => setCurrentMed({...currentMed, name: e.target.value})} placeholder="e.g. Paracetamol" />
                  </div>
                  <div className="form-field">
                    <label>Dosage</label>
                    <input className="input" type="text" value={currentMed.dosage} onChange={(e) => setCurrentMed({...currentMed, dosage: e.target.value})} placeholder="e.g. 500mg" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div className="form-field">
                    <label>Frequency</label>
                    <input className="input" type="text" value={currentMed.frequency} onChange={(e) => setCurrentMed({...currentMed, frequency: e.target.value})} placeholder="e.g. Twice daily" />
                  </div>
                  <div className="form-field">
                    <label>Duration</label>
                    <input className="input" type="text" value={currentMed.duration} onChange={(e) => setCurrentMed({...currentMed, duration: e.target.value})} placeholder="e.g. 5 days" />
                  </div>
                  <div className="form-field">
                    <label>Instructions</label>
                    <input className="input" type="text" value={currentMed.instructions} onChange={(e) => setCurrentMed({...currentMed, instructions: e.target.value})} placeholder="e.g. After food" />
                  </div>
                </div>

                <button type="button" className="btn btn-outline" onClick={addMedication} style={{ alignSelf: "flex-end" }}>
                  + Add Medication
                </button>
              </div>

              {medications.length > 0 && (
                <div style={{ marginTop: "20px" }}>
                  <h4 style={{ fontSize: "14px", marginBottom: "8px" }}>Added Medications List:</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {medications.map((m, idx) => (
                      <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "white", border: "1px solid var(--color-border)", borderRadius: "8px" }}>
                        <div>
                          <strong>{m.name} {m.dosage}</strong> — {m.frequency} ({m.duration}) <br/>
                          <small style={{ color: "var(--color-text-muted)" }}>{m.instructions}</small>
                        </div>
                        <button type="button" className="btn" style={{ padding: "4px 8px", color: "var(--color-danger)" }} onClick={() => removeMedication(idx)}>
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* SECTION 5 - FOLLOW-UP */}
            <section className="form-card">
              <h3 className="section-title">🔄 Section 5 — Follow-up Requirement</h3>
              
              <div className="form-field" style={{ marginTop: "16px" }}>
                <label>Follow-up Required?</label>
                <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
                  <label className="checkbox-row">
                    <input type="radio" name="followUpRequired" value="Yes" checked={followUpRequired === "Yes"} onChange={() => setFollowUpRequired("Yes")} />
                    Yes
                  </label>
                  <label className="checkbox-row">
                    <input type="radio" name="followUpRequired" value="No" checked={followUpRequired === "No"} onChange={() => setFollowUpRequired("No")} />
                    No
                  </label>
                </div>
              </div>

              {followUpRequired === "Yes" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                  <div className="form-field">
                    <label>Follow-up Date</label>
                    <input className="input" type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} />
                    {errors.followUpDate && <p className="field-error">{errors.followUpDate}</p>}
                  </div>
                  <div className="form-field">
                    <label>Reason / Notes</label>
                    <input className="input" type="text" value={followUpReason} onChange={(e) => setFollowUpReason(e.target.value)} placeholder="e.g. Check temperature stability" />
                    {errors.followUpReason && <p className="field-error">{errors.followUpReason}</p>}
                  </div>
                </div>
              )}
            </section>

            {/* SUBMIT BUTTON */}
            <div style={{ textAlign: "center", marginTop: "12px" }}>
              <button type="submit" className="primary-button" style={{ padding: "16px 32px", fontSize: "16px" }}>
                Save Consultation & Check Risk
              </button>
            </div>
          </form>
        ) : (
          /* SECTION 6 & SUMMARY - DISPLAYED ONCE SAVED */
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Risk Assessment Result Panel */}
            <section className={`card`} style={{
              borderLeft: "6px solid " + (summary.riskLevel === "HIGH" ? "var(--color-danger)" : summary.riskLevel === "MODERATE" ? "var(--color-warning)" : "var(--color-success)"),
              padding: "24px"
            }}>
              <p className="section-eyebrow" style={{ textTransform: "uppercase" }}>Section 6 — Risk / Urgency Assessment</p>
              <h2 style={{
                color: summary.riskLevel === "HIGH" ? "var(--color-danger)" : summary.riskLevel === "MODERATE" ? "var(--color-warning)" : "var(--color-success)",
                margin: "4px 0 12px 0"
              }}>
                {summary.riskLevel} PRIORITY
              </h2>

              <p style={{ margin: "8px 0" }}>
                <strong>Assessment Basis:</strong>
              </p>
              <ul style={{ margin: "4px 0 16px 0", paddingLeft: "20px", color: "var(--color-text-muted)" }}>
                {summary.riskReasons.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>

              <div style={{ padding: "16px", borderRadius: "12px", background: "var(--color-bg)", border: "1px solid var(--color-border)", marginBottom: "20px" }}>
                <span className="text-muted" style={{ fontSize: "12px", fontWeight: "700" }}>RECOMMENDED ACTION</span>
                <p style={{ margin: "4px 0 0 0", fontSize: "16px", fontWeight: "700" }}>{summary.recommendedAction}</p>
              </div>

              <div style={{ fontSize: "13px", color: "var(--color-text-muted)", marginBottom: "20px" }}>
                ⚠️ <em>Clinical decision support based on predefined rules. It must NOT claim to be an autonomous medical diagnosis.</em>
              </div>

              {/* Urgency Actions redirection buttons */}
              <div style={{ display: "flex", gap: "12px" }}>
                {summary.riskLevel === "LOW" && (
                  <button className="btn btn-primary" onClick={() => navigate("/follow-ups")} style={{ flex: 1 }}>
                    Schedule Follow-up
                  </button>
                )}
                {summary.riskLevel === "MODERATE" && (
                  <button className="btn btn-primary" onClick={() => navigate("/referrals/new")} style={{ flex: 1 }}>
                    Create Referral
                  </button>
                )}
                {summary.riskLevel === "HIGH" && (
                  <button className="btn btn-primary" onClick={() => navigate("/referrals/new")} style={{ flex: 1, backgroundColor: "var(--color-danger)" }}>
                    🚨 Emergency Referral
                  </button>
                )}
              </div>
            </section>

            {/* Complete Consultation Summary Detail Card */}
            <section className="card">
              <h3 className="section-title">📋 Consultation Summary Record</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div><strong>Patient:</strong> {summary.patientName} ({selectedPatientId})</div>
                  <div><strong>Consultation Date:</strong> {summary.date}</div>
                </div>

                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>
                  <strong>Symptoms:</strong>
                  <p style={{ margin: "4px 0 0 0" }}>{summary.mainComplaint} ({summary.severity}, {summary.duration || "N/A"})</p>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                    {summary.symptoms.map(s => (
                      <span key={s} className="badge badge-neutral">{s.replace("_", " ")}</span>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>
                  <strong>Vitals:</strong>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginTop: "6px" }}>
                    <div>Temp: <strong>{summary.vitals.temperature || "--"} °C</strong></div>
                    <div>BP: <strong>{summary.vitals.bloodPressure || "--"} mmHg</strong></div>
                    <div>Pulse: <strong>{summary.vitals.heartRate || "--"} bpm</strong></div>
                    <div>Resp Rate: <strong>{summary.vitals.respiratoryRate || "--"} bpm</strong></div>
                    <div>SpO₂: <strong>{summary.vitals.spo2 || "--"} %</strong></div>
                    <div>Weight: <strong>{summary.vitals.weight || "--"} kg</strong></div>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>
                  <strong>Observations:</strong>
                  <p style={{ margin: "4px 0 0 0" }}><strong>General:</strong> {summary.observations.generalObservations || "N/A"}</p>
                  <p style={{ margin: "4px 0 0 0" }}><strong>Physical:</strong> {summary.observations.physicalObservations || "N/A"}</p>
                  <p style={{ margin: "4px 0 0 0" }}><strong>Notes:</strong> {summary.observations.additionalNotes || "N/A"}</p>
                </div>

                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>
                  <strong>Medications Prescribed:</strong>
                  {summary.medications.length === 0 ? (
                    <p style={{ margin: "4px 0 0 0", color: "var(--color-text-muted)" }}>None</p>
                  ) : (
                    <ul style={{ margin: "4px 0 0 0", paddingLeft: "20px" }}>
                      {summary.medications.map((m, idx) => (
                        <li key={idx}>{m.name} {m.dosage} - {m.frequency} ({m.duration}) {m.instructions && `[${m.instructions}]`}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "12px" }}>
                  <strong>Follow-up requirement:</strong>
                  <p style={{ margin: "4px 0 0 0" }}>
                    {summary.followUp.required === "Yes" ? `Scheduled on ${new Date(summary.followUp.date).toLocaleDateString()} - ${summary.followUp.reason}` : "Not required"}
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", gap: "12px", marginTop: "24px", borderTop: "1px solid var(--color-border)", paddingTop: "20px" }}>
                <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate("/health-worker/dashboard")}>
                  Back to Dashboard
                </button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleReset}>
                  New Consultation
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default ConsultationPage;
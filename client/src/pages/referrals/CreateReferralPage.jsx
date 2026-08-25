import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createReferral } from "../../services/referralService.js";
import { mockHealthcareCentersLite } from "../../data/mockHealthcareCenters.js";
import { URGENCY_LEVELS } from "../../data/mockReferrals.js";

const initialForm = {
  patientName: "",
  patientAge: "",
  patientGender: "Female",
  village: "",
  reason: "",
  urgency: "Moderate",
  healthcareCenterId: "",
  notes: "",
};

function CreateReferralPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const validate = () => {
    const next = {};
    if (!form.patientName.trim()) next.patientName = "Patient name is required";
    if (!form.patientAge || Number(form.patientAge) <= 0) next.patientAge = "Enter a valid age";
    if (!form.reason.trim()) next.reason = "Reason for referral is required";
    if (!form.healthcareCenterId) next.healthcareCenterId = "Select a destination facility";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    const center = mockHealthcareCentersLite.find((c) => c.id === form.healthcareCenterId);
    const created = await createReferral({
      patientName: form.patientName,
      patientAge: Number(form.patientAge),
      patientGender: form.patientGender,
      village: form.village,
      reason: form.reason,
      urgency: form.urgency,
      notes: form.notes,
      healthcareCenter: { id: center.id, name: center.name, type: center.type },
    });
    setSubmitting(false);
    navigate(`/referrals/${created.id}`);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>New Referral</h1>
        <p>Create a referral for prioritized emergency or routine care</p>
      </div>

      <div className="content-block" style={{ marginTop: 40 }}>
        <form className="card" onSubmit={handleSubmit} style={{ display: "grid", gap: 16, maxWidth: 640 }}>
          <div>
            <label className="text-muted">Patient Name</label>
            <input className="input" value={form.patientName} onChange={update("patientName")} style={{ marginTop: 6 }} />
            {errors.patientName && <p style={{ color: "var(--color-danger)", fontSize: 12, marginTop: 4 }}>{errors.patientName}</p>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className="text-muted">Age</label>
              <input type="number" className="input" value={form.patientAge} onChange={update("patientAge")} style={{ marginTop: 6 }} />
              {errors.patientAge && <p style={{ color: "var(--color-danger)", fontSize: 12, marginTop: 4 }}>{errors.patientAge}</p>}
            </div>
            <div>
              <label className="text-muted">Gender</label>
              <select className="input" value={form.patientGender} onChange={update("patientGender")} style={{ marginTop: 6 }}>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-muted">Village</label>
            <input className="input" value={form.village} onChange={update("village")} style={{ marginTop: 6 }} />
          </div>

          <div>
            <label className="text-muted">Reason for Referral</label>
            <textarea
              className="input"
              rows={3}
              value={form.reason}
              onChange={update("reason")}
              style={{ marginTop: 6, resize: "vertical" }}
            />
            {errors.reason && <p style={{ color: "var(--color-danger)", fontSize: 12, marginTop: 4 }}>{errors.reason}</p>}
          </div>

          <div>
            <label className="text-muted">Urgency</label>
            <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
              {URGENCY_LEVELS.map((level) => (
                <button
                  type="button"
                  key={level}
                  className={`chip ${form.urgency === level ? "active" : ""}`}
                  onClick={() => setForm({ ...form, urgency: level })}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-muted">Destination Healthcare Center</label>
            <select
              className="input"
              value={form.healthcareCenterId}
              onChange={update("healthcareCenterId")}
              style={{ marginTop: 6 }}
            >
              <option value="">Select a facility...</option>
              {mockHealthcareCentersLite.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.type} ({c.distance} km)
                </option>
              ))}
            </select>
            {errors.healthcareCenterId && (
              <p style={{ color: "var(--color-danger)", fontSize: 12, marginTop: 4 }}>{errors.healthcareCenterId}</p>
            )}
          </div>

          <div>
            <label className="text-muted">Notes (optional)</label>
            <textarea
              className="input"
              rows={2}
              value={form.notes}
              onChange={update("notes")}
              style={{ marginTop: 6, resize: "vertical" }}
            />
          </div>

          <button className="btn btn-primary btn-block" disabled={submitting} type="submit">
            {submitting ? "Creating Referral..." : "Create Referral"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateReferralPage;
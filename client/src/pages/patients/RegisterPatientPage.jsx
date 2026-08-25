import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

function RegisterPatientPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "Female",
    village: "",
    phone: "",
    bloodGroup: "O+",
    conditions: "",
    allergies: ""
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.name.trim()) tempErrors.name = "Patient Full Name is required.";
    if (!formData.age || isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
      tempErrors.age = "Please enter a valid age.";
    }
    if (!formData.village.trim()) tempErrors.village = "Village / Location is required.";
    
    const phoneRegex = /^\+?[0-9\s-]{10,15}$/;
    if (!formData.phone.trim()) {
      tempErrors.phone = "Phone number is required.";
    } else if (!phoneRegex.test(formData.phone)) {
      tempErrors.phone = "Enter a valid phone number (min 10 digits).";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const registered = authService.registerPatient(formData);
    setSuccess(`Patient profile registered successfully! Assigned ID: ${registered.id}`);
    
    setTimeout(() => {
      navigate(`/patients/${registered.id}`);
    }, 1500);
  };

  return (
    <div className="page" style={{ fontFamily: "var(--font-family)" }}>
      <div className="page-header">
        <h1>Register New Patient / Resident</h1>
        <p>Create a clinical profile record for a village resident</p>
      </div>

      <div className="content-block" style={{ marginTop: "40px", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
        {success && (
          <div className="card" style={{ padding: "16px", color: "var(--color-success)", background: "var(--color-success-bg)", marginBottom: "20px", fontWeight: "700" }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card" style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "30px" }}>
          <div className="form-field">
            <label style={{ fontWeight: "700" }}>Full Name</label>
            <input className="input" type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Ramesh Kumar" style={{ marginTop: "6px" }} />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-field">
              <label style={{ fontWeight: "700" }}>Age</label>
              <input className="input" type="number" name="age" value={formData.age} onChange={handleChange} placeholder="e.g. 45" style={{ marginTop: "6px" }} />
              {errors.age && <p className="field-error">{errors.age}</p>}
            </div>

            <div className="form-field">
              <label style={{ fontWeight: "700" }}>Gender</label>
              <select className="input" name="gender" value={formData.gender} onChange={handleChange} style={{ marginTop: "6px" }}>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div className="form-field">
              <label style={{ fontWeight: "700" }}>Village / Location</label>
              <input className="input" type="text" name="village" value={formData.village} onChange={handleChange} placeholder="e.g. Rampur" style={{ marginTop: "6px" }} />
              {errors.village && <p className="field-error">{errors.village}</p>}
            </div>

            <div className="form-field">
              <label style={{ fontWeight: "700" }}>Phone Number</label>
              <input className="input" type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. +91-9123456789" style={{ marginTop: "6px" }} />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>
          </div>

          <div className="form-field">
            <label style={{ fontWeight: "700" }}>Blood Group</label>
            <select className="input" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} style={{ marginTop: "6px" }}>
              <option>O+</option>
              <option>A+</option>
              <option>B+</option>
              <option>AB+</option>
              <option>O-</option>
              <option>A-</option>
              <option>B-</option>
              <option>AB-</option>
            </select>
          </div>

          <div className="form-field">
            <label style={{ fontWeight: "700" }}>Existing Conditions (comma-separated)</label>
            <input className="input" type="text" name="conditions" value={formData.conditions} onChange={handleChange} placeholder="e.g. Hypertension, Asthma" style={{ marginTop: "6px" }} />
          </div>

          <div className="form-field">
            <label style={{ fontWeight: "700" }}>Known Allergies (comma-separated)</label>
            <input className="input" type="text" name="allergies" value={formData.allergies} onChange={handleChange} placeholder="e.g. Penicillin, Pollen" style={{ marginTop: "6px" }} />
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Save Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterPatientPage;

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

function HealthWorkerRegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    village: "",
    healthWorkerId: "",
    preferredLanguage: "English"
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const validate = () => {
    const tempErrors = {};
    if (!formData.fullName.trim()) tempErrors.fullName = "Full Name is required.";
    
    // Phone validation
    const phoneRegex = /^\+?[0-9\s-]{10,15}$/;
    if (!formData.phone.trim()) {
      tempErrors.phone = "Phone Number is required.";
    } else if (!phoneRegex.test(formData.phone)) {
      tempErrors.phone = "Enter a valid phone number (min 10 digits).";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      tempErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = "Enter a valid email address.";
    }

    // Password validation
    if (!formData.password) {
      tempErrors.password = "Password is required.";
    } else if (formData.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters.";
    }

    // Confirm password
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match.";
    }

    if (!formData.village.trim()) tempErrors.village = "Village / Location is required.";
    if (!formData.healthWorkerId.trim()) tempErrors.healthWorkerId = "Health Worker ID is required.";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      await authService.healthWorkerRegister(formData);
      setSuccess("Account registered successfully! Redirecting...");
      setTimeout(() => {
        navigate("/health-worker/dashboard");
      }, 1500);
    } catch (err) {
      setSubmitError(err.message || "Registration failed.");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--color-bg)",
      fontFamily: "var(--font-family)",
      padding: "24px"
    }}>
      <div style={{
        maxWidth: "500px",
        width: "100%",
        background: "white",
        borderRadius: "20px",
        padding: "36px",
        boxShadow: "var(--shadow-card)",
        border: "1px solid var(--color-border)"
      }}>
        <h2 style={{ color: "var(--color-primary-dark)", margin: "0 0 4px 0", textAlign: "center" }}>Worker Registration</h2>
        <p className="text-muted" style={{ margin: "0 0 24px 0", textAlign: "center" }}>Create a local clinical dashboard profile</p>

        {submitError && (
          <div className="error-state card" style={{ padding: "12px", color: "var(--color-danger)", background: "var(--color-danger-bg)", marginBottom: "16px", fontSize: "14px" }}>
            {submitError}
          </div>
        )}

        {success && (
          <div className="card" style={{ padding: "12px", color: "var(--color-success)", background: "var(--color-success-bg)", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-field">
            <label style={{ fontWeight: "700", fontSize: "13px" }}>Full Name</label>
            <input className="input" type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="e.g. Anita Rao" />
            {errors.fullName && <p className="field-error">{errors.fullName}</p>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-field">
              <label style={{ fontWeight: "700", fontSize: "13px" }}>Phone Number</label>
              <input className="input" type="text" name="phone" value={formData.phone} onChange={handleChange} placeholder="e.g. +91-9876543210" />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>

            <div className="form-field">
              <label style={{ fontWeight: "700", fontSize: "13px" }}>Email</label>
              <input className="input" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="e.g. anita@vh.org" />
              {errors.email && <p className="field-error">{errors.email}</p>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-field">
              <label style={{ fontWeight: "700", fontSize: "13px" }}>Password</label>
              <input className="input" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••" />
              {errors.password && <p className="field-error">{errors.password}</p>}
            </div>

            <div className="form-field">
              <label style={{ fontWeight: "700", fontSize: "13px" }}>Confirm Password</label>
              <input className="input" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="••••••" />
              {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="form-field">
              <label style={{ fontWeight: "700", fontSize: "13px" }}>Village / Location</label>
              <input className="input" type="text" name="village" value={formData.village} onChange={handleChange} placeholder="e.g. Rampur" />
              {errors.village && <p className="field-error">{errors.village}</p>}
            </div>

            <div className="form-field">
              <label style={{ fontWeight: "700", fontSize: "13px" }}>Health Worker ID</label>
              <input className="input" type="text" name="healthWorkerId" value={formData.healthWorkerId} onChange={handleChange} placeholder="e.g. HW001" />
              {errors.healthWorkerId && <p className="field-error">{errors.healthWorkerId}</p>}
            </div>
          </div>

          <div className="form-field">
            <label style={{ fontWeight: "700", fontSize: "13px" }}>Preferred Language</label>
            <select className="input" name="preferredLanguage" value={formData.preferredLanguage} onChange={handleChange}>
              <option>English</option>
              <option>Telugu</option>
              <option>Hindi</option>
              <option>Kannada</option>
            </select>
          </div>

          <button className="btn btn-primary btn-block" type="submit" style={{ padding: "14px", fontSize: "16px", borderRadius: "12px", marginTop: "12px" }}>
            Register & Continue
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
          Already have an account?{" "}
          <button
            onClick={() => navigate("/health-worker/login")}
            style={{ background: "none", border: "none", color: "var(--color-primary)", fontWeight: "700", cursor: "pointer" }}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
}

export default HealthWorkerRegisterPage;

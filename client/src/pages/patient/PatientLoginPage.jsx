import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

function PatientLoginPage() {
  const navigate = useNavigate();
  const [patientIdOrPhone, setPatientIdOrPhone] = useState("");
  const [password, setPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientIdOrPhone.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await authService.patientLogin(patientIdOrPhone, password);
      setSuccess("Login successful! Welcome to the Patient Portal...");
      setTimeout(() => {
        navigate("/patient/dashboard");
      }, 1000);
    } catch (err) {
      setError(err.message || "Invalid Patient ID or Phone.");
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
        maxWidth: "440px",
        width: "100%",
        background: "white",
        borderRadius: "20px",
        padding: "36px",
        boxShadow: "var(--shadow-card)",
        border: "1px solid var(--color-border)"
      }}>
        <h2 style={{ color: "var(--color-primary-dark)", margin: "0 0 4px 0", textAlign: "center" }}>Patient Portal</h2>
        <p className="text-muted" style={{ margin: "0 0 24px 0", textAlign: "center" }}>Access your health records and consultations</p>

        {error && (
          <div className="error-state card" style={{ padding: "12px", color: "var(--color-danger)", background: "var(--color-danger-bg)", marginBottom: "16px", fontSize: "14px" }}>
            {error}
          </div>
        )}

        {success && (
          <div className="card" style={{ padding: "12px", color: "var(--color-success)", background: "var(--color-success-bg)", marginBottom: "16px", fontSize: "14px", fontWeight: "600" }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="form-field">
            <label style={{ fontWeight: "700", fontSize: "13px" }}>Patient ID or Phone Number</label>
            <input
              className="input"
              type="text"
              value={patientIdOrPhone}
              onChange={(e) => { setPatientIdOrPhone(e.target.value); setError(""); }}
              placeholder="e.g. P1001 or +91-9123456701"
            />
            <small style={{ color: "var(--color-text-muted)" }}>
              Tip: Use P1001, P1002, or P1003
            </small>
          </div>

          <div className="form-field">
            <label style={{ fontWeight: "700", fontSize: "13px" }}>Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="Enter password..."
            />
            <small style={{ color: "var(--color-text-muted)" }}>
              Any password works for mock login
            </small>
          </div>

          <button className="btn btn-primary btn-block" type="submit" style={{ padding: "14px", fontSize: "16px", borderRadius: "12px", marginTop: "8px" }}>
            Login to Portal
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-primary)",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px"
            }}
          >
            ← Back to Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}

export default PatientLoginPage;

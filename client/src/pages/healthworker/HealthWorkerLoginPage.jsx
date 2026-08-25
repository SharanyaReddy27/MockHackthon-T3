import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

function HealthWorkerLoginPage() {
  const navigate = useNavigate();
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!emailOrPhone.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await authService.healthWorkerLogin(emailOrPhone, password);
      setSuccess("Login successful! Redirecting...");
      setTimeout(() => {
        navigate("/health-worker/dashboard");
      }, 1000);
    } catch (err) {
      setError(err.message || "Invalid credentials.");
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
        <h2 style={{ color: "var(--color-primary-dark)", margin: "0 0 4px 0", textAlign: "center" }}>Worker Login</h2>
        <p className="text-muted" style={{ margin: "0 0 24px 0", textAlign: "center" }}>Enter your credentials to access the system</p>

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
            <label style={{ fontWeight: "700", fontSize: "13px" }}>Email or Phone Number</label>
            <input
              className="input"
              type="text"
              value={emailOrPhone}
              onChange={(e) => { setEmailOrPhone(e.target.value); setError(""); }}
              placeholder="e.g. anita@vh.org or +91-9876543210"
            />
          </div>

          <div className="form-field">
            <label style={{ fontWeight: "700", fontSize: "13px" }}>Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(""); }}
              placeholder="••••••"
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <label className="checkbox-row" style={{ fontSize: "13px" }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              Remember Me
            </label>
          </div>

          <button className="btn btn-primary btn-block" type="submit" style={{ padding: "14px", fontSize: "16px", borderRadius: "12px", marginTop: "8px" }}>
            Login
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "20px", fontSize: "14px" }}>
          Don't have an account?{" "}
          <button
            onClick={() => navigate("/health-worker/register")}
            style={{ background: "none", border: "none", color: "var(--color-primary)", fontWeight: "700", cursor: "pointer" }}
          >
            Register here
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "12px" }}>
          <button
            onClick={() => navigate("/health-worker")}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-text-muted)",
              cursor: "pointer",
              fontSize: "13px"
            }}
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default HealthWorkerLoginPage;

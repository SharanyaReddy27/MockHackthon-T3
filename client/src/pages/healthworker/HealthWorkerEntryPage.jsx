import { useNavigate } from "react-router-dom";

function HealthWorkerEntryPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
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
        border: "1px solid var(--color-border)",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>🧑‍⚕️</div>
        <h2 style={{ color: "var(--color-primary-dark)", margin: "0 0 8px 0" }}>Health Care Worker Portal</h2>
        <p className="text-muted" style={{ margin: "0 0 32px 0" }}>
          Access frontline clinical records, patient discovery, consultation management, and referrals.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/health-worker/login")}
            style={{ padding: "14px", fontSize: "16px", borderRadius: "12px" }}
          >
            Sign In / Login
          </button>
          
          <button
            className="btn btn-outline"
            onClick={() => navigate("/health-worker/register")}
            style={{ padding: "14px", fontSize: "16px", borderRadius: "12px" }}
          >
            Create New Account
          </button>
        </div>

        <button
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            color: "var(--color-primary)",
            marginTop: "24px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px"
          }}
        >
          ← Back to Main Menu
        </button>
      </div>
    </div>
  );
}

export default HealthWorkerEntryPage;

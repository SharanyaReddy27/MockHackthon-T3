import { useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page" style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0F5C5C 0%, #1E8A7E 100%)",
      color: "white",
      padding: "24px",
      textAlign: "center",
      fontFamily: "var(--font-family)"
    }}>
      <div style={{
        maxWidth: "600px",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        borderRadius: "24px",
        padding: "48px 32px",
        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.2)",
        border: "1px solid rgba(255, 255, 255, 0.2)"
      }}>
        {/* Logo/Icon */}
        <div style={{
          fontSize: "64px",
          marginBottom: "16px",
          display: "inline-block",
          animation: "pulse 2s infinite"
        }}>
          🏥
        </div>
        
        <h1 style={{
          fontSize: "36px",
          fontWeight: "800",
          margin: "0 0 12px 0",
          letterSpacing: "-0.5px",
          lineHeight: "1.2"
        }}>
          Village Health Access System
        </h1>
        
        <p style={{
          fontSize: "18px",
          opacity: "0.9",
          margin: "0 0 40px 0",
          fontWeight: "400"
        }}>
          Digital healthcare access for rural and village communities.
        </p>

        <h3 style={{
          fontSize: "16px",
          fontWeight: "600",
          margin: "0 0 24px 0",
          textTransform: "uppercase",
          letterSpacing: "1px",
          opacity: "0.8"
        }}>
          Choose how you want to continue
        </h3>

        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
          <button
            onClick={() => navigate("/health-worker")}
            style={{
              padding: "16px 24px",
              fontSize: "18px",
              fontWeight: "700",
              color: "#0F5C5C",
              backgroundColor: "white",
              border: "none",
              borderRadius: "16px",
              cursor: "pointer",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(0, 0, 0, 0.25)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.15)";
            }}
          >
            🧑‍⚕️ Health Care Worker
          </button>

          <button
            onClick={() => navigate("/patient/login")}
            style={{
              padding: "16px 24px",
              fontSize: "18px",
              fontWeight: "700",
              color: "white",
              backgroundColor: "transparent",
              border: "2px solid white",
              borderRadius: "16px",
              cursor: "pointer",
              transition: "transform 0.2s ease, background-color 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            👤 Patient / Resident
          </button>
        </div>
      </div>
      
      <div style={{
        marginTop: "48px",
        fontSize: "13px",
        opacity: "0.6"
      }}>
        Providing care connection to every village household.
      </div>
    </div>
  );
}

export default LandingPage;

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";

function RiskAssessmentPage() {
  const { patientId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [priority] = useState("MODERATE");

  const patient = location.state?.patient || {
    id: patientId,
    name: "Patient",
    age: "--",
    gender: "--",
  };

  const priorityContent = {
    LOW: {
      label: "LOW PRIORITY",
      className: "risk-low",
      description:
        "Basic care and scheduled follow-up. Patient can be monitored locally.",
      action: "Continue local monitoring and follow-up.",
      button: "Schedule Follow-up",
    },

    MODERATE: {
      label: "MODERATE PRIORITY",
      className: "risk-moderate",
      description:
        "The patient should be referred to an appropriate nearby PHC or clinic.",
      action:
        "Recommend referral to a suitable nearby healthcare facility.",
      button: "Continue to Referral",
    },

    HIGH: {
      label: "HIGH PRIORITY",
      className: "risk-high",
      description:
        "Prioritized emergency referral is recommended.",
      action:
        "Identify the nearest suitable emergency healthcare facility.",
      button: "Find Emergency Facility",
    },
  };

  const current = priorityContent[priority];

  const handleAction = () => {
    if (priority === "LOW") {
      navigate(`/consultation/${patient.id}`);
      return;
    }

    // Later this will connect to F3 referral flow.
    console.log("Referral action:", {
      patientId: patient.id,
      priority,
    });
  };

  return (
    <div className="risk-page">

      <header className="medical-header">
        <div className="header-content">

          <button
            className="header-back-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            ←
          </button>

          <div>
            <p className="header-label">
              Village Health Access System
            </p>

            <h1>Case Assessment</h1>

            <p className="header-subtitle">
              Clinical decision-support result
            </p>
          </div>

        </div>
      </header>

      <main className="risk-container">

        <section className="risk-patient-card">

          <div>
            <p className="section-eyebrow">
              PATIENT
            </p>

            <h2>{patient.name}</h2>

            <p>
              {patient.id} · {patient.age} years ·{" "}
              {patient.gender}
            </p>
          </div>

        </section>

        <section className={`risk-card ${current.className}`}>

          <div className="risk-icon">
            {priority === "HIGH" ? "!" : "✓"}
          </div>

          <p className="section-eyebrow">
            ASSESSMENT RESULT
          </p>

          <h2>{current.label}</h2>

          <p className="risk-description">
            {current.description}
          </p>

          <div className="recommended-action">

            <span>
              Recommended Action
            </span>

            <strong>
              {current.action}
            </strong>

          </div>

          <button
            className="primary-button"
            onClick={handleAction}
          >
            {current.button}
          </button>

        </section>

        <section className="decision-support-note">

          <strong>
            Decision-support notice
          </strong>

          <p>
            This assessment is based on predefined decision-support
            rules and available consultation data. It is not an
            autonomous medical diagnosis.
          </p>

        </section>

      </main>
    </div>
  );
}

export default RiskAssessmentPage;
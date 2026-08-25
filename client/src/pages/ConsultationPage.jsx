import { useParams } from "react-router-dom";
import ConsultationForm from "../components/consultation/ConsultationForm";

const mockPatient = {
  id: "P1024",
  name: "Ravi Kumar",
  age: 45,
  gender: "Male",
  village: "Green Valley",
  bloodGroup: "B+",
  conditions: ["Hypertension"],
  allergies: ["Penicillin"],
};

function ConsultationPage() {
  const { patientId } = useParams();

  const patient = {
    ...mockPatient,
    id: patientId || mockPatient.id,
  };

  return (
    <div className="consultation-page">
      <header className="medical-header">
        <div className="header-content">
          <button
            className="header-back-button"
            onClick={() => window.history.back()}
            aria-label="Go back"
          >
            ←
          </button>

          <div>
            <p className="header-label">Village Health Access System</p>
            <h1>Consultation</h1>
            <p className="header-subtitle">
              Record the patient's current health consultation
            </p>
          </div>
        </div>
      </header>

      <main className="consultation-container">

        {/* Patient Summary */}
        <section className="patient-summary-card">
          <div className="section-heading-row">
            <div>
              <p className="section-eyebrow">PATIENT</p>
              <h2>Patient Information</h2>
            </div>

            <span className="patient-id-badge">
              {patient.id}
            </span>
          </div>

          <div className="patient-summary-content">
            <div className="patient-avatar">
              {patient.name.charAt(0)}
            </div>

            <div className="patient-main-info">
              <h3>{patient.name}</h3>

              <div className="patient-meta">
                <span>{patient.age} years</span>
                <span>•</span>
                <span>{patient.gender}</span>
                <span>•</span>
                <span>{patient.village}</span>
              </div>
            </div>
          </div>

          <div className="patient-details-grid">
            <div className="patient-detail">
              <span>Blood Group</span>
              <strong>{patient.bloodGroup}</strong>
            </div>

            <div className="patient-detail">
              <span>Existing Conditions</span>
              <strong>
                {patient.conditions.join(", ")}
              </strong>
            </div>

            <div className="patient-detail">
              <span>Allergies</span>
              <strong>
                {patient.allergies.join(", ")}
              </strong>
            </div>
          </div>
        </section>

        <ConsultationForm patient={patient} />
      </main>
    </div>
  );
}

export default ConsultationPage;
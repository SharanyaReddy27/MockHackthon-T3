import { useState } from "react";
import { useNavigate } from "react-router-dom";

const commonSymptoms = [
  "Fever",
  "Cough",
  "Headache",
  "Fatigue",
  "Vomiting",
  "Diarrhea",
  "Body Pain",
  "Breathing Difficulty",
];

function ConsultationForm({ patient }) {
  const navigate = useNavigate();

  const [symptoms, setSymptoms] = useState([]);

  const [formData, setFormData] = useState({
    temperature: "",
    bloodPressure: "",
    heartRate: "",
    spo2: "",
    respiratoryRate: "",
    weight: "",
    observations: "",
    medication: "",
    notes: "",
    followUpRequired: false,
    followUpDate: "",
  });

  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const toggleSymptom = (symptom) => {
    setSymptoms((current) => {
      if (current.includes(symptom)) {
        return current.filter((item) => item !== symptom);
      }

      return [...current, symptom];
    });
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (symptoms.length === 0) {
      newErrors.symptoms = "Please select at least one symptom.";
    }

    if (
      formData.temperature &&
      Number.isNaN(Number(formData.temperature))
    ) {
      newErrors.temperature = "Enter a valid temperature.";
    }

    if (
      formData.heartRate &&
      Number.isNaN(Number(formData.heartRate))
    ) {
      newErrors.heartRate = "Enter a valid heart rate.";
    }

    if (
      formData.spo2 &&
      Number.isNaN(Number(formData.spo2))
    ) {
      newErrors.spo2 = "Enter a valid SpO₂ value.";
    }

    if (
      formData.followUpRequired &&
      !formData.followUpDate
    ) {
      newErrors.followUpDate =
        "Please select a follow-up date.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const consultationData = {
      patientId: patient.id,
      symptoms,
      vitals: {
        temperature: formData.temperature,
        bloodPressure: formData.bloodPressure,
        heartRate: formData.heartRate,
        spo2: formData.spo2,
        respiratoryRate: formData.respiratoryRate,
        weight: formData.weight,
      },
      observations: formData.observations,
      medication: formData.medication,
      notes: formData.notes,
      followUp: {
        required: formData.followUpRequired,
        date: formData.followUpDate,
      },
    };

    console.log(
      "Consultation data:",
      consultationData
    );

    setSubmitted(true);

    setTimeout(() => {
      navigate(`/risk-assessment/${patient.id}`, {
        state: {
          patient,
          consultation: consultationData,
        },
      });
    }, 600);
  };

  return (
    <form
      className="consultation-form"
      onSubmit={handleSubmit}
    >

      {/* Symptoms */}
      <section className="form-card">
        <div className="form-card-header">
          <div className="form-section-icon">+</div>

          <div>
            <p className="section-eyebrow">STEP 01</p>
            <h2>Symptoms</h2>
            <p>
              Select the symptoms reported by the patient.
            </p>
          </div>
        </div>

        <div className="symptom-grid">
          {commonSymptoms.map((symptom) => {
            const selected = symptoms.includes(symptom);

            return (
              <button
                type="button"
                key={symptom}
                className={`symptom-chip ${
                  selected ? "selected" : ""
                }`}
                onClick={() => toggleSymptom(symptom)}
              >
                {selected && <span>✓</span>}
                {symptom}
              </button>
            );
          })}
        </div>

        {errors.symptoms && (
          <p className="field-error">
            {errors.symptoms}
          </p>
        )}

        {symptoms.length > 0 && (
          <div className="selected-symptoms">
            <span>Selected:</span>

            {symptoms.map((symptom) => (
              <span
                className="selected-symptom"
                key={symptom}
              >
                {symptom}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Vitals */}
      <section className="form-card">
        <div className="form-card-header">
          <div className="form-section-icon">♥</div>

          <div>
            <p className="section-eyebrow">STEP 02</p>
            <h2>Vitals</h2>
            <p>
              Record the patient's current vital measurements.
            </p>
          </div>
        </div>

        <div className="field-grid">

          <div className="form-field">
            <label htmlFor="temperature">
              Temperature
            </label>

            <div className="input-with-unit">
              <input
                id="temperature"
                name="temperature"
                type="number"
                step="0.1"
                placeholder="38.5"
                value={formData.temperature}
                onChange={handleChange}
              />
              <span>°C</span>
            </div>

            {errors.temperature && (
              <p className="field-error">
                {errors.temperature}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="bloodPressure">
              Blood Pressure
            </label>

            <div className="input-with-unit">
              <input
                id="bloodPressure"
                name="bloodPressure"
                type="text"
                placeholder="120/80"
                value={formData.bloodPressure}
                onChange={handleChange}
              />
              <span>mmHg</span>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="heartRate">
              Heart Rate
            </label>

            <div className="input-with-unit">
              <input
                id="heartRate"
                name="heartRate"
                type="number"
                placeholder="80"
                value={formData.heartRate}
                onChange={handleChange}
              />
              <span>bpm</span>
            </div>

            {errors.heartRate && (
              <p className="field-error">
                {errors.heartRate}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="spo2">
              SpO₂
            </label>

            <div className="input-with-unit">
              <input
                id="spo2"
                name="spo2"
                type="number"
                placeholder="98"
                value={formData.spo2}
                onChange={handleChange}
              />
              <span>%</span>
            </div>

            {errors.spo2 && (
              <p className="field-error">
                {errors.spo2}
              </p>
            )}
          </div>

          <div className="form-field">
            <label htmlFor="respiratoryRate">
              Respiratory Rate
            </label>

            <div className="input-with-unit">
              <input
                id="respiratoryRate"
                name="respiratoryRate"
                type="number"
                placeholder="18"
                value={formData.respiratoryRate}
                onChange={handleChange}
              />
              <span>/min</span>
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="weight">
              Weight
            </label>

            <div className="input-with-unit">
              <input
                id="weight"
                name="weight"
                type="number"
                step="0.1"
                placeholder="65"
                value={formData.weight}
                onChange={handleChange}
              />
              <span>kg</span>
            </div>
          </div>

        </div>
      </section>

      {/* Observations */}
      <section className="form-card">
        <div className="form-card-header">
          <div className="form-section-icon">i</div>

          <div>
            <p className="section-eyebrow">STEP 03</p>
            <h2>Observations</h2>
            <p>
              Record relevant observations from the consultation.
            </p>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="observations">
            Clinical observations
          </label>

          <textarea
            id="observations"
            name="observations"
            rows="5"
            placeholder="Enter observations..."
            value={formData.observations}
            onChange={handleChange}
          />
        </div>
      </section>

      {/* Medication */}
      <section className="form-card">
        <div className="form-card-header">
          <div className="form-section-icon">Rx</div>

          <div>
            <p className="section-eyebrow">STEP 04</p>
            <h2>Medication</h2>
            <p>
              Record medication guidance or prescribed medication.
            </p>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="medication">
            Medication details
          </label>

          <textarea
            id="medication"
            name="medication"
            rows="4"
            placeholder="Medicine, dosage, frequency and duration..."
            value={formData.medication}
            onChange={handleChange}
          />
        </div>
      </section>

      {/* Notes */}
      <section className="form-card">
        <div className="form-card-header">
          <div className="form-section-icon">N</div>

          <div>
            <p className="section-eyebrow">STEP 05</p>
            <h2>Notes</h2>
            <p>
              Add any additional consultation notes.
            </p>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="notes">
            Additional notes
          </label>

          <textarea
            id="notes"
            name="notes"
            rows="4"
            placeholder="Enter additional notes..."
            value={formData.notes}
            onChange={handleChange}
          />
        </div>
      </section>

      {/* Follow-up */}
      <section className="form-card">
        <div className="form-card-header">
          <div className="form-section-icon">↻</div>

          <div>
            <p className="section-eyebrow">STEP 06</p>
            <h2>Follow-up</h2>
            <p>
              Schedule a follow-up when required.
            </p>
          </div>
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            name="followUpRequired"
            checked={formData.followUpRequired}
            onChange={handleChange}
          />

          <span>
            Follow-up required
          </span>
        </label>

        {formData.followUpRequired && (
          <div className="follow-up-fields">
            <div className="form-field">
              <label htmlFor="followUpDate">
                Follow-up date
              </label>

              <input
                id="followUpDate"
                name="followUpDate"
                type="date"
                value={formData.followUpDate}
                onChange={handleChange}
              />

              {errors.followUpDate && (
                <p className="field-error">
                  {errors.followUpDate}
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Submit */}
      <div className="form-submit-section">

        {submitted && (
          <div className="success-message">
            Consultation recorded successfully. Preparing assessment...
          </div>
        )}

        <button
          type="submit"
          className="primary-button"
          disabled={submitted}
        >
          {submitted
            ? "Processing..."
            : "Submit Consultation"}
        </button>

        <p className="submit-note">
          The consultation will be assessed using the configured
          clinical decision-support rules.
        </p>
      </div>

    </form>
  );
}

export default ConsultationForm;
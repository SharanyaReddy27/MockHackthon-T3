import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  createConsultation,
  assessRisk,
} from "../../services/consultationService";

const commonSymptoms = [
  {
    value: "fever",
    label: "Fever",
  },
  {
    value: "cough",
    label: "Cough",
  },
  {
    value: "headache",
    label: "Headache",
  },
  {
    value: "fatigue",
    label: "Fatigue",
  },
  {
    value: "vomiting",
    label: "Vomiting",
  },
  {
    value: "diarrhea",
    label: "Diarrhea",
  },
  {
    value: "body_pain",
    label: "Body Pain",
  },
  {
    value: "severe_breathing_difficulty",
    label: "Severe Breathing Difficulty",
  },
];

function ConsultationForm({ patient }) {
  const navigate = useNavigate();

  // Selected symptoms
  const [symptoms, setSymptoms] = useState([]);

  // Consultation form data
  const [formData, setFormData] = useState({
    temperature: "",
    bloodPressure: "",
    heartRate: "",
    spo2: "",
    observations: "",
    medication: "",
    notes: "",
    followUpRequired: false,
    followUpDate: "",
  });

  // UI states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // --------------------------------------------------
  // HANDLE SYMPTOM SELECTION
  // --------------------------------------------------

  const toggleSymptom = (symptomValue) => {
    setSymptoms((current) => {
      if (current.includes(symptomValue)) {
        return current.filter(
          (item) => item !== symptomValue
        );
      }

      return [...current, symptomValue];
    });

    setErrors((current) => ({
      ...current,
      symptoms: "",
    }));
  };

  // --------------------------------------------------
  // HANDLE INPUT CHANGES
  // --------------------------------------------------

  const handleChange = (event) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setFormData((current) => ({
      ...current,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));

    setSubmitError("");
  };

  // --------------------------------------------------
  // FORM VALIDATION
  // --------------------------------------------------

  const validateForm = () => {
    const newErrors = {};

    // Symptoms required
    if (symptoms.length === 0) {
      newErrors.symptoms =
        "Please select at least one symptom.";
    }

    // Temperature validation
    if (formData.temperature) {
      const temperature = Number(
        formData.temperature
      );

      if (Number.isNaN(temperature)) {
        newErrors.temperature =
          "Enter a valid temperature.";
      }
    }

    // Heart rate validation
    if (formData.heartRate) {
      const heartRate = Number(
        formData.heartRate
      );

      if (Number.isNaN(heartRate)) {
        newErrors.heartRate =
          "Enter a valid heart rate.";
      }
    }

    // SpO2 validation
    if (formData.spo2) {
      const spo2 = Number(
        formData.spo2
      );

      if (Number.isNaN(spo2)) {
        newErrors.spo2 =
          "Enter a valid SpO₂ value.";
      }
    }

    // Follow-up date validation
    if (
      formData.followUpRequired &&
      !formData.followUpDate
    ) {
      newErrors.followUpDate =
        "Please select a follow-up date.";
    }

    setErrors(newErrors);

    return (
      Object.keys(newErrors).length === 0
    );
  };

  // --------------------------------------------------
  // SUBMIT CONSULTATION
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validate form before API call
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitted(false);

    // ------------------------------------------------
    // BUILD CONSULTATION REQUEST
    // This exactly follows Backend 2 contract.
    // ------------------------------------------------

    const consultationData = {
      patientId: patient.id,

      symptoms: symptoms,

      vitals: {
        temperature: formData.temperature
          ? Number(formData.temperature)
          : undefined,

        bloodPressure:
          formData.bloodPressure || undefined,

        heartRate: formData.heartRate
          ? Number(formData.heartRate)
          : undefined,

        spo2: formData.spo2
          ? Number(formData.spo2)
          : undefined,
      },

      observations:
        formData.observations || "",

      // Backend expects medication as an array
      // User enters one medication per line.
      medication: formData.medication
        ? formData.medication
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean)
        : [],

      notes: formData.notes || "",

      // Backend expects followUpDate,
      // not followUpRequired.
      followUpDate:
        formData.followUpRequired
          ? formData.followUpDate
          : null,
    };

    console.log(
      "Creating consultation:",
      consultationData
    );

    try {
      // ==============================================
      // 1. CREATE CONSULTATION
      // POST /api/consultations
      // ==============================================

      const consultationResponse =
        await createConsultation(
          consultationData
        );

      console.log(
        "Consultation API response:",
        consultationResponse
      );

      // Backend returned an unsuccessful response
      if (!consultationResponse?.success) {
        throw new Error(
          consultationResponse?.message ||
            "Unable to create consultation."
        );
      }

      const consultation =
        consultationResponse.consultation;

      // Safety check
      if (!consultation) {
        throw new Error(
          "Consultation was created but no consultation data was returned."
        );
      }

      console.log(
        "Created consultation:",
        consultation
      );

      // ==============================================
      // 2. BUILD RISK ASSESSMENT REQUEST
      // ==============================================

      const riskData = {
        temperature:
          consultation.vitals?.temperature ??
          null,

        heartRate:
          consultation.vitals?.heartRate ??
          null,

        spo2:
          consultation.vitals?.spo2 ??
          null,

        symptoms:
          consultation.symptoms || [],
      };

      console.log(
        "Risk assessment request:",
        riskData
      );

      // ==============================================
      // 3. RISK ASSESSMENT
      // POST /api/risk-assessment
      // ==============================================

      const riskResponse =
        await assessRisk(riskData);

      console.log(
        "Risk assessment response:",
        riskResponse
      );

      // Backend returned an unsuccessful response
      if (!riskResponse?.success) {
        throw new Error(
          riskResponse?.message ||
            "Unable to assess the patient's risk."
        );
      }

      const assessment =
        riskResponse.assessment;

      // Safety check
      if (!assessment) {
        throw new Error(
          "Risk assessment completed but no assessment result was returned."
        );
      }

      // ==============================================
      // 4. SUCCESS
      // ==============================================

      setSubmitted(true);

      // Navigate to Risk Assessment page
      navigate(
        `/risk-assessment/${consultation.id}`,
        {
          state: {
            patient,
            consultation,
            assessment,
          },
        }
      );
    } catch (error) {
      console.error(
        "Consultation submission failed:",
        error
      );

      // Backend error format:
      //
      // {
      //   "success": false,
      //   "message": "Consultation not found"
      // }

      const message =
        error.response?.data?.message ||
        error.message ||
        "Unable to save consultation. Please try again.";

      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <form
      className="consultation-form"
      onSubmit={handleSubmit}
    >
      {/* ============================================
          STEP 01 — SYMPTOMS
          ============================================ */}

      <section className="form-card">
        <div className="form-card-header">
          <div className="form-section-icon">
            +
          </div>

          <div>
            <p className="section-eyebrow">
              STEP 01
            </p>

            <h2>Symptoms</h2>

            <p>
              Select the symptoms reported by
              the patient.
            </p>
          </div>
        </div>

        <div className="symptom-grid">
          {commonSymptoms.map((symptom) => {
            const selected =
              symptoms.includes(
                symptom.value
              );

            return (
              <button
                type="button"
                key={symptom.value}
                className={`symptom-chip ${
                  selected
                    ? "selected"
                    : ""
                }`}
                onClick={() =>
                  toggleSymptom(
                    symptom.value
                  )
                }
              >
                {selected && (
                  <span>✓</span>
                )}

                {symptom.label}
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

            {symptoms.map(
              (symptomValue) => {
                const symptom =
                  commonSymptoms.find(
                    (item) =>
                      item.value ===
                      symptomValue
                  );

                return (
                  <span
                    className="selected-symptom"
                    key={symptomValue}
                  >
                    {symptom?.label ||
                      symptomValue}
                  </span>
                );
              }
            )}
          </div>
        )}
      </section>

      {/* ============================================
          STEP 02 — VITALS
          ============================================ */}

      <section className="form-card">
        <div className="form-card-header">
          <div className="form-section-icon">
            ♥
          </div>

          <div>
            <p className="section-eyebrow">
              STEP 02
            </p>

            <h2>Vitals</h2>

            <p>
              Record the patient's current
              vital measurements.
            </p>
          </div>
        </div>

        <div className="field-grid">
          {/* Temperature */}

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
                value={
                  formData.temperature
                }
                onChange={
                  handleChange
                }
              />

              <span>°C</span>
            </div>

            {errors.temperature && (
              <p className="field-error">
                {errors.temperature}
              </p>
            )}
          </div>

          {/* Blood Pressure */}

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
                value={
                  formData.bloodPressure
                }
                onChange={
                  handleChange
                }
              />

              <span>mmHg</span>
            </div>
          </div>

          {/* Heart Rate */}

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
                value={
                  formData.heartRate
                }
                onChange={
                  handleChange
                }
              />

              <span>bpm</span>
            </div>

            {errors.heartRate && (
              <p className="field-error">
                {errors.heartRate}
              </p>
            )}
          </div>

          {/* SpO2 */}

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
                min="0"
                max="100"
                value={formData.spo2}
                onChange={
                  handleChange
                }
              />

              <span>%</span>
            </div>

            {errors.spo2 && (
              <p className="field-error">
                {errors.spo2}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ============================================
          STEP 03 — OBSERVATIONS
          ============================================ */}

      <section className="form-card">
        <div className="form-card-header">
          <div className="form-section-icon">
            i
          </div>

          <div>
            <p className="section-eyebrow">
              STEP 03
            </p>

            <h2>Observations</h2>

            <p>
              Record relevant observations
              from the consultation.
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
            value={
              formData.observations
            }
            onChange={handleChange}
          />
        </div>
      </section>

      {/* ============================================
          STEP 04 — MEDICATION
          ============================================ */}

      <section className="form-card">
        <div className="form-card-header">
          <div className="form-section-icon">
            Rx
          </div>

          <div>
            <p className="section-eyebrow">
              STEP 04
            </p>

            <h2>Medication</h2>

            <p>
              Enter one medication per line.
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
            placeholder={`Example:
Paracetamol 500mg twice daily
ORS after loose stools`}
            value={
              formData.medication
            }
            onChange={handleChange}
          />

          <small
            style={{
              color:
                "var(--text-secondary)",
              fontSize: "12px",
            }}
          >
            Enter each medication on a
            separate line.
          </small>
        </div>
      </section>

      {/* ============================================
          STEP 05 — NOTES
          ============================================ */}

      <section className="form-card">
        <div className="form-card-header">
          <div className="form-section-icon">
            N
          </div>

          <div>
            <p className="section-eyebrow">
              STEP 05
            </p>

            <h2>Notes</h2>

            <p>
              Add any additional consultation
              notes.
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

      {/* ============================================
          STEP 06 — FOLLOW-UP
          ============================================ */}

      <section className="form-card">
        <div className="form-card-header">
          <div className="form-section-icon">
            ↻
          </div>

          <div>
            <p className="section-eyebrow">
              STEP 06
            </p>

            <h2>Follow-up</h2>

            <p>
              Schedule a follow-up when
              required.
            </p>
          </div>
        </div>

        <label className="checkbox-row">
          <input
            type="checkbox"
            name="followUpRequired"
            checked={
              formData.followUpRequired
            }
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
                value={
                  formData.followUpDate
                }
                onChange={handleChange}
              />

              {errors.followUpDate && (
                <p className="field-error">
                  {
                    errors.followUpDate
                  }
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* ============================================
          SUBMIT SECTION
          ============================================ */}

      <div className="form-submit-section">

        {/* Backend/API error */}

        {submitError && (
          <div className="error-message">
            {submitError}
          </div>
        )}

        {/* Success message */}

        {submitted && (
          <div className="success-message">
            Consultation recorded
            successfully.
          </div>
        )}

        {/* Submit button */}

        <button
          type="submit"
          className="primary-button"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving consultation..."
            : "Submit Consultation"}
        </button>

        <p className="submit-note">
          The consultation will be assessed
          using the configured clinical
          decision-support rules.
        </p>
      </div>
    </form>
  );
}

export default ConsultationForm;
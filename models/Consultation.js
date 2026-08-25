const mongoose = require('mongoose');

/**
 * Integration Model: Consultation (Owned by Backend 2 - Clinical & Urgency Assessment)
 * Minimal representation for relationship integrity, priority ingestion, and symptom trend aggregation
 */
const ConsultationSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true
    },
    healthWorkerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    symptoms: {
      type: [String],
      default: []
    },
    observedConditions: {
      type: [String],
      default: []
    },
    urgencyPriority: {
      type: String,
      enum: ['LOW', 'MODERATE', 'HIGH'],
      default: 'LOW'
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      }
    }
  }
);

const Consultation = mongoose.models.Consultation || mongoose.model('Consultation', ConsultationSchema);

module.exports = Consultation;

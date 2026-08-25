const mongoose = require('mongoose');

/**
 * Integration Model: Patient (Owned by Backend 1 - Patient Registration)
 * Minimal representation for relationship integrity, validation and village-level analytics
 */
const PatientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    age: {
      type: Number
    },
    gender: {
      type: String,
      enum: ['MALE', 'FEMALE', 'OTHER']
    },
    village: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      default: 'Telangana',
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    registeredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    isActive: {
      type: Boolean,
      default: true
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

PatientSchema.index({ village: 1 });
PatientSchema.index({ district: 1 });

const Patient = mongoose.models.Patient || mongoose.model('Patient', PatientSchema);

module.exports = Patient;

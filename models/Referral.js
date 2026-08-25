const mongoose = require('mongoose');
const {
  ALLOWED_PRIORITIES,
  ALLOWED_STATUSES,
  REFERRAL_STATUS
} = require('../constants/referralEnums');

const ReferralSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient ID is required']
    },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation'
    },
    healthcareCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HealthcareCenter',
      required: [true, 'Healthcare center ID is required']
    },
    priority: {
      type: String,
      enum: {
        values: ALLOWED_PRIORITIES,
        message: '{VALUE} is not a valid priority. Must be LOW, MODERATE, or HIGH'
      },
      required: [true, 'Referral priority is required']
    },
    reason: {
      type: String,
      required: [true, 'Referral reason is required'],
      trim: true
    },
    clinicalSummary: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_STATUSES,
        message: '{VALUE} is not a valid referral status'
      },
      default: REFERRAL_STATUS.CREATED
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: {
      type: String,
      trim: true
    },
    timestamps: {
      created: {
        type: Date,
        default: Date.now
      },
      sent: {
        type: Date
      },
      accepted: {
        type: Date
      },
      arrived: {
        type: Date
      },
      completed: {
        type: Date
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

ReferralSchema.index({ patientId: 1 });
ReferralSchema.index({ healthcareCenterId: 1 });
ReferralSchema.index({ status: 1 });
ReferralSchema.index({ priority: 1 });
ReferralSchema.index({ 'timestamps.created': -1 });

const Referral = mongoose.model('Referral', ReferralSchema);

module.exports = Referral;

const mongoose = require('mongoose');
const {
  ALLOWED_FOLLOWUP_TYPES,
  ALLOWED_PERSISTED_FOLLOWUP_STATUSES,
  FOLLOWUP_STATUS
} = require('../constants/followUpEnums');

const FollowUpSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient ID is required']
    },
    referralId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Referral'
    },
    consultationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Consultation'
    },
    type: {
      type: String,
      enum: {
        values: ALLOWED_FOLLOWUP_TYPES,
        message: '{VALUE} is not a supported follow-up type'
      },
      required: [true, 'Follow-up type is required']
    },
    scheduledDate: {
      type: Date,
      required: [true, 'Scheduled date is required']
    },
    notes: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: {
        values: ALLOWED_PERSISTED_FOLLOWUP_STATUSES,
        message: '{VALUE} is not a valid follow-up status'
      },
      default: FOLLOWUP_STATUS.PENDING
    },
    completedAt: {
      type: Date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret.__v;
        // Dynamically compute effective status if overdue
        if (ret.status === FOLLOWUP_STATUS.PENDING && ret.scheduledDate && new Date(ret.scheduledDate) < new Date()) {
          ret.status = FOLLOWUP_STATUS.OVERDUE;
          ret.isOverdue = true;
        } else {
          ret.isOverdue = false;
        }
        return ret;
      }
    },
    toObject: { virtuals: true }
  }
);

FollowUpSchema.index({ patientId: 1 });
FollowUpSchema.index({ referralId: 1 });
FollowUpSchema.index({ scheduledDate: 1 });
FollowUpSchema.index({ status: 1 });

const FollowUp = mongoose.model('FollowUp', FollowUpSchema);

module.exports = FollowUp;

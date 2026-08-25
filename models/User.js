const mongoose = require('mongoose');

/**
 * Integration Model: User (Owned by Backend 1 - Auth/Health Workers)
 * Minimal representation for relationship integrity and population
 */
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    role: {
      type: String,
      enum: ['HEALTH_WORKER', 'SUPERVISOR', 'ADMIN', 'DOCTOR'],
      default: 'HEALTH_WORKER'
    },
    assignedVillage: {
      type: String,
      trim: true
    },
    assignedDistrict: {
      type: String,
      trim: true
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

const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = User;

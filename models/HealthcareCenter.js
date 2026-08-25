const mongoose = require('mongoose');
const { ALLOWED_HEALTHCARE_TYPES, HEALTHCARE_TYPES } = require('../constants/healthcareTypes');

const HealthcareCenterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Healthcare center name is required'],
      trim: true
    },
    type: {
      type: String,
      enum: {
        values: ALLOWED_HEALTHCARE_TYPES,
        message: '{VALUE} is not a supported healthcare center type'
      },
      default: HEALTHCARE_TYPES.PHC,
      required: [true, 'Healthcare center type is required']
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true
    },
    village: {
      type: String,
      trim: true
    },
    district: {
      type: String,
      trim: true
    },
    state: {
      type: String,
      trim: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      // GeoJSON coordinates: [longitude, latitude]
      coordinates: {
        type: [Number],
        required: [true, 'Location coordinates [longitude, latitude] are required'],
        validate: {
          validator: function (val) {
            return (
              Array.isArray(val) &&
              val.length === 2 &&
              val[0] >= -180 &&
              val[0] <= 180 && // longitude
              val[1] >= -90 &&
              val[1] <= 90 // latitude
            );
          },
          message: 'Coordinates must be valid [longitude (-180 to 180), latitude (-90 to 90)]'
        }
      }
    },
    phone: {
      type: String,
      trim: true
    },
    services: {
      type: [String],
      default: []
    },
    emergencySupport: {
      type: Boolean,
      default: false
    },
    operatingHours: {
      monday: { type: String, default: '09:00 - 17:00' },
      tuesday: { type: String, default: '09:00 - 17:00' },
      wednesday: { type: String, default: '09:00 - 17:00' },
      thursday: { type: String, default: '09:00 - 17:00' },
      friday: { type: String, default: '09:00 - 17:00' },
      saturday: { type: String, default: '09:00 - 13:00' },
      sunday: { type: String, default: 'Closed' }
    },
    isActive: {
      type: Boolean,
      default: true
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

// Geospatial 2dsphere index for MongoDB geo-queries
HealthcareCenterSchema.index({ location: '2dsphere' });
HealthcareCenterSchema.index({ type: 1 });
HealthcareCenterSchema.index({ village: 1 });
HealthcareCenterSchema.index({ district: 1 });
HealthcareCenterSchema.index({ emergencySupport: 1 });
HealthcareCenterSchema.index({ isActive: 1 });

const HealthcareCenter = mongoose.model('HealthcareCenter', HealthcareCenterSchema);

module.exports = HealthcareCenter;

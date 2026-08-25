const mongoose = require("mongoose");
const crypto = require("crypto");

const addressSchema = new mongoose.Schema(
  {
    village: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    pincode: { type: String, trim: true },
  },
  { _id: false }
);

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    phone: { type: String, trim: true },
    relationship: { type: String, trim: true },
  },
  { _id: false }
);

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    address: addressSchema,
    emergencyContact: emergencyContactSchema,
    allergies: {
      type: [String],
      default: [],
    },
    existingConditions: {
      type: [String],
      default: [],
    },
    medicalHistory: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

patientSchema.pre("validate", function generatePatientId() {
  if (!this.patientId) {
    this.patientId = `PAT-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
  }
});

module.exports = mongoose.model("Patient", patientSchema);
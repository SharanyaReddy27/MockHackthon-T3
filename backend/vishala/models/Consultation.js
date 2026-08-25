const mongoose = require("mongoose");

const consultationSchema = new mongoose.Schema(
    {
        patientId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Patient"
        },

        symptoms: {
            type: [String],
            default: []
        },

        vitals: {
            temperature: Number,
            bloodPressure: String,
            heartRate: Number,
            spo2: Number
        },

        observations: {
            type: String,
            default: ""
        },

        medication: {
            type: [String],
            default: []
        },

        notes: {
            type: String,
            default: ""
        },

        followUpDate: {
            type: Date
        },

        riskPriority: {
            type: String,
            enum: ["LOW", "MODERATE", "HIGH"],
            default: "LOW"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Consultation", consultationSchema);
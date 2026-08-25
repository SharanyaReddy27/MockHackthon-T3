const Consultation = require("../models/Consultation");

// Create consultation
const createConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.create(req.body);

        res.status(201).json({
            success: true,
            message: "Consultation created successfully",
            consultation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get consultation by ID
const getConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.id);

        if (!consultation) {
            return res.status(404).json({
                success: false,
                message: "Consultation not found"
            });
        }

        res.json({
            success: true,
            consultation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Get all consultations for a patient
const getPatientConsultations = async (req, res) => {
    try {
        const consultations = await Consultation.find({
            patientId: req.params.id
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            count: consultations.length,
            consultations
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Update consultation
const updateConsultation = async (req, res) => {
    try {
        const consultation = await Consultation.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!consultation) {
            return res.status(404).json({
                success: false,
                message: "Consultation not found"
            });
        }

        res.json({
            success: true,
            message: "Consultation updated successfully",
            consultation
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createConsultation,
    getConsultation,
    getPatientConsultations,
    updateConsultation
};
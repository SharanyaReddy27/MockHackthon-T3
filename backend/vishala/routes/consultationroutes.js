const express = require("express");

const {
    createConsultation,
    getConsultation,
    getPatientConsultations,
    updateConsultation
} = require("../controllers/consultationController");

const router = express.Router();

router.post("/", createConsultation);

router.get("/patient/:id", getPatientConsultations);

router.get("/:id", getConsultation);

router.put("/:id", updateConsultation);

module.exports = router;
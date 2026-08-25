const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
	createPatient,
	deactivatePatient,
	getPatient,
	listPatients,
	updatePatient,
} = require("../controllers/patientController");

const router = express.Router();

router.post("/", authMiddleware, createPatient);
router.get("/", authMiddleware, listPatients);
router.get("/:patientId", authMiddleware, getPatient);
router.put("/:patientId", authMiddleware, updatePatient);
router.delete("/:patientId", authMiddleware, deactivatePatient);

module.exports = router;
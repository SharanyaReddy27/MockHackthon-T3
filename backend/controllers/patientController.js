const {
  createPatient,
  deactivatePatient,
  getPatientById,
  listPatients,
  updatePatient,
} = require("../services/patientService");

const toPublicPatient = (patient) => {
  const patientData = patient.toObject();
  delete patientData._id;
  delete patientData.__v;
  delete patientData.createdBy;
  return patientData;
};

const createPatientController = async (req, res) => {
  try {
    const createdBy = req.user?._id || req.user?.id;
    const patient = await createPatient(req.body, createdBy);

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: { patient: toPublicPatient(patient) },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Patient creation failed:", {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to create patient",
    });
  }
};

const listPatientsController = async (req, res) => {
  try {
    const result = await listPatients(req.query);

    res.status(200).json({
      success: true,
      message: "Patients retrieved successfully",
      data: result,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Patient retrieval failed:", {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to retrieve patients",
    });
  }
};

const getPatientController = async (req, res) => {
  try {
    const patient = await getPatientById(req.params.patientId);

    res.status(200).json({
      success: true,
      message: "Patient retrieved successfully",
      data: { patient },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Patient retrieval failed:", {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to retrieve patient",
    });
  }
};

const updatePatientController = async (req, res) => {
  try {
    const patient = await updatePatient(req.params.patientId, req.body);

    res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: { patient: toPublicPatient(patient) },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Patient update failed:", {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to update patient",
    });
  }
};

const deactivatePatientController = async (req, res) => {
  try {
    await deactivatePatient(req.params.patientId);

    res.status(200).json({
      success: true,
      message: "Patient deactivated successfully",
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Patient deactivation failed:", {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
      });
    }

    res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : "Unable to deactivate patient",
    });
  }
};

module.exports = {
  createPatient: createPatientController,
  deactivatePatient: deactivatePatientController,
  getPatient: getPatientController,
  listPatients: listPatientsController,
  updatePatient: updatePatientController,
};
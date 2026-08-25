const crypto = require("crypto");
const Patient = require("../models/Patient");

const GENDER_VALUES = ["male", "female", "other", "prefer_not_to_say"];
const INVALID_REQUEST_MESSAGE = "Invalid patient data";
const MAX_PAGE_LIMIT = 100;
const MAX_SEARCH_LENGTH = 100;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parsePagination = (pageValue, limitValue) => {
  const page = pageValue === undefined ? 1 : Number(pageValue);
  const limit = limitValue === undefined ? 20 : Number(limitValue);

  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_PAGE_LIMIT
  ) {
    const error = new Error("Invalid pagination parameters");
    error.statusCode = 400;
    throw error;
  }

  return { page, limit, skip: (page - 1) * limit };
};

const createPatient = async (patientData = {}, createdBy) => {
  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    phone,
    address,
    emergencyContact,
    allergies,
    existingConditions,
    medicalHistory,
  } = patientData;

  if (
    typeof firstName !== "string" ||
    !firstName.trim() ||
    typeof lastName !== "string" ||
    !lastName.trim() ||
    typeof phone !== "string" ||
    !phone.trim()
  ) {
    const error = new Error("First name, last name, and phone are required");
    error.statusCode = 400;
    throw error;
  }

  if (gender !== undefined && !GENDER_VALUES.includes(gender)) {
    const error = new Error(INVALID_REQUEST_MESSAGE);
    error.statusCode = 400;
    throw error;
  }

  if (dateOfBirth !== undefined) {
    const parsedDate = new Date(dateOfBirth);
    if (Number.isNaN(parsedDate.getTime())) {
      const error = new Error(INVALID_REQUEST_MESSAGE);
      error.statusCode = 400;
      throw error;
    }
  }

  if (
    (allergies !== undefined && (!Array.isArray(allergies) || allergies.some((item) => typeof item !== "string"))) ||
    (existingConditions !== undefined && (!Array.isArray(existingConditions) || existingConditions.some((item) => typeof item !== "string"))) ||
    (medicalHistory !== undefined && (!Array.isArray(medicalHistory) || medicalHistory.some((item) => typeof item !== "string")))
  ) {
    const error = new Error(INVALID_REQUEST_MESSAGE);
    error.statusCode = 400;
    throw error;
  }

  try {
    return await Patient.create({
      patientId: `PAT-${crypto.randomBytes(8).toString("hex").toUpperCase()}`,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth,
      gender,
      phone: phone.trim(),
      address,
      emergencyContact,
      allergies,
      existingConditions,
      medicalHistory,
      createdBy,
      isActive: true,
    });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateError = new Error("Unable to create patient with a unique identifier");
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      const validationError = new Error(INVALID_REQUEST_MESSAGE);
      validationError.statusCode = 400;
      throw validationError;
    }

    throw error;
  }
};

const listPatients = async ({ search, phone, page: pageValue, limit: limitValue } = {}) => {
  const { page, limit, skip } = parsePagination(pageValue, limitValue);
  const query = { isActive: true };

  if (search !== undefined) {
    if (typeof search !== "string" || !search.trim() || search.length > MAX_SEARCH_LENGTH) {
      const error = new Error("Invalid search parameter");
      error.statusCode = 400;
      throw error;
    }

    const searchPattern = new RegExp(escapeRegex(search.trim()), "i");
    query.$or = [
      { patientId: searchPattern },
      { firstName: searchPattern },
      { lastName: searchPattern },
      { phone: searchPattern },
    ];
  }

  if (phone !== undefined) {
    if (typeof phone !== "string" || !phone.trim() || phone.length > MAX_SEARCH_LENGTH) {
      const error = new Error("Invalid phone parameter");
      error.statusCode = 400;
      throw error;
    }

    query.phone = phone.trim();
  }

  const [patients, total] = await Promise.all([
    Patient.find(query)
      .select("-_id -createdBy -__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Patient.countDocuments(query),
  ]);

  return {
    patients,
    pagination: {
      page,
      limit,
      total,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    },
  };
};

const getPatientById = async (patientId) => {
  if (typeof patientId !== "string" || !patientId.trim()) {
    const error = new Error("Patient not found");
    error.statusCode = 404;
    throw error;
  }

  const patient = await Patient.findOne({
    patientId: patientId.trim(),
    isActive: true,
  })
    .select("-_id -createdBy -__v")
    .lean();

  if (!patient) {
    const error = new Error("Patient not found");
    error.statusCode = 404;
    throw error;
  }

  return patient;
};

const updatePatient = async (patientId, patientData = {}) => {
  if (typeof patientId !== "string" || !patientId.trim()) {
    const error = new Error("Patient not found");
    error.statusCode = 404;
    throw error;
  }

  const {
    firstName,
    lastName,
    dateOfBirth,
    gender,
    phone,
    address,
    emergencyContact,
    allergies,
    existingConditions,
    medicalHistory,
  } = patientData;

  if (
    typeof firstName !== "string" ||
    !firstName.trim() ||
    typeof lastName !== "string" ||
    !lastName.trim() ||
    typeof phone !== "string" ||
    !phone.trim()
  ) {
    const error = new Error("First name, last name, and phone are required");
    error.statusCode = 400;
    throw error;
  }

  if (gender !== undefined && !GENDER_VALUES.includes(gender)) {
    const error = new Error(INVALID_REQUEST_MESSAGE);
    error.statusCode = 400;
    throw error;
  }

  if (dateOfBirth !== undefined && Number.isNaN(new Date(dateOfBirth).getTime())) {
    const error = new Error(INVALID_REQUEST_MESSAGE);
    error.statusCode = 400;
    throw error;
  }

  if (
    (allergies !== undefined && (!Array.isArray(allergies) || allergies.some((item) => typeof item !== "string"))) ||
    (existingConditions !== undefined && (!Array.isArray(existingConditions) || existingConditions.some((item) => typeof item !== "string"))) ||
    (medicalHistory !== undefined && (!Array.isArray(medicalHistory) || medicalHistory.some((item) => typeof item !== "string")))
  ) {
    const error = new Error(INVALID_REQUEST_MESSAGE);
    error.statusCode = 400;
    throw error;
  }

  const patient = await Patient.findOne({
    patientId: patientId.trim(),
    isActive: true,
  });

  if (!patient) {
    const error = new Error("Patient not found");
    error.statusCode = 404;
    throw error;
  }

  patient.set({
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    dateOfBirth,
    gender,
    phone: phone.trim(),
    address,
    emergencyContact,
    allergies,
    existingConditions,
    medicalHistory,
  });

  try {
    return await patient.save();
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      const validationError = new Error(INVALID_REQUEST_MESSAGE);
      validationError.statusCode = 400;
      throw validationError;
    }

    throw error;
  }
};

const deactivatePatient = async (patientId) => {
  if (typeof patientId !== "string" || !patientId.trim()) {
    const error = new Error("Patient not found");
    error.statusCode = 404;
    throw error;
  }

  const patient = await Patient.findOne({
    patientId: patientId.trim(),
    isActive: true,
  });

  if (!patient) {
    const error = new Error("Patient not found");
    error.statusCode = 404;
    throw error;
  }

  patient.isActive = false;

  try {
    await patient.save();
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createPatient,
  deactivatePatient,
  getPatientById,
  listPatients,
  updatePatient,
};
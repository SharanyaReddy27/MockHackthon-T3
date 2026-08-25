import api from "./api";

export const createConsultation = async (data) => {
  const response = await api.post(
    "/consultations",
    data
  );

  return response.data;
};

export const assessRisk = async (data) => {
  const response = await api.post(
    "/risk-assessment",
    data
  );

  return response.data;
};

export const getConsultation = async (
  consultationId
) => {
  const response = await api.get(
    `/consultations/${consultationId}`
  );

  return response.data;
};

export const getPatientConsultations = async (
  patientId
) => {
  const response = await api.get(
    `/consultations/patient/${patientId}`
  );

  return response.data;
};

export const updateConsultation = async (
  consultationId,
  data
) => {
  const response = await api.put(
    `/consultations/${consultationId}`,
    data
  );

  return response.data;
};
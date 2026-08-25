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
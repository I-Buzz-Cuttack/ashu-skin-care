import apiClient from "../apiClient";


export const getPatients = () => apiClient.get("/patients");

export const createPatient = (data) =>
  apiClient.post("/patients", data);

export const updatePatient = (id, data) =>
  apiClient.put(`/patients/${id}`, data);

export const deletePatient = (id) =>
  apiClient.delete(`/patients/${id}`);
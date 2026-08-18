import apiClient from "../../api/apiClient";

export const login = (data) => {
  return apiClient.post("/auth/login", data);
};

export const getProfile = () => {
  return apiClient.get("/auth/profile");
};

export const logout = () => {
  return apiClient.post("/auth/logout");
};
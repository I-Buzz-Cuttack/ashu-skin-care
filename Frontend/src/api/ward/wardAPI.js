// src/services/wardAPI.js

import apiClient from "../apiClient";

// ================= GET ALL WARDS =================
export const getWards = (params = {}) =>
  apiClient.get("/wards", { params });

// ================= GET WARD BY ID =================
export const getWardById = (id) =>
  apiClient.get(`/wards/${id}`);

// ================= CREATE WARD =================
export const createWard = (data) =>
  apiClient.post("/wards", data);

// ================= UPDATE WARD =================
export const updateWard = (id, data) =>
  apiClient.put(`/wards/${id}`, data);

// ================= PATCH WARD =================
export const patchWard = (id, data) =>
  apiClient.patch(`/wards/${id}`, data);

// ================= DELETE WARD =================
export const deleteWard = (id) =>
  apiClient.delete(`/wards/${id}`);

// ================= SEARCH WARDS =================
export const searchWards = (search) =>
  apiClient.get(`/wards/search?search=${search}`);
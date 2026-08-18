import { baseApi } from "../baseApi";
import { API } from "@constants/api";

export const expiryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getExpiryDashboard: builder.query({
      query: () => ({ url: `${API.PHARMACY.EXPIRY}/dashboard` }),
      providesTags: [{ type: "Expiry", id: "DASHBOARD" }],
    }),
    getExpiredBatches: builder.query({
      query: (params = {}) => ({ url: `${API.PHARMACY.EXPIRY}/expired`, params }),
      providesTags: [{ type: "Expiry", id: "EXPIRED" }],
    }),
    getExpiringSoonBatches: builder.query({
      query: (params = {}) => ({ url: `${API.PHARMACY.EXPIRY}/expiring`, params }),
      providesTags: [{ type: "Expiry", id: "EXPIRING" }],
    }),
    exportExpiredExcel: builder.query({
      query: (params = {}) => ({ url: `${API.PHARMACY.EXPIRY}/expired/export/excel`, params, responseType: "blob" }),
    }),
    exportExpiredPdf: builder.query({
      query: (params = {}) => ({ url: `${API.PHARMACY.EXPIRY}/expired/export/pdf`, params, responseType: "blob" }),
    }),
    exportExpiringExcel: builder.query({
      query: (params = {}) => ({ url: `${API.PHARMACY.EXPIRY}/expiring/export/excel`, params, responseType: "blob" }),
    }),
    exportExpiringPdf: builder.query({
      query: (params = {}) => ({ url: `${API.PHARMACY.EXPIRY}/expiring/export/pdf`, params, responseType: "blob" }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetExpiryDashboardQuery,
  useGetExpiredBatchesQuery,
  useGetExpiringSoonBatchesQuery,
  useExportExpiredExcelQuery,
  useExportExpiredPdfQuery,
  useExportExpiringExcelQuery,
  useExportExpiringPdfQuery,
} = expiryApi;

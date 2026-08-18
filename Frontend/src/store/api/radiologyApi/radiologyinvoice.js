// src/store/api/radiologyApi/radiologyInvoice.js
import { baseApi } from '../baseApi';

export const radiologyInvoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET ALL INVOICES
    getRadiologyInvoices: builder.query({
      query: (params = {}) => ({
        url: '/radiology/invoice',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'RadiologyInvoice', id })),
              { type: 'RadiologyInvoice', id: 'LIST' },
            ]
          : [{ type: 'RadiologyInvoice', id: 'LIST' }],
    }),

    // 🔹 GET BY ID
    getRadiologyInvoiceById: builder.query({
      query: (id) => `/radiology/invoice/${id}`,
      providesTags: (result, error, id) => [{ type: 'RadiologyInvoice', id }],
    }),

    // 🔹 GET INVOICES BY PATIENT
    getRadiologyInvoicesByPatient: builder.query({
      query: (patientId) => `/radiology/invoice/patient/${patientId}`,
      providesTags: [{ type: 'RadiologyInvoice', id: 'PATIENT' }],
    }),

    // 🔹 GET INVOICES BY HOSPITAL
    getRadiologyInvoicesByHospital: builder.query({
      query: (hospitalId) => `/radiology/invoice/hospital/${hospitalId}`,
      providesTags: [{ type: 'RadiologyInvoice', id: 'HOSPITAL' }],
    }),

    // 🔹 GET PENDING INVOICES BY HOSPITAL
    getPendingRadiologyInvoicesByHospital: builder.query({
      query: (hospitalId) => `/radiology/invoice/hospital/${hospitalId}/pending`,
      providesTags: [{ type: 'RadiologyInvoice', id: 'PENDING' }],
    }),

    // 🔹 GET INVOICE STATS BY HOSPITAL
    getRadiologyInvoiceStatsByHospital: builder.query({
      query: (hospitalId) => `/radiology/invoice/hospital/${hospitalId}/stats`,
      providesTags: [{ type: 'RadiologyInvoice', id: 'STATS' }],
    }),

    // 🔹 CREATE INVOICE
    createRadiologyInvoice: builder.mutation({
      query: (body) => ({
        url: '/radiology/invoice',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'RadiologyInvoice', id: 'LIST' }],
    }),

    // 🔹 CREATE INVOICE FROM ORDERS
    createRadiologyInvoiceFromOrders: builder.mutation({
      query: (body) => ({
        url: '/radiology/invoice/from-orders',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'RadiologyInvoice', id: 'LIST' }],
    }),

    // 🔹 UPDATE INVOICE
    updateRadiologyInvoice: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/radiology/invoice/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'RadiologyInvoice', id },
        { type: 'RadiologyInvoice', id: 'LIST' },
      ],
    }),

    // 🔹 UPDATE INVOICE STATUS
    updateRadiologyInvoiceStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/radiology/invoice/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'RadiologyInvoice', id },
        { type: 'RadiologyInvoice', id: 'LIST' },
      ],
    }),

    // 🔹 RECALCULATE INVOICE TOTALS
    recalculateRadiologyInvoice: builder.mutation({
      query: (id) => ({
        url: `/radiology/invoice/${id}/recalculate`,
        method: 'POST',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'RadiologyInvoice', id },
        { type: 'RadiologyInvoice', id: 'LIST' },
      ],
    }),

    // 🔹 SOFT DELETE INVOICE
    deleteRadiologyInvoice: builder.mutation({
      query: (id) => ({
        url: `/radiology/invoice/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'RadiologyInvoice', id: 'LIST' }],
    }),

    // 🔹 HARD DELETE INVOICE (permanent)
    hardDeleteRadiologyInvoice: builder.mutation({
      query: (id) => ({
        url: `/radiology/invoice/${id}/hard`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'RadiologyInvoice', id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetRadiologyInvoicesQuery,
  useGetRadiologyInvoiceByIdQuery,
  useGetRadiologyInvoicesByPatientQuery,
  useGetRadiologyInvoicesByHospitalQuery,
  useGetPendingRadiologyInvoicesByHospitalQuery,
  useGetRadiologyInvoiceStatsByHospitalQuery,
  useCreateRadiologyInvoiceMutation,
  useCreateRadiologyInvoiceFromOrdersMutation,
  useUpdateRadiologyInvoiceMutation,
  useUpdateRadiologyInvoiceStatusMutation,
  useRecalculateRadiologyInvoiceMutation,
  useDeleteRadiologyInvoiceMutation,
  useHardDeleteRadiologyInvoiceMutation,
} = radiologyInvoiceApi;
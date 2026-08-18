// src/store/api/pathologyApi/pathologyInvoice.js
import { baseApi } from '../baseApi';

export const pathologyInvoiceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET ALL INVOICES
    getPathologyInvoices: builder.query({
      query: (params = {}) => ({
        url: '/pathology-invoice',
        params,
      }),
      providesTags: (result) =>
        result?.result?.data
          ? [
              ...result.result.data.map(({ id }) => ({ type: 'PathologyInvoice', id })),
              { type: 'PathologyInvoice', id: 'LIST' },
            ]
          : [{ type: 'PathologyInvoice', id: 'LIST' }],
    }),

    // 🔹 GET BY ID
    getPathologyInvoiceById: builder.query({
      query: (id) => `/pathology-invoice/${id}`,
      providesTags: (result, error, id) => [{ type: 'PathologyInvoice', id }],
    }),

    // 🔹 GET INVOICES BY ORDER
    getPathologyInvoicesByOrderId: builder.query({
      query: (orderId) => `/pathology-invoice/by-order/${orderId}`,
      providesTags: (result, error, orderId) => [
        { type: 'PathologyInvoice', id: `order-${orderId}` },
      ],
    }),

    // 🔹 GET INVOICES BY PATIENT
    getPathologyInvoicesByPatientId: builder.query({
      query: (patientId) => `/pathology-invoice/by-patient/${patientId}`,
      providesTags: (result, error, patientId) => [
        { type: 'PathologyInvoice', id: `patient-${patientId}` },
      ],
    }),

    // 🔹 GET INVOICES BY STATUS
    getPathologyInvoicesByStatus: builder.query({
      query: (invoiceStatus) => `/pathology-invoice/by-status/${invoiceStatus}`,
      providesTags: (result, error, invoiceStatus) => [
        { type: 'PathologyInvoice', id: `status-${invoiceStatus}` },
      ],
    }),

    // 🔹 GET INVOICES BY PAYMENT STATUS
    getPathologyInvoicesByPaymentStatus: builder.query({
      query: (paymentStatus) => `/pathology-invoice/by-payment-status/${paymentStatus}`,
      providesTags: (result, error, paymentStatus) => [
        { type: 'PathologyInvoice', id: `payment-status-${paymentStatus}` },
      ],
    }),

    // 🔹 CREATE INVOICE
    createPathologyInvoice: builder.mutation({
      query: (body) => ({
        url: '/pathology-invoice',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PathologyInvoice', id: 'LIST' }],
    }),

    // 🔹 FULL UPDATE INVOICE
    updatePathologyInvoice: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-invoice/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PathologyInvoice', id },
        { type: 'PathologyInvoice', id: 'LIST' },
      ],
    }),

    // 🔹 PARTIAL UPDATE INVOICE (PATCH)
    patchPathologyInvoice: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-invoice/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PathologyInvoice', id },
        { type: 'PathologyInvoice', id: 'LIST' },
      ],
    }),

    // 🔹 UPDATE INVOICE STATUS
    updatePathologyInvoiceStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-invoice/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PathologyInvoice', id },
        { type: 'PathologyInvoice', id: 'LIST' },
      ],
    }),

    // 🔹 UPDATE PAYMENT STATUS
    updatePathologyInvoicePaymentStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-invoice/${id}/payment-status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PathologyInvoice', id },
        { type: 'PathologyInvoice', id: 'LIST' },
      ],
    }),

    // 🔹 CANCEL INVOICE
    cancelPathologyInvoice: builder.mutation({
      query: (id) => ({
        url: `/pathology-invoice/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'PathologyInvoice', id },
        { type: 'PathologyInvoice', id: 'LIST' },
      ],
    }),

    // 🔹 INCREMENT PRINT COUNT
    incrementPathologyInvoicePrint: builder.mutation({
      query: (id) => ({
        url: `/pathology-invoice/${id}/print`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'PathologyInvoice', id },
      ],
    }),

    // 🔹 MARK SMS SENT
    markPathologyInvoiceSmsSent: builder.mutation({
      query: (id) => ({
        url: `/pathology-invoice/${id}/sms-sent`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'PathologyInvoice', id },
      ],
    }),

    // 🔹 MARK EMAIL SENT
    markPathologyInvoiceEmailSent: builder.mutation({
      query: (id) => ({
        url: `/pathology-invoice/${id}/email-sent`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'PathologyInvoice', id },
      ],
    }),

    // 🔹 DELETE INVOICE
    deletePathologyInvoice: builder.mutation({
      query: (id) => ({
        url: `/pathology-invoice/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'PathologyInvoice', id: 'LIST' }],
    }),

    // 🔹 SEARCH INVOICES
    searchPathologyInvoices: builder.query({
      query: (params = {}) => ({
        url: '/pathology-invoice/search',
        params,
      }),
      providesTags: [{ type: 'PathologyInvoice', id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetPathologyInvoicesQuery,
  useGetPathologyInvoiceByIdQuery,
  useGetPathologyInvoicesByOrderIdQuery,
  useGetPathologyInvoicesByPatientIdQuery,
  useGetPathologyInvoicesByStatusQuery,
  useGetPathologyInvoicesByPaymentStatusQuery,
  useCreatePathologyInvoiceMutation,
  useUpdatePathologyInvoiceMutation,
  usePatchPathologyInvoiceMutation,
  useUpdatePathologyInvoiceStatusMutation,
  useUpdatePathologyInvoicePaymentStatusMutation,
  useCancelPathologyInvoiceMutation,
  useIncrementPathologyInvoicePrintMutation,
  useMarkPathologyInvoiceSmsSentMutation,
  useMarkPathologyInvoiceEmailSentMutation,
  useDeletePathologyInvoiceMutation,
  useSearchPathologyInvoicesQuery,
} = pathologyInvoiceApi;
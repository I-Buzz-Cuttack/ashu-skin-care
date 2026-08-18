// // src/store/api/pathologyApi/pathologyPayment.js
// import { baseApi } from '../baseApi';

// export const pathologyPaymentApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({

//     // ─────────────────────────────────────────────────────────
//     // 🔹 GET ALL PAYMENTS  GET /pathology/payment
//     // ─────────────────────────────────────────────────────────
//     getPathologyPayments: builder.query({
//       query: (params = {}) => ({
//         url: '/pathology/payment',
//         params,
//       }),
//       providesTags: (result) =>
//         result?.result?.data
//           ? [
//               ...result.result.data.map(({ id }) => ({ type: 'PathologyPayment', id })),
//               { type: 'PathologyPayment', id: 'LIST' },
//             ]
//           : [{ type: 'PathologyPayment', id: 'LIST' }],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 GET BY ID  GET /pathology/payment/:id
//     // ─────────────────────────────────────────────────────────
//     getPathologyPaymentById: builder.query({
//       query: (id) => `/pathology/payment/${id}`,
//       providesTags: (result, error, id) => [{ type: 'PathologyPayment', id }],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 GET BY INVOICE  GET /pathology/payment/invoice/:invoiceId
//     // ─────────────────────────────────────────────────────────
//     getPathologyPaymentsByInvoiceId: builder.query({
//       query: (invoiceId) => `/pathology/payment/invoice/${invoiceId}`,
//       providesTags: (result, error, invoiceId) => [
//         { type: 'PathologyPayment', id: `invoice-${invoiceId}` },
//       ],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 GET BY ORDER  GET /pathology/payment/order/:orderId
//     // ─────────────────────────────────────────────────────────
//     getPathologyPaymentsByOrderId: builder.query({
//       query: (orderId) => `/pathology/payment/order/${orderId}`,
//       providesTags: (result, error, orderId) => [
//         { type: 'PathologyPayment', id: `order-${orderId}` },
//       ],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 GET BY PATIENT  GET /pathology/payment/patient/:patientId
//     // ─────────────────────────────────────────────────────────
//     getPathologyPaymentsByPatientId: builder.query({
//       query: (patientId) => `/pathology/payment/patient/${patientId}`,
//       providesTags: (result, error, patientId) => [
//         { type: 'PathologyPayment', id: `patient-${patientId}` },
//       ],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 GET BY STATUS  GET /pathology/payment/status/:paymentStatus
//     // ─────────────────────────────────────────────────────────
//     getPathologyPaymentsByStatus: builder.query({
//       query: (paymentStatus) => `/pathology/payment/status/${paymentStatus}`,
//       providesTags: (result, error, paymentStatus) => [
//         { type: 'PathologyPayment', id: `status-${paymentStatus}` },
//       ],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 GET BY MODE  GET /pathology/payment/mode/:paymentMode
//     // ─────────────────────────────────────────────────────────
//     getPathologyPaymentsByMode: builder.query({
//       query: (paymentMode) => `/pathology/payment/mode/${paymentMode}`,
//       providesTags: (result, error, paymentMode) => [
//         { type: 'PathologyPayment', id: `mode-${paymentMode}` },
//       ],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 CREATE  POST /pathology/payment
//     // ─────────────────────────────────────────────────────────
//     createPathologyPayment: builder.mutation({
//       query: (body) => ({
//         url: '/pathology/payment',
//         method: 'POST',
//         body,
//       }),
//       invalidatesTags: [{ type: 'PathologyPayment', id: 'LIST' }],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 FULL UPDATE  PUT /pathology/payment/:id
//     // ─────────────────────────────────────────────────────────
//     updatePathologyPayment: builder.mutation({
//       query: ({ id, ...body }) => ({
//         url: `/pathology/payment/${id}`,
//         method: 'PUT',
//         body,
//       }),
//       invalidatesTags: (result, error, { id }) => [
//         { type: 'PathologyPayment', id },
//         { type: 'PathologyPayment', id: 'LIST' },
//       ],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 PARTIAL UPDATE  PATCH /pathology/payment/:id
//     // ─────────────────────────────────────────────────────────
//     patchPathologyPayment: builder.mutation({
//       query: ({ id, ...body }) => ({
//         url: `/pathology/payment/${id}`,
//         method: 'PATCH',
//         body,
//       }),
//       invalidatesTags: (result, error, { id }) => [
//         { type: 'PathologyPayment', id },
//         { type: 'PathologyPayment', id: 'LIST' },
//       ],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 UPDATE PAYMENT STATUS  PATCH /pathology/payment/:id/status
//     // ─────────────────────────────────────────────────────────
//     updatePathologyPaymentStatus: builder.mutation({
//       query: ({ id, ...body }) => ({
//         url: `/pathology/payment/${id}/status`,
//         method: 'PATCH',
//         body,
//       }),
//       invalidatesTags: (result, error, { id }) => [
//         { type: 'PathologyPayment', id },
//         { type: 'PathologyPayment', id: 'LIST' },
//       ],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 SETTLE PAYMENT  PATCH /pathology/payment/:id/settle
//     // ─────────────────────────────────────────────────────────
//     settlePathologyPayment: builder.mutation({
//       query: (id) => ({
//         url: `/pathology/payment/${id}/settle`,
//         method: 'PATCH',
//       }),
//       invalidatesTags: (result, error, id) => [
//         { type: 'PathologyPayment', id },
//         { type: 'PathologyPayment', id: 'LIST' },
//       ],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 MARK RECEIPT PRINTED  PATCH /pathology/payment/:id/receipt-print
//     // ─────────────────────────────────────────────────────────
//     markPathologyPaymentReceiptPrinted: builder.mutation({
//       query: (id) => ({
//         url: `/pathology/payment/${id}/receipt-print`,
//         method: 'PATCH',
//       }),
//       invalidatesTags: (result, error, id) => [
//         { type: 'PathologyPayment', id },
//       ],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 DELETE  DELETE /pathology/payment/:id
//     // ─────────────────────────────────────────────────────────
//     deletePathologyPayment: builder.mutation({
//       query: (id) => ({
//         url: `/pathology/payment/${id}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: [{ type: 'PathologyPayment', id: 'LIST' }],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 SEARCH  GET /pathology/payment/search
//     // ─────────────────────────────────────────────────────────
//     searchPathologyPayments: builder.query({
//       query: (params = {}) => ({
//         url: '/pathology/payment/search',
//         params,
//       }),
//       providesTags: [{ type: 'PathologyPayment', id: 'LIST' }],
//     }),

//   }),
//   overrideExisting: false,
// });

// export const {
//   useGetPathologyPaymentsQuery,
//   useGetPathologyPaymentByIdQuery,
//   useGetPathologyPaymentsByInvoiceIdQuery,
//   useGetPathologyPaymentsByOrderIdQuery,
//   useGetPathologyPaymentsByPatientIdQuery,
//   useGetPathologyPaymentsByStatusQuery,
//   useGetPathologyPaymentsByModeQuery,
//   useCreatePathologyPaymentMutation,
//   useUpdatePathologyPaymentMutation,
//   usePatchPathologyPaymentMutation,
//   useUpdatePathologyPaymentStatusMutation,
//   useSettlePathologyPaymentMutation,
//   useMarkPathologyPaymentReceiptPrintedMutation,
//   useDeletePathologyPaymentMutation,
//   useSearchPathologyPaymentsQuery,
// } = pathologyPaymentApi;






// src/store/api/pathologyApi/pathologyPayment.js
import { baseApi } from "../baseApi";

export const pathologyPaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET /pathology/payment
    getPathologyPayments: builder.query({
      query: (params = {}) => ({
        url: "/pathology/payment",
        params,
      }),
      providesTags: [{ type: "PathologyPayment", id: "LIST" }],
    }),

    // GET /pathology/payment/search?search=...
    searchPathologyPayments: builder.query({
      query: (params = {}) => ({
        url: "/pathology/payment/search",
        params,
      }),
      providesTags: [{ type: "PathologyPayment", id: "LIST" }],
    }),

    // GET /pathology/payment/:id
    getPathologyPaymentById: builder.query({
      query: (id) => `/pathology/payment/${id}`,
      providesTags: (result, error, id) => [{ type: "PathologyPayment", id }],
    }),

    // GET /pathology/payment/invoice/:invoiceId
    getPathologyPaymentsByInvoiceId: builder.query({
      query: (invoiceId) => `/pathology/payment/invoice/${invoiceId}`,
      providesTags: (result, error, invoiceId) => [
        { type: "PathologyPayment", id: `invoice-${invoiceId}` },
      ],
    }),

    // GET /pathology/payment/order/:orderId
    getPathologyPaymentsByOrderId: builder.query({
      query: (orderId) => `/pathology/payment/order/${orderId}`,
      providesTags: (result, error, orderId) => [
        { type: "PathologyPayment", id: `order-${orderId}` },
      ],
    }),

    // GET /pathology/payment/patient/:patientId
    getPathologyPaymentsByPatientId: builder.query({
      query: ({ patientId, params = {} }) => ({
        url: `/pathology/payment/patient/${patientId}`,
        params,
      }),
      providesTags: (result, error, arg) => [
        { type: "PathologyPayment", id: `patient-${arg?.patientId}` },
      ],
    }),

    // GET /pathology/payment/status/:paymentStatus
    getPathologyPaymentsByStatus: builder.query({
      query: ({ paymentStatus, params = {} }) => ({
        url: `/pathology/payment/status/${paymentStatus}`,
        params,
      }),
      providesTags: (result, error, arg) => [
        { type: "PathologyPayment", id: `status-${arg?.paymentStatus}` },
      ],
    }),

    // GET /pathology/payment/mode/:paymentMode
    getPathologyPaymentsByMode: builder.query({
      query: ({ paymentMode, params = {} }) => ({
        url: `/pathology/payment/mode/${paymentMode}`,
        params,
      }),
      providesTags: (result, error, arg) => [
        { type: "PathologyPayment", id: `mode-${arg?.paymentMode}` },
      ],
    }),

    // POST /pathology/payment
    createPathologyPayment: builder.mutation({
      query: (body) => ({
        url: "/pathology/payment",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "PathologyPayment", id: "LIST" }],
    }),

    // PUT /pathology/payment/:id
    updatePathologyPayment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology/payment/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PathologyPayment", id },
        { type: "PathologyPayment", id: "LIST" },
      ],
    }),

    // PATCH /pathology/payment/:id
    patchPathologyPayment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology/payment/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PathologyPayment", id },
        { type: "PathologyPayment", id: "LIST" },
      ],
    }),

    // PATCH /pathology/payment/:id/status
    updatePathologyPaymentStatus: builder.mutation({
      query: ({ id, paymentStatus }) => ({
        url: `/pathology/payment/${id}/status`,
        method: "PATCH",
        body: { paymentStatus },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "PathologyPayment", id },
        { type: "PathologyPayment", id: "LIST" },
      ],
    }),

    // PATCH /pathology/payment/:id/settle
    settlePathologyPayment: builder.mutation({
      query: (id) => ({
        url: `/pathology/payment/${id}/settle`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PathologyPayment", id },
        { type: "PathologyPayment", id: "LIST" },
      ],
    }),

    // PATCH /pathology/payment/:id/receipt-print
    markPathologyPaymentReceiptPrinted: builder.mutation({
      query: (id) => ({
        url: `/pathology/payment/${id}/receipt-print`,
        method: "PATCH",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "PathologyPayment", id },
        { type: "PathologyPayment", id: "LIST" },
      ],
    }),

    // DELETE /pathology/payment/:id
    deletePathologyPayment: builder.mutation({
      query: (id) => ({
        url: `/pathology/payment/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "PathologyPayment", id: "LIST" }],
    }),
  }),

  overrideExisting: false,
});

export const {
  useGetPathologyPaymentsQuery,
  useSearchPathologyPaymentsQuery,
  useGetPathologyPaymentByIdQuery,
  useGetPathologyPaymentsByInvoiceIdQuery,
  useGetPathologyPaymentsByOrderIdQuery,
  useGetPathologyPaymentsByPatientIdQuery,
  useGetPathologyPaymentsByStatusQuery,
  useGetPathologyPaymentsByModeQuery,
  useCreatePathologyPaymentMutation,
  useUpdatePathologyPaymentMutation,
  usePatchPathologyPaymentMutation,
  useUpdatePathologyPaymentStatusMutation,
  useSettlePathologyPaymentMutation,
  useMarkPathologyPaymentReceiptPrintedMutation,
  useDeletePathologyPaymentMutation,
} = pathologyPaymentApi;

// Alias for PathologyBillPage.jsx compatibility
export const useMarkPathologyReceiptPrintedMutation =
  useMarkPathologyPaymentReceiptPrintedMutation;
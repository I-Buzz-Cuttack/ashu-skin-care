// import { baseApi } from '../baseApi';

// export const radiologyPaymentApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({

//     // ─────────────────────────────────────────────────────────
//     // 🔹 CREATE  POST /radiology/payment
//     // ─────────────────────────────────────────────────────────
//     createRadiologyPayment: builder.mutation({
//       query: (body) => ({
//         url: '/radiology/payment',
//         method: 'POST',
//         body,
//       }),
//       invalidatesTags: [{ type: 'RadiologyPayment', id: 'LIST' }],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 GET ALL  GET /radiology/payment
//     // ─────────────────────────────────────────────────────────
//     getRadiologyPayments: builder.query({
//       query: (params = {}) => ({
//         url: '/radiology/payment',
//         params,
//       }),
//       providesTags: (result) =>
//         result?.data
//           ? [
//               ...result.data.map(({ id }) => ({ type: 'RadiologyPayment', id })),
//               { type: 'RadiologyPayment', id: 'LIST' },
//             ]
//           : [{ type: 'RadiologyPayment', id: 'LIST' }],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 GET BY ID  GET /radiology/payment/:id
//     // ─────────────────────────────────────────────────────────
//     getRadiologyPaymentById: builder.query({
//       query: (id) => `/radiology/payment/${id}`,
//       providesTags: (result, error, id) => [{ type: 'RadiologyPayment', id }],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 UPDATE  PUT /radiology/payment/:id
//     // ─────────────────────────────────────────────────────────
//     updateRadiologyPayment: builder.mutation({
//       query: ({ id, ...body }) => ({
//         url: `/radiology/payment/${id}`,
//         method: 'PUT',
//         body,
//       }),
//       invalidatesTags: (result, error, { id }) => [
//         { type: 'RadiologyPayment', id },
//         { type: 'RadiologyPayment', id: 'LIST' },
//       ],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 DELETE  DELETE /radiology/payment/:id
//     // ─────────────────────────────────────────────────────────
//     deleteRadiologyPayment: builder.mutation({
//       query: (id) => ({
//         url: `/radiology/payment/${id}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: (result, error, id) => [
//         { type: 'RadiologyPayment', id },
//         { type: 'RadiologyPayment', id: 'LIST' },
//       ],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 GET BY INVOICE  GET /radiology/payment/invoice/:invoiceId
//     // ─────────────────────────────────────────────────────────
//     getRadiologyPaymentByInvoice: builder.query({
//       query: (invoiceId) => `/radiology/payment/invoice/${invoiceId}`,
//       providesTags: (result, error, invoiceId) => [
//         { type: 'RadiologyPayment', id: `invoice-${invoiceId}` },
//       ],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 GET BY PATIENT  GET /radiology/payment/patient/:patientId
//     // ─────────────────────────────────────────────────────────
//     getRadiologyPaymentsByPatient: builder.query({
//       query: (patientId) => `/radiology/payment/patient/${patientId}`,
//       providesTags: (result, error, patientId) => [
//         { type: 'RadiologyPayment', id: `patient-${patientId}` },
//       ],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 GET BY HOSPITAL  GET /radiology/payment/hospital/:hospitalId
//     // ─────────────────────────────────────────────────────────
//     getRadiologyPaymentsByHospital: builder.query({
//       query: (hospitalId) => `/radiology/payment/hospital/${hospitalId}`,
//       providesTags: (result, error, hospitalId) => [
//         { type: 'RadiologyPayment', id: `hospital-${hospitalId}` },
//       ],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 REFUND  POST /radiology/payment/:id/refund
//     // ─────────────────────────────────────────────────────────
//     refundRadiologyPayment: builder.mutation({
//       query: ({ id, ...body }) => ({
//         url: `/radiology/payment/${id}/refund`,
//         method: 'POST',
//         body,
//       }),
//       invalidatesTags: (result, error, { id }) => [
//         { type: 'RadiologyPayment', id },
//         { type: 'RadiologyPayment', id: 'LIST' },
//       ],
//     }),

//     // ─────────────────────────────────────────────────────────
//     // 🔹 STATS  GET /radiology/payment/hospital/:hospitalId/stats
//     // ─────────────────────────────────────────────────────────
//     getRadiologyPaymentStats: builder.query({
//       query: (hospitalId) =>
//         `/radiology/payment/hospital/${hospitalId}/stats`,
//       providesTags: (result, error, hospitalId) => [
//         { type: 'RadiologyPayment', id: `stats-${hospitalId}` },
//       ],
//     }),

//   }),
//   overrideExisting: false,
// });

// export const {
//   useCreateRadiologyPaymentMutation,
//   useGetRadiologyPaymentsQuery,
//   useGetRadiologyPaymentByIdQuery,
//   useUpdateRadiologyPaymentMutation,
//   useDeleteRadiologyPaymentMutation,
//   useGetRadiologyPaymentByInvoiceQuery,
//   useGetRadiologyPaymentsByPatientQuery,
//   useGetRadiologyPaymentsByHospitalQuery,
//   useRefundRadiologyPaymentMutation,
//   useGetRadiologyPaymentStatsQuery,
// } = radiologyPaymentApi;






import { baseApi } from "../baseApi";

export const radiologyPaymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─────────────────────────────────────────────────────────
    // CREATE PAYMENT
    // POST /radiology/payment
    // Required backend fields:
    // invoiceId, patientId, paidAmount
    // ─────────────────────────────────────────────────────────
    createRadiologyPayment: builder.mutation({
      query: (body) => ({
        url: "/radiology/payment",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "RadiologyPayment", id: "LIST" }],
    }),

    // ─────────────────────────────────────────────────────────
    // GET ALL PAYMENTS
    // GET /radiology/payment?page=1&limit=10
    // ─────────────────────────────────────────────────────────
    getRadiologyPayments: builder.query({
      query: (params = {}) => ({
        url: "/radiology/payment",
        method: "GET",
        params,
      }),
      providesTags: (result) => {
        const list =
          result?.data?.data ||
          result?.data?.rows ||
          result?.data?.items ||
          result?.data ||
          result?.rows ||
          result?.items ||
          [];

        return Array.isArray(list)
          ? [
              ...list.map((item) => ({
                type: "RadiologyPayment",
                id: item?.id,
              })),
              { type: "RadiologyPayment", id: "LIST" },
            ]
          : [{ type: "RadiologyPayment", id: "LIST" }];
      },
    }),

    // ─────────────────────────────────────────────────────────
    // GET PAYMENT BY ID
    // GET /radiology/payment/:id
    // ─────────────────────────────────────────────────────────
    getRadiologyPaymentById: builder.query({
      query: (id) => ({
        url: `/radiology/payment/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [
        { type: "RadiologyPayment", id },
      ],
    }),

    // ─────────────────────────────────────────────────────────
    // UPDATE PAYMENT
    // PUT /radiology/payment/:id
    // ─────────────────────────────────────────────────────────
    updateRadiologyPayment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/radiology/payment/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "RadiologyPayment", id },
        { type: "RadiologyPayment", id: "LIST" },
      ],
    }),

    // ─────────────────────────────────────────────────────────
    // DELETE PAYMENT
    // DELETE /radiology/payment/:id
    // ─────────────────────────────────────────────────────────
    deleteRadiologyPayment: builder.mutation({
      query: (id) => ({
        url: `/radiology/payment/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "RadiologyPayment", id },
        { type: "RadiologyPayment", id: "LIST" },
      ],
    }),

    // ─────────────────────────────────────────────────────────
    // GET PAYMENT BY INVOICE ID
    // GET /radiology/payment/invoice/:invoiceId
    // ─────────────────────────────────────────────────────────
    getRadiologyPaymentByInvoice: builder.query({
      query: (invoiceId) => ({
        url: `/radiology/payment/invoice/${invoiceId}`,
        method: "GET",
      }),
      providesTags: (result, error, invoiceId) => [
        { type: "RadiologyPayment", id: `invoice-${invoiceId}` },
      ],
    }),

    // ─────────────────────────────────────────────────────────
    // GET PAYMENTS BY PATIENT
    // GET /radiology/payment/patient/:patientId
    // ─────────────────────────────────────────────────────────
    getRadiologyPaymentsByPatient: builder.query({
      query: ({ patientId, params = {} }) => ({
        url: `/radiology/payment/patient/${patientId}`,
        method: "GET",
        params,
      }),
      providesTags: (result, error, arg) => [
        {
          type: "RadiologyPayment",
          id: `patient-${arg?.patientId}`,
        },
      ],
    }),

    // ─────────────────────────────────────────────────────────
    // GET PAYMENTS BY HOSPITAL
    // GET /radiology/payment/hospital/:hospitalId
    // ─────────────────────────────────────────────────────────
    getRadiologyPaymentsByHospital: builder.query({
      query: ({ hospitalId, params = {} }) => ({
        url: `/radiology/payment/hospital/${hospitalId}`,
        method: "GET",
        params,
      }),
      providesTags: (result, error, arg) => [
        {
          type: "RadiologyPayment",
          id: `hospital-${arg?.hospitalId}`,
        },
      ],
    }),

    // ─────────────────────────────────────────────────────────
    // REFUND PAYMENT
    // POST /radiology/payment/:id/refund
    // Body: { refundAmount, note }
    // ─────────────────────────────────────────────────────────
    refundRadiologyPayment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/radiology/payment/${id}/refund`,
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "RadiologyPayment", id },
        { type: "RadiologyPayment", id: "LIST" },
      ],
    }),

    // ─────────────────────────────────────────────────────────
    // GET PAYMENT STATS
    // GET /radiology/payment/hospital/:hospitalId/stats
    // ─────────────────────────────────────────────────────────
    getRadiologyPaymentStats: builder.query({
      query: (hospitalId) => ({
        url: `/radiology/payment/hospital/${hospitalId}/stats`,
        method: "GET",
      }),
      providesTags: (result, error, hospitalId) => [
        { type: "RadiologyPayment", id: `stats-${hospitalId}` },
      ],
    }),
  }),

  overrideExisting: false,
});

export const {
  useCreateRadiologyPaymentMutation,
  useGetRadiologyPaymentsQuery,
  useGetRadiologyPaymentByIdQuery,
  useUpdateRadiologyPaymentMutation,
  useDeleteRadiologyPaymentMutation,
  useGetRadiologyPaymentByInvoiceQuery,
  useGetRadiologyPaymentsByPatientQuery,
  useGetRadiologyPaymentsByHospitalQuery,
  useRefundRadiologyPaymentMutation,
  useGetRadiologyPaymentStatsQuery,
} = radiologyPaymentApi;
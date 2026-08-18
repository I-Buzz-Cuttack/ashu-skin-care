// src/store/api/radiologyApi/radiologyorder.js
import { baseApi } from '../baseApi';

export const radiologyOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET ALL
    getRadiologyOrders: builder.query({
      query: (params = {}) => ({
        url: '/radiology/order',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: 'RadiologyOrder',
                id,
              })),
              { type: 'RadiologyOrder', id: 'LIST' },
            ]
          : [{ type: 'RadiologyOrder', id: 'LIST' }],
    }),

    // 🔹 GET BY ID
    getRadiologyOrderById: builder.query({
      query: (id) => `/radiology/order/${id}`,
      providesTags: (result, error, id) => [{ type: 'RadiologyOrder', id }],
    }),

    // 🔹 GET ORDERS BY PATIENT
    getRadiologyOrdersByPatient: builder.query({
      query: (patientId) => `/radiology/order/patient/${patientId}`,
      providesTags: [{ type: 'RadiologyOrder', id: 'PATIENT' }],
    }),

    // 🔹 GET ORDERS BY DOCTOR
    getRadiologyOrdersByDoctor: builder.query({
      query: (doctorId) => `/radiology/order/doctor/${doctorId}`,
      providesTags: [{ type: 'RadiologyOrder', id: 'DOCTOR' }],
    }),

    // 🔹 GET ORDERS BY HOSPITAL
    getRadiologyOrdersByHospital: builder.query({
      query: (hospitalId) => `/radiology/order/hospital/${hospitalId}`,
      providesTags: [{ type: 'RadiologyOrder', id: 'HOSPITAL' }],
    }),

    // 🔹 GET PENDING ORDERS BY HOSPITAL
    getPendingRadiologyOrdersByHospital: builder.query({
      query: (hospitalId) => `/radiology/order/hospital/${hospitalId}/pending`,
      providesTags: [{ type: 'RadiologyOrder', id: 'PENDING' }],
    }),

    // 🔹 CALCULATE ORDER AMOUNTS
    calculateRadiologyAmount: builder.query({
      query: (radiologyId) => `/radiology/order/calculate/${radiologyId}`,
    }),

    // 🔹 CREATE
    createRadiologyOrder: builder.mutation({
      query: (body) => ({
        url: '/radiology/order',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'RadiologyOrder', id: 'LIST' }],
    }),

    // 🔹 UPDATE
    // updateRadiologyOrder: builder.mutation({
    updateRadiologyOrderRecord: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/radiology/order/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'RadiologyOrder', id },
        { type: 'RadiologyOrder', id: 'LIST' },
      ],
    }),

    // 🔹 UPDATE ORDER STATUS
    updateRadiologyOrderStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/radiology/order/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'RadiologyOrder', id },
        { type: 'RadiologyOrder', id: 'LIST' },
      ],
    }),

    // 🔹 DELETE
    deleteRadiologyOrder: builder.mutation({
      query: (id) => ({
        url: `/radiology/order/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'RadiologyOrder', id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetRadiologyOrdersQuery,
  useGetRadiologyOrderByIdQuery,
  useGetRadiologyOrdersByPatientQuery,
  useGetRadiologyOrdersByDoctorQuery,
  useGetRadiologyOrdersByHospitalQuery,
  useGetPendingRadiologyOrdersByHospitalQuery,
  useCalculateRadiologyAmountQuery,
  useCreateRadiologyOrderMutation,
  // useUpdateRadiologyOrderMutation,
  useUpdateRadiologyOrderRecordMutation,
  useUpdateRadiologyOrderStatusMutation,
  useDeleteRadiologyOrderMutation,
} = radiologyOrderApi;
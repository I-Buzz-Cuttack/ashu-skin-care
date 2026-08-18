// src/store/api/pathologyApi/pathologyOrder.js
import { baseApi } from '../baseApi';

export const pathologyOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET ALL
    getPathologyOrders: builder.query({
      query: (params = {}) => ({
        url: '/pathology-order',
        params,
      }),
      transformResponse: (response) => response?.result || response,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: 'PathologyOrder',
                id,
              })),
              { type: 'PathologyOrder', id: 'LIST' },
            ]
          : [{ type: 'PathologyOrder', id: 'LIST' }],
    }),

    // 🔹 GET BY ID
    getPathologyOrderById: builder.query({
      query: (id) => `/pathology-order/${id}`,
      transformResponse: (response) => response?.result || response,
      providesTags: (_, __, id) => [{ type: 'PathologyOrder', id }],
    }),

    // 🔹 GET ORDERS BY PATIENT
    getPathologyOrdersByPatient: builder.query({
      query: (patientId) => `/pathology-order/patient/${patientId}`,
      transformResponse: (response) => response?.result || { data: response?.data || response },
      providesTags: [{ type: 'PathologyOrder', id: 'PATIENT' }],
    }),

    // 🔹 GET ORDERS BY STATUS
    getPathologyOrdersByStatus: builder.query({
      query: (status) => `/pathology-order/status/${status}`,
      transformResponse: (response) => response?.result || response,
      providesTags: [{ type: 'PathologyOrder', id: 'STATUS' }],
    }),

    // 🔹 SEARCH
    searchPathologyOrders: builder.query({
      query: (params = {}) => ({
        url: '/pathology-order/search',
        params,
      }),
      transformResponse: (response) => response?.result || { data: response?.data || response },
      providesTags: [{ type: 'PathologyOrder', id: 'LIST' }],
    }),

    // 🔹 CREATE
    createPathologyOrder: builder.mutation({
      query: (body) => ({
        url: '/pathology-order',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PathologyOrder', id: 'LIST' }],
    }),

    // 🔹 FULL UPDATE (PUT)
    updatePathologyOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-order/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'PathologyOrder', id },
        { type: 'PathologyOrder', id: 'LIST' },
      ],
    }),

    // 🔹 PARTIAL UPDATE (PATCH)
    patchPathologyOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-order/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'PathologyOrder', id },
        { type: 'PathologyOrder', id: 'LIST' },
      ],
    }),

    // 🔹 DELETE
    deletePathologyOrder: builder.mutation({
      query: (id) => ({
        url: `/pathology-order/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'PathologyOrder', id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetPathologyOrdersQuery,
  useGetPathologyOrderByIdQuery,
  useGetPathologyOrdersByPatientQuery,
  useGetPathologyOrdersByStatusQuery,
  useSearchPathologyOrdersQuery,
  useCreatePathologyOrderMutation,
  useUpdatePathologyOrderMutation,
  usePatchPathologyOrderMutation,
  useDeletePathologyOrderMutation,
} = pathologyOrderApi;
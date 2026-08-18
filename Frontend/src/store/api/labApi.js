// labApi.js
import { baseApi } from './baseApi';
import { API } from '@constants/api';

export const labApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLabOrders: builder.query({
      query: (params = {}) => ({ url: API.LAB.ORDERS, params }),
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'LabOrder', id })), { type: 'LabOrder', id: 'LIST' }]
          : [{ type: 'LabOrder', id: 'LIST' }],
    }),
    createLabOrder: builder.mutation({
      query: (body) => ({ url: API.LAB.ORDERS, method: 'POST', body }),
      invalidatesTags: [{ type: 'LabOrder', id: 'LIST' }],
    }),
    updateLabOrder: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${API.LAB.ORDERS}/${id}`, method: 'PUT', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'LabOrder', id }, { type: 'LabOrder', id: 'LIST' }],
    }),
    getLabResults: builder.query({
      query: (params = {}) => ({ url: API.LAB.RESULTS, params }),
      providesTags: [{ type: 'LabResult', id: 'LIST' }],
    }),
    createLabResult: builder.mutation({
      query: (body) => ({ url: API.LAB.RESULTS, method: 'POST', body }),
      invalidatesTags: [{ type: 'LabResult', id: 'LIST' }, { type: 'LabOrder', id: 'LIST' }],
    }),
    getLabCatalog: builder.query({
      query: (params = {}) => ({ url: API.LAB.CATALOG, params }),
      providesTags: [{ type: 'LabCatalog', id: 'LIST' }],
    }),
    createLabCatalogItem: builder.mutation({
      query: (body) => ({ url: API.LAB.CATALOG, method: 'POST', body }),
      invalidatesTags: [{ type: 'LabCatalog', id: 'LIST' }],
    }),
    getSamples: builder.query({
      query: (params = {}) => ({ url: API.LAB.SAMPLES, params }),
      providesTags: [{ type: 'LabOrder', id: 'SAMPLES' }],
    }),
    collectSample: builder.mutation({
      query: (body) => ({ url: API.LAB.SAMPLES, method: 'POST', body }),
      invalidatesTags: [{ type: 'LabOrder', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetLabOrdersQuery,
  useCreateLabOrderMutation,
  useUpdateLabOrderMutation,
  useGetLabResultsQuery,
  useCreateLabResultMutation,
  useGetLabCatalogQuery,
  useCreateLabCatalogItemMutation,
  useGetSamplesQuery,
  useCollectSampleMutation,
} = labApi;

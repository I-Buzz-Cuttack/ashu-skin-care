// hospitalsApi.js
import { baseApi } from './baseApi';
import { API } from '@constants/api';

export const hospitalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHospitals: builder.query({
      query: (params = {}) => ({ url: API.HOSPITALS.BASE, params }),
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'Hospital', id })), { type: 'Hospital', id: 'LIST' }]
          : [{ type: 'Hospital', id: 'LIST' }],
    }),
    getHospitalById: builder.query({
      query: (id) => API.HOSPITALS.BY_ID(id),
      providesTags: (r, e, id) => [{ type: 'Hospital', id }],
    }),
    createHospital: builder.mutation({
      query: (body) => ({ url: API.HOSPITALS.BASE, method: 'POST', body }),
      invalidatesTags: [{ type: 'Hospital', id: 'LIST' }],
    }),
    updateHospital: builder.mutation({
      query: ({ id, ...body }) => ({ url: API.HOSPITALS.BY_ID(id), method: 'PUT', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Hospital', id }, { type: 'Hospital', id: 'LIST' }],
    }),
    deleteHospital: builder.mutation({
      query: (id) => ({ url: API.HOSPITALS.BY_ID(id), method: 'DELETE' }),
      invalidatesTags: (r, e, id) => [{ type: 'Hospital', id }, { type: 'Hospital', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetHospitalsQuery,
  useGetHospitalByIdQuery,
  useCreateHospitalMutation,
  useUpdateHospitalMutation,
  useDeleteHospitalMutation,
} = hospitalsApi;

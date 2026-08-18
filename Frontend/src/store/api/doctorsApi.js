// doctorsApi.js
import { baseApi } from './baseApi';
import { API } from '@constants/api';

export const doctorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDoctors: builder.query({
      query: (params = {}) => ({ url: API.DOCTORS.BASE, params }),
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'Doctor', id })), { type: 'Doctor', id: 'LIST' }]
          : [{ type: 'Doctor', id: 'LIST' }],
    }),
    getDoctorById: builder.query({
      query: (id) => API.DOCTORS.BY_ID(id),
      providesTags: (r, e, id) => [{ type: 'Doctor', id }],
    }),
    createDoctor: builder.mutation({
      query: (body) => ({ url: API.DOCTORS.BASE, method: 'POST', body }),
      invalidatesTags: [{ type: 'Doctor', id: 'LIST' }],
    }),
    updateDoctor: builder.mutation({
      query: ({ id, ...body }) => ({ url: API.DOCTORS.BY_ID(id), method: 'PUT', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Doctor', id }, { type: 'Doctor', id: 'LIST' }],
    }),
    deleteDoctor: builder.mutation({
      query: (id) => ({ url: API.DOCTORS.BY_ID(id), method: 'DELETE' }),
      invalidatesTags: (r, e, id) => [{ type: 'Doctor', id }, { type: 'Doctor', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
} = doctorsApi;

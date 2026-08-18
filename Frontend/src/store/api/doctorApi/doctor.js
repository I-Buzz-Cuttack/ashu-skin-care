import { baseApi } from '../baseApi';

const DOCTOR_ROLE_ID = 2;

export const doctorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL
    getDoctors: builder.query({
      query: (params = {}) => ({
        url: '/user',
        params: {
          ...params,
          role_id: params.role_id ?? DOCTOR_ROLE_ID,
        },
      }),
      transformResponse: (response) => response?.result ?? response,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: 'Doctor',
                id,
              })),
              { type: 'Doctor', id: 'LIST' },
            ]
          : [{ type: 'Doctor', id: 'LIST' }],
    }),

    // GET BY ID
    getDoctorById: builder.query({
      query: (id) => ({
        url: `/user/${id}`,
      }),
      transformResponse: (response) => response?.result ?? response,
      providesTags: (_, __, id) => [{ type: 'Doctor', id }],
    }),

    // CREATE
    createDoctor: builder.mutation({
      query: (body) => ({
        url: '/user',
        method: 'POST',
        body: {
          ...body,
          role_id: DOCTOR_ROLE_ID,
        },
      }),
      invalidatesTags: [{ type: 'Doctor', id: 'LIST' }],
    }),

    // UPDATE
    updateDoctor: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/user/${id}`,
        method: 'PUT',
        body: {
          ...body,
          role_id: DOCTOR_ROLE_ID,
        },
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Doctor', id },
        { type: 'Doctor', id: 'LIST' },
      ],
    }),

    // DELETE
    deleteDoctor: builder.mutation({
      query: (id) => ({
        url: `/user/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Doctor', id: 'LIST' }],
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
} = doctorApi;
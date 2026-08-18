import { baseApi } from '../baseApi';

export const patientApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // GET ALL PATIENTS
    getPatients: builder.query({
      query: (params = {}) => ({
        url: '/patient',
        params,
      }),
      transformResponse: (response) => {
        // transformResponse for patients
        
        // Handle the response structure { result: { data: [], pagination: {} } }
        if (response?.result?.data) {
          return {
            data: response.result.data,
            total: response.result.pagination?.total || 0,
            page: response.result.pagination?.page || 1,
            limit: response.result.pagination?.limit || 10,
            totalPages: response.result.pagination?.totalPages || 0,
          };
        }
        
        // Fallback for array response
        if (Array.isArray(response)) {
          return {
            data: response,
            total: response.length,
            page: 1,
            limit: response.length,
            totalPages: 1,
          };
        }
        
        return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
      },
      providesTags: (result) => {
        if (result?.data && Array.isArray(result.data)) {
          return [
            ...result.data.map(({ id }) => ({ type: 'Patient', id })),
            { type: 'Patient', id: 'LIST' },
          ];
        }
        return [{ type: 'Patient', id: 'LIST' }];
      },
    }),

    // GET PATIENT BY ID
    getPatientById: builder.query({
      query: (id) => `/patient/${id}`,
      transformResponse: (response) => {
        if (response?.result) return response.result;
        return response;
      },
      providesTags: (result, error, id) => [{ type: 'Patient', id }],
    }),

    // CREATE PATIENT
    createPatient: builder.mutation({
      query: (body) => ({
        url: '/patient',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Patient', id: 'LIST' }],
    }),

    // UPDATE PATIENT
    updatePatient: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/patient/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Patient', id },
        { type: 'Patient', id: 'LIST' },
      ],
    }),

    // DELETE PATIENT
    deletePatient: builder.mutation({
      query: (id) => ({
        url: `/patient/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Patient', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPatientsQuery,
  useGetPatientByIdQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} = patientApi;
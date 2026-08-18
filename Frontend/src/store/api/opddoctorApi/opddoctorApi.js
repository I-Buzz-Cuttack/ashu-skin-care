import { baseApi } from '../baseApi';

export const doctorApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── GET ALL DOCTORS ──────────────────────────────────────────────────────
    getDoctors: builder.query({
      query: (params = {}) => ({
        url: '/user',
        params,
      }),
      transformResponse: (response) => {
        // transformResponse for doctors

        if (response?.result?.data) {
          return {
            data: response.result.data,
            total: response.result.pagination?.total || 0,
            page: response.result.pagination?.page || 1,
            limit: response.result.pagination?.limit || 10,
            totalPages: response.result.pagination?.totalPages || 0,
          };
        }

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
            ...result.data.map(({ id }) => ({ type: 'Doctor', id })),
            { type: 'Doctor', id: 'LIST' },
          ];
        }
        return [{ type: 'Doctor', id: 'LIST' }];
      },
    }),

    // ── GET DOCTOR BY ID ─────────────────────────────────────────────────────
    getDoctorById: builder.query({
      query: (id) => `/user/${id}`,
      transformResponse: (response) => {
        if (response?.result) return response.result;
        return response;
      },
      providesTags: (result, error, id) => [{ type: 'Doctor', id }],
    }),

    // ── CREATE DOCTOR ────────────────────────────────────────────────────────
    createDoctor: builder.mutation({
      query: (body) => ({
        url: '/user',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Doctor', id: 'LIST' }],
    }),

    // ── UPDATE DOCTOR (full replace) ─────────────────────────────────────────
    updateDoctor: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/user/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Doctor', id },
        { type: 'Doctor', id: 'LIST' },
      ],
    }),

    // ── PATCH DOCTOR (partial update) ────────────────────────────────────────
    patchDoctor: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/user/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Doctor', id },
        { type: 'Doctor', id: 'LIST' },
      ],
    }),

    // ── DELETE DOCTOR ────────────────────────────────────────────────────────
    deleteDoctor: builder.mutation({
      query: (id) => ({
        url: `/user/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Doctor', id: 'LIST' }],
    }),

    // ── GET ALL DESIGNATIONS (READ ONLY) ─────────────────────────────────────
    getDesignations: builder.query({
      query: (params = {}) => ({
        url: '/designation', // Update this to your actual designation endpoint
        method: 'GET',
        params,
      }),
      transformResponse: (response) => {
        // transformResponse for designations
        
        // Handle different response structures
        const result = response?.result ?? response;
        
        if (result?.data && Array.isArray(result.data)) {
          return result.data;
        }
        
        if (Array.isArray(result)) {
          return result;
        }
        
        return [];
      },
      providesTags: (result) => {
        if (Array.isArray(result) && result.length) {
          return [
            ...result.map(({ id, _id }) => ({ type: 'Designation', id: id || _id })),
            { type: 'Designation', id: 'LIST' },
          ];
        }
        return [{ type: 'Designation', id: 'LIST' }];
      },
    }),

  }),
  overrideExisting: true,
});

// ── Export only the hooks you need ───────────────────────────────────────────
export const {
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  usePatchDoctorMutation,
  useDeleteDoctorMutation,
  useGetDesignationsQuery, 
} = doctorApi;
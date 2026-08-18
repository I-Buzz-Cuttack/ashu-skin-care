/**
 * patientsApi.js — Patient CRUD endpoints
 *
 * HOW PAGINATION WORKS WITH RTK QUERY:
 *   The backend should accept: ?page=1&limit=10&search=John&status=ACTIVE
 *   This query sends those as params and the response should be:
 *   { data: Patient[], total: number, page: number, totalPages: number }
 *
 * Generated hooks:
 *   useGetPatientsQuery        → GET  /patients  (paginated, searchable)
 *   useGetPatientByIdQuery     → GET  /patients/:id
 *   useCreatePatientMutation   → POST /patients
 *   useUpdatePatientMutation   → PUT  /patients/:id
 *   useDeletePatientMutation   → DELETE /patients/:id
 */

import { baseApi } from './baseApi';
import { API } from '@constants/api';

export const patientsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    getPatients: builder.query({
      query: (params = {}) => ({
        url:    API.PATIENTS.BASE,
        params: {
          page:   params.page   || 1,
          limit:  params.limit  || 10,
          search: params.search || '',
          status: params.status || '',
          sort:   params.sort   || 'createdAt',
          order:  params.order  || 'desc',
        },
      }),
      // Tag every patient in the list + the list itself
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Patient', id })),
              { type: 'Patient', id: 'LIST' },
            ]
          : [{ type: 'Patient', id: 'LIST' }],
    }),

    getPatientById: builder.query({
      query: (id) => API.PATIENTS.BY_ID(id),
      providesTags: (result, error, id) => [{ type: 'Patient', id }],
    }),

    createPatient: builder.mutation({
      query: (body) => ({
        url:    API.PATIENTS.BASE,
        method: 'POST',
        body,
      }),
      // Invalidate list so it refetches
      invalidatesTags: [{ type: 'Patient', id: 'LIST' }],
    }),

    updatePatient: builder.mutation({
      query: ({ id, ...body }) => ({
        url:    API.PATIENTS.BY_ID(id),
        method: 'PUT',
        body,
      }),
      // Invalidate the specific patient + the list
      invalidatesTags: (result, error, { id }) => [
        { type: 'Patient', id },
        { type: 'Patient', id: 'LIST' },
      ],
    }),

    deletePatient: builder.mutation({
      query: (id) => ({
        url:    API.PATIENTS.BY_ID(id),
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Patient', id },
        { type: 'Patient', id: 'LIST' },
      ],
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
} = patientsApi;

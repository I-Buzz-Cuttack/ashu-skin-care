/**
 * store/api/department.js
 *
 * RTK Query endpoints for Department resource.
 * Injected into baseApi — all caching, invalidation, and
 * polling is handled by the shared RTK Query infrastructure.
 *
 * NOTE: baseApi already has /api in its baseUrl, so endpoints
 * use /department (not /api/department) to avoid doubling.
 *
 * Endpoints:
 *   createDepartment   POST   /department
 *   getDepartments     GET    /department
 *   getDepartmentById  GET    /department/:id
 *   updateDepartment   PUT    /department/:id   (full update)
 *   patchDepartment    PATCH  /department/:id   (partial update)
 *   deleteDepartment   DELETE /department/:id
 */

import { baseApi } from '../baseApi';

// ── Tag constant ─────────────────────────────────────────────────────────────
const TAG = 'Department';

// ── Inject endpoints ─────────────────────────────────────────────────────────
export const departmentApi = baseApi
  .enhanceEndpoints({ addTagTypes: [TAG] })
  .injectEndpoints({
    endpoints: (builder) => ({

      /** POST /department — Create a new department */
      createDepartment: builder.mutation({
        query: (body) => ({
          url: '/department',
          method: 'POST',
          body,
        }),
        invalidatesTags: [{ type: TAG, id: 'LIST' }],
      }),

      /** GET /department — Fetch all departments */
      getDepartments: builder.query({
        query: (params) => ({
          url: '/department',
          method: 'GET',
          params,
        }),
        // Unwrap whatever shape the backend returns:
        // { result: { data: [...] } } or { result: [...] } or [...]
        transformResponse: (response) => {
          const result = response?.result ?? response;
          return Array.isArray(result) ? result : (result?.data ?? []);
        },
        providesTags: (result) =>
          Array.isArray(result) && result.length
            ? [
                ...result.map(({ id }) => ({ type: TAG, id })),
                { type: TAG, id: 'LIST' },
              ]
            : [{ type: TAG, id: 'LIST' }],
      }),

      /** GET /department/:id — Fetch a single department */
      getDepartmentById: builder.query({
        query: (id) => ({
          url: `/department/${id}`,
          method: 'GET',
        }),
        providesTags: (_result, _error, id) => [{ type: TAG, id }],
      }),

      /** PUT /department/:id — Full update */
      updateDepartment: builder.mutation({
        query: ({ id, ...body }) => ({
          url: `/department/${id}`,
          method: 'PUT',
          body,
        }),
        invalidatesTags: (_result, _error, { id }) => [
          { type: TAG, id },
          { type: TAG, id: 'LIST' },
        ],
      }),

      /** PATCH /department/:id — Partial update */
      patchDepartment: builder.mutation({
        query: ({ id, ...body }) => ({
          url: `/department/${id}`,
          method: 'PATCH',
          body,
        }),
        invalidatesTags: (_result, _error, { id }) => [
          { type: TAG, id },
          { type: TAG, id: 'LIST' },
        ],
      }),

      /** DELETE /department/:id — Delete a department */
      deleteDepartment: builder.mutation({
        query: (id) => ({
          url: `/department/${id}`,
          method: 'DELETE',
        }),
        invalidatesTags: (_result, _error, id) => [
          { type: TAG, id },
          { type: TAG, id: 'LIST' },
        ],
      }),

    }),
    overrideExisting: false,
  });

// ── Export auto-generated hooks ───────────────────────────────────────────────
export const {
  useCreateDepartmentMutation,
  useGetDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useUpdateDepartmentMutation,
  usePatchDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentApi;
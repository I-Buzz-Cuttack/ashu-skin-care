  // src/store/api/radiologyApi/radiologyTestParameterApi.js
import { baseApi } from '../baseApi';

export const radiologyTestParameterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── GET ALL  ─────────────────────────────────────────────────────────────
    // GET /radiology/parameter
    // Supports query params: search, page, limit, isActive
    getRadiologyTestParameters: builder.query({
      query: (params = {}) => ({
        url: '/radiology/parameter',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'RadiologyTestParameter', id })),
              { type: 'RadiologyTestParameter', id: 'LIST' },
            ]
          : [{ type: 'RadiologyTestParameter', id: 'LIST' }],
    }),

    // ── GET BY ID  ───────────────────────────────────────────────────────────
    // GET /radiology/parameter/{id}
    getRadiologyTestParameterById: builder.query({
      query: (id) => `/radiology/parameter/${id}`,
      providesTags: (_, __, id) => [{ type: 'RadiologyTestParameter', id }],
    }),

    // ── GET BY RADIOLOGY TEST ID  ────────────────────────────────────────────
    // GET /radiology/parameter/radiology/{radiologyId}
    getParametersByRadiologyId: builder.query({
      query: (radiologyId) => `/radiology/parameter/radiology/${radiologyId}`,
      providesTags: (_, __, radiologyId) => [
        { type: 'RadiologyTestParameter', id: `RADIOLOGY_${radiologyId}` },
        { type: 'RadiologyTestParameter', id: 'LIST' },
      ],
    }),

    // ── CREATE  ──────────────────────────────────────────────────────────────
    // POST /radiology/parameter
    // Body: { radiologyId, parameterName, referenceRange, unit, sortOrder, isActive }
    createRadiologyTestParameter: builder.mutation({
      query: (body) => ({
        url: '/radiology/parameter',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'RadiologyTestParameter', id: 'LIST' }],
    }),

    // ── BULK CREATE  ─────────────────────────────────────────────────────────
    // POST /radiology/parameter/radiology/{radiologyId}/bulk
    // Body: { parameters: [{ parameterName, referenceRange, unit, sortOrder }, ...] }
    bulkCreateRadiologyTestParameters: builder.mutation({
      query: ({ radiologyId, parameters }) => ({
        url: `/radiology/parameter/radiology/${radiologyId}/bulk`,
        method: 'POST',
        body: { parameters },
      }),
      invalidatesTags: [{ type: 'RadiologyTestParameter', id: 'LIST' }],
    }),

    // ── FULL UPDATE (PUT)  ───────────────────────────────────────────────────
    // PUT /radiology/parameter/{id}
    // Body: { radiologyId, parameterName, referenceRange, unit, sortOrder, isActive }
    updateRadiologyTestParameter: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/radiology/parameter/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'RadiologyTestParameter', id: 'LIST' },
        { type: 'RadiologyTestParameter', id },
      ],
    }),

    // ── PARTIAL UPDATE (PATCH)  ──────────────────────────────────────────────
    // PATCH /radiology/parameter/{id}
    // Used for toggling isActive without sending the full object
    patchRadiologyTestParameter: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/radiology/parameter/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'RadiologyTestParameter', id: 'LIST' },
        { type: 'RadiologyTestParameter', id },
      ],
    }),

    // ── SOFT DELETE  ─────────────────────────────────────────────────────────
    // DELETE /radiology/parameter/{id}
    deleteRadiologyTestParameter: builder.mutation({
      query: (id) => ({
        url: `/radiology/parameter/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'RadiologyTestParameter', id: 'LIST' }],
    }),

    // ── HARD DELETE (permanent)  ─────────────────────────────────────────────
    // DELETE /radiology/parameter/{id}/hard
    hardDeleteRadiologyTestParameter: builder.mutation({
      query: (id) => ({
        url: `/radiology/parameter/${id}/hard`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'RadiologyTestParameter', id: 'LIST' }],
    }),

    // ── DELETE ALL FOR A RADIOLOGY TEST  ─────────────────────────────────────
    // DELETE /radiology/parameter/radiology/{radiologyId}/all
    deleteAllParametersByRadiologyId: builder.mutation({
      query: (radiologyId) => ({
        url: `/radiology/parameter/radiology/${radiologyId}/all`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'RadiologyTestParameter', id: 'LIST' }],
    }),

    // ── REORDER  ─────────────────────────────────────────────────────────────
    // POST /radiology/parameter/radiology/{radiologyId}/reorder
    // Body: { orders: [{ id, sortOrder }, ...] }
    reorderRadiologyTestParameters: builder.mutation({
      query: ({ radiologyId, orders }) => ({
        url: `/radiology/parameter/radiology/${radiologyId}/reorder`,
        method: 'POST',
        body: { orders },
      }),
      invalidatesTags: [{ type: 'RadiologyTestParameter', id: 'LIST' }],
    }),

    // ── RADIOLOGY TESTS FOR DROPDOWN  ────────────────────────────────────────
    // GET /radiology/test  — all active tests to populate the Radiology Test dropdown
    // Response shape expected: { data: [{ id, testName, ... }] }
    getRadiologyTestsForDropdown: builder.query({
      query: () => ({
        url: '/radiology/test',
        params: { limit: 1000, isActive: true },
      }),
      providesTags: [{ type: 'RadiologyCatalog', id: 'DROPDOWN' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetRadiologyTestParametersQuery,
  useGetRadiologyTestParameterByIdQuery,
  useGetParametersByRadiologyIdQuery,
  useCreateRadiologyTestParameterMutation,
  useBulkCreateRadiologyTestParametersMutation,
  useUpdateRadiologyTestParameterMutation,
  usePatchRadiologyTestParameterMutation,
  useDeleteRadiologyTestParameterMutation,
  useHardDeleteRadiologyTestParameterMutation,
  useDeleteAllParametersByRadiologyIdMutation,
  useReorderRadiologyTestParametersMutation,
  useGetRadiologyTestsForDropdownQuery,
} = radiologyTestParameterApi;
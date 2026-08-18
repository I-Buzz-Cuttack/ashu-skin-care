// src/store/api/radiologyApi/radiologyTestApi.js
import { baseApi } from '../baseApi';

export const radiologyTestApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── GET ALL ──────────────────────────────────────────────────────────────
    // GET /radiology/test
    // Supports: search, page, limit, isActive, categoryId, chargeNameId
    getRadiologyTests: builder.query({
      query: (params = {}) => ({
        url: '/radiology/test',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'RadiologyTest', id })),
              { type: 'RadiologyTest', id: 'LIST' },
            ]
          : [{ type: 'RadiologyTest', id: 'LIST' }],
    }),

    // ── SEARCH ───────────────────────────────────────────────────────────────
    // GET /radiology/test/search
    searchRadiologyTests: builder.query({
      query: (params = {}) => ({
        url: '/radiology/test/search',
        params,
      }),
      providesTags: [{ type: 'RadiologyTest', id: 'LIST' }],
    }),

    // ── GET BY CATEGORY ───────────────────────────────────────────────────────
    // GET /radiology/test/category/{categoryId}
    getRadiologyTestsByCategory: builder.query({
      query: (categoryId) => `/radiology/test/category/${categoryId}`,
      providesTags: (_, __, categoryId) => [
        { type: 'RadiologyTest', id: `CATEGORY_${categoryId}` },
        { type: 'RadiologyTest', id: 'LIST' },
      ],
    }),

    // ── GET BY CHARGE NAME ────────────────────────────────────────────────────
    // GET /radiology/test/charge-name/{chargeNameId}
    getRadiologyTestsByChargeName: builder.query({
      query: (chargeNameId) => `/radiology/test/charge-name/${chargeNameId}`,
      providesTags: (_, __, chargeNameId) => [
        { type: 'RadiologyTest', id: `CHARGENAME_${chargeNameId}` },
        { type: 'RadiologyTest', id: 'LIST' },
      ],
    }),

    // ── GET BY ID ─────────────────────────────────────────────────────────────
    // GET /radiology/test/{id}
    getRadiologyTestById: builder.query({
      query: (id) => `/radiology/test/${id}`,
      providesTags: (_, __, id) => [{ type: 'RadiologyTest', id }],
    }),

    // ── CREATE ────────────────────────────────────────────────────────────────
    // POST /radiology/test
    createRadiologyTest: builder.mutation({
      query: (body) => ({
        url: '/radiology/test',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'RadiologyTest', id: 'LIST' }],
    }),

    // ── FULL UPDATE (PUT) ─────────────────────────────────────────────────────
    // PUT /radiology/test/{id}
    updateRadiologyTest: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/radiology/test/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'RadiologyTest', id: 'LIST' },
        { type: 'RadiologyTest', id },
      ],
    }),

    // ── PARTIAL UPDATE (PATCH) ────────────────────────────────────────────────
    // PATCH /radiology/test/{id}  — used for toggling isActive
    patchRadiologyTest: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/radiology/test/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'RadiologyTest', id: 'LIST' },
        { type: 'RadiologyTest', id },
      ],
    }),

    // ── SOFT DELETE ───────────────────────────────────────────────────────────
    // DELETE /radiology/test/{id}
    deleteRadiologyTest: builder.mutation({
      query: (id) => ({
        url: `/radiology/test/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'RadiologyTest', id: 'LIST' }],
    }),

    // ── DROPDOWN HELPERS ──────────────────────────────────────────────────────
    // GET /radiology/category  — for the Category dropdown in Add/Edit form
    getRadiologyCategoriesForDropdown: builder.query({
      query: () => ({
        url: '/radiology/category',
        params: { limit: 1000, isActive: true },
      }),
      providesTags: [{ type: 'RadiologyCategory', id: 'DROPDOWN' }],
    }),

    // GET /radiology/charge-name  — for the Charge Name dropdown in Add/Edit form
    getRadiologyChargeNamesForDropdown: builder.query({
      query: () => ({
        url: '/radiology/charge-name',
        params: { limit: 1000, isActive: true },
      }),
      providesTags: [{ type: 'RadiologyChargeName', id: 'DROPDOWN' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetRadiologyTestsQuery,
  useSearchRadiologyTestsQuery,
  useGetRadiologyTestsByCategoryQuery,
  useGetRadiologyTestsByChargeNameQuery,
  useGetRadiologyTestByIdQuery,
  useCreateRadiologyTestMutation,
  useUpdateRadiologyTestMutation,
  usePatchRadiologyTestMutation,
  useDeleteRadiologyTestMutation,
  useGetRadiologyCategoriesForDropdownQuery,
  useGetRadiologyChargeNamesForDropdownQuery,
} = radiologyTestApi;
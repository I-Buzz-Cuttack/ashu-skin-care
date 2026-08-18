// src/store/api/radiologyApi/radiologySubCategoryApi.js
import { baseApi } from '../baseApi';

export const radiologySubCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── GET ALL ──────────────────────────────────────────────────────────────
    // GET /radiology/sub-category
    // Supports: search, page, limit, isActive, categoryId
    getRadiologySubCategories: builder.query({
      query: (params = {}) => ({
        url: '/radiology/sub-category',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'RadiologySubCategory', id })),
              { type: 'RadiologySubCategory', id: 'LIST' },
            ]
          : [{ type: 'RadiologySubCategory', id: 'LIST' }],
    }),

    // ── GET BY CATEGORY (cascading dropdown) ────────────────────────────────
    // GET /radiology/sub-category/category/{categoryId}
    getRadiologySubCategoriesByCategory: builder.query({
      query: (categoryId) => `/radiology/sub-category/category/${categoryId}`,
      providesTags: (_, __, categoryId) => [
        { type: 'RadiologySubCategory', id: `CATEGORY_${categoryId}` },
        { type: 'RadiologySubCategory', id: 'LIST' },
      ],
    }),

    // ── GET BY ID ─────────────────────────────────────────────────────────────
    // GET /radiology/sub-category/{id}
    getRadiologySubCategoryById: builder.query({
      query: (id) => `/radiology/sub-category/${id}`,
      providesTags: (_, __, id) => [{ type: 'RadiologySubCategory', id }],
    }),

    // ── CREATE ────────────────────────────────────────────────────────────────
    // POST /radiology/sub-category
    createRadiologySubCategory: builder.mutation({
      query: (body) => ({
        url: '/radiology/sub-category',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_, __, body) => [
        { type: 'RadiologySubCategory', id: 'LIST' },
        { type: 'RadiologySubCategory', id: `CATEGORY_${body?.categoryId}` },
        { type: 'RadiologyCategory', id: 'LIST' }, // category's nested subCategories also changes
      ],
    }),

    // ── FULL UPDATE (PUT) ─────────────────────────────────────────────────────
    // PUT /radiology/sub-category/{id}
    updateRadiologySubCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/radiology/sub-category/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_, __, { id, categoryId }) => [
        { type: 'RadiologySubCategory', id: 'LIST' },
        { type: 'RadiologySubCategory', id },
        { type: 'RadiologySubCategory', id: `CATEGORY_${categoryId}` },
        { type: 'RadiologyCategory', id: 'LIST' },
      ],
    }),

    // ── PARTIAL UPDATE (PATCH) ────────────────────────────────────────────────
    // PATCH /radiology/sub-category/{id} — used for toggling isActive
    patchRadiologySubCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/radiology/sub-category/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'RadiologySubCategory', id: 'LIST' },
        { type: 'RadiologySubCategory', id },
        { type: 'RadiologyCategory', id: 'LIST' },
      ],
    }),

    // ── SOFT DELETE ───────────────────────────────────────────────────────────
    // DELETE /radiology/sub-category/{id}
    deleteRadiologySubCategory: builder.mutation({
      query: (id) => ({
        url: `/radiology/sub-category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'RadiologySubCategory', id: 'LIST' },
        { type: 'RadiologyCategory', id: 'LIST' },
      ],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetRadiologySubCategoriesQuery,
  useGetRadiologySubCategoriesByCategoryQuery,
  useGetRadiologySubCategoryByIdQuery,
  useCreateRadiologySubCategoryMutation,
  useUpdateRadiologySubCategoryMutation,
  usePatchRadiologySubCategoryMutation,
  useDeleteRadiologySubCategoryMutation,
} = radiologySubCategoryApi;
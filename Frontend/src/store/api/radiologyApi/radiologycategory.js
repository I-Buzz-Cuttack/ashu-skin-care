// import { baseApi } from '../baseApi';

// export const radiologyCategoryApi = baseApi.injectEndpoints({
//   endpoints: (builder) => ({

//     // 🔹 GET ALL
//     getRadiologyCategories: builder.query({
//       query: (params = {}) => ({
//         url: '/radiology/category',
//         params,
//       }),
//       providesTags: (result) =>
//         result?.data
//           ? [
//               ...result.data.map(({ id }) => ({
//                 type: 'RadiologyCategory',
//                 id,
//               })),
//               { type: 'RadiologyCategory', id: 'LIST' },
//             ]
//           : [{ type: 'RadiologyCategory', id: 'LIST' }],
//     }),

//     // 🔹 CREATE
//     createRadiologyCategory: builder.mutation({
//       query: (body) => ({
//         url: '/radiology/category',
//         method: 'POST',
//         body,
//       }),
//       invalidatesTags: [{ type: 'RadiologyCategory', id: 'LIST' }],
//     }),

//     // 🔹 UPDATE
//     updateRadiologyCategory: builder.mutation({
//       query: ({ id, ...body }) => ({
//         url: `/radiology/category/${id}`,
//         method: 'PUT',
//         body,
//       }),
//       invalidatesTags: [{ type: 'RadiologyCategory', id: 'LIST' }],
//     }),

//     // 🔹 DELETE
//     deleteRadiologyCategory: builder.mutation({
//       query: (id) => ({
//         url: `/radiology/category/${id}`,
//         method: 'DELETE',
//       }),
//       invalidatesTags: [{ type: 'RadiologyCategory', id: 'LIST' }],
//     }),

//   }),
//   overrideExisting: false,
// });

// export const {
//   useGetRadiologyCategoriesQuery,
//   useCreateRadiologyCategoryMutation,
//   useUpdateRadiologyCategoryMutation,
//   useDeleteRadiologyCategoryMutation,
// } = radiologyCategoryApi;


// src/store/api/radiologyApi/radiologyCategoryApi.js
import { baseApi } from '../baseApi';

export const radiologyCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── GET ALL ──────────────────────────────────────────────────────────────
    // GET /radiology/category
    // Supports: search, page, limit, isActive
    getRadiologyCategories: builder.query({
      query: (params = {}) => ({
        url: '/radiology-category',
        params,
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'RadiologyCategory', id })),
              { type: 'RadiologyCategory', id: 'LIST' },
            ]
          : [{ type: 'RadiologyCategory', id: 'LIST' }],
    }),

    // ── GET BY ID ─────────────────────────────────────────────────────────────
    // GET /radiology/category/{id}
    getRadiologyCategoryById: builder.query({
      query: (id) => `/radiology-category/${id}`,
      providesTags: (_, __, id) => [{ type: 'RadiologyCategory', id }],
    }),

    // ── CREATE ────────────────────────────────────────────────────────────────
    // POST /radiology/category
    createRadiologyCategory: builder.mutation({
      query: (body) => ({
        url: '/radiology-category',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: 'RadiologyCategory', id: 'LIST' },
        { type: 'RadiologyCategory', id: 'DROPDOWN' },
      ],
    }),

    // ── FULL UPDATE (PUT) ─────────────────────────────────────────────────────
    // PUT /radiology/category/{id}
    updateRadiologyCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/radiology-category/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'RadiologyCategory', id: 'LIST' },
        { type: 'RadiologyCategory', id: 'DROPDOWN' },
        { type: 'RadiologyCategory', id },
      ],
    }),

    // ── PARTIAL UPDATE (PATCH) ────────────────────────────────────────────────
    // PATCH /radiology/category/{id} — used for toggling isActive
    patchRadiologyCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/radiology-category/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'RadiologyCategory', id: 'LIST' },
        { type: 'RadiologyCategory', id: 'DROPDOWN' },
        { type: 'RadiologyCategory', id },
      ],
    }),

    // ── SOFT DELETE ───────────────────────────────────────────────────────────
    // DELETE /radiology/category/{id}
    deleteRadiologyCategory: builder.mutation({
      query: (id) => ({
        url: `/radiology-category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'RadiologyCategory', id: 'LIST' },
        { type: 'RadiologyCategory', id: 'DROPDOWN' },
      ],
    }),

    // ── DROPDOWN HELPER ───────────────────────────────────────────────────────
    // GET /radiology/category — for the Category dropdown in Add/Edit forms
    getRadiologyCategoriesForDropdown: builder.query({
      query: () => ({
        url: '/radiology-category',
        params: { limit: 1000, isActive: true },
      }),
      providesTags: [{ type: 'RadiologyCategory', id: 'DROPDOWN' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetRadiologyCategoriesQuery,
  useGetRadiologyCategoryByIdQuery,
  useCreateRadiologyCategoryMutation,
  useUpdateRadiologyCategoryMutation,
  usePatchRadiologyCategoryMutation,
  useDeleteRadiologyCategoryMutation,
  useGetRadiologyCategoriesForDropdownQuery,
} = radiologyCategoryApi;
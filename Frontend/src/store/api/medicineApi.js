// src/store/api/medicineApi.js
import { baseApi } from './baseApi';

export const medicineApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ───────────── MEDICINE CATEGORY ─────────────

    getMedicineCategories: builder.query({
      query: () => ({
        url: '/medicine-category',
      }),

      // 🔥 SAFE RESPONSE HANDLER (ALL CASES)
      transformResponse: (res) => {
        // transformResponse for medicine categories

        // direct array
        if (Array.isArray(res)) return res;

        // common formats
        if (Array.isArray(res?.result)) return res.result;
        if (Array.isArray(res?.data)) return res.data;

        // 🔥 IMPORTANT (missing in your code)
        if (Array.isArray(res?.result?.data)) return res.result.data;
        if (Array.isArray(res?.result?.rows)) return res.result.rows;

        if (Array.isArray(res?.data?.rows)) return res.data.rows;
        if (Array.isArray(res?.rows)) return res.rows;

        return [];
      },

      // 🔥 SAFE TAGGING (NO CRASH)
      providesTags: (result) =>
        Array.isArray(result)
          ? [
            ...result.map((item) => ({
              type: 'MedicineCategory',
              id: item.id || item.category_id,
            })),
            { type: 'MedicineCategory', id: 'LIST' },
          ]
          : [{ type: 'MedicineCategory', id: 'LIST' }],
    }),

    // ───────────── GET BY ID ─────────────

    getMedicineCategoryById: builder.query({
      query: (id) => `/medicine-category/${id}`,
      transformResponse: (res) => res?.result ?? res?.data ?? res,
      providesTags: (_res, _err, id) => [
        { type: 'MedicineCategory', id },
      ],
    }),

    // ───────────── CREATE ─────────────

    createMedicineCategory: builder.mutation({
      query: (body) => ({
        url: '/medicine-category',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'MedicineCategory', id: 'LIST' }],
    }),

    // ───────────── UPDATE (PUT) ─────────────

    updateMedicineCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/medicine-category/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'MedicineCategory', id },
        { type: 'MedicineCategory', id: 'LIST' },
      ],
    }),

    // ───────────── PATCH ─────────────

    patchMedicineCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/medicine-category/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: 'MedicineCategory', id },
        { type: 'MedicineCategory', id: 'LIST' },
      ],
    }),

    // ───────────── DELETE ─────────────

    deleteMedicineCategory: builder.mutation({
      query: (id) => ({
        url: `/medicine-category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: 'MedicineCategory', id },
        { type: 'MedicineCategory', id: 'LIST' },
      ],
    }),

  }),
});

export const {
  useGetMedicineCategoriesQuery,
  useGetMedicineCategoryByIdQuery,
  useCreateMedicineCategoryMutation,
  useUpdateMedicineCategoryMutation,
  usePatchMedicineCategoryMutation,
  useDeleteMedicineCategoryMutation,
} = medicineApi;
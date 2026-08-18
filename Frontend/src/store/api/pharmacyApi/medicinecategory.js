import { baseApi } from "../baseApi";

// ── Response unwrapper ──────────────────────────────────────────────────────
// Backend envelope: { result: { data: [...], pagination: { page, limit, total, totalPages } } }
// We need to extract the data array so the frontend gets a plain list.

const unwrapCategoryList = (response) => {
  // Direct array
  if (Array.isArray(response)) return response;

  // { result: { data: [...] } }
  if (Array.isArray(response?.result?.data)) return response.result.data;

  // { result: [...] }
  if (Array.isArray(response?.result)) return response.result;

  // { data: [...] }
  if (Array.isArray(response?.data)) return response.data;

  // Fallback
  return [];
};

export const medicineCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMedicineCategories: builder.query({
      query: (params = {}) => ({
        url: "/medicine-category",
        params,
      }),
      transformResponse: unwrapCategoryList,
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({
                type: "MedicineCategory",
                id: item.id ?? item.categoryId ?? item.category_id,
              })),
              { type: "MedicineCategory", id: "LIST" },
            ]
          : [{ type: "MedicineCategory", id: "LIST" }],
    }),

    getMedicineCategoryById: builder.query({
      query: (id) => `/medicine-category/${id}`,
      providesTags: (result, error, id) => [
        { type: "MedicineCategory", id },
      ],
    }),

    createMedicineCategory: builder.mutation({
      query: (body) => ({
        url: "/medicine-category",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "MedicineCategory", id: "LIST" }],
    }),

    updateMedicineCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/medicine-category/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "MedicineCategory", id: "LIST" }],
    }),

    patchMedicineCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/medicine-category/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "MedicineCategory", id: "LIST" }],
    }),

    deleteMedicineCategory: builder.mutation({
      query: (id) => ({
        url: `/medicine-category/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "MedicineCategory", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMedicineCategoriesQuery,
  useGetMedicineCategoryByIdQuery,
  useCreateMedicineCategoryMutation,
  useUpdateMedicineCategoryMutation,
  usePatchMedicineCategoryMutation,
  useDeleteMedicineCategoryMutation,
} = medicineCategoryApi;
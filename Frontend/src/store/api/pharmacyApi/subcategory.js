import { baseApi } from "../baseApi";

export const subcategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMedicineSubcategories: builder.query({
      query: (params = {}) => ({
        url: "/medicine-subcategory",
        params,
      }),
      providesTags: [{ type: "MedicineSubCategory", id: "LIST" }],
    }),

    getMedicineSubcategoryById: builder.query({
      query: (id) => `/medicine-subcategory/${id}`,
      providesTags: (result, error, id) => [
        { type: "MedicineSubCategory", id },
      ],
    }),

    createMedicineSubcategory: builder.mutation({
      query: (body) => ({
        url: "/medicine-subcategory",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "MedicineSubCategory", id: "LIST" }],
    }),

    updateMedicineSubcategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/medicine-subcategory/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "MedicineSubCategory", id: "LIST" }],
    }),

    patchMedicineSubcategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/medicine-subcategory/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "MedicineSubCategory", id: "LIST" }],
    }),

    deleteMedicineSubcategory: builder.mutation({
      query: (id) => ({
        url: `/medicine-subcategory/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "MedicineSubCategory", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMedicineSubcategoriesQuery,
  useGetMedicineSubcategoryByIdQuery,
  useCreateMedicineSubcategoryMutation,
  useUpdateMedicineSubcategoryMutation,
  usePatchMedicineSubcategoryMutation,
  useDeleteMedicineSubcategoryMutation,
} = subcategoryApi;
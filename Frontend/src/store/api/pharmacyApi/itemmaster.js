
import { baseApi } from "../baseApi";

// ── Response unwrapper ──────────────────────────────────────────────────────
// Backend envelope: { result: { data: [...], pagination: { page, limit, total, totalPages } } }
// We need to extract the data array so the frontend gets a plain list.

const unwrapMedicineList = (response) => {
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

export const itemMasterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMedicines: builder.query({
      query: (params = {}) => ({
        url: "/medicine",
        method: "GET",
        params,
      }),
      transformResponse: unwrapMedicineList,
      providesTags: (result) =>
        result
          ? [
              ...result.map((item) => ({
                type: "Medicine",
                id: item.id ?? item.medicineId ?? item.medicine_id,
              })),
              { type: "Medicine", id: "LIST" },
            ]
          : [{ type: "Medicine", id: "LIST" }],
    }),

    getMedicineById: builder.query({
      query: (id) => ({
        url: `/medicine/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Medicine", id }],
    }),

    createMedicine: builder.mutation({
      query: (body) => ({
        url: "/medicine",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Medicine", id: "LIST" }],
    }),

    updateMedicine: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/medicine/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Medicine", id },
        { type: "Medicine", id: "LIST" },
      ],
    }),

    patchMedicine: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/medicine/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Medicine", id },
        { type: "Medicine", id: "LIST" },
      ],
    }),

    deleteMedicine: builder.mutation({
      query: (id) => ({
        url: `/medicine/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Medicine", id: "LIST" }],
    }),

    getMedicinesByCategory: builder.query({
      query: ({ categoryId, page = 1, limit = 10, search = "", status = "" }) => ({
        url: "/medicine/category",
        method: "GET",
        params: { categoryId, page, limit, ...(search && { search }), ...(status && { status }) },
      }),
      providesTags: [{ type: "Medicine", id: "CATEGORY_LIST" }],
    }),

    getMedicinesBySubCategory: builder.query({
      query: ({ subcategoryId, page = 1, limit = 10, search = "", status = "" }) => ({
        url: "/medicine/subcategory",
        method: "GET",
        params: { subcategoryId, page, limit, ...(search && { search }), ...(status && { status }) },
      }),
      providesTags: [{ type: "Medicine", id: "SUBCATEGORY_LIST" }],
    }),

    getMedicinesByCompany: builder.query({
      query: ({ companyId, page = 1, limit = 10, search = "", status = "" }) => ({
        url: "/medicine/company",
        method: "GET",
        params: { companyId, page, limit, ...(search && { search }), ...(status && { status }) },
      }),
      providesTags: [{ type: "Medicine", id: "COMPANY_LIST" }],
    }),

    getMedicinesByUnit: builder.query({
      query: ({ unitId, page = 1, limit = 10, search = "", status = "" }) => ({
        url: "/medicine/unit",
        method: "GET",
        params: { unitId, page, limit, ...(search && { search }), ...(status && { status }) },
      }),
      providesTags: [{ type: "Medicine", id: "UNIT_LIST" }],
    }),

    getMedicinesByShelf: builder.query({
      query: ({ shelfId, page = 1, limit = 10, search = "", status = "" }) => ({
        url: "/medicine/shelf",
        method: "GET",
        params: { shelfId, page, limit, ...(search && { search }), ...(status && { status }) },
      }),
      providesTags: [{ type: "Medicine", id: "SHELF_LIST" }],
    }),

  }),

  overrideExisting: false,
});

export const {
  useGetMedicinesQuery,
  useGetMedicineByIdQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  usePatchMedicineMutation,
  useDeleteMedicineMutation,
  useGetMedicinesByCategoryQuery,
  useGetMedicinesBySubCategoryQuery,
  useGetMedicinesByCompanyQuery,
  useGetMedicinesByUnitQuery,
  useGetMedicinesByShelfQuery,
} = itemMasterApi;
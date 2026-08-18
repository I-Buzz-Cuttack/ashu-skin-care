import { baseApi } from "../baseApi";

export const companyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMedicineCompanies: builder.query({
      query: (params = {}) => ({
        url: "/medicine-company",
        params,
      }),
      providesTags: [{ type: "MedicineCompany", id: "LIST" }],
    }),

    getMedicineCompanyById: builder.query({
      query: (id) => `/medicine-company/${id}`,
      providesTags: (result, error, id) => [{ type: "MedicineCompany", id }],
    }),

    createMedicineCompany: builder.mutation({
      query: (body) => ({
        url: "/medicine-company",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "MedicineCompany", id: "LIST" }],
    }),

    updateMedicineCompany: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/medicine-company/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "MedicineCompany", id: "LIST" }],
    }),

    patchMedicineCompany: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/medicine-company/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "MedicineCompany", id: "LIST" }],
    }),

    deleteMedicineCompany: builder.mutation({
      query: (id) => ({
        url: `/medicine-company/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "MedicineCompany", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMedicineCompaniesQuery,
  useGetMedicineCompanyByIdQuery,
  useCreateMedicineCompanyMutation,
  useUpdateMedicineCompanyMutation,
  usePatchMedicineCompanyMutation,
  useDeleteMedicineCompanyMutation,
} = companyApi;
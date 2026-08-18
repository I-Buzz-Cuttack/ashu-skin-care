import { baseApi } from "../baseApi";

export const unitApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMedicineUnits: builder.query({
      query: (params = {}) => ({
        url: "/medicine-unit",
        params,
      }),
      providesTags: [{ type: "MedicineUnit", id: "LIST" }],
    }),

    getMedicineUnitById: builder.query({
      query: (id) => `/medicine-unit/${id}`,
      providesTags: (result, error, id) => [{ type: "MedicineUnit", id }],
    }),

    createMedicineUnit: builder.mutation({
      query: (body) => ({
        url: "/medicine-unit",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "MedicineUnit", id: "LIST" }],
    }),

    updateMedicineUnit: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/medicine-unit/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "MedicineUnit", id: "LIST" }],
    }),

    patchMedicineUnit: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/medicine-unit/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "MedicineUnit", id: "LIST" }],
    }),

    deleteMedicineUnit: builder.mutation({
      query: (id) => ({
        url: `/medicine-unit/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "MedicineUnit", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMedicineUnitsQuery,
  useGetMedicineUnitByIdQuery,
  useCreateMedicineUnitMutation,
  useUpdateMedicineUnitMutation,
  usePatchMedicineUnitMutation,
  useDeleteMedicineUnitMutation,
} = unitApi;
import { baseApi } from "../baseApi";

export const supplierApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSuppliers: builder.query({
      query: (params = {}) => ({
        url: "/supplier",
        params,
      }),
      providesTags: [{ type: "Supplier", id: "LIST" }],
    }),

    getSupplierById: builder.query({
      query: (id) => `/supplier/${id}`,
      providesTags: (result, error, id) => [{ type: "Supplier", id }],
    }),

    createSupplier: builder.mutation({
      query: (body) => ({
        url: "/supplier",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Supplier", id: "LIST" }],
    }),

    updateSupplier: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/supplier/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "Supplier", id: "LIST" }],
    }),

    patchSupplier: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/supplier/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "Supplier", id: "LIST" }],
    }),

    deleteSupplier: builder.mutation({
      query: (id) => ({
        url: `/supplier/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Supplier", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  usePatchSupplierMutation,
  useDeleteSupplierMutation,
} = supplierApi;
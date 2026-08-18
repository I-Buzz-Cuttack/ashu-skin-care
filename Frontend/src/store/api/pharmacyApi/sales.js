import { baseApi } from "../baseApi";
import { API } from "@constants/api";

export const salesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createSale: builder.mutation({
      query: (body) => ({ url: API.PHARMACY.SALES_MASTER, method: "POST", body }),
      invalidatesTags: [{ type: "SalesMaster", id: "LIST" }],
    }),
    getSales: builder.query({
      query: (params = {}) => ({ url: API.PHARMACY.SALES_MASTER, params }),
      providesTags: [{ type: "SalesMaster", id: "LIST" }],
    }),
    getSaleById: builder.query({
      query: (id) => ({ url: `${API.PHARMACY.SALES_MASTER}/${id}` }),
      providesTags: (result, error, id) => [{ type: "SalesMaster", id }],
    }),
    deleteSale: builder.mutation({
      query: (id) => ({ url: `${API.PHARMACY.SALES_MASTER}/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "SalesMaster", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateSaleMutation,
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useDeleteSaleMutation,
} = salesApi;

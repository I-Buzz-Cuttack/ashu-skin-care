import { baseApi } from "../baseApi";
import { API } from "@constants/api";

export const returnsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseReturns: builder.query({
      query: (params = {}) => ({ url: API.PHARMACY.PURCHASE_RETURN, params }),
      providesTags: [{ type: "PurchaseReturn", id: "LIST" }],
    }),
    getPurchaseReturnById: builder.query({
      query: (id) => ({ url: `${API.PHARMACY.PURCHASE_RETURN}/${id}` }),
      providesTags: (result, error, id) => [{ type: "PurchaseReturn", id }],
    }),
    createPurchaseReturn: builder.mutation({
      query: (body) => ({ url: API.PHARMACY.PURCHASE_RETURN, method: "POST", body }),
      invalidatesTags: [{ type: "PurchaseReturn", id: "LIST" }],
    }),
    updatePurchaseReturn: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${API.PHARMACY.PURCHASE_RETURN}/${id}`, method: "PUT", body }),
      invalidatesTags: (r, e, { id }) => [{ type: "PurchaseReturn", id }, { type: "PurchaseReturn", id: "LIST" }],
    }),
    deletePurchaseReturn: builder.mutation({
      query: (id) => ({ url: `${API.PHARMACY.PURCHASE_RETURN}/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "PurchaseReturn", id: "LIST" }],
    }),

    getSalesReturns: builder.query({
      query: (params = {}) => ({ url: API.PHARMACY.SALES_RETURN, params }),
      providesTags: [{ type: "SalesReturn", id: "LIST" }],
    }),
    getSalesReturnById: builder.query({
      query: (id) => ({ url: `${API.PHARMACY.SALES_RETURN}/${id}` }),
      providesTags: (result, error, id) => [{ type: "SalesReturn", id }],
    }),
    createSalesReturn: builder.mutation({
      query: (body) => ({ url: API.PHARMACY.SALES_RETURN, method: "POST", body }),
      invalidatesTags: [{ type: "SalesReturn", id: "LIST" }],
    }),
    updateSalesReturn: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${API.PHARMACY.SALES_RETURN}/${id}`, method: "PUT", body }),
      invalidatesTags: (r, e, { id }) => [{ type: "SalesReturn", id }, { type: "SalesReturn", id: "LIST" }],
    }),
    deleteSalesReturn: builder.mutation({
      query: (id) => ({ url: `${API.PHARMACY.SALES_RETURN}/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "SalesReturn", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPurchaseReturnsQuery,
  useGetPurchaseReturnByIdQuery,
  useCreatePurchaseReturnMutation,
  useUpdatePurchaseReturnMutation,
  useDeletePurchaseReturnMutation,
  useGetSalesReturnsQuery,
  useGetSalesReturnByIdQuery,
  useCreateSalesReturnMutation,
  useUpdateSalesReturnMutation,
  useDeleteSalesReturnMutation,
} = returnsApi;

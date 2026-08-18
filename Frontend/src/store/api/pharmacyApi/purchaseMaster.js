import { baseApi } from "../baseApi";
import { API } from "@constants/api";

export const purchaseMasterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchases: builder.query({
      query: (params = {}) => ({ url: API.PHARMACY.PURCHASE_MASTER, params }),
      providesTags: [{ type: "PurchaseMaster", id: "LIST" }],
    }),
    getPurchaseById: builder.query({
      query: (id) => ({ url: `${API.PHARMACY.PURCHASE_MASTER}/${id}` }),
      providesTags: (result, error, id) => [{ type: "PurchaseMaster", id }],
    }),
    createPurchaseMaster: builder.mutation({
      query: (body) => ({ url: API.PHARMACY.PURCHASE_MASTER, method: "POST", body }),
      invalidatesTags: [{ type: "PurchaseMaster", id: "LIST" }],
    }),
    deletePurchaseMaster: builder.mutation({
      query: (id) => ({ url: `${API.PHARMACY.PURCHASE_MASTER}/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "PurchaseMaster", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPurchasesQuery,
  useGetPurchaseByIdQuery,
  useCreatePurchaseMasterMutation,
  useDeletePurchaseMasterMutation,
} = purchaseMasterApi;

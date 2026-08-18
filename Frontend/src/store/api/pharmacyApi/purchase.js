import { baseApi } from "../baseApi";

export const purchaseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseMedicines: builder.query({
      query: (params = {}) => ({
        url: "/purchase-medicine",
        params,
      }),
      providesTags: [{ type: "PurchaseMedicine", id: "LIST" }],
    }),

    getPurchaseMedicineById: builder.query({
      query: (id) => `/purchase-medicine/${id}`,
      providesTags: (result, error, id) => [{ type: "PurchaseMedicine", id }],
    }),

    createPurchaseMedicine: builder.mutation({
      query: (body) => ({
        url: "/purchase-medicine",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "PurchaseMedicine", id: "LIST" }],
    }),

    updatePurchaseMedicine: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-medicine/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "PurchaseMedicine", id: "LIST" }],
    }),

    patchPurchaseMedicine: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-medicine/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "PurchaseMedicine", id: "LIST" }],
    }),

    deletePurchaseMedicine: builder.mutation({
      query: (id) => ({
        url: `/purchase-medicine/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "PurchaseMedicine", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPurchaseMedicinesQuery,
  useGetPurchaseMedicineByIdQuery,
  useCreatePurchaseMedicineMutation,
  useUpdatePurchaseMedicineMutation,
  usePatchPurchaseMedicineMutation,
  useDeletePurchaseMedicineMutation,
} = purchaseApi;
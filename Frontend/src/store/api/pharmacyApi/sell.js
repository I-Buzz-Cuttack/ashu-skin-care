import { baseApi } from "../baseApi";

export const sellApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSellMedicines: builder.query({
      query: (params = {}) => ({
        url: "/sell-medicine",
        params,
      }),
      providesTags: [{ type: "Medicine", id: "LIST" }],
    }),

    getSellMedicineById: builder.query({
      query: (id) => `/sell-medicine/${id}`,
      providesTags: (result, error, id) => [{ type: "Medicine", id }],
    }),

    createSellMedicine: builder.mutation({
      query: (body) => ({
        url: "/sell-medicine",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Medicine", id: "LIST" }],
    }),

    createSalesMaster: builder.mutation({
      query: (body) => ({
        url: "/sales-master",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Medicine", id: "LIST" }],
    }),

    updateSellMedicine: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/sell-medicine/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "Medicine", id: "LIST" }],
    }),

    patchSellMedicine: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/sell-medicine/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "Medicine", id: "LIST" }],
    }),

    deleteSellMedicine: builder.mutation({
      query: (id) => ({
        url: `/sell-medicine/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Medicine", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSellMedicinesQuery,
  useGetSellMedicineByIdQuery,
  useCreateSellMedicineMutation,
  useUpdateSellMedicineMutation,
  usePatchSellMedicineMutation,
  useDeleteSellMedicineMutation,
  useCreateSalesMasterMutation,
} = sellApi;

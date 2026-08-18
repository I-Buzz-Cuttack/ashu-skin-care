// src/store/api/pathologyApi/pathologyOrderItem.js
import { baseApi } from '../baseApi';

export const pathologyOrderItemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET ALL
    getPathologyOrderItems: builder.query({
      query: (params = {}) => ({
        url: '/pathology-order-item',
        params,
      }),
      transformResponse: (response) => response?.result || response,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: 'PathologyOrderItem',
                id,
              })),
              { type: 'PathologyOrderItem', id: 'LIST' },
            ]
          : [{ type: 'PathologyOrderItem', id: 'LIST' }],
    }),

    // 🔹 GET BY ID
    getPathologyOrderItemById: builder.query({
      query: (id) => `/pathology-order-item/${id}`,
      transformResponse: (response) => response?.result || response,
      providesTags: (_, __, id) => [{ type: 'PathologyOrderItem', id }],
    }),

    // 🔹 GET ITEMS BY ORDER ID
    getPathologyOrderItemsByOrderId: builder.query({
      query: (orderId) => `/pathology-order-item/order/${orderId}`,
      transformResponse: (response) => response?.result || { data: response?.data || response },
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({
                type: 'PathologyOrderItem',
                id,
              })),
              { type: 'PathologyOrderItem', id: 'BY_ORDER' },
            ]
          : [{ type: 'PathologyOrderItem', id: 'BY_ORDER' }],
    }),

    // 🔹 GET ITEMS BY STATUS
    getPathologyOrderItemsByStatus: builder.query({
      query: (itemStatus) => `/pathology-order-item/status/${itemStatus}`,
      transformResponse: (response) => response?.result || { data: response?.data || response },
      providesTags: [{ type: 'PathologyOrderItem', id: 'BY_STATUS' }],
    }),

    // 🔹 SEARCH
    searchPathologyOrderItems: builder.query({
      query: (params = {}) => ({
        url: '/pathology-order-item/search',
        params,
      }),
      transformResponse: (response) => response?.result || { data: response?.data || response },
      providesTags: [{ type: 'PathologyOrderItem', id: 'LIST' }],
    }),

    // 🔹 CREATE SINGLE
    createPathologyOrderItem: builder.mutation({
      query: (body) => ({
        url: '/pathology-order-item',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PathologyOrderItem', id: 'LIST' }],
    }),

    // 🔹 CREATE BULK
    createPathologyOrderItemsBulk: builder.mutation({
      query: (body) => ({
        url: '/pathology-order-item/bulk',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PathologyOrderItem', id: 'LIST' }],
    }),

    // 🔹 FULL UPDATE (PUT)
    updatePathologyOrderItem: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-order-item/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'PathologyOrderItem', id },
        { type: 'PathologyOrderItem', id: 'LIST' },
      ],
    }),

    // 🔹 PARTIAL UPDATE (PATCH)
    patchPathologyOrderItem: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-order-item/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'PathologyOrderItem', id },
        { type: 'PathologyOrderItem', id: 'LIST' },
      ],
    }),

    // 🔹 UPDATE ITEM STATUS (with result data)
    updatePathologyOrderItemStatus: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-order-item/${id}/status`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'PathologyOrderItem', id },
        { type: 'PathologyOrderItem', id: 'LIST' },
      ],
    }),

    // 🔹 CANCEL ITEM
    cancelPathologyOrderItem: builder.mutation({
      query: (id) => ({
        url: `/pathology-order-item/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: (_, __, id) => [
        { type: 'PathologyOrderItem', id },
        { type: 'PathologyOrderItem', id: 'LIST' },
      ],
    }),

    // 🔹 DELETE
    deletePathologyOrderItem: builder.mutation({
      query: (id) => ({
        url: `/pathology-order-item/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'PathologyOrderItem', id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetPathologyOrderItemsQuery,
  useGetPathologyOrderItemByIdQuery,
  useGetPathologyOrderItemsByOrderIdQuery,
  useGetPathologyOrderItemsByStatusQuery,
  useSearchPathologyOrderItemsQuery,
  useCreatePathologyOrderItemMutation,
  useCreatePathologyOrderItemsBulkMutation,
  useUpdatePathologyOrderItemMutation,
  usePatchPathologyOrderItemMutation,
  useUpdatePathologyOrderItemStatusMutation,
  useCancelPathologyOrderItemMutation,
  useDeletePathologyOrderItemMutation,
} = pathologyOrderItemApi;
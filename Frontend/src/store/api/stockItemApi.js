import { baseApi } from './baseApi';

const transformPaginatedResponse = (response) => {
  if (response?.result?.data) {
    return {
      data: response.result.data,
      total: response.result.pagination?.total || 0,
      page: response.result.pagination?.page || 1,
      limit: response.result.pagination?.limit || 10,
      totalPages: response.result.pagination?.totalPages || 0,
    };
  }

  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length,
      page: 1,
      limit: response.length,
      totalPages: 1,
    };
  }

  return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
};

export const stockItemApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockItems: builder.query({
      query: (params = {}) => ({
        url: '/stock-items',
        params,
      }),
      transformResponse: transformPaginatedResponse,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'StockItem', id })),
              { type: 'StockItem', id: 'LIST' },
            ]
          : [{ type: 'StockItem', id: 'LIST' }],
    }),

    searchStockItems: builder.query({
      query: (params = {}) => ({
        url: '/stock-items/search',
        params,
      }),
      transformResponse: transformPaginatedResponse,
      providesTags: [{ type: 'StockItem', id: 'LIST' }],
    }),

    getStockItemById: builder.query({
      query: (id) => ({
        url: `/stock-items/${id}`,
      }),
      providesTags: (_, __, id) => [{ type: 'StockItem', id }],
    }),

    createStockItem: builder.mutation({
      query: (body) => ({
        url: '/stock-items',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'StockItem', id: 'LIST' }],
    }),

    updateStockItem: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/stock-items/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'StockItem', id },
        { type: 'StockItem', id: 'LIST' },
      ],
    }),

    patchStockItem: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/stock-items/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'StockItem', id },
        { type: 'StockItem', id: 'LIST' },
      ],
    }),

    deleteStockItem: builder.mutation({
      query: (id) => ({
        url: `/stock-items/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'StockItem', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStockItemsQuery,
  useSearchStockItemsQuery,
  useGetStockItemByIdQuery,
  useCreateStockItemMutation,
  useUpdateStockItemMutation,
  usePatchStockItemMutation,
  useDeleteStockItemMutation,
} = stockItemApi;
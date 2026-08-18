import { baseApi } from './baseApi';

const transformPaginatedResponse = (response) => {
  if (response?.result?.data) {
    return {
      data: response.result.data,
      total: response.result.pagination?.total || 0,
      page: response.result.pagination?.page || 1,
      limit: response.result.pagination?.limit || 10,
      totalPages: response.result.pagination?.totalPages || 1,
    };
  }

  if (response?.data) {
    return {
      data: response.data,
      total: response.data.length,
      page: 1,
      limit: response.data.length,
      totalPages: 1,
    };
  }

  return {
    data: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };
};

export const outstockApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOutStocks: builder.query({
      query: (params = {}) => ({ url: '/out-stocks', params }),
      transformResponse: transformPaginatedResponse,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'OutStock', id })),
              { type: 'OutStock', id: 'LIST' },
            ]
          : [{ type: 'OutStock', id: 'LIST' }],
    }),
    getOutStockById: builder.query({
      query: (id) => `/out-stocks/${id}`,
      providesTags: (_, __, id) => [{ type: 'OutStock', id }],
    }),
    createOutStock: builder.mutation({
      query: (body) => ({
        url: '/out-stocks',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'OutStock', id: 'LIST' }, { type: 'StockMaster', id: 'LIST' }],
    }),
    updateOutStock: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/out-stocks/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'OutStock', id },
        { type: 'OutStock', id: 'LIST' },
        { type: 'StockMaster', id: 'LIST' },
      ],
    }),
    deleteOutStock: builder.mutation({
      query: (id) => ({
        url: `/out-stocks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'OutStock', id: 'LIST' }, { type: 'StockMaster', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOutStocksQuery,
  useGetOutStockByIdQuery,
  useCreateOutStockMutation,
  useUpdateOutStockMutation,
  useDeleteOutStockMutation,
} = outstockApi;

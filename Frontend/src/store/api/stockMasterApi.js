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
  return { data: [], total: 0, page: 1, limit: 10, totalPages: 1 };
};

export const stockMasterApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStockMasters: builder.query({
      query: (params = {}) => ({ url: '/stock-masters', params }),
      transformResponse: transformPaginatedResponse,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'StockMaster', id })),
              { type: 'StockMaster', id: 'LIST' },
            ]
          : [{ type: 'StockMaster', id: 'LIST' }],
    }),
    searchStockMasters: builder.query({
      query: (params = {}) => ({ url: '/stock-masters/search', params }),
      transformResponse: transformPaginatedResponse,
    }),
    getStockMasterById: builder.query({
      query: (id) => `/stock-masters/${id}`,
      providesTags: (_, __, id) => [{ type: 'StockMaster', id }],
    }),
    createStockMaster: builder.mutation({
      query: (data) => ({
        url: '/stock-masters',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: 'StockMaster', id: 'LIST' }],
    }),
    updateStockMaster: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/stock-masters/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'StockMaster', id }],
    }),
    patchStockMaster: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/stock-masters/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_, __, { id }) => [{ type: 'StockMaster', id }],
    }),
    deleteStockMaster: builder.mutation({
      query: (id) => ({
        url: `/stock-masters/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'StockMaster', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetStockMastersQuery,
  useSearchStockMastersQuery,
  useGetStockMasterByIdQuery,
  useCreateStockMasterMutation,
  useUpdateStockMasterMutation,
  usePatchStockMasterMutation,
  useDeleteStockMasterMutation,
} = stockMasterApi;
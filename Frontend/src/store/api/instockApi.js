import { baseApi } from './baseApi';
import { API } from '../../constants/api';

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

export const instockApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInStocks: builder.query({
      query: (params = {}) => ({ url: API.IN_STOCKS, params }),
      transformResponse: transformPaginatedResponse,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'InStock', id })),
              { type: 'InStock', id: 'LIST' },
            ]
          : [{ type: 'InStock', id: 'LIST' }],
    }),
    getInStockById: builder.query({
      query: (id) => `${API.IN_STOCKS}/${id}`,
      providesTags: (_, __, id) => [{ type: 'InStock', id }],
    }),
    createInStock: builder.mutation({
      query: (body) => ({ url: API.IN_STOCKS, method: 'POST', body }),
      invalidatesTags: [{ type: 'InStock', id: 'LIST' }],
    }),
    updateInStock: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${API.IN_STOCKS}/${id}`, method: 'PUT', body }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'InStock', id },
        { type: 'InStock', id: 'LIST' },
      ],
    }),
    patchInStock: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${API.IN_STOCKS}/${id}`, method: 'PATCH', body }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'InStock', id },
        { type: 'InStock', id: 'LIST' },
      ],
    }),
    deleteInStock: builder.mutation({
      query: (id) => ({ url: `${API.IN_STOCKS}/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'InStock', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetInStocksQuery,
  useGetInStockByIdQuery,
  useCreateInStockMutation,
  useUpdateInStockMutation,
  usePatchInStockMutation,
  useDeleteInStockMutation,
} = instockApi;

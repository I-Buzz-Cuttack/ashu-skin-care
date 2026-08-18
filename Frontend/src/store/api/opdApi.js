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

export const opdApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOpdCategories: builder.query({
      query: (params = {}) => ({
        url: '/opd-charge-categories',
        params,
      }),
      transformResponse: transformPaginatedResponse,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'OpdCategory', id })),
              { type: 'OpdCategory', id: 'LIST' },
            ]
          : [{ type: 'OpdCategory', id: 'LIST' }],
    }),

    createOpdCategory: builder.mutation({
      query: (body) => ({
        url: '/opd-charge-categories',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'OpdCategory', id: 'LIST' }],
    }),

    updateOpdCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/opd-charge-categories/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'OpdCategory', id },
        { type: 'OpdCategory', id: 'LIST' },
        { type: 'OpdCharge', id: 'LIST' },
      ],
    }),

    deleteOpdCategory: builder.mutation({
      query: (id) => ({
        url: `/opd-charge-categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [
        { type: 'OpdCategory', id: 'LIST' },
        { type: 'OpdCharge', id: 'LIST' },
      ],
    }),

    getOpdCharges: builder.query({
      query: (params = {}) => ({
        url: '/opd-consultation-charges',
        params,
      }),
      transformResponse: transformPaginatedResponse,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'OpdCharge', id })),
              { type: 'OpdCharge', id: 'LIST' },
            ]
          : [{ type: 'OpdCharge', id: 'LIST' }],
    }),

    createOpdCharge: builder.mutation({
      query: (body) => ({
        url: '/opd-consultation-charges',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'OpdCharge', id: 'LIST' }],
    }),

    updateOpdCharge: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/opd-consultation-charges/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'OpdCharge', id },
        { type: 'OpdCharge', id: 'LIST' },
      ],
    }),

    deleteOpdCharge: builder.mutation({
      query: (id) => ({
        url: `/opd-consultation-charges/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'OpdCharge', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetOpdCategoriesQuery,
  useCreateOpdCategoryMutation,
  useUpdateOpdCategoryMutation,
  useDeleteOpdCategoryMutation,
  useGetOpdChargesQuery,
  useCreateOpdChargeMutation,
  useUpdateOpdChargeMutation,
  useDeleteOpdChargeMutation,
} = opdApi;

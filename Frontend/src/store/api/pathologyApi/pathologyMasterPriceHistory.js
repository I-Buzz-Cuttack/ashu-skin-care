import { baseApi } from '../baseApi';

export const pathologyMasterPriceHistoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET ALL
    getPathologyMasterPriceHistories: builder.query({
      query: (params = {}) => ({
        url: '/pathology-master-price-history',
        params,
      }),
      providesTags: (result) =>
        result?.result?.data
          ? [
              ...result.result.data.map(({ id }) => ({
                type: 'PathologyMasterPriceHistory',
                id,
              })),
              { type: 'PathologyMasterPriceHistory', id: 'LIST' },
            ]
          : [{ type: 'PathologyMasterPriceHistory', id: 'LIST' }],
    }),

    // 🔹 GET BY ID
    getPathologyMasterPriceHistoryById: builder.query({
      query: (id) => `/pathology-master-price-history/${id}`,
      providesTags: (_, __, id) => [{ type: 'PathologyMasterPriceHistory', id }],
    }),

    // 🔹 GET BY MASTER ID
    getPathologyMasterPriceHistoryByMasterId: builder.query({
      query: (masterId) => `/pathology-master-price-history/master/${masterId}`,
      providesTags: (_, __, masterId) => [
        { type: 'PathologyMasterPriceHistory', id: `MASTER_${masterId}` },
        { type: 'PathologyMasterPriceHistory', id: 'LIST' },
      ],
    }),

    // 🔹 SEARCH
    searchPathologyMasterPriceHistories: builder.query({
      query: (params = {}) => ({
        url: '/pathology-master-price-history/search',
        params,
      }),
      providesTags: [{ type: 'PathologyMasterPriceHistory', id: 'LIST' }],
    }),

    // 🔹 CREATE
    createPathologyMasterPriceHistory: builder.mutation({
      query: (body) => ({
        url: '/pathology-master-price-history',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PathologyMasterPriceHistory', id: 'LIST' }],
    }),

    // 🔹 FULL UPDATE
    updatePathologyMasterPriceHistory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-master-price-history/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ({ id } = {}) => [
        { type: 'PathologyMasterPriceHistory', id: 'LIST' },
        { type: 'PathologyMasterPriceHistory', id },
      ],
    }),

    // 🔹 PARTIAL UPDATE (PATCH)
    patchPathologyMasterPriceHistory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-master-price-history/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ({ id } = {}) => [
        { type: 'PathologyMasterPriceHistory', id: 'LIST' },
        { type: 'PathologyMasterPriceHistory', id },
      ],
    }),

    // 🔹 DELETE
    deletePathologyMasterPriceHistory: builder.mutation({
      query: (id) => ({
        url: `/pathology-master-price-history/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'PathologyMasterPriceHistory', id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetPathologyMasterPriceHistoriesQuery,
  useGetPathologyMasterPriceHistoryByIdQuery,
  useGetPathologyMasterPriceHistoryByMasterIdQuery,
  useSearchPathologyMasterPriceHistoriesQuery,
  useCreatePathologyMasterPriceHistoryMutation,
  useUpdatePathologyMasterPriceHistoryMutation,
  usePatchPathologyMasterPriceHistoryMutation,
  useDeletePathologyMasterPriceHistoryMutation,
} = pathologyMasterPriceHistoryApi;
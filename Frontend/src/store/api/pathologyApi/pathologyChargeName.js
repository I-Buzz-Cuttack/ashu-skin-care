import { baseApi } from '../baseApi';

export const pathologyChargeNameApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPathologyChargeNames: builder.query({
      query: (params = {}) => ({
        url: '/pathology-charge-name',
        params,
      }),
      providesTags: (result) =>
        result?.result?.data
          ? [
              ...result.result.data.map(({ id }) => ({
                type: 'PathologyChargeName',
                id,
              })),
              { type: 'PathologyChargeName', id: 'LIST' },
            ]
          : [{ type: 'PathologyChargeName', id: 'LIST' }],
    }),

    getPathologyChargeNameById: builder.query({
      query: (id) => ({
        url: `/pathology-charge-name/${id}`,
      }),
      providesTags: (result, error, id) => [
        { type: 'PathologyChargeName', id },
      ],
    }),

    getPathologyChargeNamesByCategory: builder.query({
      query: ({ categoryId, ...params }) => ({
        url: `/pathology-charge-name/category/${categoryId}`,
        params,
      }),
      providesTags: [{ type: 'PathologyChargeName', id: 'LIST' }],
    }),

    createPathologyChargeName: builder.mutation({
      query: (body) => ({
        url: '/pathology-charge-name',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PathologyChargeName', id: 'LIST' }],
    }),

    updatePathologyChargeName: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-charge-name/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PathologyChargeName', id },
        { type: 'PathologyChargeName', id: 'LIST' },
      ],
    }),

    deletePathologyChargeName: builder.mutation({
      query: (id) => ({
        url: `/pathology-charge-name/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'PathologyChargeName', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPathologyChargeNamesQuery,
  useGetPathologyChargeNameByIdQuery,
  useGetPathologyChargeNamesByCategoryQuery,
  useCreatePathologyChargeNameMutation,
  useUpdatePathologyChargeNameMutation,
  useDeletePathologyChargeNameMutation,
} = pathologyChargeNameApi;
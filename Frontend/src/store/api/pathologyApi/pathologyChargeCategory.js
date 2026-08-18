import { baseApi } from '../baseApi';

export const pathologyChargeCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET ALL (with pagination, search, filter)
    getPathologyChargeCategories: builder.query({
      query: (params = {}) => ({
        url: '/pathology-charge-category',
        params,
      }),
      providesTags: (result) =>
        result?.result?.data
          ? [
              ...result.result.data.map(({ id }) => ({
                type: 'PathologyChargeCategory',
                id,
              })),
              { type: 'PathologyChargeCategory', id: 'LIST' },
            ]
          : [{ type: 'PathologyChargeCategory', id: 'LIST' }],
    }),

    // 🔹 GET BY ID
    getPathologyChargeCategoryById: builder.query({
      query: (id) => `/pathology-charge-category/${id}`,
      providesTags: (_, __, id) => [{ type: 'PathologyChargeCategory', id }],
    }),

    // 🔹 SEARCH
    searchPathologyChargeCategories: builder.query({
      query: ({ term, ...params } = {}) => ({
        url: '/pathology-charge-category/search',
        params: {
          ...params,
          search: params.search ?? term,
        },
      }),
      providesTags: [{ type: 'PathologyChargeCategory', id: 'LIST' }],
    }),

    // 🔹 CREATE
    createPathologyChargeCategory: builder.mutation({
      query: (body) => ({
        url: '/pathology-charge-category',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PathologyChargeCategory', id: 'LIST' }],
    }),

    // 🔹 UPDATE
    updatePathologyChargeCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-charge-category/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ({ id } = {}) => [
        { type: 'PathologyChargeCategory', id: 'LIST' },
        { type: 'PathologyChargeCategory', id },
      ],
    }),

    // 🔹 PARTIAL UPDATE (PATCH)
    patchPathologyChargeCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-charge-category/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ({ id } = {}) => [
        { type: 'PathologyChargeCategory', id: 'LIST' },
        { type: 'PathologyChargeCategory', id },
      ],
    }),

    // 🔹 DELETE (soft delete)
    deletePathologyChargeCategory: builder.mutation({
      query: (id) => ({
        url: `/pathology-charge-category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'PathologyChargeCategory', id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetPathologyChargeCategoriesQuery,
  useGetPathologyChargeCategoryByIdQuery,
  useSearchPathologyChargeCategoriesQuery,
  useCreatePathologyChargeCategoryMutation,
  useUpdatePathologyChargeCategoryMutation,
  usePatchPathologyChargeCategoryMutation,
  useDeletePathologyChargeCategoryMutation,
} = pathologyChargeCategoryApi;

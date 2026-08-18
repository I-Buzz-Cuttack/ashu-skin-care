import { baseApi } from '../baseApi';

export const pathologyCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET ALL
    getPathologyCategories: builder.query({
      query: (params = {}) => ({
        url: '/pathology-category',
        params,
      }),
      providesTags: (result) =>
        result?.result?.data
          ? [
              ...result.result.data.map(({ id }) => ({
                type: 'PathologyCategory',
                id,
              })),
              { type: 'PathologyCategory', id: 'LIST' },
            ]
          : [{ type: 'PathologyCategory', id: 'LIST' }],
    }),

    // 🔹 GET BY ID
    getPathologyCategoryById: builder.query({
      query: (id) => `/pathology-category/${id}`,
      providesTags: (_, __, id) => [{ type: 'PathologyCategory', id }],
    }),

    // 🔹 SEARCH
    searchPathologyCategories: builder.query({
      query: ({ term, ...params } = {}) => ({
        url: '/pathology-category/search',
        params: {
          ...params,
          search: params.search ?? term,
        },
      }),
      providesTags: [{ type: 'PathologyCategory', id: 'LIST' }],
    }),

    // 🔹 CREATE
    createPathologyCategory: builder.mutation({
      query: (body) => ({
        url: '/pathology-category',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PathologyCategory', id: 'LIST' }],
    }),

    // 🔹 FULL UPDATE
    updatePathologyCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-category/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ({ id } = {}) => [
        { type: 'PathologyCategory', id: 'LIST' },
        { type: 'PathologyCategory', id },
      ],
    }),

    // 🔹 PARTIAL UPDATE (PATCH)
    patchPathologyCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-category/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ({ id } = {}) => [
        { type: 'PathologyCategory', id: 'LIST' },
        { type: 'PathologyCategory', id },
      ],
    }),

    // 🔹 DELETE
    deletePathologyCategory: builder.mutation({
      query: (id) => ({
        url: `/pathology-category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'PathologyCategory', id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetPathologyCategoriesQuery,
  useGetPathologyCategoryByIdQuery,
  useSearchPathologyCategoriesQuery,
  useCreatePathologyCategoryMutation,
  useUpdatePathologyCategoryMutation,
  usePatchPathologyCategoryMutation,
  useDeletePathologyCategoryMutation,
} = pathologyCategoryApi;

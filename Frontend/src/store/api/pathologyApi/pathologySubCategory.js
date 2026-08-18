import { baseApi } from '../baseApi';

export const pathologySubCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET ALL
    getPathologySubCategories: builder.query({
      query: (params = {}) => ({
        url: '/pathology-sub-category',
        params,
      }),
      providesTags: (result) =>
        result?.result?.data
          ? [
              ...result.result.data.map(({ id }) => ({
                type: 'PathologySubCategory',
                id,
              })),
              { type: 'PathologySubCategory', id: 'LIST' },
            ]
          : [{ type: 'PathologySubCategory', id: 'LIST' }],
    }),

    // 🔹 GET BY ID
    getPathologySubCategoryById: builder.query({
      query: (id) => `/pathology-sub-category/${id}`,
      providesTags: (_, __, id) => [{ type: 'PathologySubCategory', id }],
    }),

    // 🔹 SEARCH
    searchPathologySubCategories: builder.query({
      query: ({ term, ...params } = {}) => ({
        url: '/pathology-sub-category/search',
        params: {
          ...params,
          search: params.search ?? term,
        },
      }),
      providesTags: [{ type: 'PathologySubCategory', id: 'LIST' }],
    }),

    // 🔹 CREATE
    createPathologySubCategory: builder.mutation({
      query: (body) => ({
        url: '/pathology-sub-category',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'PathologySubCategory', id: 'LIST' }],
    }),

    // 🔹 FULL UPDATE
    updatePathologySubCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-sub-category/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ({ id } = {}) => [
        { type: 'PathologySubCategory', id: 'LIST' },
        { type: 'PathologySubCategory', id },
      ],
    }),

    // 🔹 PARTIAL UPDATE (PATCH)
    patchPathologySubCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/pathology-sub-category/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ({ id } = {}) => [
        { type: 'PathologySubCategory', id: 'LIST' },
        { type: 'PathologySubCategory', id },
      ],
    }),

    // 🔹 DELETE
    deletePathologySubCategory: builder.mutation({
      query: (id) => ({
        url: `/pathology-sub-category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'PathologySubCategory', id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetPathologySubCategoriesQuery,
  useGetPathologySubCategoryByIdQuery,
  useSearchPathologySubCategoriesQuery,
  useCreatePathologySubCategoryMutation,
  useUpdatePathologySubCategoryMutation,
  usePatchPathologySubCategoryMutation,
  useDeletePathologySubCategoryMutation,
} = pathologySubCategoryApi;
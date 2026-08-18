import { baseApi } from '../baseApi';

export const radiologyChargeCategoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET ALL (with pagination, search, filter)
    getRadiologyChargeCategories: builder.query({
      query: (params = {}) => ({
        url: '/radiology/charge-category',
        params,
      }),
      providesTags: (result) =>
        result?.result?.data
          ? [
              ...result.result.data.map(({ id }) => ({
                type: 'RadiologyChargeCategory',
                id,
              })),
              { type: 'RadiologyChargeCategory', id: 'LIST' },
            ]
          : [{ type: 'RadiologyChargeCategory', id: 'LIST' }],
    }),

    // 🔹 GET BY ID
    getRadiologyChargeCategoryById: builder.query({
      query: (id) => `/radiology/charge-category/${id}`,
      providesTags: (_, __, id) => [{ type: 'RadiologyChargeCategory', id }],
    }),

    // 🔹 CREATE
    createRadiologyChargeCategory: builder.mutation({
      query: (body) => ({
        url: '/radiology/charge-category',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'RadiologyChargeCategory', id: 'LIST' }],
    }),

    // 🔹 UPDATE
    updateRadiologyChargeCategory: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/radiology/charge-category/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: ({ id } = {}) => [
        { type: 'RadiologyChargeCategory', id: 'LIST' },
        { type: 'RadiologyChargeCategory', id },
      ],
    }),

    // 🔹 DELETE (soft delete)
    deleteRadiologyChargeCategory: builder.mutation({
      query: (id) => ({
        url: `/radiology/charge-category/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'RadiologyChargeCategory', id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetRadiologyChargeCategoriesQuery,
  useGetRadiologyChargeCategoryByIdQuery,
  useCreateRadiologyChargeCategoryMutation,
  useUpdateRadiologyChargeCategoryMutation,
  useDeleteRadiologyChargeCategoryMutation,
} = radiologyChargeCategoryApi;
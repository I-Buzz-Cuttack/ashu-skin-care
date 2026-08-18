import { baseApi } from '../baseApi';

export const radiologyChargeNameApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // 🔹 GET ALL
    getChargeNames: builder.query({
      query: (params = {}) => ({
        url: '/radiology/charge-name',
        params,
      }),
      providesTags: (result) =>
        result?.result?.data
          ? [
              ...result.result.data.map(({ id }) => ({
                type: 'RadiologyChargeName',
                id,
              })),
              { type: 'RadiologyChargeName', id: 'LIST' },
            ]
          : [{ type: 'RadiologyChargeName', id: 'LIST' }],
    }),

    // 🔹 GET BY CATEGORY
    getChargeNamesByCategory: builder.query({
      query: (categoryId) => `/radiology/charge-name/category/${categoryId}`,
    }),

    // 🔹 GET BY ID
    getChargeNameById: builder.query({
      query: (id) => `/radiology/charge-name/${id}`,
    }),

    // 🔹 CREATE
    createChargeName: builder.mutation({
      query: (body) => ({
        url: '/radiology/charge-name',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'RadiologyChargeName', id: 'LIST' }],
    }),

    // 🔹 UPDATE
    updateChargeName: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/radiology/charge-name/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: [{ type: 'RadiologyChargeName', id: 'LIST' }],
    }),

    // 🔹 DELETE
    deleteChargeName: builder.mutation({
      query: (id) => ({
        url: `/radiology/charge-name/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'RadiologyChargeName', id: 'LIST' }],
    }),

  }),
});

export const {
  useGetChargeNamesQuery,
  useCreateChargeNameMutation,
  useUpdateChargeNameMutation,
  useDeleteChargeNameMutation,
} = radiologyChargeNameApi;
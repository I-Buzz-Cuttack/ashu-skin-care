// store/api/shelfApi.js

import { baseApi } from './baseApi';

const shelfApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getShelves: builder.query({
      query: (params) => ({ url: '/shelf-master', params }),
      transformResponse: (res) => res?.result?.data ?? [],
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Shelf', id })),
              { type: 'Shelf', id: 'LIST' },
            ]
          : [{ type: 'Shelf', id: 'LIST' }],
    }),
    getShelfById: builder.query({
      query: (id) => `/shelf-master/${id}`,
      transformResponse: (res) => res?.result ?? res?.data ?? res,
      providesTags: (_result, _err, id) => [{ type: 'Shelf', id }],
    }),
    createShelf: builder.mutation({
      query: (data) => ({
        url: '/shelf-master',
        method: 'POST',
        body: data,
      }),
      transformResponse: (res) => res?.result ?? res?.data ?? res,
      invalidatesTags: [{ type: 'Shelf', id: 'LIST' }],
    }),
    updateShelf: builder.mutation({
      query: ({ id, data }) => ({
        url: `/shelf-master/${id}`,
        method: 'PUT',
        body: data,
      }),
      transformResponse: (res) => res?.result ?? res?.data ?? res,
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Shelf', id },
        { type: 'Shelf', id: 'LIST' },
      ],
    }),
    toggleShelfStatus: builder.mutation({
      query: ({ id, isActive }) => ({
        url: `/shelf-master/${id}`,
        method: 'PATCH',
        body: { isActive },
      }),
      transformResponse: (res) => res?.result ?? res?.data ?? res,
      invalidatesTags: (_result, _err, { id }) => [
        { type: 'Shelf', id },
        { type: 'Shelf', id: 'LIST' },
      ],
    }),
    deleteShelf: builder.mutation({
      query: (id) => ({
        url: `/shelf-master/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'Shelf', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetShelvesQuery,
  useGetShelfByIdQuery,
  useCreateShelfMutation,
  useUpdateShelfMutation,
  useToggleShelfStatusMutation,
  useDeleteShelfMutation,
} = shelfApi;
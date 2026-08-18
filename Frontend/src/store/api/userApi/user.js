import { baseApi } from '../baseApi';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── GET ALL USERS (pagination + search) ──────────────────────────────
    getUsers: builder.query({
      query: (params = {}) => ({
        url: '/user',
        params,                       // page, limit, search forwarded as-is
      }),
      transformResponse: (response) => {
        // Shape: { result: { data: [], pagination: {} } }
        if (response?.result?.data) {
          return {
            data:       response.result.data,
            total:      response.result.pagination?.total      || 0,
            page:       response.result.pagination?.page       || 1,
            limit:      response.result.pagination?.limit      || 10,
            totalPages: response.result.pagination?.totalPages || 0,
          };
        }
        // Fallback: plain array
        if (Array.isArray(response)) {
          return {
            data:       response,
            total:      response.length,
            page:       1,
            limit:      response.length,
            totalPages: 1,
          };
        }
        // Fallback: { users, total } or { data, total }
        const list = response?.users ?? response?.data ?? [];
        return {
          data:       list,
          total:      response?.total ?? response?.count ?? list.length,
          page:       response?.page  ?? 1,
          limit:      response?.limit ?? 10,
          totalPages: response?.totalPages ?? 1,
        };
      },
      providesTags: (result) => {
        if (result?.data && Array.isArray(result.data)) {
          return [
            ...result.data.map(({ id }) => ({ type: 'User', id })),
            { type: 'User', id: 'LIST' },
          ];
        }
        return [{ type: 'User', id: 'LIST' }];
      },
    }),

    // ── GET USER BY ID ───────────────────────────────────────────────────
    getUserById: builder.query({
      query: (id) => `/user/${id}`,
      transformResponse: (response) => {
        if (response?.result) return response.result;
        return response;
      },
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    // ── CREATE USER ──────────────────────────────────────────────────────
    createUser: builder.mutation({
      query: (body) => ({
        url:    '/user',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    // ── UPDATE USER (full) ───────────────────────────────────────────────
    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url:    `/user/${id}`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    // ── PARTIAL UPDATE USER ──────────────────────────────────────────────
    patchUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url:    `/user/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    // ── DELETE USER ──────────────────────────────────────────────────────
    deleteUser: builder.mutation({
      query: (id) => ({
        url:    `/user/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  usePatchUserMutation,
  useDeleteUserMutation,
} = userApi;
import { baseApi } from '../baseApi';

export const roleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // GET ALL
    getRoles: builder.query({
      query: (params = {}) => ({
        url: '/role',
        params,
      }),
      transformResponse: (response) => response?.result ?? response,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Role', id })),
              { type: 'Role', id: 'LIST' },
            ]
          : [{ type: 'Role', id: 'LIST' }],
    }),

    // GET BY ID
    getRoleById: builder.query({
      query: (id) => ({ url: `/role/${id}` }),
      transformResponse: (response) => response?.result ?? response,
      providesTags: (_, __, id) => [{ type: 'Role', id }],
    }),

    // CREATE
    createRole: builder.mutation({
      query: (body) => ({ url: '/role', method: 'POST', body }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),

    // UPDATE
    updateRole: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/role/${id}`, method: 'PUT', body }),
      invalidatesTags: (_, __, { id }) => [
        { type: 'Role', id },
        { type: 'Role', id: 'LIST' },
      ],
    }),

    // DELETE
    deleteRole: builder.mutation({
      query: (id) => ({ url: `/role/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} = roleApi;
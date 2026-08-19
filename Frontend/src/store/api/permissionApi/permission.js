import { baseApi } from '../baseApi';

export const permissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // GET ALL permissions
    getPermissions: builder.query({
      query: (params = {}) => ({ url: '/permission', params }),
      transformResponse: (res) => res?.result ?? res,
      providesTags: [{ type: 'Permission', id: 'LIST' }],
    }),

    // GET permissions for a role
    getRolePermissions: builder.query({
      query: (roleId) => ({ url: `/permission/role/${roleId}` }),
      transformResponse: (res) => res?.result ?? res,
      providesTags: (_, __, roleId) => [{ type: 'Permission', id: `role-${roleId}` }],
    }),

    // SYNC permissions to a role
    syncRolePermissions: builder.mutation({
      query: ({ roleId, permission_ids }) => ({
        url: `/permission/role/${roleId}`,
        method: 'PUT',
        body: { permission_ids },
      }),
      invalidatesTags: (_, __, { roleId }) => [
        { type: 'Permission', id: `role-${roleId}` },
        { type: 'Role', id: roleId },
      ],
    }),

    getMyEffectivePermissions: builder.query({
      query: () => ({ url: '/permission/me/effective' }),
      transformResponse: (res) => res?.result?.data ?? res?.result ?? res,
      providesTags: [{ type: 'Permission', id: 'me-effective' }],
    }),

    getPermissionCatalog: builder.query({
      query: () => ({ url: '/permission/catalog' }),
      transformResponse: (res) => res?.result?.data ?? res?.result ?? res,
      providesTags: [{ type: 'Permission', id: 'CATALOG' }],
    }),

    getUserEffectivePermissions: builder.query({
      query: (userId) => ({ url: `/permission/user/${userId}` }),
      transformResponse: (res) => res?.result?.data ?? res?.result ?? res,
      providesTags: (_, __, userId) => [{ type: 'Permission', id: `user-${userId}` }],
    }),

    updateUserPermissions: builder.mutation({
      query: ({ userId, permissions }) => ({
        url: `/permission/user/${userId}`,
        method: 'PUT',
        body: { permissions },
      }),
      invalidatesTags: (_, __, { userId }) => [
        { type: 'Permission', id: `user-${userId}` },
        { type: 'Permission', id: 'me-effective' },
      ],
    }),

  }),
  overrideExisting: false,
});

export const {
  useGetPermissionsQuery,
  useGetRolePermissionsQuery,
  useSyncRolePermissionsMutation,
  useGetMyEffectivePermissionsQuery,
  useGetPermissionCatalogQuery,
  useGetUserEffectivePermissionsQuery,
  useUpdateUserPermissionsMutation,
} = permissionApi;

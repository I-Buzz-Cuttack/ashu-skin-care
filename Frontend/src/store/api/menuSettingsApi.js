/**
 * menuSettingsApi.js - Sidebar / menu visibility settings.
 *
 * Expected backend shape:
 *  GET  /menu-settings/roles/:role
 *    -> { role: 'SUPER_ADMIN', items: { '/path': true, '/other': false } }
 *
 *  PUT  /menu-settings/roles/:role
 *    body -> { items: { '/path': true, '/other': false } }
 *
 *  POST /menu-settings/bulk
 *    body -> { roles: [{ role, items }] }
 */

import { baseApi } from './baseApi';
import { API } from '@constants/api';

export const menuSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMenuSettingsByRole: builder.query({
      query: (role) => API.MENU_SETTINGS.BY_ROLE(role),
      providesTags: (result, error, role) => [
        { type: 'MenuSettings', id: role },
      ],
    }),

    updateMenuSettingsByRole: builder.mutation({
      query: ({ role, items }) => ({
        url: API.MENU_SETTINGS.BY_ROLE(role),
        method: 'PUT',
        body: { items },
      }),
      invalidatesTags: (result, error, { role }) => [
        { type: 'MenuSettings', id: role },
      ],
    }),

    upsertMenuSettingsBulk: builder.mutation({
      query: (body) => ({
        url: API.MENU_SETTINGS.BULK,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MenuSettings'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMenuSettingsByRoleQuery,
  useUpdateMenuSettingsByRoleMutation,
  useUpsertMenuSettingsBulkMutation,
} = menuSettingsApi;

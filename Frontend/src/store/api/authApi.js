/**
 * authApi.js — Authentication endpoints (login, logout, refresh, me)
 *
 * Injected into baseApi. Auto-generates hooks:
 *   useLoginMutation         → POST /auth/login
 *   useLogoutMutation        → POST /auth/logout
 *   useGetMeQuery            → GET  /auth/me
 *   useForgotPasswordMutation
 *   useResetPasswordMutation
 */

import { baseApi } from './baseApi';
import { API } from '@constants/api';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    login: builder.mutation({
      query: (credentials) => ({
        url:    API.AUTH.LOGIN,
        method: 'POST',
        body:   credentials,   // { email, password }
      }),
      // No tag invalidation needed on login
    }),

    logout: builder.mutation({
      query: () => ({
        url:    API.AUTH.LOGOUT,
        method: 'POST',
      }),
      // On logout, reset all cached data
      invalidatesTags: (result, error, arg) => [{ type: 'User' }],
    }),

    refreshToken: builder.mutation({
      query: (body) => ({
        url:    API.AUTH.REFRESH,
        method: 'POST',
        body,   // { refreshToken }
      }),
    }),

    getMe: builder.query({
      query: () => API.AUTH.ME,
      providesTags: [{ type: 'User', id: 'ME' }],
    }),

    forgotPassword: builder.mutation({
      query: (body) => ({
        url:    API.AUTH.FORGOT_PASSWORD,
        method: 'POST',
        body,   // { email }
      }),
    }),

    resetPassword: builder.mutation({
      query: (body) => ({
        url:    API.AUTH.RESET_PASSWORD,
        method: 'POST',
        body,   // { token, password, confirmPassword }
      }),
    }),

  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;

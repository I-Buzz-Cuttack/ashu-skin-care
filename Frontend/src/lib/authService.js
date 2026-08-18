/**
 * ============================================================
 *  lib/authService.js  —  HMS Authentication Service Library
 * ============================================================
 *
 *  ONE STOP SHOP for all auth-related API calls and state helpers.
 *
 *  ┌─────────────────────────────────────────────────────────┐
 *  │  HOW TO USE (inside a React component):                 │
 *  │                                                         │
 *  │  import { useAuthService } from '@lib/authService';     │
 *  │                                                         │
 *  │  const { login, logout, currentUser, isLoggedIn }       │
 *  │        = useAuthService();                              │
 *  │                                                         │
 *  │  // Login                                               │
 *  │  await login({ email, password });                      │
 *  │                                                         │
 *  │  // Logout                                              │
 *  │  await logout();                                        │
 *  └─────────────────────────────────────────────────────────┘
 *
 *  ┌─────────────────────────────────────────────────────────┐
 *  │  HOW TO USE (outside React — router guards, helpers):   │
 *  │                                                         │
 *  │  import { authService } from '@lib/authService';        │
 *  │                                                         │
 *  │  const result = await authService.login(store,          │
 *  │                   { email, password });                 │
 *  └─────────────────────────────────────────────────────────┘
 *
 *  Exports:
 *    useAuthService()   — React hook (components)
 *    authService        — Imperative object (non-React contexts)
 *
 *    Direct RTK Query hooks (for advanced usage):
 *      useLoginMutation, useLogoutMutation, useGetMeQuery,
 *      useRefreshTokenMutation, useForgotPasswordMutation,
 *      useResetPasswordMutation
 */

import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';

// ── RTK Query hooks ──────────────────────────────────────────
import {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from '@store/api/authApi';

// ── Auth slice actions & selectors ───────────────────────────
import {
  setCredentials,
  updateAccessToken,
  clearAuth,
  updateUser,
  selectCurrentUser,
  selectCurrentRole,
  selectToken,
  selectIsAuthenticated,
} from '@store/slices/authSlice';

// ── Utils ─────────────────────────────────────────────────────
import {
  decodeToken,
  isTokenExpired,
  getRoleFromToken,
  getDashboardByRole,
} from '@utils/auth.utils';

// ── Notification helpers ──────────────────────────────────────
import { addToast } from '@store/slices/notificationSlice';

// ── Router ─────────────────────────────────────────────────────
// (used in imperative authService only)
import { API } from '@constants/api';

// =============================================================
//  useAuthService  — React hook for use inside components
// =============================================================

/**
 * useAuthService()
 *
 * Returns an object with:
 *   - Auth state: currentUser, currentRole, token, isLoggedIn
 *   - Auth actions: login(), logout(), refreshToken(),
 *                   forgotPassword(), resetPassword(),
 *                   updateProfile()
 *   - Auth utils:  decodeToken, isTokenExpired,
 *                  getRoleFromToken, getDashboardByRole
 *   - Raw RTK loading/error flags: loginLoading, loginError, etc.
 *
 * @returns {object} auth service API
 *
 * @example
 *   const { login, isLoggedIn, currentUser } = useAuthService();
 *
 *   const handleLogin = async (formData) => {
 *     const { user, token, role } = await login(formData);
 *     // user is already stored in Redux + localStorage
 *   };
 */
export const useAuthService = () => {
  const dispatch = useDispatch();

  // ── State selectors ───────────────────────────────────────
  const currentUser  = useSelector(selectCurrentUser);
  const currentRole  = useSelector(selectCurrentRole);
  const token        = useSelector(selectToken);
  const isLoggedIn   = useSelector(selectIsAuthenticated);

  // ── RTK Query mutations/queries ───────────────────────────
  const [loginMutation,          { isLoading: loginLoading,   error: loginError   }] = useLoginMutation();
  const [logoutMutation,         { isLoading: logoutLoading                        }] = useLogoutMutation();
  const [refreshTokenMutation,   { isLoading: refreshLoading                       }] = useRefreshTokenMutation();
  const [forgotPasswordMutation, { isLoading: forgotLoading,  error: forgotError  }] = useForgotPasswordMutation();
  const [resetPasswordMutation,  { isLoading: resetLoading,   error: resetError   }] = useResetPasswordMutation();

  // ── Wrapped actions ───────────────────────────────────────

  /**
   * login({ email, password })
   *
   * Calls POST /auth/login, stores credentials in Redux + localStorage,
   * dispatches a success toast, and returns the response data.
   *
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ user, token, role }>}
   * @throws will dispatch an error toast and re-throw on failure
   *
   * @example
   *   const { user } = await login({ email: 'a@b.com', password: '123' });
   */
// REPLACE WITH:
  const login = useCallback(async (credentials) => {
    const response = await loginMutation(credentials).unwrap();
    const data = response.result ?? response;  // ← unwrap the envelope

    dispatch(setCredentials({
      user:        data.user,
      token:       data.accessToken  || data.token,  // ← backend sends "accessToken"
      role:        data.user?.role   || data.user?.role_name,
      permissions: data.permissions  || [],
    }));

    dispatch(addToast({ type: 'success', message: `Welcome back, ${data.user?.name || 'User'}!` }));
    return data;
  }, [loginMutation, dispatch]);

  /**
   * logout()
   *
   * Calls POST /auth/logout, clears Redux state and localStorage.
   * Safe to call even if the API call fails (always clears local state).
   *
   * @example
   *   await logout();
   */
  const logout = useCallback(async () => {
    try {
      await logoutMutation().unwrap();
    } catch {
      // Swallow — always clear local state regardless of API result
    } finally {
      dispatch(clearAuth());
      dispatch(addToast({ type: 'info', message: 'You have been logged out.' }));
    }
  }, [logoutMutation, dispatch]);

  /**
   * refreshToken({ refreshToken })
   *
   * Calls POST /auth/refresh and updates the stored token.
   *
   * @param {{ refreshToken: string }} body
   * @returns {Promise<{ token: string }>}
   */
  const refreshToken = useCallback(async (body) => {
    const response = await refreshTokenMutation(body).unwrap();
    const result = response.result ?? response;
    const token = result.accessToken || result.token || result.access_token;
    if (token) {
      dispatch(updateAccessToken(token));
    }
    return result;
  }, [refreshTokenMutation, dispatch]);

  /**
   * forgotPassword({ email })
   *
   * Calls POST /auth/forgot-password.
   *
   * @param {{ email: string }} body
   * @returns {Promise<{ message: string }>}
   */
  const forgotPassword = useCallback(async (body) => {
    const result = await forgotPasswordMutation(body).unwrap();
    dispatch(addToast({ type: 'success', message: result.message || 'Reset link sent to your email.' }));
    return result;
  }, [forgotPasswordMutation, dispatch]);

  /**
   * resetPassword({ token, password, confirmPassword })
   *
   * Calls POST /auth/reset-password.
   *
   * @param {{ token: string, password: string, confirmPassword: string }} body
   * @returns {Promise<{ message: string }>}
   */
  const resetPassword = useCallback(async (body) => {
    const result = await resetPasswordMutation(body).unwrap();
    dispatch(addToast({ type: 'success', message: result.message || 'Password reset successfully.' }));
    return result;
  }, [resetPasswordMutation, dispatch]);

  /**
   * updateProfile(patch)
   *
   * Updates user info in Redux state (client-side only).
   * Call after a successful profile update API response.
   *
   * @param {Partial<User>} patch — fields to merge into current user
   *
   * @example
   *   updateProfile({ name: 'New Name', avatar: url });
   */
  const updateProfile = useCallback((patch) => {
    dispatch(updateUser(patch));
  }, [dispatch]);

  // ── Return public API ─────────────────────────────────────
  return {
    // ── State ──────────────────────────────────────────────
    currentUser,
    currentRole,
    token,
    isLoggedIn,

    // ── Actions ────────────────────────────────────────────
    login,
    logout,
    refreshToken,
    forgotPassword,
    resetPassword,
    updateProfile,

    // ── Loading & Error flags ──────────────────────────────
    loginLoading,
    loginError,
    logoutLoading,
    refreshLoading,
    forgotLoading,
    forgotError,
    resetLoading,
    resetError,

    // ── Utility helpers ────────────────────────────────────
    decodeToken,
    isTokenExpired,
    getRoleFromToken,
    getDashboardByRole,
    getDashboard: () => getDashboardByRole(currentRole),
  };
};

// =============================================================
//  authService  — Imperative object for non-React contexts
//  (route loaders, saga-like thunks, vanilla JS helpers)
// =============================================================

/**
 * authService
 *
 * Use when you are OUTSIDE a React component and need to call auth APIs.
 * Pass the Redux `store` as the first argument to each method.
 *
 * @example — in a route loader or middleware:
 *   import store from '@store';
 *   import { authService } from '@lib/authService';
 *
 *   const result = await authService.login(store, { email, password });
 *   const user   = authService.getUser(store);
 *   const ok     = authService.isAuthenticated(store);
 */
export const authService = {

  /**
   * login(store, credentials)
   * @param {Redux Store} store
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<object>} API result
   */
  async login(store, credentials) {
    const { data, error } = await store.dispatch(
      // dynamically access authApi endpoint
      (await import('@store/api/authApi')).authApi.endpoints.login.initiate(credentials)
    );
    if (error) throw error;
    // const payload = {
    //   user:  data.user  || data.data?.user,
    //   token: data.token || data.data?.token || data.access_token,
    //   role:  data.role  || data.data?.role  || data.user?.role,
    // };

    const payload_data = data.result ?? data;  // ← unwrap the envelope

    const payload = {
      user:        payload_data.user,
      token:       payload_data.accessToken  || payload_data.token,
      role:        payload_data.user?.role   || payload_data.user?.role_name,
      permissions: payload_data.permissions  || [],
    };
    store.dispatch(setCredentials(payload));
    return payload_data;
  },

  /**
   * logout(store)
   * @param {Redux Store} store
   */
  async logout(store) {
    try {
      await store.dispatch(
        (await import('@store/api/authApi')).authApi.endpoints.logout.initiate()
      );
    } catch { /* ignore */ }
    store.dispatch(clearAuth());
  },

  /**
   * getUser(store) — returns current user from state
   * @param {Redux Store} store
   * @returns {object|null}
   */
  getUser(store) {
    return selectCurrentUser(store.getState());
  },

  /**
   * getRole(store) — returns current role from state
   * @param {Redux Store} store
   * @returns {string|null}
   */
  getRole(store) {
    return selectCurrentRole(store.getState());
  },

  /**
   * getToken(store) — returns JWT token from state
   * @param {Redux Store} store
   * @returns {string|null}
   */
  getToken(store) {
    return selectToken(store.getState());
  },

  /**
   * isAuthenticated(store) — returns boolean login status
   * @param {Redux Store} store
   * @returns {boolean}
   */
  isAuthenticated(store) {
    return selectIsAuthenticated(store.getState());
  },

  /**
   * isTokenValid(store) — checks Redux token is present and not expired
   * @param {Redux Store} store
   * @returns {boolean}
   */
  isTokenValid(store) {
    const token = selectToken(store.getState());
    return !!token && !isTokenExpired(token);
  },

  // ── Auth utility helpers (no store needed) ─────────────
  decodeToken,
  isTokenExpired,
  getRoleFromToken,
  getDashboardByRole,
};

// =============================================================
//  Re-export raw RTK hooks for advanced / direct usage
// =============================================================
export {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
};

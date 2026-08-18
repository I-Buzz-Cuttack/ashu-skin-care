/**
 * authSlice.js — stores current user, token, role, login state
 *
 * Shape:
 *   auth.user        { id, name, email, avatar }
 *   auth.token       string | null
 *   auth.role        ROLES enum value | null
 *   auth.permissions []
 *   auth.isLoggedIn  boolean
 *
 * Selectors:
 *   selectCurrentUser, selectCurrentRole, selectToken, selectIsAuthenticated, selectPermissions
 */

import { createSlice } from '@reduxjs/toolkit';

const AUTH_KEYS = ['hms_token', 'hms_role', 'hms_user', 'refresh_token', 'user', 'hms_permissions'];

const getStorageValue = (key) => {
  try {
    return localStorage.getItem(key) || sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const setStorageValue = (storage, key, value) => {
  if (value === undefined || value === null) return;
  storage.setItem(key, value);
};

const getAuthStorage = () => (
  sessionStorage.getItem('hms_user') ? sessionStorage : localStorage
);

const clearAuthStorage = () => {
  AUTH_KEYS.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

const storedUser = (() => {
  try { return JSON.parse(getStorageValue('hms_user') || 'null'); } catch { return null; }
})();

const storedPermissions = (() => {
  try { return JSON.parse(getStorageValue('hms_permissions') || '[]'); } catch { return []; }
})();

const initialState = {
  user:        storedUser,
  token:       getStorageValue('hms_token'),
  role:        getStorageValue('hms_role'),
  permissions: storedPermissions,
  isLoggedIn:  !!getStorageValue('hms_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Call after successful login API response.
     * Payload: { user, token, role, rememberMe?, refreshToken?, permissions? }
     */
    setCredentials: (state, { payload }) => {
      state.user        = payload.user;
      state.token       = payload.token;
      state.role        = payload.role;
      state.permissions = payload.permissions ?? [];
      state.isLoggedIn  = true;

      clearAuthStorage();

      const targetStorage = payload.rememberMe === false ? sessionStorage : localStorage;
      setStorageValue(targetStorage, 'hms_token',       payload.token);
      setStorageValue(targetStorage, 'hms_role',        payload.role);
      setStorageValue(targetStorage, 'hms_user',        JSON.stringify(payload.user));
      setStorageValue(targetStorage, 'hms_permissions', JSON.stringify(payload.permissions ?? []));
    },

    updateAccessToken: (state, { payload }) => {
      const token = typeof payload === 'string' ? payload : payload?.token;
      if (!token) return;
      state.token = token;
      state.isLoggedIn = true;
      getAuthStorage().setItem('hms_token', token);
    },

    /** Call on logout or 401 */
    clearAuth: (state) => {
      state.user        = null;
      state.token       = null;
      state.role        = null;
      state.permissions = [];
      state.isLoggedIn  = false;
      clearAuthStorage();
    },

    /** Update user profile without touching token/role */
    updateUser: (state, { payload }) => {
      state.user = { ...state.user, ...payload };
    },
  },
});

export const { setCredentials, updateAccessToken, clearAuth, updateUser } = authSlice.actions;

// ── Selectors ──────────────────────────────────────────
export const selectCurrentUser     = (state) => state.auth.user;
export const selectCurrentRole     = (state) => state.auth.role;
export const selectToken           = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isLoggedIn;
export const selectPermissions     = (state) => state.auth.permissions;

export default authSlice.reducer;

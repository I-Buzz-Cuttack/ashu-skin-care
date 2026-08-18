// src/utils/storage.utils.js
/**
 * Safe localStorage wrappers — always use these instead of calling localStorage directly.
 * They handle JSON parse errors and SSR gracefully.
 */

export const storage = {
  get: (key, fallback = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  },

  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('localStorage set error:', e);
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('localStorage remove error:', e);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error('localStorage clear error:', e);
    }
  },
};

// ── Auth-specific keys ──────────────────────────────────────
export const AUTH_KEYS = {
  TOKEN: 'hms_token',
  ROLE:  'hms_role',
  USER:  'hms_user',
};

export const saveAuthToStorage = ({ token, role, user }) => {
  storage.set(AUTH_KEYS.TOKEN, token);
  storage.set(AUTH_KEYS.ROLE,  role);
  storage.set(AUTH_KEYS.USER,  user);
};

export const clearAuthFromStorage = () => {
  storage.remove(AUTH_KEYS.TOKEN);
  storage.remove(AUTH_KEYS.ROLE);
  storage.remove(AUTH_KEYS.USER);
};

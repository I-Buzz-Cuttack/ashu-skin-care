// src/utils/auth.utils.js
import { ROLES } from '@constants/roles';

/**
 * Decode a JWT token payload (without verification — server verifies).
 * Returns the payload object or null on error.
 */
export const decodeToken = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64    = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64).split('').map((c) =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * Check if a JWT token is expired.
 */
export const isTokenExpired = (token) => {
  const payload = decodeToken(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
};

/**
 * Extract role from token payload.
 */
export const getRoleFromToken = (token) => {
  const payload = decodeToken(token);
  return payload?.role || null;
};

/**
 * Map role string → dashboard route.
 */
export const getDashboardByRole = (role) => {
  const MAP = {
    [ROLES.SUPER_ADMIN]:    '/super-admin/dashboard',
    [ROLES.SUB_ADMIN]:      '/sub-admin/dashboard',
    [ROLES.HOSPITAL_ADMIN]: '/hospital-admin/dashboard',
    [ROLES.FRONT_DESK]:     '/front-desk/dashboard',
    [ROLES.ACCOUNTANT]:     '/accountant/dashboard',
    [ROLES.NURSE]:          '/nurse/dashboard',
    [ROLES.LABORATORY]:     '/laboratory/dashboard',
    [ROLES.RADIOLOGY]:      '/radiology/dashboard',
    [ROLES.AMBULANCE]:      '/ambulance/dashboard',
    [ROLES.PHARMACIST]:     '/pharmacist/dashboard',
  };
  return MAP[role] || '/login';
};

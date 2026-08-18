// src/hooks/useAuth.js
import { useSelector } from 'react-redux';
import {
  selectCurrentUser,
  selectCurrentRole,
  selectIsAuthenticated,
  selectToken,
} from '@store/slices/authSlice';

/**
 * useAuth — access current user, role, and auth state.
 *
 * Usage:
 *   const { user, role, isAuthenticated } = useAuth();
 */
export const useAuth = () => {
  const user            = useSelector(selectCurrentUser);
  const role            = useSelector(selectCurrentRole);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const token           = useSelector(selectToken);
  return { user, role, isAuthenticated, token };
};

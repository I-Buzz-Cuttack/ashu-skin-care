import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  selectCurrentRole,
  selectIsAuthenticated,
  selectPermissions,
} from '@store/slices/authSlice';
import { useGetMyEffectivePermissionsQuery } from '@store/api/permissionApi/permission';
import {
  canAccessPermission,
  isSuperAdminRole,
  normalizePermissionAction,
  normalizePermissionResource,
} from '@utils/permission.utils';

/**
 * const { can } = usePermission();
 * can('patient', 'create')  ->  true | false
 */
export const usePermission = () => {
  const role        = useSelector(selectCurrentRole);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const permissions = useSelector(selectPermissions);
  const isSuperAdmin = isSuperAdminRole(role);
  // const query = useGetMyEffectivePermissionsQuery(undefined, {
  //   skip: !isAuthenticated || isSuperAdmin,
  // });
  // const effectivePermissions = query.data ?? permissions ?? [];

  const query = useGetMyEffectivePermissionsQuery(undefined, {
  skip: !isAuthenticated || isSuperAdmin,
  refetchOnMountOrArgChange: true,
});
const effectivePermissions = query.data ?? permissions ?? [];

  const permissionSet = useMemo(
    () =>
      new Set(
        effectivePermissions
          .map((p) =>
            p?.resource && p?.action
              ? `${normalizePermissionResource(p.resource)}:${normalizePermissionAction(p.action)}`
              : null,
          )
          .filter(Boolean),
      ),
    [effectivePermissions],
  );

  const can = useCallback((resource, action = 'read') => {
    if (isSuperAdmin) return true;
    return canAccessPermission({ role, permissionSet, resource, action });
  }, [isSuperAdmin, permissionSet, role]);

  return { can, isSuperAdmin, role, isLoading: query.isLoading, error: query.error };
};

export default usePermission;

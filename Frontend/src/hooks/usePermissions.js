// import { useMemo } from "react";
// import { useSelector } from "react-redux";
// import {
//   selectCurrentRole,
//   selectIsAuthenticated,
// } from "@store/slices/authSlice";
// import { useGetMyEffectivePermissionsQuery } from "@store/api/permissionApi/permission";
// import {
//   canAccessPermission,
//   isSuperAdminRole,
// } from "@utils/permission.utils";

// const buildPermissionSet = (permissions = []) =>
//   new Set(
//     permissions
//       .map((permission) =>
//         permission?.resource && permission?.action
//           ? `${permission.resource}:${permission.action}`
//           : null,
//       )
//       .filter(Boolean),
//   );

// export const usePermissions = () => {
//   const role = useSelector(selectCurrentRole);
//   const isAuthenticated = useSelector(selectIsAuthenticated);
//   const isSuperAdmin = isSuperAdminRole(role);

//   const query = useGetMyEffectivePermissionsQuery(undefined, {
//     skip: !isAuthenticated || isSuperAdmin,
//   });

//   const permissionSet = useMemo(
//     () => buildPermissionSet(query.data),
//     [query.data],
//   );

//   const canAccess = (resource, action = "read") =>
//     canAccessPermission({
//       role,
//       permissionSet,
//       resource,
//       action,
//     });

//   return {
//     ...query,
//     role,
//     permissions: query.data ?? [],
//     canAccess,
//     isSuperAdmin,
//     isReady: isSuperAdmin || !query.isLoading,
//   };
// };

// export default usePermissions;



import { useMemo } from 'react';
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

const buildPermissionSet = (permissions = []) =>
  new Set(
    permissions
      .map((p) =>
        p?.resource && p?.action
          ? `${normalizePermissionResource(p.resource)}:${normalizePermissionAction(p.action)}`
          : null,
      )
      .filter(Boolean),
  );

export const usePermissions = () => {
  const role            = useSelector(selectCurrentRole);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const permissions     = useSelector(selectPermissions);
  const isSuperAdmin    = isSuperAdminRole(role);
  // const query = useGetMyEffectivePermissionsQuery(undefined, {
  //   skip: !isAuthenticated || isSuperAdmin,
  // });
// REPLACE WITH:
const query = useGetMyEffectivePermissionsQuery(undefined, {
  skip: !isAuthenticated || isSuperAdmin,
  refetchOnMountOrArgChange: true,
});
const effectivePermissions = query.data ?? permissions ?? [];

  const permissionSet = useMemo(
    () => buildPermissionSet(effectivePermissions),
    [effectivePermissions],
  );

  const canAccess = (resource, action = 'read') =>
    canAccessPermission({ role, permissionSet, resource, action });

  return {
    role,
    isAuthenticated,
    permissions: effectivePermissions,
    permissionSet,
    canAccess,
    isSuperAdmin,
    isReady:    isSuperAdmin || !query.isLoading,
    isLoading:  query.isLoading,
    error:      query.error,
  };
};

export default usePermissions;

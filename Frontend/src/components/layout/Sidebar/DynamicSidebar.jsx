// src/components/layout/Sidebar/DynamicSidebar.jsx
import { useSelector } from "react-redux";
import { selectCurrentRole } from "@store/slices/authSlice";
import SidebarBase from "./SidebarBase";
import { getSidebarConfig } from "./sidebarConfig";
// import { SIDEBAR_NAV_ITEMS, MASTER_NAV_ITEMS } from "./sidebarItems";
// import { SIDEBAR_NAV_ITEMS } from "./sidebarItems";
import { SIDEBAR_NAV_ITEMS, MASTER_NAV_ITEMS } from "./sidebarItems";
import { filterSidebarItems } from "./sidebarFilters";
import { useGetMenuSettingsByRoleQuery } from "@store/api/menuSettingsApi";
import usePermissions from "@hooks/usePermissions";
import { ROLES } from "@constants/roles";

// ── Each role's base path prefix ──────────────────────────────
// Maps /super-admin/ipd  →  /radiologist/ipd  (for RADIOLOGIST)
// Maps /super-admin/ipd  →  /pharmacist/ipd   (for PHARMACIST)
// etc.
const ROLE_BASE_PATH = {
  [ROLES.RADIOLOGIST]:    '/radiologist',
  [ROLES.LAB_TECHNICIAN]: '/lab-technician',
  [ROLES.PHARMACIST]:     '/pharmacist',
  [ROLES.DOCTOR]:         '/doctor',
  [ROLES.NURSE]:          '/nurse',
  [ROLES.RECEPTIONIST]:   '/receptionist',
  [ROLES.IPD_STAFF]:      '/ipd-staff',
  [ROLES.BILLING_STAFF]:  '/billing',
  [ROLES.SUB_ADMIN]:      '/sub-admin',
  [ROLES.FRONT_DESK]:     '/front-desk',
  [ROLES.ACCOUNTANT]:     '/accountant',
  [ROLES.HOSPITAL_ADMIN]: '/hospital-admin',
  [ROLES.LABORATORY]:     '/laboratory',
  [ROLES.RADIOLOGY]:      '/radiology',
  [ROLES.AMBULANCE]:      '/ambulance',    
};

// Rewrites /super-admin/xyz  →  /{roleBase}/xyz
// Leaves /profile and /settings unchanged (shared routes)
// const remapPath = (path, roleBase) => {
//   if (!roleBase) return path;
//   if (path === '/profile' || path === '/settings') return path;
//   return path.replace(/^\/super-admin/, roleBase);
// };

const remapPath = (path, roleBase) => {
  if (!roleBase) return path;
  return path.replace(/^\/super-admin/, roleBase); 
};

const DynamicSidebar = ({
  sidebarKey,
  navItems,
  roleLabel,
  roleColor,
  roleBg,
  logo,
  menuAccess,
  canAccess,
  collapsed,        // ← explicitly destructured so it's guaranteed to pass through
  onNavigate,       // ← same for onNavigate
  ...sidebarProps
}) => {
  const currentRole = useSelector(selectCurrentRole);
  const resolved = getSidebarConfig(sidebarKey || currentRole);
  const { canAccess: assignedCanAccess, isReady } = usePermissions();

  const { data: savedMenuSettings } = useGetMenuSettingsByRoleQuery(
    currentRole,
    { skip: !currentRole },
  );

  // SuperAdmin → its own hardcoded list
  // Everyone else → MASTER_NAV_ITEMS with paths rewritten to their role's base
  const roleBase = ROLE_BASE_PATH[currentRole];

const rawNavItems =
  navItems ??
  (currentRole === ROLES.SUPER_ADMIN
    ? SIDEBAR_NAV_ITEMS[ROLES.SUPER_ADMIN]
    : MASTER_NAV_ITEMS);


const remapMenuItem = (item, roleBase) => ({
  ...item,

  path: item.path
    ? remapPath(item.path, roleBase)
    : item.path,

  children: item.children?.map((child) =>
    remapMenuItem(child, roleBase)
  ),

  subItems: item.subItems?.map((sub) => ({
    ...sub,
    path: sub.path
      ? remapPath(sub.path, roleBase)
      : sub.path,
  })),
});

const currentNavItems =
  currentRole === ROLES.SUPER_ADMIN
    ? rawNavItems
    : rawNavItems.map((item) => remapMenuItem(item, roleBase));

  const resolvedMenuAccess =
    menuAccess ||
    (savedMenuSettings?.items
      ? Object.fromEntries(
          currentNavItems.map((item) => [
            item.path,
            savedMenuSettings.items[item.path] !== false,
          ]),
        )
      : null);

  const visibleNavItems = filterSidebarItems(currentNavItems, {
    role: currentRole,
    menuAccess: resolvedMenuAccess,
    // canAccess:
    //   canAccess ||
    //   ((_role, resource, action) => assignedCanAccess(resource, action)),
    canAccess:
      canAccess ||
      ((resource, action) => assignedCanAccess(resource, action))
  });

  if (!isReady) {
    return (
      <SidebarBase
        navItems={[]}
        roleLabel={roleLabel ?? resolved.roleLabel ?? "Dashboard"}
        roleColor={roleColor ?? resolved.roleColor}
        roleBg={roleBg ?? resolved.roleBg}
        logo={logo}
        {...sidebarProps}
      />
    );
  }

  return (
    <SidebarBase
      navItems={visibleNavItems}
      roleLabel={roleLabel ?? resolved.roleLabel ?? "Dashboard"}
      roleColor={roleColor ?? resolved.roleColor}
      roleBg={roleBg ?? resolved.roleBg}
      logo={logo}
      collapsed={collapsed}
      onNavigate={onNavigate}
      {...sidebarProps}
    />
  );
};

export default DynamicSidebar;
// src/components/layout/Sidebar/sidebarConfig.jsx
import { ROLES, ROLE_LABELS, ROLE_COLORS } from '@constants/roles';
import { getSidebarNavItems } from './sidebarItems';

export const SIDEBAR_KEYS = ROLES;

export const SIDEBAR_CONFIG = {
  [ROLES.SUPER_ADMIN]: {
    navItems: getSidebarNavItems(ROLES.SUPER_ADMIN),
    roleLabel: ROLE_LABELS[ROLES.SUPER_ADMIN],
    roleColor: ROLE_COLORS[ROLES.SUPER_ADMIN].text,
    roleBg: ROLE_COLORS[ROLES.SUPER_ADMIN].bg,
  },
  [ROLES.SUB_ADMIN]: {
    navItems: getSidebarNavItems(ROLES.SUB_ADMIN),
    roleLabel: ROLE_LABELS[ROLES.SUB_ADMIN],
    roleColor: ROLE_COLORS[ROLES.SUB_ADMIN].text,
    roleBg: ROLE_COLORS[ROLES.SUB_ADMIN].bg,
  },
  [ROLES.HOSPITAL_ADMIN]: {
    navItems: getSidebarNavItems(ROLES.HOSPITAL_ADMIN),
    roleLabel: ROLE_LABELS[ROLES.HOSPITAL_ADMIN],
    roleColor: ROLE_COLORS[ROLES.HOSPITAL_ADMIN].text,
    roleBg: ROLE_COLORS[ROLES.HOSPITAL_ADMIN].bg,
  },
  [ROLES.FRONT_DESK]: {
    navItems: getSidebarNavItems(ROLES.FRONT_DESK),
    roleLabel: ROLE_LABELS[ROLES.FRONT_DESK],
    roleColor: ROLE_COLORS[ROLES.FRONT_DESK].text,
    roleBg: ROLE_COLORS[ROLES.FRONT_DESK].bg,
  },
  [ROLES.ACCOUNTANT]: {
    navItems: getSidebarNavItems(ROLES.ACCOUNTANT),
    roleLabel: ROLE_LABELS[ROLES.ACCOUNTANT],
    roleColor: ROLE_COLORS[ROLES.ACCOUNTANT].text,
    roleBg: ROLE_COLORS[ROLES.ACCOUNTANT].bg,
  },
  [ROLES.NURSE]: {
    navItems: getSidebarNavItems(ROLES.NURSE),
    roleLabel: ROLE_LABELS[ROLES.NURSE],
    roleColor: ROLE_COLORS[ROLES.NURSE].text,
    roleBg: ROLE_COLORS[ROLES.NURSE].bg,
  },
  [ROLES.LABORATORY]: {
    navItems: getSidebarNavItems(ROLES.LABORATORY),
    roleLabel: ROLE_LABELS[ROLES.LABORATORY],
    roleColor: ROLE_COLORS[ROLES.LABORATORY].text,
    roleBg: ROLE_COLORS[ROLES.LABORATORY].bg,
  },
  [ROLES.RADIOLOGY]: {
    navItems: getSidebarNavItems(ROLES.RADIOLOGY),
    roleLabel: ROLE_LABELS[ROLES.RADIOLOGY],
    roleColor: ROLE_COLORS[ROLES.RADIOLOGY].text,
    roleBg: ROLE_COLORS[ROLES.RADIOLOGY].bg,
  },
  [ROLES.AMBULANCE]: {
    navItems: getSidebarNavItems(ROLES.AMBULANCE),
    roleLabel: ROLE_LABELS[ROLES.AMBULANCE],
    roleColor: ROLE_COLORS[ROLES.AMBULANCE].text,
    roleBg: ROLE_COLORS[ROLES.AMBULANCE].bg,
  },
  [ROLES.PHARMACIST]: {
    navItems: getSidebarNavItems(ROLES.PHARMACIST),
    roleLabel: ROLE_LABELS[ROLES.PHARMACIST],
    roleColor: ROLE_COLORS[ROLES.PHARMACIST].text,
    roleBg: ROLE_COLORS[ROLES.PHARMACIST].bg,
  },
  [ROLES.DOCTOR]: {
    navItems: getSidebarNavItems(ROLES.DOCTOR),
    roleLabel: ROLE_LABELS[ROLES.DOCTOR],
    roleColor: ROLE_COLORS[ROLES.DOCTOR].text,
    roleBg: ROLE_COLORS[ROLES.DOCTOR].bg,
  },
  [ROLES.RECEPTIONIST]: {
    navItems: getSidebarNavItems(ROLES.RECEPTIONIST),
    roleLabel: ROLE_LABELS[ROLES.RECEPTIONIST],
    roleColor: ROLE_COLORS[ROLES.RECEPTIONIST].text,
    roleBg: ROLE_COLORS[ROLES.RECEPTIONIST].bg,
  },
  [ROLES.LAB_TECHNICIAN]: {
    navItems: getSidebarNavItems(ROLES.LAB_TECHNICIAN),
    roleLabel: ROLE_LABELS[ROLES.LAB_TECHNICIAN],
    roleColor: ROLE_COLORS[ROLES.LAB_TECHNICIAN].text,
    roleBg: ROLE_COLORS[ROLES.LAB_TECHNICIAN].bg,
  },
  [ROLES.RADIOLOGIST]: {
    navItems: getSidebarNavItems(ROLES.RADIOLOGIST),
    roleLabel: ROLE_LABELS[ROLES.RADIOLOGIST],
    roleColor: ROLE_COLORS[ROLES.RADIOLOGIST].text,
    roleBg: ROLE_COLORS[ROLES.RADIOLOGIST].bg,
  },
  [ROLES.BILLING_STAFF]: {
    navItems: getSidebarNavItems(ROLES.BILLING_STAFF),
    roleLabel: ROLE_LABELS[ROLES.BILLING_STAFF],
    roleColor: ROLE_COLORS[ROLES.BILLING_STAFF].text,
    roleBg: ROLE_COLORS[ROLES.BILLING_STAFF].bg,
  },
  [ROLES.IPD_STAFF]: {
    navItems: getSidebarNavItems(ROLES.IPD_STAFF),
    roleLabel: ROLE_LABELS[ROLES.IPD_STAFF],
    roleColor: ROLE_COLORS[ROLES.IPD_STAFF].text,
    roleBg: ROLE_COLORS[ROLES.IPD_STAFF].bg,
  },
};

export const getSidebarConfig = (roleKey) => {
  const config = SIDEBAR_CONFIG[roleKey];
  if (config) return config;

  const fallbackColor = ROLE_COLORS[roleKey] || ROLE_COLORS[ROLES.SUPER_ADMIN];
  return {
    ...SIDEBAR_CONFIG[ROLES.SUPER_ADMIN],
    roleLabel: ROLE_LABELS[roleKey] || "Dashboard",
    roleColor: fallbackColor.text,
    roleBg: fallbackColor.bg,
  };
};

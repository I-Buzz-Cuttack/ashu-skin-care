import { ROLES } from '@constants/roles';

const ROLE_DASHBOARDS = {
  [ROLES.SUPER_ADMIN]: '/super-admin/dashboard',
  [ROLES.DOCTOR]: '/doctor/dashboard',
  [ROLES.RECEPTIONIST]: '/receptionist/dashboard',
  [ROLES.LAB_TECHNICIAN]: '/lab-technician/dashboard',
  [ROLES.RADIOLOGIST]: '/radiologist/dashboard',
  [ROLES.BILLING_STAFF]: '/billing/dashboard',
  [ROLES.IPD_STAFF]: '/ipd-staff/dashboard',
  [ROLES.SUB_ADMIN]: '/sub-admin/dashboard',
  [ROLES.HOSPITAL_ADMIN]: '/hospital-admin/dashboard',
  [ROLES.FRONT_DESK]: '/front-desk/dashboard',
  [ROLES.ACCOUNTANT]: '/accountant/dashboard',
  [ROLES.NURSE]: '/nurse/dashboard',
  [ROLES.LABORATORY]: '/laboratory/dashboard',
  [ROLES.RADIOLOGY]: '/radiology/dashboard',
  [ROLES.AMBULANCE]: '/ambulance/dashboard',
  [ROLES.PHARMACIST]: '/pharmacist/dashboard',
};

const PREFIX_RULES = [
  {
    from: '/super-admin/opd',
    roles: {
      [ROLES.DOCTOR]: '/doctor/opd',
      [ROLES.RECEPTIONIST]: '/receptionist/opd',
      [ROLES.SUB_ADMIN]: '/sub-admin/opd',
      [ROLES.NURSE]: '/nurse/opd',
      [ROLES.ACCOUNTANT]: '/accountant/opd',
      [ROLES.RADIOLOGY]: '/radiology/opd',
      [ROLES.PHARMACIST]: '/pharmacist/opd',
    },
  },
  {
    from: '/super-admin/ipd',
    roles: {
      [ROLES.DOCTOR]: '/doctor/ipd',
      [ROLES.RECEPTIONIST]: '/receptionist/ipd',
      [ROLES.IPD_STAFF]: '/ipd-staff/ipd',
      [ROLES.SUB_ADMIN]: '/sub-admin/ipd',
      [ROLES.NURSE]: '/nurse/ipd',
      [ROLES.ACCOUNTANT]: '/accountant/ipd',
      [ROLES.RADIOLOGY]: '/radiology/ipd',
      [ROLES.PHARMACIST]: '/pharmacist/ipd',
    },
  },
  {
    from: '/super-admin/emergency',
    roles: {
      [ROLES.DOCTOR]: '/doctor/emergency',
      [ROLES.RECEPTIONIST]: '/receptionist/emergency',
    },
  },
  {
    from: '/super-admin/patients',
    roles: {
      [ROLES.DOCTOR]: '/doctor/patients',
      [ROLES.RECEPTIONIST]: '/receptionist/patients',
      [ROLES.FRONT_DESK]: '/front-desk/patients',
      [ROLES.ACCOUNTANT]: '/accountant/patients',
      [ROLES.NURSE]: '/nurse/patients',
      [ROLES.RADIOLOGY]: '/radiology/patients',
      [ROLES.SUB_ADMIN]: '/sub-admin/patients',
    },
  },
  {
    from: '/super-admin/pathology',
    roles: {
      [ROLES.DOCTOR]: '/doctor/pathology',
      [ROLES.LAB_TECHNICIAN]: '/lab-technician/pathology',
      [ROLES.FRONT_DESK]: '/front-desk/pathology',
      [ROLES.ACCOUNTANT]: '/accountant/pathology',
      [ROLES.SUB_ADMIN]: '/sub-admin/pathology',
    },
  },
  {
    from: '/super-admin/radiology',
    roles: {
      [ROLES.DOCTOR]: '/doctor/radiology',
      [ROLES.RADIOLOGIST]: '/radiologist/radiology',
      [ROLES.FRONT_DESK]: '/front-desk/radiology',
      [ROLES.ACCOUNTANT]: '/accountant/radiology',
      [ROLES.SUB_ADMIN]: '/sub-admin/radiology',
    },
  },
  {
    from: '/super-admin/stocks',
    roles: {
      [ROLES.BILLING_STAFF]: '/billing/stocks',
      [ROLES.LAB_TECHNICIAN]: '/lab-technician/stocks',
    },
  },
  {
    from: '/super-admin/pharma',
    roles: {
      [ROLES.PHARMACIST]: '/pharmacist',
      [ROLES.ACCOUNTANT]: '/accountant/pharmacy',
      [ROLES.FRONT_DESK]: '/front-desk/pharmacy',
      [ROLES.SUB_ADMIN]: '/sub-admin/pharmacy',
    },
  },
  {
    from: '/super-admin/ambulance',
    roles: {
      [ROLES.AMBULANCE]: '/ambulance',
      [ROLES.ACCOUNTANT]: '/accountant/ambulance',
      [ROLES.FRONT_DESK]: '/front-desk/ambulance',
      [ROLES.SUB_ADMIN]: '/sub-admin/ambulance',
    },
  },
  {
    from: '/super-admin/appointments',
    roles: {
      [ROLES.ACCOUNTANT]: '/accountant/appointments',
      [ROLES.FRONT_DESK]: '/front-desk/appointments',
      [ROLES.SUB_ADMIN]: '/sub-admin/appointments',
    },
  },
];

const EXACT_RULES = {
  '/super-admin/pharma': {
    [ROLES.PHARMACIST]: '/pharmacist/dashboard',
  },
  '/super-admin/pharma/sell': {
    [ROLES.PHARMACIST]: '/pharmacist/sell',
  },
  '/super-admin/pharma/sales': {
    [ROLES.PHARMACIST]: '/pharmacist/sales',
  },
  '/super-admin/pharma/medicines/purchasepage': {
    [ROLES.PHARMACIST]: '/pharmacist/purchase',
  },
  '/super-admin/pharma/purchases': {
    [ROLES.PHARMACIST]: '/pharmacist/purchases',
  },
  '/super-admin/pharma/purchase-returns': {
    [ROLES.PHARMACIST]: '/pharmacist/purchase-returns',
  },
  '/super-admin/pharma/sales-returns': {
    [ROLES.PHARMACIST]: '/pharmacist/sales-returns',
  },
  '/super-admin/pharma/item-master': {
    [ROLES.PHARMACIST]: '/pharmacist/medicines',
  },
  '/super-admin/pharma/item-category': {
    [ROLES.PHARMACIST]: '/pharmacist/medicine-category',
  },
  '/super-admin/pharma/itemsubcategory': {
    [ROLES.PHARMACIST]: '/pharmacist/medicine-subcategory',
  },
  '/super-admin/pharma/self-master': {
    [ROLES.PHARMACIST]: '/pharmacist/self-master',
  },
  '/super-admin/pharma/supplier': {
    [ROLES.PHARMACIST]: '/pharmacist/suppliers',
  },
  '/super-admin/pharma/expiry': {
    [ROLES.PHARMACIST]: '/pharmacist/expiry',
  },
  '/super-admin/pharma/stock-ledger': {
    [ROLES.PHARMACIST]: '/pharmacist/stock-ledger',
  },
  '/super-admin/pharma/reports': {
    [ROLES.PHARMACIST]: '/pharmacist/reports',
  },
  '/super-admin/pathology': {
    [ROLES.LAB_TECHNICIAN]: '/lab-technician/pathology',
  },
  '/super-admin/pathology/pathology-test': {
    [ROLES.LAB_TECHNICIAN]: '/lab-technician/pathology/add-test',
  },
  '/super-admin/pathology/orders': {
    [ROLES.LAB_TECHNICIAN]: '/lab-technician/pathology/orders',
  },
  '/super-admin/pathology/category': {
    [ROLES.LAB_TECHNICIAN]: '/lab-technician/pathology/category',
  },
  '/super-admin/pathology/subcategory': {
    [ROLES.LAB_TECHNICIAN]: '/lab-technician/pathology/subcategory',
  },
  '/super-admin/pathology/charge-category': {
    [ROLES.LAB_TECHNICIAN]: '/lab-technician/pathology/charge-category',
  },
  '/super-admin/pathology/charge-name': {
    [ROLES.LAB_TECHNICIAN]: '/lab-technician/pathology/charge-name',
  },
  '/super-admin/radiology': {
    [ROLES.RADIOLOGIST]: '/radiologist/radiology',
  },
  '/super-admin/radiology/add-test': {
    [ROLES.RADIOLOGIST]: '/radiologist/radiology/add-test',
  },
  '/super-admin/radiology/orders': {
    [ROLES.RADIOLOGIST]: '/radiologist/radiology/orders',
  },
  '/super-admin/radiology/category': {
    [ROLES.RADIOLOGIST]: '/radiologist/radiology/category',
  },
  '/super-admin/radiology/charge-category': {
    [ROLES.RADIOLOGIST]: '/radiologist/radiology/charge-category',
  },
  '/super-admin/radiology/charge-name': {
    [ROLES.RADIOLOGIST]: '/radiologist/radiology/charge-name',
  },
  '/super-admin/radiology/test-parameters': {
    [ROLES.RADIOLOGIST]: '/radiologist/radiology/test-parameters',
  },
  '/super-admin/radiology/radiology-invoice': {
    [ROLES.RADIOLOGIST]: '/radiologist/radiology/invoice',
  },
  '/super-admin/opd/department': {
    [ROLES.DOCTOR]: '/doctor/opd/department',
    [ROLES.RECEPTIONIST]: '/receptionist/opd/department',
    [ROLES.NURSE]: '/nurse/opd/department',
    [ROLES.ACCOUNTANT]: '/accountant/opd/department',
    [ROLES.RADIOLOGY]: '/radiology/opd/department',
    [ROLES.PHARMACIST]: '/pharmacist/opd/department',
    [ROLES.SUB_ADMIN]: '/sub-admin/opd',
  },
  '/super-admin/opd/category': {
    [ROLES.DOCTOR]: '/doctor/opd/category',
    [ROLES.RECEPTIONIST]: '/receptionist/opd/category',
    [ROLES.NURSE]: '/nurse/opd/category',
    [ROLES.ACCOUNTANT]: '/accountant/opd/category',
    [ROLES.RADIOLOGY]: '/radiology/opd/category',
    [ROLES.PHARMACIST]: '/pharmacist/opd/category',
    [ROLES.SUB_ADMIN]: '/sub-admin/opd',
  },
  '/super-admin/opd/charge-category': {
    [ROLES.DOCTOR]: '/doctor/opd/charge-category',
    [ROLES.RECEPTIONIST]: '/receptionist/opd/charge-category',
    [ROLES.NURSE]: '/nurse/opd/charge-category',
    [ROLES.ACCOUNTANT]: '/accountant/opd/charge-category',
    [ROLES.RADIOLOGY]: '/radiology/opd/charge-category',
    [ROLES.PHARMACIST]: '/pharmacist/opd/charge-category',
    [ROLES.SUB_ADMIN]: '/sub-admin/opd',
  },
  '/super-admin/ipd/ward': {
    [ROLES.DOCTOR]: '/doctor/ipd/ward',
    [ROLES.RECEPTIONIST]: '/receptionist/ipd/ward',
    [ROLES.IPD_STAFF]: '/ipd-staff/ward',
    [ROLES.NURSE]: '/nurse/ipd/ward',
    [ROLES.ACCOUNTANT]: '/accountant/ipd/ward',
    [ROLES.RADIOLOGY]: '/radiology/ipd/ward',
    [ROLES.PHARMACIST]: '/pharmacist/ipd/ward',
    [ROLES.SUB_ADMIN]: '/sub-admin/ipd',
  },
  '/super-admin/ipd/room': {
    [ROLES.DOCTOR]: '/doctor/ipd/room',
    [ROLES.RECEPTIONIST]: '/receptionist/ipd/room',
    [ROLES.IPD_STAFF]: '/ipd-staff/room',
    [ROLES.NURSE]: '/nurse/ipd/room',
    [ROLES.ACCOUNTANT]: '/accountant/ipd/room',
    [ROLES.RADIOLOGY]: '/radiology/ipd/room',
    [ROLES.PHARMACIST]: '/pharmacist/ipd/room',
    [ROLES.SUB_ADMIN]: '/sub-admin/ipd',
  },
  '/super-admin/ipd/bed': {
    [ROLES.DOCTOR]: '/doctor/ipd/bed',
    [ROLES.RECEPTIONIST]: '/receptionist/ipd/bed',
    [ROLES.IPD_STAFF]: '/ipd-staff/bed',
    [ROLES.NURSE]: '/nurse/ipd/bed',
    [ROLES.ACCOUNTANT]: '/accountant/ipd/bed',
    [ROLES.RADIOLOGY]: '/radiology/ipd/bed',
    [ROLES.PHARMACIST]: '/pharmacist/ipd/bed',
    [ROLES.SUB_ADMIN]: '/sub-admin/ipd',
  },
  '/super-admin/ipd/bed-status': {
    [ROLES.DOCTOR]: '/doctor/ipd/bed-status',
    [ROLES.RECEPTIONIST]: '/receptionist/ipd/bed-status',
    [ROLES.IPD_STAFF]: '/ipd-staff/bed-status',
    [ROLES.NURSE]: '/nurse/ipd/bed-status',
    [ROLES.ACCOUNTANT]: '/accountant/ipd/bed-status',
    [ROLES.RADIOLOGY]: '/radiology/ipd/bed-status',
    [ROLES.PHARMACIST]: '/pharmacist/ipd/bed-status',
    [ROLES.SUB_ADMIN]: '/sub-admin/ipd',
  },
  '/super-admin/ambulance': {
    [ROLES.AMBULANCE]: '/ambulance/dashboard',
    [ROLES.ACCOUNTANT]: '/accountant/ambulance',
    [ROLES.FRONT_DESK]: '/front-desk/ambulance',
    [ROLES.SUB_ADMIN]: '/sub-admin/ambulance',
  },
  '/super-admin/ambulance/dispatch': {
    [ROLES.AMBULANCE]: '/ambulance/dispatch',
    [ROLES.ACCOUNTANT]: '/accountant/ambulance',
    [ROLES.FRONT_DESK]: '/front-desk/ambulance',
    [ROLES.SUB_ADMIN]: '/sub-admin/ambulance',
  },
  '/super-admin/ambulance/reports': {
    [ROLES.AMBULANCE]: '/ambulance/reports',
    [ROLES.ACCOUNTANT]: '/accountant/ambulance',
    [ROLES.FRONT_DESK]: '/front-desk/ambulance',
    [ROLES.SUB_ADMIN]: '/sub-admin/ambulance',
  },
  '/super-admin/opd/add-prescription': {
    [ROLES.DOCTOR]: '/doctor/opd/prescription',
  },
  '/super-admin/opd/admit': {
    [ROLES.DOCTOR]: '/doctor/ipd/add',
    [ROLES.RECEPTIONIST]: '/receptionist/ipd/add',
    [ROLES.IPD_STAFF]: '/ipd-staff/ipd/add',
  },
  '/super-admin/ipd/add-ipd': {
    [ROLES.DOCTOR]: '/doctor/ipd/add',
    [ROLES.RECEPTIONIST]: '/receptionist/ipd/add',
    [ROLES.IPD_STAFF]: '/ipd-staff/ipd/add',
  },
  '/super-admin/ipd/ipd-patients': {
    [ROLES.IPD_STAFF]: '/ipd-staff/ipd/patients',
  },
  '/super-admin/ipd/admitted-patients': {
    [ROLES.DOCTOR]: '/doctor/ipd/admitted',
    [ROLES.RECEPTIONIST]: '/receptionist/ipd/admitted',
    [ROLES.IPD_STAFF]: '/ipd-staff/ipd/admitted',
  },
  '/super-admin/ipd/discharged-patients': {
    [ROLES.DOCTOR]: '/doctor/ipd/discharged',
    [ROLES.RECEPTIONIST]: '/receptionist/ipd/discharged',
    [ROLES.IPD_STAFF]: '/ipd-staff/ipd/discharged',
  },
  '/super-admin/pathology/generate-bill': {
    [ROLES.LAB_TECHNICIAN]: '/lab-technician/pathology/generate-bill',
  },
  '/super-admin/AppointmentBill': {
    [ROLES.BILLING_STAFF]: '/billing/appointment-bill',
  },
  '/super-admin/appointment-bill': {
    [ROLES.BILLING_STAFF]: '/billing/appointment-bill',
  },
  '/super-admin/RadiologyBill': {
    [ROLES.BILLING_STAFF]: '/billing/radiology-bill',
  },
  '/super-admin/radiology-bill': {
    [ROLES.BILLING_STAFF]: '/billing/radiology-bill',
  },
  '/super-admin/PathologyBill': {
    [ROLES.BILLING_STAFF]: '/billing/pathology-bill',
    [ROLES.LAB_TECHNICIAN]: '/lab-technician/pathology/billing',
  },
  '/super-admin/pathology-bill': {
    [ROLES.BILLING_STAFF]: '/billing/pathology-bill',
    [ROLES.LAB_TECHNICIAN]: '/lab-technician/pathology/billing',
  },
  '/super-admin/PharmacyBill': {
    [ROLES.BILLING_STAFF]: '/billing/pharmacy-bill',
  },
  '/super-admin/pharmacy-bill': {
    [ROLES.BILLING_STAFF]: '/billing/pharmacy-bill',
  },
};

export const getRoleDashboardPath = (role) =>
  ROLE_DASHBOARDS[role] || ROLE_DASHBOARDS[ROLES.SUPER_ADMIN];

export const resolveRolePath = (path, role, { strict = false } = {}) => {
  if (!path || typeof path !== 'string') return path;
  if (role === ROLES.SUPER_ADMIN) return path;
  if (path === '/super-admin' || path === '/super-admin/dashboard') {
    return getRoleDashboardPath(role);
  }

  const rolePrefix = ROLE_DASHBOARDS[role]?.replace('/dashboard', '');
  if (rolePrefix) {
    if (path === '/profile')  return `${rolePrefix}/profile`;
    if (path === '/settings') return `${rolePrefix}/settings`;
  }

  const exact = EXACT_RULES[path]?.[role];
  if (exact) return exact;

  const rule = PREFIX_RULES.find(({ from }) =>
    path === from || path.startsWith(`${from}/`),
  );

  if (!rule) return strict ? null : path;

  const targetPrefix = rule.roles[role];
  if (!targetPrefix) return strict ? null : path;

  return `${targetPrefix}${path.slice(rule.from.length)}`;
};

export const isRolePathSupported = (path, role) =>
  Boolean(resolveRolePath(path, role, { strict: true }));

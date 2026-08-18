// src/utils/permission.utils.js
import { ROLES } from '@constants/roles';

/**
 * Permission matrix — defines what each role can do.
 * Format: { ROLE: { resource: ['action', ...] } }
 *
 * Usage:
 *   import { can } from '@utils/permission.utils';
 *   if (can(userRole, 'patient', 'delete')) { ... }
 */
const PERMISSIONS = {
  [ROLES.SUPER_ADMIN]: {
    dashboard: ['view'],
    hospital: ['view', 'create', 'edit', 'delete'],
    user: ['view', 'create', 'edit', 'delete'],
    patients: ['view', 'create', 'edit', 'delete'],
    ipd: ['view', 'create', 'edit', 'delete'],
    emergency: ['view','create','edit','delete'],
    opd: ['view', 'create', 'edit', 'delete'],
    pharmacy: ['view'],
    ambulance: ['view'],
    appointments: ['view'],
    doctor: ['view'],
    ivf: ['view'],
    pathology: ['view'],
    radiology: ['view'],
    role: ['view'],
    permission: ['view'],
    payment: ['view'],
    report: ['view', 'export'],
    settings: ['view', 'edit'],
    auditLog: ['view'],
    menuSettings: ['view'],
    appointmentBill: ['view'],
    pharmacyBill: ['view'],
    pathologyBill: ['view'],
    radiologyBill: ['view'],
    bloodBank: ['view', 'create', 'edit', 'delete'],
    ot: ['view', 'create', 'edit', 'delete'],
    stock: ['view', 'create', 'edit', 'delete'],

  },
  [ROLES.SUB_ADMIN]: {
    dashboard: ['view'],
    hospital: ['view', 'edit'],
    user: ['view', 'create', 'edit'],
    patient: ['view'],
    ipd: ['view'],
    opd: ['view'],
    pharmacy: ['view'],
    ambulance: ['view'],
    appointment: ['view'],
    doctor: ['view'],
    ivf: ['view'],
    pathology: ['view'],
    radiology: ['view'],
    report: ['view', 'export'],
    settings: ['view'],
    profile: ['view'],
    bloodBank: ['view', 'create', 'edit', 'delete'],
    stock: ['view', 'create', 'edit', 'delete'],
  },
  [ROLES.HOSPITAL_ADMIN]: {
    dashboard: ['view'],
    doctor: ['view', 'create', 'edit', 'delete'],
    staff: ['view', 'create', 'edit', 'delete'],
    department: ['view', 'create', 'edit'],
    ward: ['view', 'create', 'edit'],
    inventory: ['view', 'edit'],
    report: ['view', 'export'],
    settings: ['view'],
    profile: ['view'],
  },
  [ROLES.FRONT_DESK]: {
    dashboard: ['view'],
    patient: ['view', 'create', 'edit'],
    appointment: ['view', 'create', 'edit', 'delete'],
    token: ['view', 'create'],
    opd: ['view'],
    ipd: ['view'],
    pharmacy: ['view'],
    radiology: ['view'],
    pathology: ['view'],
    ambulance: ['view'],
    billing: ['view', 'create'],
    profile: ['view'],
    settings: ['view'],
  },
  [ROLES.ACCOUNTANT]: {
    dashboard: ['view'],
    Patients: ['view'],
    bill: ['view', 'create', 'edit'],
    appointment: ['view'],
    opd: ['view'],
    ipd: ['view'],
    pharmacy: ['view'],
    pathology: ['view'],
    radiology: ['view'],
    ambulance: ['view'],
    payment: ['view', 'create'],
    expense: ['view', 'create', 'edit'],
    insurance: ['view', 'edit'],
    report: ['view', 'export'],
    profile: ['view'],
    settings: ['view'],
  },
  [ROLES.NURSE]: {
    dashboard: ['view'],
    Patient: ['view'],
    ipd: ['view'],
    opd: ['view'],
    Vital: ['view', 'create', 'edit'],
    Medication: ['view', 'edit'],
    ward: ['view', 'edit'],
    carePlan: ['view', 'create', 'edit'],
    handover: ['view'],
    profile: ['view'],
    settings: ['view'],
  },
  [ROLES.LABORATORY]: {
    dashboard: ['view'],
    labOrder: ['view', 'edit'],
    labResult: ['view', 'create', 'edit'],
    sample: ['view', 'create'],
    catalog: ['view', 'create', 'edit'],
    report: ['view'],
    profile: ['view'],
    settings: ['view'],
  },
  [ROLES.RADIOLOGY]: {
    dashboard: ['view'],
    patient: ['view'],
    billing: ['view'],
    opd: ['view'],
    ipd: ['view'],
    report: ['view'],
    scanOrder: ['view', 'edit'],
    scanResult: ['view', 'create', 'edit'],
    equipment: ['view', 'edit'],
    imaging: ['view'],
    catalog: ['view', 'create', 'edit'],
    profile: ['view'],
    settings: ['view'],
  },
  [ROLES.AMBULANCE]: {
    dashboard: ['view'],
    dispatch: ['view', 'create'],
    fleet: ['view', 'edit'],
    call: ['view', 'create'],
    driver: ['view', 'create', 'edit'],
    profile: ['view'],
    settings: ['view'],
  },
  [ROLES.PHARMACIST]: {
    dashboard: ['view'],
    prescription: ['view', 'edit'],
    medicine: ['view', 'create', 'edit'],
    stock: ['view', 'edit'],
    purchaseOrder: ['view', 'create'],
    supplier: ['view', 'create', 'edit'],
    bill: ['view'],
    opd: ['view'],
    ipd: ['view'],
    profile: ['view'],
    settings: ['view'],
  },
  [ROLES.RECEPTIONIST]: {
  dashboard:    ['view'],
  patient:      ['view', 'create', 'edit'],
  opd:          ['view', 'create', 'edit'],
  // prescription: ['view', 'create', 'edit'],
  ipd:          ['view'],
  emergency:    ['view', 'create', 'edit'],
  appointment:  ['view', 'create', 'edit'],
  appointmentBill: ['view'],
  doctor:       ['view'],
  profile:      ['view'],
  settings:     ['view'],
},
};

const ACTION_ALIASES = {
  view: 'read',
  edit: 'update',
};

export const normalizePermissionResource = (resource) =>
  String(resource || '').trim().toLowerCase();

export const normalizePermissionAction = (action) => {
  const normalized = String(action || '').trim().toLowerCase();
  return ACTION_ALIASES[normalized] || normalized;
};

const normalizeAction = normalizePermissionAction;

const RESOURCE_ALIASES = {
  ipd: ['ipd_admission'],
  pathology_module: [
    'pathology_overview',
    'pathology_master',
    'pathology_order',
    'pathology_category',
    'pathology_subcategory',
    'pathology_charge_category',
    'pathology_charge_name',
  ],
  pathology: [
    'pathology_overview',
    'pathology_master',
    'pathology_order',
    'pathology_category',
    'pathology_subcategory',
    'pathology_charge_category',
    'pathology_charge_name',
  ],
  radiology_module: [
    'radiology_overview',
    'radiology_master',
    'radiology_order',
    'radiology_category',
    'radiology_charge_category',
    'radiology_charge_name',
    'radiology_test_parameter',
  ],
  radiology: [
    'radiology_overview',
    'radiology_master',
    'radiology_order',
    'radiology_category',
    'radiology_charge_category',
    'radiology_charge_name',
    'radiology_test_parameter',
    // 'radiology_invoice',
  ],
  pharmacy_module: [
    'pharmacy_overview',
    // 'sell_medicine',
    'purchase_medicine',
    'purchase_return',
    'sales_return',
    'medicine',
    'medicine_category',
    'medicine_subcategory',
    'medicine_self',
    'supplier',
    'expiry',
    'stock_ledger',
    'pharmacy_report',
  ],
  pharmacy: [
    'pharmacy_overview',
    // 'sell_medicine',
    'purchase_medicine',
    'purchase_return',
    'sales_return',
    'medicine',
    'medicine_category',
    'medicine_subcategory',
    'medicine_self',
    'supplier',
    'expiry',
    'stock_ledger',
    'pharmacy_report',
  ],
  pharma: [
    'pharmacy_overview',
    // 'sell_medicine',
    'purchase_medicine',
    'purchase_return',
    'sales_return',
    'medicine',
    'medicine_category',
    'medicine_subcategory',
    'medicine_self',
    'supplier',
    'expiry',
    'stock_ledger',
    'pharmacy_report',
  ],
  billing: ['appointment_billing'],
  appointmentbill: ['appointment_billing'],
  appointment_bill: ['appointment_billing'],
  patients: ['patient'],
  appointments: ['appointment'],
  bloodbank: ['bloodbank', 'bloodBank'],
  stockledger: ['stock_ledger'],
  stock_ledger: ['stockledger'],
  pharmacyreport: ['pharmacy_report'],
  // pharmacy_report: ['report'],
  pharmacy_report: ['report'],
  pathology_invoice: ['pathology_invoice', 'pathology_generate_bill'],
  radiology_invoice: ['radiology_invoice', 'radiology_generate_bill'],
  sell_medicine:     ['sell_medicine'],
};

const getResourceCandidates = (resource) => {
  const normalized = normalizePermissionResource(resource);
  return [normalized, ...(RESOURCE_ALIASES[normalized] || []).map(normalizePermissionResource)];
};

export const normalizeRole = (role) =>
  String(role || '')
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, '_');

export const isSuperAdminRole = (role) => normalizeRole(role) === ROLES.SUPER_ADMIN;

export const canAccessPermission = ({
  role,
  permissionSet,
  resource,
  action = 'read',
}) => {
  if (isSuperAdminRole(role)) return true;
  if (!resource) return true;
  if (!permissionSet) return false;
  const normalizedAction = normalizeAction(action);
  return getResourceCandidates(resource).some((candidate) =>
    permissionSet.has(`${candidate}:${normalizedAction}`),
  );
};

/**
 * can — check if a role has permission for an action on a resource.
 * Usage: can('NURSE', 'vital', 'create') → true
 */
// export const can = (role, resource, action) => {
//   if (isSuperAdminRole(role)) return true;

//   const rolePerms = PERMISSIONS[normalizeRole(role)];
//   if (!rolePerms) return false;
//   const resourcePerms = rolePerms[resource];
//   if (!resourcePerms) return false;
//   return resourcePerms.includes(action) || resourcePerms.includes(normalizeAction(action));
// };

export const can = (role, resource, action, permissionSet = null) => {
  if (isSuperAdminRole(role)) return true;
  if (permissionSet) {
    return canAccessPermission({ role, permissionSet, resource, action });
  }
  // fallback to hardcoded matrix (for legacy code only)
  const rolePerms = PERMISSIONS[normalizeRole(role)];
  if (!rolePerms) return false;
  const resourcePerms = rolePerms[resource];
  if (!resourcePerms) return false;
  return resourcePerms.includes(action) || resourcePerms.includes(normalizeAction(action));
};

export default PERMISSIONS;

/**
 * ROLES — single source of truth for all role keys.
 * Use these constants everywhere; never type the string manually.
 *
 * Usage:
 *   import { ROLES } from '@constants/roles';
 *   if (user.role === ROLES.SUPER_ADMIN) { ... }
 */
export const ROLES = {
  SUPER_ADMIN:    'SUPER_ADMIN',
  DOCTOR:         'DOCTOR',
  RECEPTIONIST:   'RECEPTIONIST',
  LAB_TECHNICIAN: 'LAB_TECHNICIAN',
  RADIOLOGIST:    'RADIOLOGIST',
  BILLING_STAFF:  'BILLING_STAFF',
  IPD_STAFF:      'IPD_STAFF',
  SUB_ADMIN:      'SUB_ADMIN',
  HOSPITAL_ADMIN: 'HOSPITAL_ADMIN',
  FRONT_DESK:     'FRONT_DESK',
  ACCOUNTANT:     'ACCOUNTANT',
  NURSE:          'NURSE',
  LABORATORY:     'LABORATORY',
  RADIOLOGY:      'RADIOLOGY',
  AMBULANCE:      'AMBULANCE',
  PHARMACIST:     'PHARMACIST',
};

/** Human-readable role labels */
export const ROLE_LABELS = {
  [ROLES.SUPER_ADMIN]:    'Super Admin',
  [ROLES.DOCTOR]:         'Doctor',
  [ROLES.RECEPTIONIST]:   'Receptionist',
  [ROLES.LAB_TECHNICIAN]: 'Lab Technician',
  [ROLES.RADIOLOGIST]:    'Radiologist',
  [ROLES.BILLING_STAFF]:  'Billing Staff',
  [ROLES.IPD_STAFF]:      'IPD Staff',
  [ROLES.SUB_ADMIN]:      'Sub Admin',
  [ROLES.HOSPITAL_ADMIN]: 'Hospital Admin',
  [ROLES.FRONT_DESK]:     'Front Desk',
  [ROLES.ACCOUNTANT]:     'Accountant',
  [ROLES.NURSE]:          'Nurse',
  [ROLES.LABORATORY]:     'Laboratory',
  [ROLES.RADIOLOGY]:      'Radiology',
  [ROLES.AMBULANCE]:      'Ambulance',
  [ROLES.PHARMACIST]:     'Pharmacist',
};

/** Tailwind color class per role (bg + text) */
export const ROLE_COLORS = {
  [ROLES.SUPER_ADMIN]:    { bg: 'bg-indigo-100',  text: 'text-indigo-700',  dot: 'bg-indigo-500'  },
  [ROLES.DOCTOR]:         { bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-500'    },
  [ROLES.RECEPTIONIST]:   { bg: 'bg-teal-100',    text: 'text-teal-700',    dot: 'bg-teal-500'    },
  [ROLES.LAB_TECHNICIAN]: { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  [ROLES.RADIOLOGIST]:    { bg: 'bg-indigo-100',  text: 'text-indigo-700',  dot: 'bg-indigo-500'  },
  [ROLES.BILLING_STAFF]:  { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  [ROLES.IPD_STAFF]:      { bg: 'bg-sky-100',     text: 'text-sky-700',     dot: 'bg-sky-500'     },
  [ROLES.SUB_ADMIN]:      { bg: 'bg-violet-100',  text: 'text-violet-700',  dot: 'bg-violet-500'  },
  [ROLES.HOSPITAL_ADMIN]: { bg: 'bg-cyan-100',    text: 'text-cyan-700',    dot: 'bg-cyan-500'    },
  [ROLES.FRONT_DESK]:     { bg: 'bg-teal-100',    text: 'text-teal-700',    dot: 'bg-teal-500'    },
  [ROLES.ACCOUNTANT]:     { bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  [ROLES.NURSE]:          { bg: 'bg-pink-100',    text: 'text-pink-700',    dot: 'bg-pink-500'    },
  [ROLES.LABORATORY]:     { bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500'   },
  [ROLES.RADIOLOGY]:      { bg: 'bg-indigo-100',  text: 'text-indigo-700',  dot: 'bg-indigo-500'  },
  [ROLES.AMBULANCE]:      { bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500'     },
  [ROLES.PHARMACIST]:     { bg: 'bg-purple-100',  text: 'text-purple-700',  dot: 'bg-purple-500'  },
};

// src/constants/status.js

export const PATIENT_STATUS = {
  ACTIVE:     'ACTIVE',
  ADMITTED:   'ADMITTED',
  DISCHARGED: 'DISCHARGED',
  CRITICAL:   'CRITICAL',
  DECEASED:   'DECEASED',
};

export const APPOINTMENT_STATUS = {
  SCHEDULED:  'SCHEDULED',
  CONFIRMED:  'CONFIRMED',
  COMPLETED:  'COMPLETED',
  CANCELLED:  'CANCELLED',
  NO_SHOW:    'NO_SHOW',
};

export const BILL_STATUS = {
  PENDING:    'PENDING',
  PAID:       'PAID',
  PARTIAL:    'PARTIAL',
  OVERDUE:    'OVERDUE',
  CANCELLED:  'CANCELLED',
};

export const TEST_STATUS = {
  ORDERED:    'ORDERED',
  SAMPLE_COLLECTED: 'SAMPLE_COLLECTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED:  'COMPLETED',
  REVIEWED:   'REVIEWED',
};

export const AMBULANCE_STATUS = {
  AVAILABLE:  'AVAILABLE',
  DISPATCHED: 'DISPATCHED',
  RETURNING:  'RETURNING',
  MAINTENANCE:'MAINTENANCE',
};

export const STATUS_COLORS = {
  // patient
  ACTIVE:     'bg-green-100 text-green-700',
  ADMITTED:   'bg-blue-100 text-blue-700',
  DISCHARGED: 'bg-gray-100 text-gray-700',
  CRITICAL:   'bg-red-100 text-red-700',
  DECEASED:   'bg-gray-200 text-gray-600',
  // appointment
  SCHEDULED:  'bg-blue-100 text-blue-700',
  CONFIRMED:  'bg-green-100 text-green-700',
  COMPLETED:  'bg-teal-100 text-teal-700',
  CANCELLED:  'bg-red-100 text-red-700',
  NO_SHOW:    'bg-orange-100 text-orange-700',
  // bill
  PENDING:    'bg-yellow-100 text-yellow-700',
  PAID:       'bg-green-100 text-green-700',
  PARTIAL:    'bg-blue-100 text-blue-700',
  OVERDUE:    'bg-red-100 text-red-700',
  // ambulance
  AVAILABLE:  'bg-green-100 text-green-700',
  DISPATCHED: 'bg-red-100 text-red-700',
  RETURNING:  'bg-yellow-100 text-yellow-700',
  MAINTENANCE:'bg-orange-100 text-orange-700',
};

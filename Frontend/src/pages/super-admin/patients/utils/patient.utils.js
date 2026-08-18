import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/* ─────────────────────────────────────────────────────────────
   AGE HELPERS
───────────────────────────────────────────────────────────── */

/**
 * Calculates age breakdown (years / months / days) from a date-of-birth string.
 * Returns string values so they plug directly into form fields.
 */
export const calculateAgeFromDob = (dateOfBirth) => {
  if (!dateOfBirth) return { years: '', months: '', days: '' };

  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return { years: '', months: '', days: '' };

  const today = new Date();
  let years  = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth()    - birthDate.getMonth();
  let days   = today.getDate()     - birthDate.getDate();

  if (days < 0) {
    const previousMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days   += previousMonth.getDate();
    months -= 1;
  }
  if (months < 0) {
    months += 12;
    years  -= 1;
  }

  return {
    years:  String(Math.max(years, 0)),
    months: String(Math.max(months, 0)),
    days:   String(Math.max(days, 0)),
  };
};

/**
 * Returns a compact human-readable age string from a patient object.
 * Prefers explicit ageYears/ageMonths/ageDays fields; falls back to dob.
 * e.g.  "34y 2m 5d"  or  "34y"  or  "-"
 */
export const formatPatientAge = (patient) => {
  const years  = patient?.ageYears  ? String(patient.ageYears).trim()  : '';
  const months = patient?.ageMonths ? String(patient.ageMonths).trim() : '';
  const days   = patient?.ageDays   ? String(patient.ageDays).trim()   : '';

  const parts = [];
  if (years)  parts.push(`${years}y`);
  if (months) parts.push(`${months}m`);
  if (days)   parts.push(`${days}d`);
  if (parts.length) return parts.join(' ');

  if (patient?.dob) {
    const dob = new Date(patient.dob);
    if (!Number.isNaN(dob.getTime())) {
      const diffMs    = Date.now() - dob.getTime();
      const ageDate   = new Date(diffMs);
      const calcYears = Math.abs(ageDate.getUTCFullYear() - 1970);
      return `${calcYears}y`;
    }
  }

  return '-';
};

/* ─────────────────────────────────────────────────────────────
   PATIENT ID HELPERS
───────────────────────────────────────────────────────────── */

/**
 * Formats any raw patient identifier into the canonical PAT### format.
 *
 * Examples:
 *   "PAT-0001"   → "PAT001"
 *   "PAT001"     → "PAT001"  (already valid)
 *   "1"  /  1    → "PAT001"
 *   UUID / junk  → "PAT001"  (falls back to row index)
 *   null + idx 4 → "PAT005"
 */
export const formatPatientId = (raw, index = null) => {
  if (!raw && index === null) return '—';

  const str = String(raw ?? '').trim();

  // Already PAT### (with optional dash/space) → normalise padding
  const alreadyValid = str.match(/^PAT[-\s]?(\d+)$/i);
  if (alreadyValid) {
    return `PAT${String(parseInt(alreadyValid[1], 10)).padStart(3, '0')}`;
  }

  // Pure numeric string → wrap
  const numericOnly = str.match(/^(\d+)$/);
  if (numericOnly) {
    return `PAT${String(parseInt(numericOnly[1], 10)).padStart(3, '0')}`;
  }

  // UUID / arbitrary string → fall back to row index
  if (index !== null) {
    return `PAT${String(index + 1).padStart(3, '0')}`;
  }

  return '—';
};

/**
 * Generates a patient ID from a sequence number.
 * e.g.  generatePatientId(5)  →  "PAT005"
 */
export const generatePatientId = (sequenceNumber) =>
  `PAT${String(sequenceNumber).padStart(3, '0')}`;

/* ─────────────────────────────────────────────────────────────
   VALIDATION
───────────────────────────────────────────────────────────── */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\d{10}$/;

export const validatePatient = (values) => {
  const errors = {};

  if (!values.name?.trim()) {
    errors.name = 'Name is required';
  }

  if (!values.ageYears && !values.dob) {
    errors.ageYears = 'Age or Date of Birth is required';
  }

  if (values.email && !EMAIL_PATTERN.test(values.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (values.phone && !PHONE_PATTERN.test(String(values.phone).trim())) {
    errors.phone = 'Phone must be exactly 10 digits';
  }

  if (
    values.patientPhoto?.type &&
    !values.patientPhoto.type.startsWith('image/')
  ) {
    errors.patientPhoto = 'Only image files are allowed';
  }

  return errors;
};

/* ─────────────────────────────────────────────────────────────
   EXPORT — shared row builder
───────────────────────────────────────────────────────────── */

const buildRows = (patients) =>
  patients.map((patient, index) => ({
    No:                 index + 1,
    'Patient ID':       formatPatientId(patient.patientId ?? patient.id, index),
    Name:               patient.name                              ?? '-',
    'Guardian Name':    patient.guardianName                      ?? '-',
    Gender:             patient.gender                            ?? '-',
    'Date of Birth':    patient.dateOfBirth ?? patient.dob        ?? '-',
    'Marital Status':   patient.maritalStatus                     ?? '-',
    Age:                formatPatientAge(patient),
    'Blood Group':      patient.blood ?? patient.bloodGroup       ?? '-',
    Phone:              patient.phone                             ?? '-',
    Email:              patient.email                             ?? '-',
    'Alternate Number': patient.alternateNumber                   ?? '-',
    Address:            patient.address                           ?? '-',
    Remarks:            patient.remarks                           ?? '-',
    Allergies:          patient.allergies                         ?? '-',
    TPA:                patient.tpa                               ?? '-',
    'TPA ID':           patient.tpaId                             ?? '-',
    'TPA Validity':     patient.tpaValidity                       ?? '-',
    'National ID':      patient.nationalIdentificationNumber      ?? '-',
    Status:             patient.status                            ?? '-',
    Registered:         patient.registered ?? patient.registeredAt ?? '-',
  }));

/* ─────────────────────────────────────────────────────────────
   EXPORT — XLSX
───────────────────────────────────────────────────────────── */

const downloadBlob = (blob, fileName) => {
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportPatientsToXlsx = (patients, fileName = 'patients.xlsx') => {
  const sheet    = XLSX.utils.json_to_sheet(buildRows(patients));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, 'Patients');
  const output = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  downloadBlob(
    new Blob([output], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }),
    fileName,
  );
};

/* ─────────────────────────────────────────────────────────────
   EXPORT — CSV
───────────────────────────────────────────────────────────── */

export const exportPatientsToCsv = (patients, fileName = 'patients.csv') => {
  const rows    = buildRows(patients);
  const headers = Object.keys(rows[0] || {});

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const value = String(row[header] ?? '');
          return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
        })
        .join(','),
    ),
  ].join('\n');

  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), fileName);
};

/* ─────────────────────────────────────────────────────────────
   EXPORT — PDF
───────────────────────────────────────────────────────────── */

export const exportPatientsToPdf = (patients, fileName = 'patients.pdf') => {
  const rows    = buildRows(patients);
  const headers = Object.keys(rows[0] ?? {});
  const doc     = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(14);
  doc.text('Patient Records', 14, 14);

  autoTable(doc, {
    head:       [headers],
    body:       rows.length ? rows.map((row) => Object.values(row)) : [headers.map(() => '')],
    startY:     20,
    styles:     { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(fileName);
};

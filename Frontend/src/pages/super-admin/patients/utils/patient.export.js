// import * as XLSX from 'xlsx';
// import jsPDF from 'jspdf';
// import autoTable from 'jspdf-autotable';
import { formatPatientAge } from './patient.formatters';

const buildRows = (patients) =>
  patients.map((patient, index) => ({
    No: index + 1,
    Name: patient.name,
    'Guardian Name': patient.guardianName || '-',
    Gender: patient.gender,
    'Date of Birth': patient.dateOfBirth || '-',
    'Marital Status': patient.maritalStatus || '-',
    Age: formatPatientAge(patient),
    'Blood Group': patient.blood || '-',
    Phone: patient.phone || '-',
    Email: patient.email,
    'Alternate Number': patient.alternateNumber || '-',
    Address: patient.address || '-',
    Remarks: patient.remarks || '-',
    Allergies: patient.allergies || '-',
    TPA: patient.tpa || '-',
    'TPA ID': patient.tpaId || '-',
    'TPA Validity': patient.tpaValidity || '-',
    'National ID': patient.nationalIdentificationNumber || '-',
    Status: patient.status,
    Registered: patient.registered,
  }));

const downloadBlob = (blob, fileName) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportPatientsToXlsx = (patients, fileName = 'patients.xlsx') => {
  const sheet = XLSX.utils.json_to_sheet(buildRows(patients));
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

export const exportPatientsToCsv = (patients, fileName = 'patients.csv') => {
  const rows = buildRows(patients);
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

export const exportPatientsToPdf = (patients, fileName = 'patients.pdf') => {
  const rows = buildRows(patients);
  const doc = new jsPDF({ orientation: 'landscape' });
  const headers = Object.keys(rows[0] || {
    No: '',
    Name: '',
    'Guardian Name': '',
    Gender: '',
    'Date of Birth': '',
    'Marital Status': '',
    Age: '',
    'Blood Group': '',
    Phone: '',
    Email: '',
    'Alternate Number': '',
    Address: '',
    Remarks: '',
    Allergies: '',
    TPA: '',
    'TPA ID': '',
    'TPA Validity': '',
    'National ID': '',
    Status: '',
    Registered: '',
  });

  doc.setFontSize(14);
  doc.text('Patient Records', 14, 14);

  autoTable(doc, {
    head: [headers],
    body: rows.length
      ? rows.map((row) => Object.values(row))
      : [headers.map(() => '')],
    startY: 20,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [59, 130, 246] },
  });

  doc.save(fileName);
};

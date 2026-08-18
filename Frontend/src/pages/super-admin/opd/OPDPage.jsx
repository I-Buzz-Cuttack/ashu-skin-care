// src/pages/super-admin/opd/OPDPage.jsx
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { ROLES } from "../../../constants/roles";
import { ROUTES } from "../../../constants/routes";
import {
  Plus, Stethoscope, FilePlus, Calendar, Clock, History, ClipboardCheck,
  Download, FileText, Receipt, X, Printer, Eye, Pencil,
  Trash2, BedDouble,
} from "lucide-react";
import PageHeader    from "@components/layout/PageHeader/PageHeader";
import DataTable     from "@components/tables/DataTable/DataTable";
import Pagination    from "@components/tables/Pagination/Pagination";
import Badge         from "@components/ui/Badge/Badge";
import Button        from "@components/ui/Button/Button";
import StatCard      from "@components/cards/StatCard/StatCard";
import ConfirmModal  from "@components/modals/ConfirmModal/ConfirmModal";
import TableActions  from "@components/tables/TableActions/TableActions";
import { useModal }      from "@hooks/useModal";
import { useToast }      from "@hooks/useToast";
import { usePagination } from "@hooks/usePagination";
import { useDebounce }   from "@hooks/useDebounce";
import apiClient from "../../../api/apiClient";
import { usePermission } from '../../../hooks/usePermission';

/* ─────────────────────────────────────────────────────────────
   CONSTANTS / FILTER CONFIG
───────────────────────────────────────────────────────────── */
const TABS = [
  { key: "today",    label: "Today OPD",    icon: Clock    },
  { key: "upcoming", label: "Upcoming OPD", icon: Calendar },
  { key: "old",      label: "Old OPD",      icon: History  },
  { key: "converted", label: "Converted IPD", icon: ClipboardCheck },
];

const STATUS_OPTIONS = [
  { label: "All",        value: "" },
  { label: "Waiting",    value: "Waiting" },
  { label: "Consulting", value: "Consulting" },
  { label: "Done",       value: "Done" },
  { label: "Cancelled",  value: "Cancelled" },
  { label: "Converted IPD", value: "Converted IPD" },
];

const OPD_MASTER_LINKS = [
  { label: "Register OPD", text: "Create token and bill", path: "/super-admin/opd/add", icon: Plus, tone: "opd-tile-teal" },
  { label: "Patient Scanner", text: "Scan QR / UHID", path: "/super-admin/opd/patient-scanner", icon: Eye, tone: "opd-tile-blue" },
  { label: "E-Prescription", text: "Rx, vitals and tests", path: "/super-admin/opd/add-prescription", icon: FilePlus, tone: "opd-tile-amber" },
  { label: "Doctor Master", text: "Doctor profiles", path: "/super-admin/opd/opd-doctors", icon: Stethoscope, tone: "opd-tile-indigo" },
  { label: "Doctor Fees", text: "Consultation rules", path: "/super-admin/opd/doctor-fees", icon: Receipt, tone: "opd-tile-emerald" },
  { label: "Departments", text: "OPD departments", path: "/super-admin/opd/department", icon: Stethoscope, tone: "opd-tile-slate" },
  { label: "Categories", text: "Charge categories", path: "/super-admin/opd/category", icon: Receipt, tone: "opd-tile-rose" },
];

const EMPTY_FILTERS = { search: "", status: "", date_from: "", date_to: "" };

const FILTER_CONFIG = [
  { id: "search", type: "search",     placeholder: "Search by patient, doctor…" },
  { id: "status", type: "select",     label: "Status",           options: STATUS_OPTIONS },
  { id: "date",   type: "date-range", label: "Appointment date" },
];

const statusVariant = {
  Waiting: "warning",
  Consulting: "primary",
  Done: "success",
  Cancelled: "danger",
  "Converted IPD": "primary",
};

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const unwrapList = (response) => {
  const body   = response?.data;
  const result = body?.result ?? body?.data ?? body;
  const data   = result?.data ?? result?.records ?? result;
  return Array.isArray(data) ? data : [];
};

const formatCurrency = (value) => `₹${Number(value || 0).toFixed(2)}`;

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};

const normalizePrescription = (value) => {
  if (!value) return "";
  return typeof value === "string" ? value : JSON.stringify(value);
};

const buildLookup = (items, key = "id") => {
  const map = new Map();
  items.forEach((item) => map.set(String(item[key]), item));
  return map;
};

const identifierDateCode = (value) => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return "";
  const day   = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}${month}${date.getFullYear()}`;
};

const trailingSequence = (value) =>
  String(value || "").match(/(\d+)$/)?.[1] || "";

const displayUhid = (value, dateValue) => {
  if (/^\d{10,}$/.test(String(value || ""))) return value;
  const dateCode = identifierDateCode(dateValue);
  const sequence = trailingSequence(value);
  if (!dateCode || !sequence) return value;
  return `${dateCode}${String(Number(sequence)).padStart(2, "0")}`;
};

const displayToken = (value, dateValue) => {
  if (/^TKN-\d{8}-\d{5}$/.test(String(value || ""))) return value;
  const dateCode = identifierDateCode(dateValue);
  const sequence = trailingSequence(value);
  if (!dateCode || !sequence) return value;
  return `TKN-${dateCode}-${String(Number(sequence)).padStart(5, "0")}`;
};

const displayOpdNumber = (value, token) => {
  if (/^OPD-\d{8}-\d{5}$/.test(String(value || ""))) return value;
  if (/^TKN-\d{8}-\d{5}$/.test(String(token || "")))
    return String(token).replace(/^TKN-/, "OPD-");
  return value;
};

const buildDailyIdentifierMap = (items, { getId, getIdentifierDate, getOrderDate, format }) => {
  const groups = new Map();
  items.forEach((item) => {
    const dateCode = identifierDateCode(getIdentifierDate(item));
    if (!dateCode) return;
    const rows = groups.get(dateCode) || [];
    rows.push(item);
    groups.set(dateCode, rows);
  });
  const identifiers = new Map();
  groups.forEach((rows, dateCode) => {
    rows
      .sort((a, b) => {
        const at = new Date(getOrderDate(a) || 0).getTime();
        const bt = new Date(getOrderDate(b) || 0).getTime();
        return at - bt || String(getId(a)).localeCompare(String(getId(b)));
      })
      .forEach((item, index) => {
        identifiers.set(String(getId(item)), format(dateCode, index + 1));
      });
  });
  return identifiers;
};

const mapApiOpdRecord = (row, lookups = {}) => {
  const patient    = lookups.patients?.get(String(row.patientId));
  const doctor     = lookups.doctors?.get(String(row.consultantDoctorId));
  const department = lookups.departments?.get(String(row.departmentId));
  const token      = row.opdNo || row.caseId || row.id;
  const formattedToken =
    lookups.opdTokens?.get(String(row.id)) ||
    displayToken(token, row.appointmentDate);
  const opdNumber = displayOpdNumber(row.caseId, formattedToken);

  return {
    id:           row.id,
    appointmentId: row.appointmentId,
    patientName:  patient?.name || row.patientId || "Unknown Patient",
    patientId:    row.patientId,
    uhid:
      lookups.patientUhids?.get(String(row.patientId)) ||
      displayUhid(patient?.uhid || "", patient?.registeredAt || row.appointmentDate),
    registeredAt: patient?.registeredAt,
    gender:       patient?.gender || "",
    phone:        patient?.phone  || "",
    token:        formattedToken,
    opdNumber,
    caseId:       row.caseId || row.opdNo || row.id,
    date:         formatDateTime(row.appointmentDate),
    generatedBy:  row.generatedBy ? `User (${row.generatedBy})` : "System",
    doctor:
      doctor?.name ||
      (row.consultantDoctorId ? `Doctor (${row.consultantDoctorId})` : ""),
    doctorId:         row.consultantDoctorId,
    reference:        row.reference        || "",
    symptoms:
      row.symptomsDescription || row.symptomsTitle || row.symptomsType || "",
    prevMedicalIssue: row.previousMedicalIssue || "",
    status:
      row.status === "registered" ? "Waiting"
      : row.status === "completed" ? "Done"
      : row.status === "admitted" ? "Converted IPD"
      : row.status || "Waiting",
    fee:            formatCurrency(row.amount),
    amount:         row.amount,
    paidAmount:     row.paidAmount,
    paymentMode:    row.paymentMode,
    prescription:   normalizePrescription(row.prescription),
    departments:    department?.name ? [department.name] : [],
    departmentId:   row.departmentId,
    standardCharge: row.standardCharge,
    appliedCharge:  row.appliedCharge,
    discount:       row.discountPercentage,
    tax:            row.taxPercentage,
    chargeCategoryId: row.chargeCategoryId,
    chargeId:       row.chargeId,
    oldPatient:     row.isOldPatient ? "Yes" : "No",
    casualty:       row.isCasualty   ? "Yes" : "No",
    isAntenatal:    row.isAntenatal,
    age: patient?.age || (() => {
      const dob = patient?.dateOfBirth || patient?.dob || patient?.date_of_birth;
      if (!dob) return "—";
      const birth = new Date(dob);
      if (isNaN(birth.getTime())) return "—";
      const now = new Date();
      let y = now.getFullYear() - birth.getFullYear();
      let m = now.getMonth()    - birth.getMonth();
      let d = now.getDate()     - birth.getDate();
      if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
      if (m < 0) { y--; m += 12; }
      return `${y}Y ${m}M ${d}D`;
    })(),
    apiRecord: row,
  };
};

/* ─────────────────────────────────────────────────────────────
   PRINT HELPERS
───────────────────────────────────────────────────────────── */
// Opens print dialog (used for Invoice)
const openPrintWindow = (html) => {
  const win = window.open("", "_blank", "width=900,height=1200");
  if (win) { win.document.write(html); win.document.close(); }
};

// Directly downloads as PDF without showing print dialog (used for Download PDF)
const downloadAsPDF = (html, filename = "document.pdf") => {
  const win = window.open("", "_blank", "width=900,height=1200");
  if (!win) return;

  // Inject html2pdf.js from CDN + auto-trigger download instead of print
  const downloadScript = `
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"><\/script>
    <script>
      window.onload = function() {
        const element = document.querySelector('.prescription-sheet') || document.querySelector('.sheet') || document.body;
        const opt = {
          margin:      0,
          filename:    '${filename}',
          image:       { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' },
        };
        Promise.all(Array.from(document.images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })).then(() => {
          html2pdf().set(opt).from(element).save().then(() => {
            setTimeout(() => window.close(), 500);
          });
        });
      };
    <\/script>
  `;

  // Remove the existing window.onload print script and inject download script
  const modifiedHtml = html
    .replace(/<script>window\.onload=\(\)=>window\.print\(\);<\/script>/, "")
    .replace(/<script>window\.onload=\(\)=>\{window\.print\(\)\}<\/script>/, "")
    .replace("</body>", `${downloadScript}</body>`);

  win.document.write(modifiedHtml);
  win.document.close();
};

const baseStyles = `
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;background:#fff;padding:32px;font-size:13px}
  .header{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #0d9488;padding-bottom:16px;margin-bottom:20px}
  .hospital h1{font-size:22px;font-weight:700;color:#0d9488;letter-spacing:-.5px}
  .hospital p{font-size:11px;color:#666;margin-top:2px}
  .badge{background:#0d9488;color:#fff;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.5px}
  .meta{display:flex;gap:24px;background:#f0f4ff;border-radius:8px;padding:12px 18px;margin-bottom:18px;flex-wrap:wrap}
  .meta-item label{font-size:10px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.5px;display:block;margin-bottom:2px}
  .meta-item span{font-size:13px;font-weight:600;color:#1a1a2e}
  .section{margin-bottom:18px}
  .section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#0d9488;border-bottom:1px solid #e0e8ff;padding-bottom:6px;margin-bottom:10px}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px}
  .field label{font-size:10px;color:#999;font-weight:500;display:block;margin-bottom:1px}
  .field span{font-size:12px;color:#1a1a2e;font-weight:500}
  table{width:100%;border-collapse:collapse;margin-top:6px}
  th{background:#f0f4ff;text-align:left;padding:7px 10px;font-size:10px;font-weight:700;color:#555;text-transform:uppercase}
  td{padding:7px 10px;font-size:12px;border-bottom:1px solid #f0f0f0}
  .total-row td{font-weight:700;color:#0d9488;font-size:14px;border-top:2px solid #0d9488;background:#f0f4ff}
  .footer{margin-top:28px;border-top:1px solid #e0e0e0;padding-top:14px;display:flex;justify-content:space-between;align-items:flex-end}
  .sig{border-top:1px solid #999;width:140px;text-align:center;padding-top:4px;font-size:10px;color:#888}
  .wm{font-size:10px;color:#bbb}
  @media print{body{padding:16px}}
`;

const buildInvoiceHTML = (row) => {
  if (!row) return "";
  const now = new Date();
  const ds  = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const ts  = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  const standardCharge = parseFloat(row.apiRecord?.standardCharge || row.standardCharge || 0);
  const appliedCharge  = parseFloat(row.apiRecord?.appliedCharge  || row.appliedCharge  || 0);
  const discountPct    = parseFloat(row.apiRecord?.discountPercentage || row.discount   || 0);
  const taxPct         = parseFloat(row.apiRecord?.taxPercentage      || row.tax        || 0);
  const discountAmt    = (appliedCharge * discountPct) / 100;
  const taxableAmt     = appliedCharge - discountAmt;
  const taxAmt         = (taxableAmt * taxPct) / 100;
  const totalAmt       = parseFloat(row.apiRecord?.amount || row.amount || taxableAmt + taxAmt || 0);
  const paidAmt        = parseFloat(row.apiRecord?.paidAmount || row.paidAmount || 0);
  const balanceDue     = totalAmt - paidAmt;
  const paymentMode    = row.paymentMode || row.apiRecord?.paymentMode || "Cash";
  const invoiceNo      = `INV-${row.opdNumber || row.caseId || row.token || ""}`;
  const department     = row.departments?.[0] || "—";

  const billingRows = `
    ${standardCharge ? `<tr><td>1</td><td>Standard Charge</td><td style="text-align:right">₹${standardCharge.toFixed(2)}</td></tr>` : ""}
    ${discountPct > 0 ? `<tr><td></td><td style="color:#888">Discount (${discountPct}%)</td><td style="text-align:right;color:#e53935">- ₹${discountAmt.toFixed(2)}</td></tr>` : ""}
    ${taxPct > 0 ? `<tr><td></td><td style="color:#888">Tax (${taxPct}%)</td><td style="text-align:right;color:#2e7d32">+ ₹${taxAmt.toFixed(2)}</td></tr>` : ""}
    <tr class="total-row"><td colspan="2">Total Payable</td><td style="text-align:right">₹${totalAmt.toFixed(2)}</td></tr>
    ${paidAmt > 0 ? `<tr style="background:#f0fff4"><td colspan="2" style="color:#2e7d32;font-weight:600">Amount Paid (${paymentMode})</td><td style="text-align:right;color:#2e7d32;font-weight:600">₹${paidAmt.toFixed(2)}</td></tr>` : ""}
    ${balanceDue > 0.01 ? `<tr style="background:#fff8f8"><td colspan="2" style="color:#c62828;font-weight:600">Balance Due</td><td style="text-align:right;color:#c62828;font-weight:600">₹${balanceDue.toFixed(2)}</td></tr>` : ""}
  `;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <title>Invoice – ${invoiceNo}</title>
  <style>${baseStyles}
    .highlight{background:#f0f4ff;border-radius:8px;padding:10px 14px;margin-bottom:6px}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:6px 24px}
    td,th{vertical-align:middle}
    tr td:last-child,tr th:last-child{text-align:right}
  </style></head><body>
  <div class="header">
    <div class="hospital"><h1>🏥 Ashu Skin Care</h1><p>Gynae & Skin Clinic · OPD and patient care</p></div>
    <div><div class="badge">OPD INVOICE</div><p style="text-align:right;font-size:10px;color:#888;margin-top:4px">${ds} · ${ts}</p></div>
  </div>
  <div class="meta">
    <div class="meta-item"><label>Invoice No.</label><span>${invoiceNo}</span></div>
    <div class="meta-item"><label>OPD Token</label><span>${row.token || "—"}</span></div>
    <div class="meta-item"><label>OPD No.</label><span>${row.opdNumber || row.caseId || "—"}</span></div>
    <div class="meta-item"><label>Appointment</label><span>${row.date || "—"}</span></div>
    <div class="meta-item"><label>Payment Mode</label><span>${paymentMode}</span></div>
  </div>
  <div class="section">
    <div class="section-title">Patient &amp; Consultation</div>
    <div class="two-col">
      <div class="field"><label>Patient Name</label><span>${row.patientName || "—"}</span></div>
      <div class="field"><label>UHID No.</label><span>${row.uhid || "—"}</span></div>
      <div class="field"><label>Consultant Doctor</label><span>${row.doctor || "—"}</span></div>
      <div class="field"><label>Department</label><span>${department}</span></div>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Billing Summary</div>
    <table><thead><tr><th>#</th><th>Description</th><th style="text-align:right">Amount (₹)</th></tr></thead>
    <tbody>${billingRows}</tbody></table>
  </div>
  <div class="footer">
    <div class="wm">Generated by Ashu Skin Care · ${ds} ${ts}<br/>This is a computer-generated invoice.</div>
    <div class="sig">Authorised Signatory</div>
  </div>
  <script>window.onload=()=>{window.print()}</script>
  </body></html>`;
};

const escapePrintHTML = (value, fallback = "-") => {
  const text = value === undefined || value === null || value === "" ? fallback : value;
  return String(text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
};

const buildPatientQRHTML = (seed) => {
  const numericSeed = String(seed ?? "").split("").reduce(
    (sum, ch) => (Math.imul(31, sum) + ch.charCodeAt(0)) | 0, 0,
  );
  const size = 21; const cell = 5;
  let rv = numericSeed * 6364136 + 1442695;
  const random = () => { rv = (1664525 * rv + 1013904223) & 0xffffffff; return (rv >>> 0) / 0xffffffff; };
  const grid = Array.from({ length: size }, () => Array(size).fill(false));
  const fill = (r, c, h, w, v = true) => {
    for (let i = r; i < r + h; i++) for (let j = c; j < c + w; j++) if (i < size && j < size) grid[i][j] = v;
  };
  const finder = (r, c) => { fill(r, c, 7, 7); fill(r+1, c+1, 5, 5, false); fill(r+2, c+2, 3, 3); };
  finder(0, 0); finder(0, size-7); finder(size-7, 0);
  for (let i = 8; i < size - 8; i++) { grid[6][i] = i % 2 === 0; grid[i][6] = i % 2 === 0; }
  fill(14, 14, 5, 5); fill(15, 15, 3, 3, false); grid[16][16] = true; grid[8][size-8] = true;
  const reserved = (r, c) =>
    (r < 9 && c < 9) || (r < 9 && c >= size-8) || (r >= size-8 && c < 9) ||
    r === 6 || c === 6 || (r >= 14 && r <= 18 && c >= 14 && c <= 18) || (r === 8 && c === size-8);
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!reserved(r, c)) grid[r][c] = random() > 0.48;
  const cells = grid.flatMap((line, r) => line.map((filled, c) =>
    filled ? `<rect x="${c*cell}" y="${r*cell}" width="${cell}" height="${cell}"/>` : "",
  )).join("");
  const dim = size * cell;
  return `<svg width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}">
    <rect width="${dim}" height="${dim}" fill="#fff"/>
    <g fill="#1a1a1a">${cells}</g></svg>`;
};

const buildA4PatientCardHTML = (row) => {
  if (!row) return "";
  let prescription = null;
  try { prescription = row.prescription ? JSON.parse(row.prescription) : null; } catch { prescription = null; }

  const printDate      = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const printableToken = displayToken(row.token, row.apiRecord?.appointmentDate || row.date);
  const printableUhid  = displayUhid(row.uhid, row.registeredAt || row.apiRecord?.appointmentDate || row.date);
  const vitals         = prescription?.vitalSigns ?? {};
  const medicines      = (prescription?.medicines ?? []).filter(
    (m) => m.medicineId || m.medicine || m.medicineName,
  );
  const tests = [
    ...(prescription?.radiologies ?? []).map((t) => t.radiology?.testName ?? t.testName ?? t.radiologyId),
    ...(prescription?.pathologies ?? []).map((t) => t.testName ?? t.pathologyMaster?.testName ?? t.pathologyMaster?.name ?? t.test?.testName ?? t.test?.name ?? null),
  ].filter(Boolean);

  const medicineName = (m) => {
    if (typeof m.medicine === "object" && m.medicine !== null)
      return m.medicine.name ?? m.medicine.medicineName ?? "Medicine";
    return m.medicine ?? m.medicineName ?? m.medicineId ?? "Medicine";
  };

  const computeAge = (dob) => {
    if (!dob) return "—";
    const birth = new Date(dob);
    if (isNaN(birth.getTime())) return "—";
    const now = new Date();
    let y = now.getFullYear() - birth.getFullYear();
    let m = now.getMonth()    - birth.getMonth();
    let d = now.getDate()     - birth.getDate();
    if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    return `${String(d).padStart(2,"0")}/${String(m).padStart(2,"0")}/${y}`;
  };

  const patientAge =
    row.age || row.apiRecord?.age ||
    computeAge(row.apiRecord?.dateOfBirth ?? row.apiRecord?.dob ?? row.apiRecord?.date_of_birth ?? row.dob);

  const observations = [
    prescription?.chiefComplaint,
    prescription?.diagnosis ? `Diagnosis: ${prescription.diagnosis}` : null,
    prescription?.findingDesc,
    row.symptoms        ? `Symptoms: ${row.symptoms}`              : null,
    row.prevMedicalIssue ? `Previous history: ${row.prevMedicalIssue}` : null,
  ].filter(Boolean);

  const vitalEntries = [
    ["BP", vitals.bloodPressure], ["Pulse", vitals.pulse], ["Temp", vitals.temperature],
    ["SpO2", vitals.spo2], ["RR", vitals.respiratoryRate], ["Weight", vitals.weight], ["Height", vitals.height],
  ].filter(([, v]) => v);

  const advice = [
    prescription?.advice,
    prescription?.referredTo  ? `Referred to: ${prescription.referredTo}`  : null,
    prescription?.followUpDate ? `Follow-up date: ${new Date(prescription.followUpDate).toLocaleDateString("en-IN")}` : null,
  ].filter(Boolean);

  const observationHTML = observations.length > 0
    ? observations.map((item) => `<p class="line">${escapePrintHTML(item)}</p>`).join("")
    : '<p class="empty">Clinical findings / examination notes</p>';

  const vitalHTML = vitalEntries.length > 0
    ? vitalEntries.map(([label, value]) =>
        `<div class="vital"><small>${escapePrintHTML(label)}</small><strong>${escapePrintHTML(value)}</strong></div>`,
      ).join("")
    : '<p class="empty">Vitals not recorded</p>';

  const testsHTML = tests.length > 0
    ? tests.map((t) => `<p class="line">${escapePrintHTML(t)}</p>`).join("")
    : '<p class="empty">Investigations / tests</p>';

  const medicinesHTML = medicines.length > 0
    ? medicines.map((m, i) => {
        const instructions = [m.dose, m.interval, m.duration, m.instruction].filter(Boolean).join(" | ");
        return `<div class="medicine"><span class="number">${i+1}</span><div>
          <strong>${escapePrintHTML(medicineName(m))}</strong>
          <p>${escapePrintHTML(instructions, "As directed")}</p></div></div>`;
      }).join("")
    : '<p class="empty">Medicines / treatment advice</p>';

  const adviceHTML = advice.map((item) => `<p class="line">${escapePrintHTML(item)}</p>`).join("");
  const department = row.departments?.[0] ?? row.department;

  // ✅ visitBoxes and its table have been removed entirely

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <title>PRESCRIPTION - ${escapePrintHTML(printableToken)}</title>
  <style>
    *{box-sizing:border-box}@page{size:A4 portrait;margin:0}
    html,body{margin:0;min-height:100%;font-family:Arial,sans-serif;color:#262626}body{background:#d9dde3}
    .sheet{width:210mm;height:297mm;margin:12px auto;padding:10mm 10mm 8mm;background:#fff;
      box-shadow:0 1px 12px rgba(0,0,0,.18);display:flex;flex-direction:column;overflow:hidden;font-size:10px}
    .top{display:grid;grid-template-columns:27mm 1fr 38mm;gap:6px;align-items:center;padding-bottom:6px}
    .patient-qr{width:27mm;height:27mm;padding:1.5mm;border:1px solid #777;background:#fff;display:grid;place-items:center}
    .patient-qr svg{display:block;width:24mm;height:24mm}
    .hospital{text-align:center}.hospital h1{margin:0 0 3px;font-size:14px;text-transform:uppercase}
    .hospital p{margin:1px 0;font-size:9px}.card-title{font-weight:bold;font-size:11px;text-transform:uppercase;margin-top:4px}
    .card-no{text-align:right;line-height:1.6;font-size:9px}.card-no strong{display:block;font-size:11px}
    table{width:100%;border-collapse:collapse}.patient td{border:1px solid #555;padding:4px 6px;vertical-align:top;height:22px}
    .label{color:#555;font-size:8px;font-weight:bold;text-transform:uppercase;margin-right:4px}
    .value{font-weight:600;font-size:10px}
    .clinical{display:grid;grid-template-columns:38% 62%;flex:1;min-height:0;margin-top:7px;border:1px solid #555}
    .panel{position:relative;padding:27px 10px 10px;overflow:hidden}.panel+.panel{border-left:1px solid #555}
    .panel-title{position:absolute;top:0;left:0;right:0;height:22px;padding:6px 8px;border-bottom:1px solid #666;
      font-size:9px;font-weight:bold;text-align:center;text-transform:uppercase}
    .line{margin:0;padding:4px 0;min-height:20px;font-size:11px;line-height:1.35;border-bottom:1px dotted #d9d9d9}
    .empty{color:#999;font-size:10px;font-style:italic;margin:5px 0 16px}
    .subhead{margin:13px 0 5px;font-size:9px;font-weight:bold;text-transform:uppercase;border-bottom:1px solid #666;padding-bottom:4px}
    .vitals{display:flex;flex-wrap:wrap;gap:4px}
    .vital{border:1px solid #b8b8b8;min-width:48px;padding:4px;text-align:center}
    .vital small{display:block;color:#555;font-size:7px;font-weight:bold}.vital strong{font-size:10px}
    .medicine{display:flex;gap:8px;padding:5px 0;border-bottom:1px dotted #d9d9d9;font-size:11px}
    .medicine p{margin:3px 0 0;font-size:10px}
    .number{width:18px;height:18px;flex:none;border:1px solid #444;border-radius:50%;text-align:center;line-height:17px;font-weight:bold}
    .signature{display:flex;justify-content:space-between;align-items:end;border-top:1px solid #777;
      margin-top:7px;padding-top:7px;min-height:28px;color:#555}
    .signature-line{min-width:43mm;padding-top:4px;border-top:1px solid #555;text-align:center}
    @media print{html,body{width:210mm;height:297mm;background:#fff}.sheet{margin:0;box-shadow:none}}
  </style></head><body>
  <main class="sheet">
    <header class="top">
      <div class="patient-qr">${buildPatientQRHTML(row.patientId || row.uhid)}</div>
      <div class="hospital">
        <h1>Ashu Skin Care</h1>
        <p>Department of Health and Family Welfare</p>
        <p>Gynae & Skin Clinic | Tel: +91-9800000000</p>
        <div class="card-title">PRESCRIPTION</div>
      </div>
      <div class="card-no">
        <strong>PRESCRIPTION</strong>
        Date: ${escapePrintHTML(printDate)}<br/>
        Token: ${escapePrintHTML(printableToken)}
      </div>
    </header>
    <table class="patient">
      <tr>
        <td colspan="2"><span class="label">Name</span><span class="value">${escapePrintHTML(row.patientName)}</span></td>
        <td><span class="label">UHID No.</span><span class="value">${escapePrintHTML(printableUhid)}</span></td>
        <td><span class="label">Gender</span><span class="value">${escapePrintHTML(row.gender)}</span></td>
      </tr>
      <tr>
        <td><span class="label">Token No.</span><span class="value">${escapePrintHTML(printableToken)}</span></td>
        <td><span class="label">Visit Date</span><span class="value">${escapePrintHTML(row.date)}</span></td>
        <td colspan="2"><span class="label">Doctor</span><span class="value">${escapePrintHTML(row.doctor)}</span></td>
      </tr>
      <tr>
        <td colspan="2"><span class="label">Department</span><span class="value">${escapePrintHTML(department)}</span></td>
        <td><span class="label">Age (DD/MM/YY)</span><span class="value">${escapePrintHTML(patientAge)}</span></td>
        <td><span class="label">Contact</span><span class="value">${escapePrintHTML(row.phone)}</span></td>
      </tr>
    </table>
    <section class="clinical">
      <div class="panel">
        <div class="panel-title">Clinical Notes / Findings</div>
        ${observationHTML}
        <div class="subhead">Vital Signs</div>
        <div class="vitals">${vitalHTML}</div>
        <div class="subhead">Investigations</div>
        ${testsHTML}
      </div>
      <div class="panel">
        <div class="panel-title">Advice / Prescription</div>
        ${medicinesHTML}
        ${adviceHTML ? `<div class="subhead">Advice</div>${adviceHTML}` : ""}
      </div>
    </section>
    <footer class="signature">
      <div>Generated on ${escapePrintHTML(printDate)} | OPD patient record</div>
      <div class="signature-line">Doctor's Signature and Stamp</div>
    </footer>
  </main>
  <script>window.onload=()=>window.print();</script>
  </body></html>`;
};

const buildPrescriptionHTML = (row) => {
  if (!row) return "";

  let rx = null;
  try { rx = row.prescription ? JSON.parse(row.prescription) : null; } catch { rx = null; }

  const medicines    = (rx?.medicines ?? []).filter((m) => m.medicineId || m.medicine || m.medicineName);
  const radiologies  = rx?.radiologies ?? [];
  const pathologies  = rx?.pathologies ?? [];
  const vitals       = rx?.vitalSigns ?? {};
  const printDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const printableToken = displayToken(row.token, row.apiRecord?.appointmentDate || row.date);
  const printableUhid = displayUhid(row.uhid, row.registeredAt || row.apiRecord?.appointmentDate || row.date);

  const getMedName = (m) => {
    if (typeof m.medicine === "object" && m.medicine !== null) return m.medicine?.name ?? "—";
    return m.medicine || m.medicineName || m.medicineId || "—";
  };
  const getPathologyName = (t, index) =>
  t?.testName ?? t?.pathologyMaster?.testName ?? t?.pathologyMaster?.name ??
  t?.test?.testName ?? t?.test?.name ?? t?.test_name ?? `Test ${index + 1}`;

  const radiologyText = radiologies.map((t, i) =>
    t.radiology?.testName ?? t.testName ?? t.radiologyId ?? `Radiology ${i + 1}`,
  ).filter(Boolean);

  const pathologyText = pathologies.map(getPathologyName).filter(Boolean);
  const department = row.departments?.[0] || row.department || "—";
  const followUp = rx?.followUpDate ? new Date(rx.followUpDate).toLocaleDateString("en-IN") : "";
  const findingText = [
    rx?.findingCategory,
    rx?.findingList,
    rx?.findingDesc,
  ].filter(Boolean).join(" | ");
  const generatedAt = new Date().toLocaleString("en-IN");
  const qrPayload = encodeURIComponent([
    `Patient: ${row.patientName || "-"}`,
    `UHID: ${printableUhid || row.uhid || "-"}`,
    `Gender: ${row.gender || "-"}`,
    `Age: ${row.age || "-"}`,
    `Phone: ${row.phone || "-"}`,
    `Token: ${printableToken || row.token || "-"}`,
    `Visit: ${row.date || "-"}`,
    `Doctor: ${row.doctor || "-"}`,
    `Department: ${department || "-"}`,
  ].join("\n"));
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${qrPayload}`;
  const radiologyHTML = radiologyText.length
    ? radiologyText.map((item) => `• ${escapePrintHTML(item)}`).join("<br>")
    : "";
  const pathologyHTML = pathologyText.length
    ? pathologyText.map((item) => `• ${escapePrintHTML(item)}`).join("<br>")
    : "";
  const medicineHTML = medicines.length
    ? `<table class="medicine-table"><thead><tr><th>#</th><th>Medicine</th><th>Dose</th><th>Interval</th><th>Duration</th><th>Instruction</th></tr></thead><tbody>${medicines.map((m, i) => `<tr><td>${i + 1}</td><td>${escapePrintHTML(getMedName(m))}</td><td>${escapePrintHTML(m.dose, "")}</td><td>${escapePrintHTML(m.interval, "")}</td><td>${escapePrintHTML(m.duration, "")}</td><td>${escapePrintHTML(m.instruction, "")}</td></tr>`).join("")}</tbody></table>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>
  <base href="${window.location.origin}/">
  <title>Prescription - ${escapePrintHTML(printableToken)}</title>
  <style>
    @page{size:A4;margin:0}
    *{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    *{margin:0;padding:0;font-family:Arial,Helvetica,sans-serif}
    body{background:#e5e5e5;display:flex;justify-content:center;padding:20px}
    .prescription-sheet{width:210mm;height:297mm;background:#fff;box-shadow:0 0 10px rgba(0,0,0,.2);display:flex;flex-direction:column;position:relative;overflow:hidden}
    .header-bar{background:#ffcc00;padding:10px 16px 6px;display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #b71540}
    .header-left{width:122px;text-align:center}.logo-circle{width:78px;height:78px;border-radius:50%;border:3px solid #b71540;background:#fff;display:block;overflow:hidden;margin:0 auto 3px;box-shadow:0 1px 4px rgba(0,0,0,.2)}.logo-circle img{width:100%;height:100%;object-fit:cover;display:block}
    .header-center{text-align:center;flex:1;padding:0 6px}.header-center h1{font-size:24px;font-weight:900;color:#b71540;letter-spacing:.5px}.header-center h4{font-size:11px;font-weight:bold;color:#222;margin-top:2px;font-style:italic}
    .badge-container{display:flex;justify-content:center;gap:5px;margin-top:5px}.badge-pill{background:#d81b60;color:#fff;font-size:9px;font-weight:bold;padding:2px 7px;border-radius:3px;text-transform:uppercase}
    .header-right{width:112px;text-align:center}.qr-box{width:82px;height:82px;border:1px solid #333;margin:0 auto;display:flex;align-items:center;justify-content:center;background:#fff;padding:4px}.qr-box img{width:100%;height:100%;object-fit:contain;display:block}
    .content-body{display:flex;flex:1}.sidebar{width:32%;background:#fff;border-right:2px solid #b71540;padding:8px 7px;display:flex;flex-direction:column}
    .left-box{border:1.4px solid #d81b60;margin-bottom:7px;padding:7px}
    .doc-name{color:#d81b60;font-size:15px;font-weight:900;padding-bottom:3px;margin-bottom:4px}.doc-specs{font-size:10px;line-height:1.28;color:#25314f;font-weight:800;margin-bottom:2px}.doc-specs strong{color:#25314f}
    .doc-specs .pink{color:#d81b60}
    .doc-memberships{font-size:7.7px;line-height:1.16;color:#25314f;font-weight:800;padding-bottom:5px}.doc-memberships p{margin-bottom:5px}.doc-memberships .pink{color:#d81b60}
    .doc-contact-box{text-align:center;font-size:8px;line-height:1.25;margin-top:2px}.doc-contact-box .site{display:block;color:#c2412f;font-size:14px;font-weight:900;margin-bottom:2px}.doc-contact-box .booking{display:block;color:#25314f;font-size:11px;font-weight:900}.doc-contact-box .booking b{color:#25314f;font-size:13px}.doc-contact-box .addr{color:#d81b60;font-size:7px;font-weight:700}
    .attendant-section{flex:1;min-height:186px;font-size:8px;color:#d81b60;font-weight:800;display:flex;flex-direction:column;justify-content:space-between}.attendant-row label{display:block;margin-bottom:1px}.attendant-row .line{border-bottom:1px dotted #888;height:10px}
    .main-panel{width:68%;display:flex;flex-direction:column}.patient-info-table{width:100%;border-collapse:collapse;font-size:9.5px;border-bottom:1.5px solid #333}.patient-info-table td{border:1px solid #ccc;padding:4px 6px}.patient-info-table td span{font-weight:bold;color:#333}
    .workspace{display:flex;flex:1}.clinical-col{width:44%;border-right:1px solid #ccc;padding:8px;font-size:10px}.rx-col{width:56%;padding:8px;font-size:10px;display:flex;flex-direction:column;justify-content:space-between}
    .section-heading{font-size:9.5px;font-weight:bold;color:#000;text-transform:uppercase;border-bottom:1px solid #666;padding-bottom:2px;margin-bottom:6px}.clinical-col p{margin-bottom:8px;line-height:1.4}.test-subhead{font-size:8.5px;font-weight:bold;color:#b71540;text-transform:uppercase;margin:7px 0 2px}.test-list{color:#444;line-height:1.45;margin-bottom:9px;min-height:48px}
    .vitals-grid{display:flex;gap:3px;margin:6px 0 14px}.vital-cell{border:1px solid #888;border-radius:2px;padding:2px;text-align:center;flex:1;font-size:8px;min-height:25px}.vital-cell strong{display:block;font-size:9px;margin-top:1px;min-height:11px}
    .rx-symbol{font-size:22px;font-weight:bold;color:#b71540;margin-bottom:4px}.medicine-table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:9px}.medicine-table th{border:1px solid #999;background:#fff5f7;color:#b71540;text-align:left;padding:4px}.medicine-table td{border:1px solid #bbb;padding:5px 4px;vertical-align:top;min-height:18px}.medicine-free-space{min-height:210px}
    .footer-bar{border-top:1px solid #ccc;padding:8px 12px;display:flex;justify-content:space-between;align-items:flex-end;font-size:8.5px;color:#555}.signature-area{text-align:center}.signature-line{width:140px;border-top:1px solid #333;padding-top:3px;margin-top:35px;font-weight:bold}
    @media print{body{background:#fff;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}.prescription-sheet{box-shadow:none;-webkit-print-color-adjust:exact;print-color-adjust:exact}}
  </style></head><body>
  <div class="prescription-sheet">
    <div class="header-bar">
      <div class="header-left">
        <div class="logo-circle"><img src="/images/ashu-skin-care-logo.png" alt="Ashu Skin Care"></div>
        <span style="font-size:8px;font-weight:bold;color:#b71540">9090088000</span>
      </div>
      <div class="header-center">
        <h1>DR. RABI'S GYNECARE</h1>
        <h4>Odisha's First Laser Cosmetic &amp; Aesthetic Gynecology Clinic</h4>
        <div class="badge-container"><span class="badge-pill">Fertility</span><span class="badge-pill">Gynecology</span><span class="badge-pill">Obstetrics</span><span class="badge-pill">PCOD</span><span class="badge-pill">Laparoscopy</span></div>
      </div>
      <div class="header-right"><div class="qr-box"><img src="${qrImageUrl}" alt="Patient QR Code"></div></div>
    </div>
    <div class="content-body">
      <div class="sidebar">
        <div>
          <div class="left-box">
            <div class="doc-name">Dr Rabi Narayan Satapathy</div>
            <div class="doc-specs">
              MBBS, MD (Obst. &amp; Gyn),<br>
              Honours. Gold Medalist<br>
              FICOG, FICMCH, LLB<br>
              MBA (Hospital Management),<br>
              <span class="pink">Ex Deputy Medical Superintendent,<br>
              SCB Medical College Cuttack,<br>
              Senior Gynaecologist &amp; Obstetrician<br>
              Fertility Consultant,<br>
              Laparoscopy Surgeon<br>
              Minimal invasive Surgeon<br>
              Cosmetic Gynecologist</span>
            </div>
          </div>
          <div class="left-box doc-memberships">
            <p>Fellow Member (ICOG) Indian College of Obstetricians &amp; Gynaecologists</p>
            <p class="pink">Patron Member (PSI) The PCOS Society of India</p>
            <p>Life Member of (FOGSI) Federation of Gynaecologists and Obstetrician Societies of India</p>
            <p class="pink">Life Member of (IAGE) Indian Association of Gynaecological Endoscopists</p>
            <p>Life Member of (IFS) Indian Fertility Society</p>
            <p class="pink">Life Member of (ISAR) Indian Society of Assisted Reproduction</p>
            <p>Life Member of (ISOPARB) Indian Society of Perinatology and Reproductive Biology</p>
            <p class="pink">Life Member of (IMS) Indian Menopause Society</p>
            <p>Life Member of (AGOI) Association of Gynecological Oncologist of India</p>
            <p class="pink">Life Member of (IMA) Indian Medical Association</p>
            <p>Life Member of (AIAARO) All India Association for Advancing Research in Obesity</p>
            <p class="pink">Life Member of (AOGO) Association of Gynecologists of Odisha</p>
            <div class="doc-contact-box">
              <span class="site">www.drrabi.com</span>
              <span class="booking">Book Appointment : <b>9090088000</b></span>
              <span class="addr">Jaydev Vihar, Biju Patnaik College Road, Bhubaneswar</span>
            </div>
          </div>
        </div>
        <div class="left-box attendant-section">
          <div class="attendant-row"><label>Name of The Attendant Present During Consultation:</label><div class="line"></div></div>
          <div class="attendant-row"><label>Relationship with Client:</label><div class="line"></div></div>
          <div class="attendant-row"><label>Name of The Female Clinic Staff Present During Consultation:</label><div class="line"></div></div>
          <div class="attendant-row"><label>Signature of the Client:</label><div class="line"></div></div>
          <div class="attendant-row"><label>Client Mobile No:</label><div class="line"></div></div>
        </div>
      </div>
      <div class="main-panel">
        <table class="patient-info-table">
          <tr><td><span>NAME:</span> ${escapePrintHTML(row.patientName)}</td><td><span>UHID NO:</span> ${escapePrintHTML(printableUhid)}</td><td><span>GENDER:</span> ${escapePrintHTML(row.gender)}</td></tr>
          <tr><td><span>TOKEN NO:</span> ${escapePrintHTML(printableToken)}</td><td><span>VISIT DATE:</span> ${escapePrintHTML(row.date)}</td><td><span>DOCTOR:</span> ${escapePrintHTML(row.doctor)}</td></tr>
          <tr><td><span>DEPARTMENT:</span> ${escapePrintHTML(department)}</td><td><span>AGE (DD/MM/YY):</span> ${escapePrintHTML(row.age)}</td><td><span>CONTACT:</span> ${escapePrintHTML(row.phone)}</td></tr>
        </table>
        <div class="workspace">
          <div class="clinical-col">
            <div class="section-heading">Clinical Notes / Findings</div>
            <p><strong>Diagnosis:</strong> ${escapePrintHTML(rx?.diagnosis)}</p>
            <p><strong>Symptoms:</strong> ${escapePrintHTML(rx?.chiefComplaint || row.symptoms)}</p>
            <p><strong>Previous History:</strong> ${escapePrintHTML(findingText || row.prevMedicalIssue)}</p>
            <div class="section-heading" style="margin-top:12px">Vital Signs</div>
            <div class="vitals-grid">
              <div class="vital-cell">BP<strong>${escapePrintHTML(vitals.bloodPressure, "")}</strong></div>
              <div class="vital-cell">Pulse<strong>${escapePrintHTML(vitals.pulse, "")}</strong></div>
              <div class="vital-cell">Temp<strong>${escapePrintHTML(vitals.temperature, "")}</strong></div>
              <div class="vital-cell">SpO2<strong>${escapePrintHTML(vitals.spo2, "")}</strong></div>
              <div class="vital-cell">Weight<strong>${escapePrintHTML(vitals.weight, "")}</strong></div>
            </div>
            <div class="section-heading" style="margin-top:12px">Investigations</div>
            <div class="test-subhead">Radiology Tests</div>
            <div class="test-list">${radiologyHTML}</div>
            <div class="test-subhead">Pathology Tests</div>
            <div class="test-list">${pathologyHTML}</div>
          </div>
          <div class="rx-col">
            <div>
              <div class="section-heading">Advice / Medicine</div>
              <div class="rx-symbol">℞</div>
              ${medicineHTML || '<div class="medicine-free-space"></div>'}
              <div class="section-heading" style="margin-top:20px">Advice</div>
              <p style="margin-bottom:10px;min-height:90px">${rx?.advice ? escapePrintHTML(rx.advice) : ""}</p>
              <p><strong>Follow-up date:</strong> ${escapePrintHTML(followUp, "")}</p>
            </div>
          </div>
        </div>
        <div class="footer-bar">
          <div>Generated on ${escapePrintHTML(generatedAt)} | OPD Patient Record</div>
          <div class="signature-area"><div class="signature-line">Doctor's Signature &amp; Stamp</div></div>
        </div>
      </div>
    </div>
  </div>
  <script>window.onload=()=>{window.print()}</script>
  </body></html>`;
};

/* ─────────────────────────────────────────────────────────────
   SMALL UI COMPONENTS
───────────────────────────────────────────────────────────── */
const ActionBtn = ({ onClick, icon: Icon, label, colorClass }) => (
  <button
    type="button" title={label} onClick={onClick}
    className={`inline-flex items-center justify-center w-7 h-7 rounded transition-colors focus:outline-none flex-shrink-0 ${colorClass}`}
  >
    <Icon size={13} strokeWidth={1.8} />
  </button>
);

const InlineModal = ({ isOpen, onClose, title, children, onPrint }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-surface-200 dark:border-slate-700">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-surface-200 dark:border-slate-700 bg-[#0d9488] rounded-t-xl">
          <span className="text-sm font-semibold text-white">{title}</span>
          <div className="flex items-center gap-2">
            {onPrint && (
              <button onClick={onPrint} className="flex items-center gap-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded transition">
                <Printer size={13} /> Print
              </button>
            )}
            <button onClick={onClose} className="text-white/70 hover:text-white transition focus:outline-none">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
};

/* ─── Invoice View ─── */
const InvoiceView = ({ row }) => {
  if (!row) return null;
  const fee = parseFloat((row.fee || "₹0").replace("₹", "")) || 0;
  const Field = ({ label, value, highlight }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-400">{label}</span>
      <span className={`text-sm font-medium ${highlight ? "text-primary-600 dark:text-primary-400" : "text-surface-800 dark:text-slate-200"}`}>
        {value || "—"}
      </span>
    </div>
  );
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-4 gap-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg p-3">
        <Field label="Invoice No." value={`INV-${row.caseId}`} />
        <Field label="OPD Token"   value={row.token} />
        <Field label="Appointment" value={row.date} />
        <Field label="Status"      value={row.status} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-600 border-b border-primary-100 dark:border-primary-800 pb-1.5 mb-3">
          Patient &amp; Consultation
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <Field label="Patient Name"    value={row.patientName} />
          <Field label="Case ID"         value={`#${row.caseId}`} />
          <Field label="Consultant"      value={row.doctor} />
          <Field label="Reference"       value={row.reference} />
          <Field label="Symptoms"        value={row.symptoms} />
          <Field label="Previous History" value={row.prevMedicalIssue} />
        </div>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-primary-600 border-b border-primary-100 dark:border-primary-800 pb-1.5 mb-3">
          Billing Summary
        </p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-primary-50 dark:bg-primary-900/20">
              {["#", "Description", "Amount"].map((h) => (
                <th key={h} className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-surface-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-surface-100 dark:border-slate-800">
              <td className="px-3 py-2 text-surface-600">1</td>
              <td className="px-3 py-2 text-surface-800 dark:text-slate-200">OPD Consultation Fee</td>
              <td className="px-3 py-2 text-right">₹{fee.toFixed(2)}</td>
            </tr>
            <tr className="bg-primary-50 dark:bg-primary-900/20 font-bold">
              <td className="px-3 py-2.5 text-primary-700 dark:text-primary-300" colSpan={2}>Total Payable</td>
              <td className="px-3 py-2.5 text-right text-primary-700 dark:text-primary-300 text-base">₹{fee.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ─── Prescription View ─── */
const PrescriptionView = ({ row }) => {
  const previewRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);

  useEffect(() => {
    const node = previewRef.current;
    if (!node) return undefined;

    const updateScale = () => {
      const availableWidth = Math.max(node.clientWidth - 16, 280);
      setPreviewScale(Math.min(1, availableWidth / 794));
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(node);
    window.addEventListener("resize", updateScale);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  if (!row) return null;
  let rx = null;
  try { rx = row.prescription ? JSON.parse(row.prescription) : null; } catch { rx = null; }

  const medicines   = (rx?.medicines ?? []).filter((m) => m.medicineId || m.medicine || m.medicineName);
  const radiologies = rx?.radiologies ?? [];
  const pathologies = rx?.pathologies ?? [];
  const vitals      = rx?.vitalSigns ?? {};

  const getMedName = (m) => {
    if (typeof m.medicine === "object" && m.medicine !== null) return m.medicine?.name ?? "—";
    return m.medicine || m.medicineName || m.medicineId || "—";
  };
  const getPathologyName = (t, index) =>
  t?.testName ?? t?.pathologyMaster?.testName ?? t?.pathologyMaster?.name ??
  t?.test?.testName ?? t?.test?.name ?? t?.test_name ?? `Test ${index + 1}`;

  const previewHTML = buildPrescriptionHTML(row)
    .replace(/<script>window\.onload=\(\)=>\{window\.print\(\)\}<\/script>/, "");

  return (
    <div ref={previewRef} className="h-[76vh] overflow-auto rounded-lg bg-slate-100 p-2 sm:p-3">
      <div
        className="mx-auto"
        style={{
          width: `${794 * previewScale}px`,
          height: `${1123 * previewScale}px`,
        }}
      >
        <iframe
          title={`Prescription preview ${row.token || row.id || ""}`}
          srcDoc={previewHTML}
          className="block rounded-md border border-slate-200 bg-white shadow-sm"
          style={{
            width: 794,
            height: 1123,
            transform: `scale(${previewScale})`,
            transformOrigin: "top left",
          }}
        />
      </div>
    </div>
  );

  const printDate = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  const printableToken = displayToken(row.token, row.apiRecord?.appointmentDate || row.date);
  const printableUhid = displayUhid(row.uhid, row.registeredAt || row.apiRecord?.appointmentDate || row.date);
  const department = row.departments?.[0] || row.department || "—";
  const radiologyText = radiologies.map((t, i) => t.radiology?.testName ?? t.testName ?? t.radiologyId ?? `Test ${i + 1}`).filter(Boolean).join(", ");
  const pathologyText = pathologies.map(getPathologyName).filter(Boolean).join(", ");
  const findingText = [rx?.findingCategory, rx?.findingList, rx?.findingDesc].filter(Boolean).join(" | ");
  const followUp = rx?.followUpDate ? new Date(rx.followUpDate).toLocaleDateString("en-IN") : "—";

  return (
    <div className="rx-preview-wrap">
      <style>{`
        .rx-preview-wrap{margin:-4px auto 0;max-width:100%;overflow:auto;background:#eef2f7;padding:12px;border-radius:10px}
        .rx-preview-sheet{width:794px;min-height:1123px;margin:0 auto;background:#fff;position:relative;overflow:hidden;box-shadow:0 12px 30px rgba(15,23,42,.18);font-family:Arial,Helvetica,sans-serif;color:#1f2937}
        .rx-preview-header{height:162px;position:relative;background:linear-gradient(103deg,#f1df16 0 22%,#f5c313 22% 44%,#ef8a37 72%,#e87b31 100%);border-bottom:8px solid #dc2b79}
        .rx-preview-header:after{content:"";position:absolute;left:284px;right:-30px;bottom:-8px;height:72px;background:#fff;border-top:6px solid #dc2b79;transform:skewY(-8deg);transform-origin:left bottom}
        .rx-logo{position:absolute;left:26px;top:15px;width:106px;height:106px;border-radius:50%;background:#fff;overflow:hidden;border:5px solid rgba(255,255,255,.45)}
        .rx-logo img{width:100%;height:100%;object-fit:cover;display:block}
        .rx-brand{position:absolute;left:190px;top:14px;color:#8b1d26;text-shadow:1px 1px 0 rgba(255,255,255,.8);font-size:44px;font-weight:900;letter-spacing:.5px;line-height:.95;white-space:nowrap}
        .rx-tagline{position:absolute;left:193px;top:68px;color:#25314f;font-size:18px;font-weight:800}
        .rx-chips{position:absolute;left:190px;top:102px;display:flex;gap:11px}
        .rx-chip{background:#d73585;color:#fff;border-radius:6px;padding:6px 10px;font-size:13px;font-weight:900;text-transform:uppercase}
        .rx-phone{position:absolute;left:27px;top:121px;background:#fff;border-radius:6px;border:1px solid #718096;color:#1f3765;font-size:18px;font-weight:900;padding:3px 19px}
        .rx-mother{position:absolute;right:49px;top:19px;width:102px;height:117px;border-radius:50% 50% 45% 45%;background:radial-gradient(circle at 50% 18%,#ffe2c4 0 12%,transparent 13%),linear-gradient(150deg,#fff 0 28%,#f5a5c6 29% 64%,#c43b7c 65%);opacity:.95}
        .rx-body{display:grid;grid-template-columns:276px 1fr;min-height:961px}
        .rx-sidebar{padding:19px 15px 23px 19px;border-right:8px solid #df2c7d;color:#263761}
        .rx-side-box{border:1.2px solid #df2c7d;margin-bottom:11px;padding:11px}
        .rx-doctor-name{color:#d73585;font-size:21px;font-weight:900;margin:0 0 8px}
        .rx-degree{font-size:14px;line-height:1.28;font-weight:800;margin:0;color:#273a67}
        .rx-role{color:#d73585;font-weight:900}
        .rx-memberships{font-size:10.5px;line-height:1.22;font-weight:800}
        .rx-memberships p{margin:0 0 8px}
        .rx-accent{color:#d73585}
        .rx-website{text-align:center;color:#c2442d;font-size:19px;font-weight:900;margin-top:8px}
        .rx-booking{text-align:center;color:#24416f;font-size:16px;font-weight:900}
        .rx-address{text-align:center;color:#d73585;font-size:9px;font-weight:700}
        .rx-attendant{height:264px;display:flex;flex-direction:column;justify-content:space-between;color:#d73585;font-size:10px;font-weight:800}
        .rx-attendant .blue{color:#263761}
        .rx-main{position:relative;padding:42px 34px 72px 30px}
        .rx-watermark{position:absolute;left:50%;top:51%;width:196px;height:196px;border-radius:50%;border:8px solid rgba(38,55,97,.035);transform:translate(-50%,-45%);display:flex;align-items:center;justify-content:center;color:rgba(38,55,97,.045);font-size:60px;font-weight:900}
        .rx-patient-strip{position:relative;z-index:1;border:1px solid #e6b6cd;background:rgba(255,248,251,.88);padding:11px;display:grid;grid-template-columns:1.2fr .6fr .6fr .9fr;gap:8px;font-size:12px;margin-bottom:15px}
        .rx-patient-strip b,.rx-section-title{color:#d73585}
        .rx-section{position:relative;z-index:1;margin-top:15px}
        .rx-section-title{display:inline-block;border-bottom:1px solid #d73585;font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px}
        .rx-vitals{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}
        .rx-vital{border:1px solid #f0c0d5;padding:8px;min-height:38px;font-size:12px}
        .rx-vital b{display:block;color:#d73585;font-size:10px;text-transform:uppercase}
        .rx-notes{display:grid;grid-template-columns:1fr 1fr;gap:11px}
        .rx-note{min-height:76px;border-bottom:1px solid #f3c6d9;padding-bottom:8px;white-space:pre-wrap;line-height:1.45;font-size:13px}
        .rx-note.full{grid-column:1/-1}
        .rx-table{width:100%;border-collapse:collapse;font-size:12px}
        .rx-table th{background:#ffe8f2;color:#b81e63;text-align:left;padding:8px;border:1px solid #efb5cf;text-transform:uppercase;font-size:10px}
        .rx-table td{border:1px solid #f1c2d7;padding:8px;vertical-align:top}
        .rx-tests{line-height:1.55;font-size:13px}
        .rx-follow{display:flex;justify-content:space-between;gap:14px;margin-top:19px;font-size:12px}
        .rx-sign{text-align:right;margin-top:49px;color:#263761;font-weight:800}
        .rx-sign span{display:inline-block;min-width:181px;border-top:1px solid #263761;padding-top:8px}
        .rx-bottom-bar{position:absolute;left:276px;right:0;bottom:0;height:60px;background:linear-gradient(90deg,#dfeff4 0 64%,#3681bb 64% 74%,#0f4f91 74% 84%,#3681bb 84% 100%);border-top:8px solid #df2c7d}
      `}</style>
      <div className="rx-preview-sheet">
        <header className="rx-preview-header">
          <div className="rx-logo"><img src="/images/ashu-skin-care-logo.png" alt="Ashu Skin Care" /></div>
          <div className="rx-brand">DR. RABI'S GYNECARE</div>
          <div className="rx-tagline">Odisha's First Laser Cosmetic &amp; Aesthetic Gynecology Clinic</div>
          <div className="rx-chips">
            {["Fertility", "Gynecology", "Obstetrics", "PCOD", "Laparoscopy"].map((label) => <span key={label} className="rx-chip">{label}</span>)}
          </div>
          <div className="rx-phone">9090088000</div>
          <div className="rx-mother" />
        </header>
        <div className="rx-body">
          <aside className="rx-sidebar">
            <div className="rx-side-box">
              <h2 className="rx-doctor-name">Dr Rabi Narayan Satapathy</h2>
              <p className="rx-degree">
                MBBS, MD (Obst. &amp; Gyn),<br />Honours. Gold Medalist<br />FICOG, FICMCH, LLB<br />MBA (Hospital Management),<br />
                <span className="rx-role">Ex Deputy Medical Superintendent,<br />SCB Medical College Cuttack,<br />Senior Gynaecologist &amp; Obstetrician<br />Fertility Consultant,<br />Laparoscopy Surgeon<br />Minimal invasive Surgeon<br />Cosmetic Gynecologist</span>
              </p>
            </div>
            <div className="rx-side-box rx-memberships">
              <p>Fellow Member (ICOG) Indian College of Obstetricians &amp; Gynaecologists</p>
              <p className="rx-accent">Patron Member (PSI) The PCOS Society of India</p>
              <p>Life Member of (FOGSI) Federation of Gynaecologists and Obstetrician Societies of India</p>
              <p className="rx-accent">Life Member of (IAGE) Indian Association of Gynaecological Endoscopists</p>
              <p>Life Member of (IFS) Indian Fertility Society</p>
              <p className="rx-accent">Life Member of (ISAR) Indian Society of Assisted Reproduction</p>
              <p>Life Member of (ISOPARB) Indian Society of Perinatology and Reproductive Biology</p>
              <p className="rx-accent">Life Member of (IMS) Indian Menopause Society</p>
              <p>Life Member of (AGOI) Association of Gynecological Oncologist of India</p>
              <p className="rx-accent">Life Member of (IMA) Indian Medical Association</p>
              <p>Life Member of (AIAARO) All India Association for Advancing Research in Obesity</p>
              <p className="rx-accent">Life Member of (AOGO) Association of Gynecologists of Odisha</p>
              <div className="rx-website">www.drrabi.com</div>
              <div className="rx-booking">Book Appointment : 9090088000</div>
              <div className="rx-address">Jaydev Vihar, Biju Patnaik College Road, Bhubaneswar</div>
            </div>
            <div className="rx-side-box rx-attendant">
              <div>Name of The Attendant Present During Consultation</div>
              <div>Relationship with Client</div>
              <div className="blue">Name of The Female Clinic Staff Present During Consultation</div>
              <div>Signature of the Client</div>
              <div>Client Mobile No :</div>
            </div>
          </aside>
          <main className="rx-main">
            <div className="rx-watermark">Rx</div>
            <div className="rx-patient-strip">
              <div><b>Name:</b> {row.patientName || "—"}</div>
              <div><b>Age:</b> {row.age || "—"}</div>
              <div><b>Sex:</b> {row.gender || "—"}</div>
              <div><b>Date:</b> {printDate}</div>
              <div><b>UHID:</b> {printableUhid || "—"}</div>
              <div><b>OPD:</b> {printableToken || "—"}</div>
              <div><b>Phone:</b> {row.phone || "—"}</div>
              <div><b>Doctor:</b> {row.doctor || "—"}</div>
            </div>
            <section className="rx-section">
              <div className="rx-section-title">Vitals</div>
              <div className="rx-vitals">
                <div className="rx-vital"><b>BP</b>{vitals.bloodPressure || "—"}</div>
                <div className="rx-vital"><b>Pulse</b>{vitals.pulse || "—"}</div>
                <div className="rx-vital"><b>Temp</b>{vitals.temperature || "—"}</div>
                <div className="rx-vital"><b>SpO2</b>{vitals.spo2 || "—"}</div>
                <div className="rx-vital"><b>Weight</b>{vitals.weight || "—"}</div>
              </div>
            </section>
            <section className="rx-section">
              <div className="rx-section-title">Clinical Notes</div>
              <div className="rx-notes">
                <div className="rx-note"><b>Complaint:</b><br />{rx?.chiefComplaint || row.symptoms || "—"}</div>
                <div className="rx-note"><b>Diagnosis:</b><br />{rx?.diagnosis || "—"}</div>
                <div className="rx-note full"><b>Finding:</b><br />{findingText || row.prevMedicalIssue || "—"}</div>
                <div className="rx-note full"><b>Advice:</b><br />{rx?.advice || "—"}</div>
              </div>
            </section>
            <section className="rx-section">
              <div className="rx-section-title">Medicines</div>
              <table className="rx-table">
                <thead><tr><th>#</th><th>Medicine</th><th>Dose</th><th>Interval</th><th>Duration</th><th>Instruction</th></tr></thead>
                <tbody>
                  {medicines.length ? medicines.map((m, i) => (
                    <tr key={i}>
                      <td>{i + 1}</td><td>{getMedName(m)}</td><td>{m.dose || "—"}</td><td>{m.interval || "—"}</td><td>{m.duration || "—"}</td><td>{m.instruction || "—"}</td>
                    </tr>
                  )) : <tr><td colSpan={6}>No medicines prescribed</td></tr>}
                </tbody>
              </table>
            </section>
            <section className="rx-section rx-tests">
              <div className="rx-section-title">Investigations</div>
              <div><b>Pathology:</b> {pathologyText || "—"}</div>
              <div><b>Radiology:</b> {radiologyText || "—"}</div>
            </section>
            <div className="rx-follow">
              <div><b>Department:</b> {department}</div>
              <div><b>Visit:</b> {row.date || "—"}</div>
              <div><b>Follow-up:</b> {followUp}</div>
            </div>
            <div className="rx-sign"><span>Doctor Signature</span></div>
          </main>
        </div>
        <div className="rx-bottom-bar" />
      </div>
    </div>
  );

  const vitalFields = [
    { label: "Temp",   value: vitals.temperature },
    { label: "Pulse",  value: vitals.pulse },
    { label: "BP",     value: vitals.bloodPressure },
    { label: "SpO2",   value: vitals.spo2 },
    { label: "RR",     value: vitals.respiratoryRate },
    { label: "Weight", value: vitals.weight },
    { label: "Height", value: vitals.height },
  ].filter((v) => v.value);

  const statusColor = rx?.status === "final"
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
    : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";

  const Field = ({ label, value }) => (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500">{label}</span>
      <span className="text-sm font-medium text-surface-800 dark:text-slate-200">{value || "—"}</span>
    </div>
  );
  const SectionTitle = ({ children }) => (
    <p className="text-[10px] font-bold uppercase tracking-widest text-primary-600 dark:text-primary-400 border-b border-primary-100 dark:border-primary-900/40 pb-1 mb-2">
      {children}
    </p>
  );

  return (
    <div className="text-sm">
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-surface-200 dark:border-surface-700">
        <div>
          <p className="font-semibold text-base text-surface-900 dark:text-surface-100">Ashu Skin Care Clinic System</p>
          <p className="text-xs text-surface-400 dark:text-surface-500">OPD Prescription</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-surface-400 dark:text-surface-500">{row.date}</p>
          {rx?.status && (
            <span className={`inline-block mt-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${statusColor}`}>
              {rx.status.charAt(0).toUpperCase() + rx.status.slice(1)}
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-5 gap-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg px-4 py-3 mb-4">
        <Field label="Patient"    value={row.patientName} />
        <Field label="Token"      value={row.token} />
        <Field label="OPD No"     value={row.caseId} />
        <Field label="Department" value={row.departments?.[0] || "—"} />
        <Field label="Doctor"     value={row.doctor} />
      </div>
      <div className="grid gap-4" style={{ gridTemplateColumns: "180px 1fr" }}>
        {/* LEFT */}
        <div className="space-y-4">
          <div>
            <SectionTitle>Radiology</SectionTitle>
            {radiologies.length === 0 ? (
              <p className="text-xs text-surface-400 dark:text-surface-500 italic">None ordered</p>
            ) : (
              <div className="space-y-1.5">
                {radiologies.map((t, i) => (
                  <div key={i} className="bg-surface-50 dark:bg-surface-800 rounded-md px-2.5 py-2">
                    <p className="text-xs font-medium text-surface-800 dark:text-surface-200">
                      {t.radiology?.testName ?? t.radiologyId ?? `Test ${i+1}`}
                    </p>
                    <span className="text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-1.5 py-0.5 rounded-full">
                      {t.status ?? "Ordered"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <SectionTitle>Pathology</SectionTitle>
            {pathologies.length === 0 ? (
              <p className="text-xs text-surface-400 dark:text-surface-500 italic">None ordered</p>
            ) : (
              <div className="space-y-1.5">
                {pathologies.map((t, i) => (
                  <div key={i} className="bg-surface-50 dark:bg-surface-800 rounded-md px-2.5 py-2">
                    <p className="text-xs font-medium text-surface-800 dark:text-surface-200">{getPathologyName(t, i)}</p>
                    <span className="text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-1.5 py-0.5 rounded-full">
                      {t.status ?? "Ordered"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* RIGHT */}
        <div className="space-y-3 border-l border-surface-100 dark:border-surface-700 px-4">
          {rx?.headerNote && (
            <div>
              <SectionTitle>Header note</SectionTitle>
              <div className="border border-surface-200 dark:border-surface-700 rounded-md px-3 py-2 text-xs text-surface-600 dark:text-surface-400 italic">
                {rx.headerNote}
              </div>
            </div>
          )}
          {vitalFields.length > 0 && (
            <div>
              <SectionTitle>Vital signs</SectionTitle>
              <div className="grid grid-cols-4 gap-1.5">
                {vitalFields.map((v) => (
                  <div key={v.label} className="bg-surface-50 dark:bg-surface-800 rounded-md px-2 py-1.5 text-center">
                    <p className="text-[10px] text-surface-400 dark:text-surface-500">{v.label}</p>
                    <p className="text-xs font-semibold text-surface-800 dark:text-surface-200">{v.value}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {(rx?.chiefComplaint || rx?.diagnosis) && (
            <div className="grid grid-cols-2 gap-3">
              {rx?.chiefComplaint && (
                <div>
                  <SectionTitle>Chief complaint</SectionTitle>
                  <div className="border border-surface-200 dark:border-surface-700 rounded-md px-3 py-2 text-xs text-surface-700 dark:text-surface-300">{rx.chiefComplaint}</div>
                </div>
              )}
              {rx?.diagnosis && (
                <div>
                  <SectionTitle>Diagnosis</SectionTitle>
                  <div className="border border-surface-200 dark:border-surface-700 rounded-md px-3 py-2 text-xs text-surface-700 dark:text-surface-300 flex items-center justify-between gap-2">
                    <span>{rx.diagnosis}</span>
                    {rx?.diagnosisCode && (
                      <span className="flex-shrink-0 text-[10px] bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-1.5 py-0.5 rounded-full">
                        {rx.diagnosisCode}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          {(rx?.findingCategory || rx?.findingList || rx?.findingDesc) && (
            <div>
              <SectionTitle>Finding</SectionTitle>
              <div className="border border-surface-200 dark:border-surface-700 rounded-md px-3 py-2 grid grid-cols-2 gap-2 text-xs">
                {rx?.findingCategory && (
                  <div>
                    <span className="text-[10px] text-surface-400 dark:text-surface-500 block">Category / List</span>
                    <span className="text-surface-700 dark:text-surface-300">{rx.findingCategory}{rx.findingList ? ` — ${rx.findingList}` : ""}</span>
                  </div>
                )}
                {rx?.findingDesc && (
                  <div>
                    <span className="text-[10px] text-surface-400 dark:text-surface-500 block">Description</span>
                    <span className="text-surface-700 dark:text-surface-300">{rx.findingDesc}</span>
                  </div>
                )}
              </div>
            </div>
          )}
          <div>
            <SectionTitle>Medicines</SectionTitle>
            {medicines.length === 0 ? (
              <p className="text-xs text-surface-400 dark:text-surface-500 italic">No medicines prescribed</p>
            ) : (
              <div className="border border-surface-200 dark:border-surface-700 rounded-md overflow-hidden">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-primary-50 dark:bg-primary-900/20">
                      {["#","Medicine","Dose","Interval","Duration","Instruction","Status"].map((h) => (
                        <th key={h} className="text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-surface-500 dark:text-surface-400 border-b border-surface-200 dark:border-surface-700 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((m, i) => (
                      <tr key={i} className="border-b border-surface-100 dark:border-surface-800 last:border-0 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                        <td className="px-3 py-2 text-surface-400 dark:text-surface-500">{i+1}</td>
                        <td className="px-3 py-2 font-semibold text-surface-800 dark:text-surface-200 whitespace-nowrap">{getMedName(m)}</td>
                        <td className="px-3 py-2 text-surface-700 dark:text-surface-300">{m.dose       || "—"}</td>
                        <td className="px-3 py-2 text-surface-700 dark:text-surface-300">{m.interval   || "—"}</td>
                        <td className="px-3 py-2 text-surface-700 dark:text-surface-300">{m.duration   || "—"}</td>
                        <td className="px-3 py-2 text-surface-700 dark:text-surface-300">{m.instruction|| "—"}</td>
                        <td className="px-3 py-2">
                          {m.dispenseStatus ? (
                            <span className="text-[10px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full capitalize whitespace-nowrap">{m.dispenseStatus}</span>
                          ) : <span className="text-surface-300 dark:text-surface-600">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          {(rx?.advice || rx?.followUpDate || rx?.referredTo) && (
            <div className="grid grid-cols-3 gap-2">
              {rx?.advice && (
                <div className="col-span-1">
                  <SectionTitle>Advice</SectionTitle>
                  <div className="border border-surface-200 dark:border-surface-700 rounded-md px-3 py-2 text-xs text-surface-700 dark:text-surface-300">{rx.advice}</div>
                </div>
              )}
              {rx?.followUpDate && (
                <div>
                  <SectionTitle>Follow-up</SectionTitle>
                  <div className="border border-surface-200 dark:border-surface-700 rounded-md px-3 py-2 text-xs text-surface-700 dark:text-surface-300">{new Date(rx.followUpDate).toLocaleDateString("en-IN")}</div>
                </div>
              )}
              {rx?.referredTo && (
                <div>
                  <SectionTitle>Referred to</SectionTitle>
                  <div className="border border-surface-200 dark:border-surface-700 rounded-md px-3 py-2 text-xs text-surface-700 dark:text-surface-300">{rx.referredTo}</div>
                </div>
              )}
            </div>
          )}
          {rx?.footerNote && (
            <div>
              <SectionTitle>Footer note</SectionTitle>
              <div className="border border-surface-200 dark:border-surface-700 rounded-md px-3 py-2 text-xs text-surface-600 dark:text-surface-400 italic">{rx.footerNote}</div>
            </div>
          )}
        </div>
      </div>
      <div className="mt-4 pt-3 border-t border-surface-200 dark:border-surface-700 flex items-center justify-between text-xs text-surface-400 dark:text-surface-500">
        <span>Generated: {new Date().toLocaleString("en-IN")}</span>
        <span>{row.doctor} &nbsp;|&nbsp; Signature: ___________</span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE COMPONENT
═══════════════════════════════════════════════════════════ */
const OPDPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const { can } = usePermission();
  // const opdBase = role === ROLES.DOCTOR ? "/doctor" : role === ROLES.SUPER_ADMIN ? "/super-admin": "/dashboard";
  // const opdBase = role === ROLES.DOCTOR ? "/doctor" : role === ROLES.SUPER_ADMIN ? "/super-admin": role === ROLES.RECEPTIONIST ? "/receptionist": "/dashboard";
  // const opdAddPath = `${opdBase}/opd/add`;
  // const prescriptionPath =
  //   role === ROLES.DOCTOR ? "/doctor/opd/prescription" : "/super-admin/opd/add-prescription";
  // const admitPath =
  //   role === ROLES.DOCTOR ? "/doctor/ipd/add" : "/super-admin/opd/admit";

const ROLE_BASE_MAP = {
  [ROLES.SUPER_ADMIN]:  '/super-admin',
  [ROLES.DOCTOR]:       '/doctor',
  [ROLES.RECEPTIONIST]: '/receptionist',
};
const base = ROLE_BASE_MAP[role] ?? '/super-admin';

const opdAddPath      = base === '/doctor' ? ROUTES.DOCTOR.OPD_ADD         : ROUTES.SUPER_ADMIN.OPD_ADD;
const prescriptionPath = base === '/doctor' ? ROUTES.DOCTOR.OPD_PRESCRIPTION : ROUTES.SUPER_ADMIN.ADD_PRESCRIPTION;

  const location = useLocation();

  const [activeTab,    setActiveTab]    = useState("today");
  const [records,      setRecords]      = useState({ today: [], upcoming: [], old: [], converted: [] });
  const [filterValues, setFilterValues] = useState(EMPTY_FILTERS);
  const [loading,      setLoading]      = useState(true);

  const debouncedSearch = useDebounce(filterValues.search, 300);
  const { page, limit, setPage } = usePagination(1, 10);

  const deleteModal      = useModal();
  const toast            = useToast();
  const [invoiceModal,      setInvoiceModal]      = useState({ open: false, row: null });
  const [prescriptionModal, setPrescriptionModal] = useState({ open: false, row: null });

  useEffect(() => { setPage(1); }, [debouncedSearch, filterValues.status, filterValues.date_from, filterValues.date_to]);

  useEffect(() => {
    const updatedRecord = location.state?.updatedRecord;
    const savedRecord   = location.state?.savedRecord;
    if (!updatedRecord && !savedRecord) return;
    setRecords((prev) => {
      const target = updatedRecord || savedRecord;
      if (!target?.id) return prev;
      const n = {
        ...target,
        patientName: target.patientName || target.patient?.name || "Unknown Patient",
        doctor:      target.doctor || target.consultant || target.doctorName || "",
        status:      target.status || "Waiting",
      };
      const merge = (rows) => {
        const exists = rows.some((r) => r.id === n.id);
        return exists ? rows.map((r) => r.id === n.id ? { ...r, ...n } : r) : [n, ...rows];
      };
      return {
        ...prev,
        today:    merge(prev.today),
        upcoming: prev.upcoming.map((r) => r.id === n.id ? { ...r, ...n } : r),
        old:      prev.old.map((r)      => r.id === n.id ? { ...r, ...n } : r),
      };
    });
  }, [location.state]);

  useEffect(() => {
    let cancelled = false;
    const fetchOpdRecords = async () => {
      try {
        const [opdRes, patientRes, doctorRes, departmentRes, prescriptionRes, pathologyRes] =
          await Promise.all([
            apiClient.get("/opd-appointments",  { params: { page: 1, limit: 1000 } }),
            apiClient.get("/patient",           { params: { page: 1, limit: 1000 } }),
            apiClient.get("/user",              { params: { page: 1, limit: 1000 } }),
            apiClient.get("/department",        { params: { page: 1, limit: 1000 } }),
            apiClient.get("/prescription",      { params: { page: 1, limit: 1000 } }),
            apiClient.get("/pathology-master",  { params: { isActive: true, limit: 1000 } }),
          ]);
        if (cancelled) return;

        const patientRows = unwrapList(patientRes);
        const opdRows     = unwrapList(opdRes).filter((r) => (r.status || "").toLowerCase() !== "inactive");

        const patientUhids = buildDailyIdentifierMap(patientRows, {
          getId: (p) => p.id, getIdentifierDate: (p) => p.registeredAt, getOrderDate: (p) => p.registeredAt,
          format: (dc, seq) => `${dc}${String(seq).padStart(2, "0")}`,
        });
        const opdTokens = buildDailyIdentifierMap(opdRows, {
          getId: (a) => a.id, getIdentifierDate: (a) => a.appointmentDate, getOrderDate: (a) => a.createdAt,
          format: (dc, seq) => `TKN-${dc}-${String(seq).padStart(5, "0")}`,
        });

        const patients    = buildLookup(patientRows);
        const doctors     = buildLookup(unwrapList(doctorRes));
        const departments = buildLookup(unwrapList(departmentRes));

        const pathologyMasterList = unwrapList(pathologyRes);
        const pathologyNameMap = new Map();
        pathologyMasterList.forEach((t) => {
          pathologyNameMap.set(String(t.id), t.testName ?? t.name ?? t.title ?? String(t.id));
        });

        const prescriptions = new Map();
        unwrapList(prescriptionRes).forEach((p) => {
          if (p.opdAppointmentId) {
            if (Array.isArray(p.pathologies)) {
              p.pathologies = p.pathologies.map((pt) => ({
                ...pt,
                testName: pt.testName || pathologyNameMap.get(String(pt.testId)) || null,
              }));
            }
            prescriptions.set(String(p.opdAppointmentId), p);
          }
        });

        const rows = opdRows.map((row) => {
          const mapped = mapApiOpdRecord(row, { patients, doctors, departments, patientUhids, opdTokens });
          const rx     = prescriptions.get(String(row.id));
          if (rx) mapped.prescription = JSON.stringify(rx);
          return mapped;
        });

        const now   = new Date();
        const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
        const localDate = (d) => {
          if (!d) return "";
          const dt = new Date(d);
          return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`;
        };

        setRecords({
          today:    rows.filter((r) => localDate(r.apiRecord?.appointmentDate) === today && r.status !== "Converted IPD"),
          upcoming: rows.filter((r) => localDate(r.apiRecord?.appointmentDate) >  today && r.status !== "Converted IPD"),
          old:      rows.filter((r) => localDate(r.apiRecord?.appointmentDate) <  today && r.status !== "Converted IPD"),
        converted: rows.filter((r) => r.status === "Converted IPD"),
        });
      } catch {
        toast.error?.("Unable to load OPD appointments.");
      } finally {
        setLoading(false);
      }
    };
    fetchOpdRecords();
    return () => { cancelled = true; };
  }, [location.key]); // eslint-disable-line react-hooks/exhaustive-deps

  const todayRecords = records.today;
  const waiting    = todayRecords.filter((r) => r.status === "Waiting").length;
  const consulting = todayRecords.filter((r) => r.status === "Consulting").length;
  const done       = todayRecords.filter((r) => r.status === "Done").length;

  const getActiveData = () => records[activeTab] || [];

  const filtered = getActiveData().filter((r) => {
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      if (
        !r.patientName?.toLowerCase().includes(q) &&
        !r.doctor?.toLowerCase().includes(q) &&
        !r.token?.toLowerCase().includes(q)
      ) return false;
    }
    if (filterValues.status && r.status !== filterValues.status) return false;
    if (filterValues.date_from || filterValues.date_to) {
      const apptDate = r.apiRecord?.appointmentDate;
      if (!apptDate) return false;
      const d  = new Date(apptDate);
      const dt = new Date(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`);
      if (filterValues.date_from && dt < new Date(filterValues.date_from)) return false;
      if (filterValues.date_to   && dt > new Date(filterValues.date_to))   return false;
    }
    return true;
  });

  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const handleTabChange = (key) => { setActiveTab(key); setFilterValues(EMPTY_FILTERS); setPage(1); };
  const handleFilterChange = (id, val) => { setFilterValues((prev) => ({ ...prev, [id]: val })); setPage(1); };
  const handleFilterReset  = () => { setFilterValues(EMPTY_FILTERS); setPage(1); };

  const exportCSV = () => {
    const data   = getActiveData();
    const header = "OPD No,Patient Name,Case ID,Date,Doctor,Symptoms,Status,Fee";
    const rows   = data.map((r) =>
      `"${r.token}","${r.patientName}","${r.caseId}","${r.date}","${r.doctor}","${r.symptoms}","${r.status}","${r.fee}"`,
    );
    const blob = new Blob([[header, ...rows].join("\n")], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `opd-${activeTab}-records.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported successfully!");
  };

  // const handleView   = (row) => navigate("/super-admin/opd/add", { state: { mode: "view", record: row } });
  const handleView = (row) => navigate(opdAddPath, { state: { mode: "view", record: row } });
  // const handleEdit   = (row) => navigate("/super-admin/opd/add", { state: { mode: "edit", record: row } });
  const handleEdit = (row) => navigate(opdAddPath, { state: { mode: "edit", record: row } });
  const handleConvertToIpd = async (row) => {
    if (!row?.id || row.status === "Converted IPD") return;
    try {
      const payload = {
        ...(row.apiRecord || {}),
        appointmentDate: row.apiRecord?.appointmentDate || new Date().toISOString(),
        patientId: row.patientId || row.apiRecord?.patientId,
        status: "admitted",
      };
      await apiClient.put(`/opd-appointments/${row.id}`, payload);
      const convertedRow = {
        ...row,
        status: "Converted IPD",
        apiRecord: { ...(row.apiRecord || {}), status: "admitted" },
      };
      setRecords((prev) => ({
        today: prev.today.filter((item) => item.id !== row.id),
        upcoming: prev.upcoming.filter((item) => item.id !== row.id),
        old: prev.old.filter((item) => item.id !== row.id),
        converted: [convertedRow, ...prev.converted.filter((item) => item.id !== row.id)],
      }));
      setActiveTab("converted");
      setPage(1);
      toast.success("OPD converted to IPD.");
    } catch (err) {
      toast.error?.(err?.response?.data?.message || "Failed to convert OPD to IPD.");
    }
  };
  const handleDelete = async () => {
    const id = deleteModal.data?.id;
    if (!id) return;
    try {
      await apiClient.delete(`/opd-appointments/${id}`);
      setRecords((prev) => ({ ...prev, [activeTab]: prev[activeTab].filter((r) => r.id !== id) }));
      toast.success("Record removed.");
    } catch (err) {
      toast.error?.(err?.response?.data?.message || "Failed to delete record.");
    }
    deleteModal.close();
  };

  const renderOpdActions = (_, row) => (
    <div className="flex items-center gap-0.5 flex-nowrap">
      <ActionBtn
        icon={Receipt} label="Download Invoice"
        colorClass="text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30"
        onClick={() => openPrintWindow(buildInvoiceHTML(row))}
      />
      <ActionBtn
        icon={FileText} label="Download PDF"
        colorClass="text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30"
        onClick={() => downloadAsPDF(buildPrescriptionHTML(row), `Prescription-${row.token || row.id}.pdf`)}
      />
      <span className="w-px h-4 bg-surface-200 dark:bg-slate-700 mx-0.5 flex-shrink-0" />
      <TableActions row={row} onView={handleView} onEdit={handleEdit} onDelete={(r) => deleteModal.open(r)} />
    </div>
  );

  const opdColumns = [
    {
      key: "token", label: "OPD No", sortable: true,
      render: (v, row) => (
        <span onClick={() => handleView(row)} className="font-medium text-primary-600 dark:text-primary-400 hover:underline cursor-pointer whitespace-nowrap">{v}</span>
      ),
    },
    {
      key: "patientName", label: "Patient Name", sortable: true,
      render: (v) => <span className="font-medium text-surface-800 dark:text-surface-100 whitespace-nowrap">{v}</span>,
    },
    { key: "uhid", label: "UHID No.", sortable: true },
    {
      key: "date", label: "Appointment", sortable: true,
      render: (v) => <span className="whitespace-nowrap">{v}</span>,
    },
    {
      key: "generatedBy", label: "Generated By", mobileHidden: true,
      render: (v) => <span className="whitespace-nowrap">{v}</span>,
    },
    {
      key: "doctor", label: "Consultant",
      render: (v) => <span className="whitespace-nowrap">{v}</span>,
    },
    {
      key: "reference", label: "Reference", mobileHidden: true,
      render: (v) => v || <span className="text-surface-300 dark:text-surface-600">—</span>,
    },
    {
      key: "symptoms", label: "Symptoms",
      render: (v) => v
        ? <span className="max-w-[120px] truncate block" title={v}>{v}</span>
        : <span className="text-surface-300 dark:text-surface-600">—</span>,
    },
    {
      key: "prevMedicalIssue", label: "Prev. Issue", mobileHidden: true,
      render: (v) => v || <span className="text-surface-300 dark:text-surface-600">—</span>,
    },
    {
      key: "fee", label: "Fee",
      render: (v) => <span className="whitespace-nowrap font-medium">{v}</span>,
    },
    {
      key: "prescription", label: "Prescription",
      headerClassName: "w-[100px] text-center",
      className: "w-[100px] text-center",
      // render: (_, row) => {
      //   const hasPrescription = row.prescription && row.prescription.trim() !== "";
      //   return (
      //     <div className="flex items-center gap-1.5 flex-nowrap">
      //       {hasPrescription ? (
      //         <>
      //           <button type="button" title="View Prescription"
      //             onClick={() => setPrescriptionModal({ open: true, row })}
      //             className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
      //               text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20
      //               hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors whitespace-nowrap">
      //             <Eye size={12} strokeWidth={2} /><span>View Rx</span>
      //           </button>
      //           {can('opd', 'create') && (
      //           <button type="button" title="Edit Prescription"
      //             onClick={() => navigate(prescriptionPath, { state: { record: row, mode: "edit" } })}
      //             className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
      //               text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20
      //               border border-amber-200 dark:border-amber-700/50
      //               hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors whitespace-nowrap">
      //             <Pencil size={12} strokeWidth={2} /><span>Edit Rx</span>
      //           </button>
      //           )}
      //         </>
      //       ) : (
      //         can('opd', 'create') && (
      //         <button type="button" title="Add Prescription"
      //           onClick={() => navigate(prescriptionPath,{ state: { record: row } })}
      //           className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
      //             text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20
      //             border border-violet-200 dark:border-violet-700/50
      //             hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors whitespace-nowrap">
      //           <FilePlus size={12} strokeWidth={2} /><span>Add Rx</span>
      //         </button>
      //       )
      //      )}
      //       <button type="button" title="Admit to IPD"
      //         onClick={() => navigate("/super-admin/opd/admit", { state: { record: row } })}
      //         className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
      //           text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20
      //           border border-emerald-200 dark:border-emerald-700/50
      //           hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors whitespace-nowrap">
      //         <BedDouble size={12} strokeWidth={2} /><span>{row.status === "Converted IPD" ? "Converted" : "Convert IPD"}</span>
      //       </button>
      //     </div>
      //   );
      // },
      render: (_, row) => {
  const hasPrescription = row.prescription && row.prescription.trim() !== "";
  const canPrescribe = can('prescription', 'create'); // ← use 'prescription' not 'opd'
  return (
    <div className="flex items-center gap-1.5 flex-nowrap">
      {hasPrescription ? (
        <>
          <button type="button" title="View Prescription"
            onClick={() => setPrescriptionModal({ open: true, row })}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
              text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20
              hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors whitespace-nowrap">
            <Eye size={12} strokeWidth={2} /><span>View Rx</span>
          </button>
          {canPrescribe && (
            <button type="button" title="Edit Prescription"
              onClick={() => navigate(prescriptionPath, { state: { record: row, mode: "edit" } })}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
                text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20
                border border-amber-200 dark:border-amber-700/50
                hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors whitespace-nowrap">
              <Pencil size={12} strokeWidth={2} /><span>Edit Rx</span>
            </button>
          )}
        </>
      ) : (
        canPrescribe && (
          <button type="button" title="Add Prescription"
            onClick={() => navigate(prescriptionPath, { state: { record: row } })}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
              text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20
              border border-violet-200 dark:border-violet-700/50
              hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors whitespace-nowrap">
            <FilePlus size={12} strokeWidth={2} /><span>Add Rx</span>
          </button>
        )
      )}
      <button type="button" title="Admit to IPD"
        // onClick={() => navigate(`${opdBase}/opd/admit`, { state: { record: row } })}
        onClick={() => handleConvertToIpd(row)}
        disabled={row.status === "Converted IPD"}
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium
          text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20
          border border-emerald-200 dark:border-emerald-700/50
          hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors whitespace-nowrap">
        <BedDouble size={12} strokeWidth={2} /><span>{row.status === "Converted IPD" ? "Converted" : "Convert IPD"}</span>
      </button>
    </div>
  );
},
    },
    {
      key: "actions", label: "Action", mobileAction: true,
      headerClassName: "w-[160px]", className: "w-[160px]",
      render: renderOpdActions,
    },
  ];

  const toolbarLeft = (
    <div className="flex items-center gap-1">
      {TABS.map(({ key, label, icon: Icon }) => {
        const isActive = activeTab === key;
        return (
          <button key={key} type="button" onClick={() => handleTabChange(key)}
            className={[
              "inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium",
              "transition-all duration-150 whitespace-nowrap",
              isActive
                ? "bg-primary-600 border-primary-600 text-white dark:bg-primary-500 dark:border-primary-500"
                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500",
            ].join(" ")}
          >
            <Icon size={12} />{label}
          </button>
        );
      })}
    </div>
  );

//   const toolbarRight = (
//   <Button
//     size="sm"
//     className="h-8 shadow-sm"
//     leftIcon={<Plus size={13} />}
//     onClick={() => navigate(opdAddPath)}
//   >
//     Add OPD
//   </Button>
// );

const toolbarRight = can('opd', 'create') ? (
  <Button
    size="sm"
    className="h-8 shadow-sm"
    leftIcon={<Plus size={13} />}
    onClick={() => navigate(opdAddPath)}
  >
    Add OPD
  </Button>
) : null;

  return (
    <div className="page-container">
      <PageHeader
        title="OPD Management"
        subtitle="Outpatient Department — daily visits and consultations"
        breadcrumbs={[
          { label: "Super Admin", path: "/super-admin/dashboard" },
          { label: "Dashboard",   path: "/super-admin/dashboard" },
          { label: "OPD",         path: "/super-admin/opd" },
        ]}
      />

      <div className="opd-command-center">
        <div className="opd-command-main">
          <div>
            <p className="opd-command-kicker">Outpatient desk</p>
            <h2 className="opd-command-title">OPD workflow console</h2>
            <p className="opd-command-copy">
              Register visits, scan patients, write prescriptions, and manage doctor billing from one place.
            </p>
          </div>
          <div className="opd-command-stages">
            {[
              ["1", "Scan / Search", "Find patient by QR, UHID or mobile"],
              ["2", "Register OPD", "Token, doctor and billing"],
              ["3", "Consultation", "Vitals and e-prescription"],
              ["4", "Print / Close", "Receipt, Rx and follow-up"],
            ].map(([step, title, text]) => (
              <div key={step} className="opd-stage">
                <span>{step}</span>
                <div>
                  <p>{title}</p>
                  <small>{text}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="opd-command-side">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Today status</p>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-2">
            <div className="opd-mini-stat"><b>{waiting}</b><span>Waiting</span></div>
            <div className="opd-mini-stat"><b>{consulting}</b><span>Consulting</span></div>
            <div className="opd-mini-stat"><b>{done}</b><span>Done</span></div>
          </div>
        </div>
      </div>

      <div className="opd-action-grid">
        {OPD_MASTER_LINKS.map(({ label, text, path, icon: Icon, tone }) => (
          <Link
            key={path}
            to={path}
            className={`opd-action-tile ${tone}`}
          >
            <span className="opd-action-icon">
                <Icon size={15} />
            </span>
            <span>
              <b>{label}</b>
              <small>{text}</small>
            </span>
          </Link>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Waiting"   value={waiting}
          icon={<Stethoscope size={18} />}
          iconBg="bg-yellow-100 dark:bg-yellow-900/30"
          iconColor="text-yellow-600 dark:text-yellow-400"
          trend={{ value: 5, positive: false }} />
        <StatCard title="Consulting" value={consulting}
          icon={<Stethoscope size={18} />}
          trend={{ value: 3, positive: true }} />
        <StatCard title="Completed"  value={done}
          icon={<Stethoscope size={18} />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
          trend={{ value: 20, positive: true }} />
      </div>

      {/* Table card */}
      <div className="card overflow-hidden">
        <DataTable
          columns={opdColumns}
          data={paginated}
          keyField="id"
          loading={loading}
          emptyMessage="No OPD records found"
          className="rounded-none border-0 shadow-none"
          filters={FILTER_CONFIG}
          filterValues={{
            search:    filterValues.search,
            status:    filterValues.status,
            date_from: filterValues.date_from,
            date_to:   filterValues.date_to,
          }}
          onFilterChange={handleFilterChange}
          onFilterReset={handleFilterReset}
          onExport={exportCSV}
          toolbarLeft={toolbarLeft}
          toolbarRight={toolbarRight}
        />
        <div className="p-4 border-t border-surface-200 dark:border-surface-700">
          <Pagination
            page={page}
            totalPages={Math.ceil(filtered.length / limit)}
            total={filtered.length}
            limit={limit}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Invoice Modal */}
      <InlineModal
        isOpen={invoiceModal.open}
        onClose={() => setInvoiceModal({ open: false, row: null })}
        title={`Invoice — ${invoiceModal.row?.token || ""}`}
        onPrint={() => openPrintWindow(buildInvoiceHTML(invoiceModal.row))}
      >
        <InvoiceView row={invoiceModal.row} />
      </InlineModal>

      {/* Prescription Modal */}
      <InlineModal
        isOpen={prescriptionModal.open}
        onClose={() => setPrescriptionModal({ open: false, row: null })}
        title={`Prescription — ${prescriptionModal.row?.token || ""}`}
        onPrint={() => openPrintWindow(buildPrescriptionHTML(prescriptionModal.row))}
      >
        <PrescriptionView row={prescriptionModal.row} />
      </InlineModal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        message={`Are you sure you want to remove the OPD record for "${deleteModal.data?.patientName}"?`}
        variant="danger"
      />
    </div>
  );
};

export default OPDPage;

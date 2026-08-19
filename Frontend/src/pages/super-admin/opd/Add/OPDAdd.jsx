// src/pages/super-admin/opd/OPDAdd.jsx
import { useState, useRef, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";
import { ROLES } from "../../../../constants/roles";
import {
  Save, Printer, Upload, X, Plus, User, Search,
  ChevronDown, ArrowLeft, Eye, Check,
} from "lucide-react";

import PageHeader from "@components/layout/PageHeader/PageHeader";
import Modal      from "@components/modals/Modal/Modal";
import Button     from "@components/ui/Button/Button";
import Badge      from "@components/ui/Badge/Badge";
import {
  useOpdAppointmentFormData,
  useSaveOpdAppointment,
} from "../../../../hooks/useOpdAppointmentFormData";
import { usePatient }      from "../../../../lib/patient/patientservice";
import useRoleNavigate     from "@hooks/useRoleNavigate";

/* ══════════════════════════════════════════════════════════
   GLOBAL PRIMITIVES — all use global tokens / input-base
══════════════════════════════════════════════════════════ */

const Label = ({ children, required }) => (
  <label className="block text-[11px] font-extrabold text-surface-500 dark:text-slate-500 uppercase tracking-widest mb-1.5 font-display">
    {children}
    {required && <span className="text-red-400 ml-0.5">*</span>}
  </label>
);

const Field = ({ label, required, error, children }) => (
  <div>
    {label && <Label required={required}>{label}</Label>}
    {children}
    {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
  </div>
);

const Input = ({ label, required, error, readOnly, className = "", ...props }) => (
  <Field label={label} required={required} error={error}>
    <input
      {...props}
      readOnly={readOnly}
      className={[
        'input-base',
        readOnly ? 'bg-slate-50 dark:bg-slate-800/50 cursor-default' : '',
        error  ? 'error' : '',
        className,
      ].join(' ')}
    />
  </Field>
);

const Textarea = ({ label, required, rows = 3, readOnly, ...props }) => (
  <Field label={label} required={required}>
    <textarea
      rows={rows}
      readOnly={readOnly}
      {...props}
      className={[
        'input-base resize-none',
        readOnly ? 'bg-slate-50 dark:bg-slate-800/50 cursor-default' : '',
      ].join(' ')}
    />
  </Field>
);

const Section = ({ title, children }) => (
  <div className="opd-form-section">
    <div className="opd-form-section-header">
      <span className="opd-form-section-title">
        {title}
      </span>
    </div>
    <div className="opd-form-section-body">{children}</div>
  </div>
);

const ViewField = ({ label, value }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 font-display">
      {label}
    </span>
    <span className="text-sm text-slate-800 dark:text-slate-200">
      {value || <span className="italic text-slate-300 dark:text-slate-600">—</span>}
    </span>
  </div>
);

const SearchableSelect = ({
  label, required, options = [], placeholder = "Select",
  value, onChange, className = "", disabled = false, error, readOnly = false,
  allowCustom = false,
}) => {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState("");
  const ref       = useRef(null);
  const searchRef = useRef(null);
  const filtered  = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch(""); } };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  useEffect(() => { if (open && searchRef.current) searchRef.current.focus(); }, [open]);

  const select = (opt) => { onChange({ target: { value: opt } }); setSearch(""); setOpen(false); };
  const isLocked = disabled || readOnly;
  const trimmedSearch = search.trim();
  const hasExactMatch = options.some((opt) => opt.toLowerCase() === trimmedSearch.toLowerCase());

  return (
    <div ref={ref} className={`relative ${className} ${isLocked ? "opacity-60 pointer-events-none" : ""}`}>
      {label && <Label required={required}>{label}</Label>}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        onKeyDown={(e) => { if (["Enter", " ", "ArrowDown"].includes(e.key)) { e.preventDefault(); setOpen(true); } }}
        className={['input-base flex items-center justify-between text-left', error ? 'error' : '', value ? '' : 'text-slate-400 dark:text-slate-500'].join(' ')}
      >
        <span>{value || placeholder}</span>
        <ChevronDown size={12} className={`text-slate-400 shrink-0 ml-1 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-xl shadow-xl z-[300] overflow-hidden">
          <div className="px-2 py-1.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80">
            <div className="relative">
              <Search size={10} className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (allowCustom && e.key === "Enter" && trimmedSearch) {
                    e.preventDefault();
                    select(trimmedSearch);
                  }
                }}
                placeholder={allowCustom ? "Search or type new..." : "Search..."}
                className="w-full pl-5 pr-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-400 placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="max-h-44 overflow-y-auto">
            {value && (
              <button type="button" onClick={() => select("")}
                className="w-full text-left px-3 py-1.5 text-xs text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition italic">
                — Clear selection
              </button>
            )}
            {allowCustom && trimmedSearch && !hasExactMatch && (
              <button type="button" onClick={() => select(trimmedSearch)}
                className="w-full text-left px-3 py-2 text-xs text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition font-semibold">
                Use "{trimmedSearch}"
              </button>
            )}
            {filtered.length > 0 ? filtered.map(opt => (
              <button key={opt} type="button" onClick={() => select(opt)}
                className={['w-full text-left px-3 py-1.5 text-xs transition',
                  value === opt ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700',
                ].join(' ')}>
                {opt}
              </button>
            )) : (
              !allowCustom && <div className="px-3 py-2.5 text-xs text-slate-400 text-center">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   ICON ROW
══════════════════════════════════════════════════════════ */
const ICONS = {
  guardian: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  clock:    <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
  phone:    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.07 13a19.79 19.79 0 0 1-3-8.59A2 2 0 0 1 3 2.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>,
  email:    <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
  location: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
  gender:   <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>,
  blood:    <path d="M12 2.7S5.5 10.1 5.5 14.8a6.5 6.5 0 0 0 13 0C18.5 10.1 12 2.7 12 2.7z"/>,
  heart:    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>,
};

const IconRow = ({ icon, children }) => (
  <div className="flex items-center gap-2">
    <svg width="13" height="13" className="text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{ICONS[icon]}</svg>
    <span className="text-xs text-slate-700 dark:text-slate-300">{children}</span>
  </div>
);


const QRViz = ({ seed }) => {
  const numericSeed = typeof seed === "number" ? seed : String(seed).split("").reduce((a, c) => (Math.imul(31, a) + c.charCodeAt(0)) | 0, 0);
  const SIZE = 21, CELL = 5, dim = SIZE * CELL;
  const lcg = (s) => { let x = s * 6364136 + 1442695; return (n) => { for (let i = 0; i < n; i++) x = (1664525 * x + 1013904223) & 0xffffffff; return (x >>> 0) / 0xffffffff; }; };
  const rng = lcg(numericSeed);
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
  const fill = (r, c, h, w, v = true) => { for (let i = r; i < r + h; i++) for (let j = c; j < c + w; j++) if (i < SIZE && j < SIZE) grid[i][j] = v; };
  const finder = (r, c) => { fill(r, c, 7, 7); fill(r + 1, c + 1, 5, 5, false); fill(r + 2, c + 2, 3, 3); };
  finder(0, 0); finder(0, SIZE - 7); finder(SIZE - 7, 0);
  for (let i = 8; i < SIZE - 8; i++) { grid[6][i] = i % 2 === 0; grid[i][6] = i % 2 === 0; }
  fill(14, 14, 5, 5); fill(15, 15, 3, 3, false); grid[16][16] = true; grid[8][SIZE - 8] = true;
  const reserved = (r, c) => (r < 9 && c < 9) || (r < 9 && c >= SIZE - 8) || (r >= SIZE - 8 && c < 9) || r === 6 || c === 6 || (r >= 14 && r <= 18 && c >= 14 && c <= 18) || (r === 8 && c === SIZE - 8);
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!reserved(r, c)) grid[r][c] = rng(1) > 0.48;
  const rects = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (grid[r][c]) rects.push(<rect key={`${r}-${c}`} x={c * CELL} y={r * CELL} width={CELL} height={CELL} />);
  return (
    <div className="inline-block shrink-0 p-1 bg-white border border-slate-200 dark:border-slate-600 rounded">
      <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} style={{ display: "block" }}>
        <rect width={dim} height={dim} fill="white" />
        <g fill="#1a1a1a">{rects}</g>
      </svg>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════
   BILLING / CHARGE CONSTANTS
══════════════════════════════════════════════════════════ */
const CHARGE_CATALOGUE = {
  "OPD Consultation":     { standardCharge: "500",  discount: "0",  tax: "0" },
  "Follow-up":            { standardCharge: "300",  discount: "10", tax: "0" },
  "Emergency Consultation":{ standardCharge: "1200", discount: "0",  tax: "0" },
  "Specialist Consultation":{ standardCharge: "800", discount: "10", tax: "0" },
  "Routine Check-up":     { standardCharge: "400",  discount: "0",  tax: "0" },
  Physiotherapy:          { standardCharge: "600",  discount: "0",  tax: "5" },
  "Lab Tests":            { standardCharge: "900",  discount: "0",  tax: "5" },
  Radiology:              { standardCharge: "1200", discount: "0",  tax: "5" },
  "Minor Procedure":      { standardCharge: "2000", discount: "5",  tax: "0" },
  "Dressing / Wound Care":{ standardCharge: "350",  discount: "0",  tax: "0" },
};

const CHARGE_CATEGORY_MULTIPLIERS = { General: 1.0, "Semi-Private": 1.25, Private: 1.5, VIP: 2.0, Emergency: 1.35 };

const asChargeList = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
};

const computeAutoFill = (selectedCharges, selectedCategories) => {
  if (!selectedCharges.length) return { standardCharge: "", appliedCharge: "", discount: "0", tax: "0" };
  let totalStd = 0, totalDiscount = 0, totalTax = 0;
  selectedCharges.forEach(ch => { const e = CHARGE_CATALOGUE[ch] || { standardCharge: "0", discount: "0", tax: "0" }; totalStd += parseFloat(e.standardCharge); totalDiscount += parseFloat(e.discount); totalTax += parseFloat(e.tax); });
  const avgDiscount = (totalDiscount / selectedCharges.length).toFixed(0);
  const avgTax      = (totalTax / selectedCharges.length).toFixed(0);
  const multiplier  = selectedCategories.length ? Math.max(...selectedCategories.map(c => CHARGE_CATEGORY_MULTIPLIERS[c] || 1)) : 1;
  return { standardCharge: totalStd.toFixed(2), appliedCharge: (totalStd * multiplier).toFixed(2), discount: avgDiscount, tax: avgTax };
};

/* ══════════════════════════════════════════════════════════
   PRINT
══════════════════════════════════════════════════════════ */
const printOPDReceipt = (patient, opd) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"/><title>OPD Receipt – ${opd.caseNo}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',Arial,sans-serif;color:#1a1a2e;background:#fff;padding:32px;font-size:13px}.header{display:flex;align-items:center;justify-content:space-between;border-bottom:3px solid #0d9488;padding-bottom:16px;margin-bottom:20px}.hospital h1{font-size:22px;font-weight:700;color:#0d9488}.badge{background:#0d9488;color:#fff;padding:6px 14px;border-radius:20px;font-size:11px;font-weight:600}.meta{display:flex;gap:32px;background:#f0f4ff;border-radius:8px;padding:14px 18px;margin-bottom:20px}.meta-item label{font-size:10px;font-weight:600;color:#888;text-transform:uppercase;display:block;margin-bottom:2px}.meta-item span{font-size:13px;font-weight:600;color:#1a1a2e}.section{margin-bottom:18px}.section-title{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#0d9488;border-bottom:1px solid #e0e8ff;padding-bottom:6px;margin-bottom:10px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 24px}.field label{font-size:10px;color:#999;font-weight:500;display:block;margin-bottom:1px}.field span{font-size:12px;color:#1a1a2e;font-weight:500}.billing-table{width:100%;border-collapse:collapse;margin-top:6px}.billing-table th{background:#f0f4ff;text-align:left;padding:7px 10px;font-size:10px;font-weight:700;color:#555;text-transform:uppercase}.billing-table td{padding:7px 10px;font-size:12px;border-bottom:1px solid #f0f0f0}.billing-table .total-row td{font-weight:700;color:#0d9488;font-size:14px;border-top:2px solid #0d9488;background:#f0f4ff}.footer{margin-top:28px;border-top:1px solid #e0e0e0;padding-top:14px;display:flex;justify-content:space-between;align-items:flex-end}.sig-line{border-top:1px solid #999;width:140px;text-align:center;padding-top:4px;font-size:10px;color:#888}@media print{body{padding:16px}}</style>
  </head><body>
  <div class="header"><div class="hospital"><h1>🏥 Ashu Skin Care</h1><p>Gynae & Skin Clinic · OPD and patient care</p></div>
  <div><div class="badge">OPD RECEIPT</div><p style="text-align:right;font-size:10px;color:#888;margin-top:4px">${dateStr} · ${timeStr}</p></div></div>
  <div class="meta">
    <div class="meta-item"><label>Case No.</label><span>${opd.caseNo}</span></div>
    <div class="meta-item"><label>Appointment Date</label><span>${opd.appointmentDate || dateStr}</span></div>
    <div class="meta-item"><label>Doctor</label><span>${opd.consultantDoctor || "—"}</span></div>
    <div class="meta-item"><label>Status</label><span>${opd.casualty === "Yes" ? "Casualty" : "OPD"}</span></div>
  </div>
  <div class="section"><div class="section-title">Patient Information</div><div class="grid">
    <div class="field"><label>Patient Name</label><span>${patient?.name || "—"}</span></div>
    <div class="field"><label>Patient ID</label><span>#${patient?.id || "—"}</span></div>
    <div class="field"><label>Gender</label><span>${patient?.gender || "—"}</span></div>
    <div class="field"><label>Blood Group</label><span>${patient?.bloodGroup || "—"}</span></div>
    <div class="field"><label>Phone</label><span>${patient?.phone || "—"}</span></div>
    <div class="field"><label>Guardian</label><span>${patient?.guardianName || "—"}</span></div>
  </div></div>
  <div class="section"><div class="section-title">Billing Summary</div>
  <table class="billing-table"><thead><tr><th>Description</th><th>Amount</th></tr></thead><tbody>
    ${asChargeList(opd.charges).map(c => `<tr><td>${c}</td><td>₹${CHARGE_CATALOGUE[c]?.standardCharge || "0"}</td></tr>`).join("") || '<tr><td colspan="2">—</td></tr>'}
    <tr><td style="color:#888">Standard Charge</td><td>₹${opd.standardCharge || "0"}</td></tr>
    <tr class="total-row"><td>Total Payable</td><td>₹${opd.amount || "0.00"}</td></tr>
  </tbody></table></div>
  <div class="footer"><div style="font-size:10px;color:#bbb">Generated by Ashu Skin Care · ${dateStr} ${timeStr}</div><div class="sig-line">Authorised Signatory</div></div>
  <script>window.onload=()=>{ window.print(); }</script></body></html>`;
  const win = window.open("", "_blank", "width=800,height=900");
  if (win) { win.document.write(html); win.document.close(); }
};

/* ══════════════════════════════════════════════════════════
   PATIENTS + CONSTANTS
══════════════════════════════════════════════════════════ */
const INIT_PATIENTS = [
  { id: 121, name: "Maria Taylor",  guardianName: "Jonson",        gender: "Female", bloodGroup: "B+",  maritalStatus: "Single",  age: "14 Year 10 Month 5 Days",   phone: "7488548942", email: "mariaw@gmail.com",  address: "CA, USA",       allergies: "Fast Food",   remarks: "Left Hand Mark",  tpa: "Star Health Insurance", tpaId: "47547", tpaValidity: "11/30/2023", nationalId: "890867878",  photo: "https://randomuser.me/api/portraits/women/44.jpg" },
  { id: 122, name: "Rajesh Kumar",  guardianName: "Suresh Kumar",  gender: "Male",   bloodGroup: "B+",  maritalStatus: "Married", age: "34 Year 2 Month 10 Days",   phone: "9876543210", email: "rajesh@gmail.com",  address: "Mumbai, India", allergies: "Penicillin",  remarks: "Diabetic",        tpa: "",                      tpaId: "",      tpaValidity: "",           nationalId: "123456789",  photo: null },
  { id: 123, name: "Priya Singh",   guardianName: "Mohan Singh",   gender: "Female", bloodGroup: "A+",  maritalStatus: "Single",  age: "28 Year 5 Month 3 Days",    phone: "9812345678", email: "priya@gmail.com",   address: "Delhi, India",  allergies: "None",        remarks: "",                tpa: "ICICI Lombard",         tpaId: "88234", tpaValidity: "12/31/2024", nationalId: "987654321",  photo: null },
  { id: 124, name: "Amit Patel",    guardianName: "Rakesh Patel",  gender: "Male",   bloodGroup: "O+",  maritalStatus: "Married", age: "45 Year 1 Month 20 Days",   phone: "9898989898", email: "amit@gmail.com",    address: "Ahmedabad",     allergies: "Sulfa drugs", remarks: "Hypertensive",    tpa: "",                      tpaId: "",      tpaValidity: "",           nationalId: "456789123",  photo: null },
  { id: 125, name: "Sunita Devi",   guardianName: "Ramesh Devi",   gender: "Female", bloodGroup: "AB+", maritalStatus: "Married", age: "52 Year 3 Month 8 Days",    phone: "9123456789", email: "sunita@gmail.com",  address: "Patna, India",  allergies: "None",        remarks: "",                tpa: "HDFC Ergo",             tpaId: "55321", tpaValidity: "06/30/2025", nationalId: "789123456",  photo: null },
];

const EXISTING_OPD_PATIENT_IDS = new Set([122, 123]);

const DEPARTMENT_OPTIONS = [
  "General Medicine", "Surgery", "Orthopedics", "Gynecology & Obstetrics", "Pediatrics",
  "Cardiology", "Neurology", "Oncology", "Urology", "ENT", "Ophthalmology", "Dermatology",
  "Psychiatry", "Nephrology", "Gastroenterology", "Pulmonology", "Endocrinology",
  "Emergency & Trauma", "ICU / Critical Care",
];

const toRupee = (v) => { const n = Number(v || 0); return Number.isFinite(n) ? n.toFixed(2) : "0.00"; };
const getResponseMessage = (err, fallback = "Something went wrong") => err?.response?.data?.message || err?.message || fallback;

const formatPatient = (pt) => ({
  ...pt,
  id: pt.id,
  name: pt.name || pt.patientName || "Unnamed Patient",
  guardianName: pt.guardianName || pt.emergencyContactName || "",
  gender: pt.gender ? String(pt.gender).replace("_", " ") : "",
  bloodGroup: pt.bloodGroup ? String(pt.bloodGroup).replace("_POS", "+").replace("_NEG", "-") : "",
  maritalStatus: pt.maritalStatus ? String(pt.maritalStatus).replace("_", " ") : "",
  age: (() => {
    if (pt.age) return pt.age;
    if (!pt.dob) return "";
    const birth = new Date(pt.dob);
    if (isNaN(birth.getTime())) return "";
    const now = new Date();
    let y = now.getFullYear() - birth.getFullYear(), m = now.getMonth() - birth.getMonth(), d = now.getDate() - birth.getDate();
    if (d < 0) { m--; d += 30; } if (m < 0) { y--; m += 12; }
    return `${y} Year ${m} Month ${d} Days`;
  })(),
  phone: pt.phone || "", email: pt.email || "",
  address: pt.address || [pt.city, pt.state].filter(Boolean).join(", "),
  allergies: pt.allergies || "", remarks: pt.remarks || "",
  tpa: pt.insuranceProvider || pt.tpa || "", tpaId: pt.insurancePolicyNo || pt.tpaId || "",
  nationalId: pt.adharNo || pt.nationalId || "", photo: pt.photo || pt.image || null,
});

const getDoctorDepartmentId = (doctor) => doctor.departmentId || doctor.department_id || "";
const doctorLabel   = (d, dept = "") => `${d.name || "Doctor"} (${d.id})${dept ? ` - ${dept}` : ""}`;
const chargeLabel   = (c) => `${c.name || "OPD Consultation"} - Rs ${toRupee(c.standardCharge)}${c.chargeCategory?.name ? ` (${c.chargeCategory.name})` : ""}`;
const paymentModeValue = (mode) => ({ Cash: "cash", Card: "card", UPI: "upi", Online: "online", Insurance: "tpa", Cheque: "credit" })[mode] || String(mode || "cash").toLowerCase();

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
const OPDAdd = () => {
  const navigate   = useRoleNavigate();
  const { role }   = useAuth();
  const location   = useLocation();

  const routeMode   = location.state?.mode   || "add";
  const routeRecord = location.state?.record || null;
  const isView = routeMode === "view";
  const isEdit = routeMode === "edit";

  const {
    patients: apiPatients, departments: apiDepartments, doctors: apiDoctors,
    chargeCategories: apiChargeCategories, consultationCharges: apiConsultationCharges,
    loading: loadingLookups, error: lookupError,
    fetchDoctors, fetchCharges,
  } = useOpdAppointmentFormData();
  const { saveAppointment, loading: savingAppointment } = useSaveOpdAppointment();
  const { create: createPatient, createLoading } = usePatient();

  const [patientList, setPatientList] = useState(INIT_PATIENTS);
  useEffect(() => { if (apiPatients.length) setPatientList(apiPatients.map(formatPatient)); }, [apiPatients]);

  /* ── Patient search ── */
  const [query,           setQuery]           = useState("");
  const [showDrop,        setShowDrop]        = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const searchRef = useRef(null);

  const filteredPts = query.trim()
    ? patientList.filter(pt => pt.name.toLowerCase().includes(query.toLowerCase()) || String(pt.id).includes(query) || pt.phone.includes(query))
    : patientList;

  useEffect(() => {
    const fn = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const pickPatient = (pt) => {
    setSelectedPatient(pt); setQuery(pt.name); setShowDrop(false);
    if (errors.patient) setErrors(p => ({ ...p, patient: "" }));
    setOpd(prev => ({ ...prev, oldPatient: EXISTING_OPD_PATIENT_IDS.has(pt.id) ? "Yes" : "No" }));
  };

  const clearPatient = () => { setSelectedPatient(null); setQuery(""); };

  /* ── New patient modal ── */
  const [showModal,    setShowModal]    = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [dragOver,     setDragOver]     = useState(false);
  const fileInputRef = useRef(null);
  const handlePhoto = (file) => {
    if (!file || !file.type?.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const EMPTY_NP = { name: "", guardianName: "", gender: "", dob: "", ageYear: "", ageMonth: "", ageDay: "", bloodGroup: "", maritalStatus: "", phone: "", email: "", address: "", remarks: "", allergies: "", tpa: "", tpaId: "", tpaValidity: "", nationalId: "", alternateNumber: "" };
  const [np, setNp]           = useState(EMPTY_NP);
  const [npErrors, setNpErrors] = useState({});

  useEffect(() => {
    if (!np.dob) { setNp(prev => ({ ...prev, ageYear: "", ageMonth: "", ageDay: "" })); return; }
    const [year, month, day] = np.dob.split("-").map(Number);
    const birth = new Date(year, month - 1, day);
    if (isNaN(birth.getTime())) return;
    const now = new Date();
    let years = now.getFullYear() - birth.getFullYear(), months = now.getMonth() - birth.getMonth(), days = now.getDate() - birth.getDate();
    if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }
    setNp(prev => ({ ...prev, ageYear: years, ageMonth: months, ageDay: days }));
  }, [np.dob]);

  const nf = (f) => (e) => { setNp(prev => ({ ...prev, [f]: e.target.value })); if (npErrors[f]) setNpErrors(p => ({ ...p, [f]: "" })); };

  const handleSaveNewPatient = async () => {
    const errs = {};
    if (!np.name.trim()) errs.name = "Required";
    else if (!/^[a-zA-Z\s]+$/.test(np.name.trim())) errs.name = "Name must contain alphabets only";
    if (!np.gender) errs.gender = "Required";
    if (!np.dob) errs.dob = "Date of birth is required";
    if (!np.phone.trim()) errs.phone = "Required";
    else if (np.phone.length !== 10) errs.phone = "Must be exactly 10 digits";
    if (np.alternateNumber && np.alternateNumber.length !== 10) errs.alternateNumber = "Must be exactly 10 digits";
    if (np.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(np.email)) errs.email = "Enter a valid email address";
    if (np.nationalId && np.nationalId.length !== 12) errs.nationalId = "Aadhaar must be exactly 12 digits";
    if (Object.keys(errs).length) { setNpErrors(errs); return; }

    try {
      const genderMap     = { Male: "male", Female: "female", Other: "other" };
      const maritalMap    = { Single: "single", Married: "married", Divorced: "divorced", Widowed: "widowed" };
      const bloodGroupMap = { "A+": "A_POS", "A-": "A_NEG", "B+": "B_POS", "B-": "B_NEG", "O+": "O_POS", "O-": "O_NEG", "AB+": "AB_POS", "AB-": "AB_NEG" };
      const body = {
        name: np.name, dob: np.dob ? new Date(np.dob).toISOString() : undefined,
        gender: genderMap[np.gender] || undefined, maritalStatus: maritalMap[np.maritalStatus] || undefined,
        bloodGroup: bloodGroupMap[np.bloodGroup] || undefined,
        phone: np.phone || undefined, email: np.email || undefined, address: np.address || undefined,
        emergencyContactName: np.guardianName || undefined, insuranceProvider: np.tpa || undefined,
        insurancePolicyNo: np.tpaId || undefined,
        adharNo: np.nationalId && /^\d+$/.test(np.nationalId) ? np.nationalId : undefined,
        photo: photoPreview || undefined,
      };
      const saved  = await createPatient(body);
      const rawPt  = saved?.data || saved?.patient || saved?.result || saved;
      const newPt  = formatPatient({ ...rawPt, name: rawPt?.name || np.name, phone: rawPt?.phone || np.phone, email: rawPt?.email || np.email, address: rawPt?.address || np.address, gender: rawPt?.gender || np.gender, bloodGroup: rawPt?.bloodGroup || np.bloodGroup, maritalStatus: rawPt?.maritalStatus || np.maritalStatus, emergencyContactName: rawPt?.emergencyContactName || np.guardianName, dob: rawPt?.dob || np.dob, insuranceProvider: rawPt?.insuranceProvider || np.tpa, insurancePolicyNo: rawPt?.insurancePolicyNo || np.tpaId, adharNo: rawPt?.adharNo || np.nationalId, allergies: rawPt?.allergies || np.allergies, remarks: rawPt?.remarks || np.remarks, photo: rawPt?.photo || photoPreview });
      setPatientList(prev => [...prev, newPt]);
      pickPatient(newPt); setNp(EMPTY_NP); setPhotoPreview(null); setNpErrors({}); setShowModal(false);
    } catch {}
  };

  /* ── OPD fields ── */
  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const getCurrentDateTimeString = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const toLocalAppointmentIso = (dateTimeValue) => {
    if (!dateTimeValue) return null;
    const [datePart, timePart = "00:00"] = String(dateTimeValue).split("T");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour, minute] = timePart.split(":").map(Number);
    if (!year || !month || !day) return new Date(dateTimeValue).toISOString();
    return new Date(year, month - 1, day, hour || 0, minute || 0, 0, 0).toISOString();
  };

  const EMPTY_OPD = {
    symptomsType: "", symptomsTitle: "", symptomsDescription: "", note: "", allergies: "",
    prescription: "", previousMedical: "", diagnosis: "", appointmentDate: getCurrentDateTimeString(),
    caseNo: "OPD" + Date.now().toString().slice(-5),
    casualty: "No", oldPatient: "No", reference: "", consultantDoctor: "",
    liveConsultation: "No", departments: [], applyTpa: false, tpa: "",
    chargeCategory: "", charges: "", standardCharge: "", appliedCharge: "",
    discount: "0", tax: "0", amount: "", paymentMode: "Cash", paidAmount: "",
  };

  const [opd, setOpd]       = useState(EMPTY_OPD);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const o = (f) => (e) => { setOpd(prev => ({ ...prev, [f]: e.target.value })); if (errors[f]) setErrors(p => ({ ...p, [f]: "" })); };

  const departmentOptions = useMemo(() => [...new Set(apiDepartments.map(d => d.name).filter(Boolean))], [apiDepartments]);
  const departmentByName  = useMemo(() => { const m = new Map(); apiDepartments.forEach(d => m.set(d.name, d)); return m; }, [apiDepartments]);

  const doctorOptions = useMemo(() => {
    return apiDoctors.map(d =>
      doctorLabel(d, apiDepartments.find(dep => dep.id === getDoctorDepartmentId(d))?.name)
    );
  }, [apiDoctors, apiDepartments]);

  const doctorByLabel     = useMemo(() => { const m = new Map(); apiDoctors.forEach(d => m.set(doctorLabel(d, apiDepartments.find(dep => dep.id === getDoctorDepartmentId(d))?.name), d)); return m; }, [apiDoctors, apiDepartments]);
  const chargeCategoryOptions = useMemo(() => apiChargeCategories.map(c => c.name).filter(Boolean), [apiChargeCategories]);
  const chargeCategoryByName  = useMemo(() => { const m = new Map(); apiChargeCategories.forEach(c => m.set(c.name, c)); return m; }, [apiChargeCategories]);
  const chargeOptions     = useMemo(() => apiConsultationCharges.map(chargeLabel), [apiConsultationCharges]);
  const chargeByLabel     = useMemo(() => { const m = new Map(); apiConsultationCharges.forEach(c => m.set(chargeLabel(c), c)); return m; }, [apiConsultationCharges]);

  const filteredChargeOptions = chargeOptions;

  const applyConsultationCharge = (prev, charge, categoryName = "") => {
    if (!charge) return prev;
    return { ...prev, charges: chargeLabel(charge), chargeId: charge.id, chargeCategory: categoryName || charge.chargeCategory?.name || prev.chargeCategory, standardCharge: toRupee(charge.standardCharge), appliedCharge: toRupee(charge.standardCharge), discount: String(charge.discountPercentage ?? 0), tax: String(charge.taxPercentage ?? 0) };
  };

  const handleChargeCategoryChange = (event) => {
    const categoryName = event.target.value;
    setOpd(prev => ({
      ...prev,
      chargeCategory: categoryName,
      charges: "",
      chargeId: "",
      standardCharge: "",
      appliedCharge: "",
      discount: "0",
      tax: "0"
    }));
    if (errors.chargeCategory) setErrors(prev => ({ ...prev, chargeCategory: "" }));
  };

  const findPatientMatch = (list, record) => {
    if (!record || !list.length) return null;
    return list.find(p => (record.patientId && String(p.id) === String(record.patientId)) || record.patientName?.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(record.patientName?.toLowerCase())) || null;
  };

  useEffect(() => {
    if ((isEdit || isView) && routeRecord) {
      setOpd(prev => ({
        ...prev,
        appointmentDate: routeRecord.apiRecord?.appointmentDate ? routeRecord.apiRecord.appointmentDate.slice(0, 16) : routeRecord.date || "",
        caseNo: routeRecord.caseId || "", consultantDoctor: routeRecord.doctor || "",
        symptomsType: routeRecord.apiRecord?.symptomsType || "", symptomsTitle: routeRecord.apiRecord?.symptomsTitle || "",
        symptomsDescription: routeRecord.apiRecord?.symptomsDescription || routeRecord.symptoms || "",
        prescription: "", previousMedical: routeRecord.apiRecord?.previousMedicalIssue || routeRecord.prevMedicalIssue || "",
        reference: routeRecord.apiRecord?.reference || routeRecord.reference || "",
        diagnosis: routeRecord.apiRecord?.primaryDiagnosis || routeRecord.diagnosis || "",
        departments: routeRecord.departments || [],
        chargeCategory: routeRecord.chargeCategory || "",
        charges: Array.isArray(routeRecord.charges) ? routeRecord.charges[0] || "" : routeRecord.charges || "",
        standardCharge: routeRecord.apiRecord?.standardCharge || routeRecord.standardCharge || "",
        appliedCharge: routeRecord.apiRecord?.appliedCharge || routeRecord.appliedCharge || "",
        discount: routeRecord.apiRecord?.discountPercentage || routeRecord.discount || "0",
        tax: routeRecord.apiRecord?.taxPercentage || routeRecord.tax || "0",
        amount: routeRecord.apiRecord?.amount || routeRecord.fee?.replace("₹", "") || routeRecord.amount || "",
        paymentMode: routeRecord.apiRecord?.paymentMode || routeRecord.paymentMode || "Cash",
        paidAmount: routeRecord.apiRecord?.paidAmount || routeRecord.paidAmount || "",
        oldPatient: routeRecord.oldPatient || "No", casualty: routeRecord.casualty || "No",
      }));
      const match = findPatientMatch(patientList, routeRecord);
      if (match) { setSelectedPatient(match); setQuery(match.name); }
      else {
        const stub = { id: routeRecord.patientId || routeRecord.id, name: routeRecord.patientName || "", guardianName: "", gender: "", bloodGroup: "", maritalStatus: "", age: "", phone: "", email: "", address: "", allergies: routeRecord.prevMedicalIssue || "", remarks: "", tpa: "", tpaId: "", tpaValidity: "", nationalId: "", photo: null };
        setSelectedPatient(stub); setQuery(stub.name);
      }
    } else { setOpd(prev => ({ ...prev, caseNo: "OPD" + Date.now().toString().slice(-5) })); }
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!isEdit && !isView) return; if (!routeRecord || !patientList.length) return;
    const match = findPatientMatch(patientList, routeRecord);
    if (match) setSelectedPatient(prev => { const isStub = prev && !prev.phone && !prev.gender && !prev.email; if (isStub || !prev) { setQuery(match.name); return match; } return prev; });
  }, [patientList]); // eslint-disable-line

  // ── Fetch doctors dynamically when department changes ──
  useEffect(() => {
    const selectedDept = opd.departments?.[0];
    const deptObj = selectedDept ? departmentByName.get(selectedDept) : null;
    if (deptObj?.id) {
      fetchDoctors(deptObj.id);
    } else {
      fetchDoctors(null);
    }
  }, [opd.departments, departmentByName, fetchDoctors]);

  // ── Fetch consultation charges dynamically when charge category changes ──
  useEffect(() => {
    const categoryName = opd.chargeCategory;
    const categoryObj = categoryName ? chargeCategoryByName.get(categoryName) : null;
    if (categoryObj?.id) {
      fetchCharges(categoryObj.id);
    } else {
      fetchCharges(null);
    }
  }, [opd.chargeCategory, chargeCategoryByName, fetchCharges]);

  useEffect(() => {
    if (isView || apiConsultationCharges.length) return;
    const fill = computeAutoFill(opd.charges ? [opd.charges] : [], opd.chargeCategory ? [opd.chargeCategory] : []);
    setOpd(prev => ({ ...prev, standardCharge: fill.standardCharge, appliedCharge: fill.appliedCharge, discount: fill.discount, tax: fill.tax }));
  }, [opd.charges, opd.chargeCategory, apiConsultationCharges.length]); // eslint-disable-line

  useEffect(() => {
    if (isView || !apiConsultationCharges.length) return;
    const doctor = doctorByLabel.get(opd.consultantDoctor);
    const category = chargeCategoryByName.get(opd.chargeCategory);
    const department = opd.departments?.[0] ? departmentByName.get(opd.departments[0]) : null;
    const activeCharges = apiConsultationCharges.filter(c => c.isActive !== false);
    if (!activeCharges.length) return;
    const score = (charge) => { let v = 0; if (doctor?.id && String(charge.doctorId || "") === String(doctor.id)) v += 8; if (category?.id && charge.chargeCategoryId === category.id) v += 4; if (department?.id && charge.departmentId === department.id) v += 2; if (!charge.doctorId) v += 1; return v; };
    const match = [...activeCharges].sort((a, b) => score(b) - score(a))[0];
    if (!match || score(match) === 0) return;
    const label = chargeLabel(match);
    setOpd(prev => {
      // Safeguard: do not overwrite in edit mode if charge is already loaded
      if (isEdit && prev.charges) return prev;
      if (prev.charges === label && prev.chargeId === match.id) return prev;
      return applyConsultationCharge(prev, match);
    });
  }, [opd.consultantDoctor, opd.chargeCategory, opd.departments, apiConsultationCharges, doctorByLabel, chargeCategoryByName, departmentByName, isView, isEdit]); // eslint-disable-line

  useEffect(() => {
    const charge = parseFloat(opd.appliedCharge) || 0, discount = parseFloat(opd.discount) || 0, tax = parseFloat(opd.tax) || 0;
    if (!charge) { setOpd(prev => ({ ...prev, amount: "" })); return; }
    const afterDiscount = charge - (charge * discount) / 100;
    const final = afterDiscount + (afterDiscount * tax) / 100;
    setOpd(prev => ({ ...prev, amount: final.toFixed(2), paidAmount: final.toFixed(2) }));
  }, [opd.appliedCharge, opd.discount, opd.tax]);

  const validate = () => {
    const errs = {};
    if (!selectedPatient) errs.patient = "Please select a patient from the list";
    if (!opd.appointmentDate) errs.appointmentDate = "Required";
    if (!opd.consultantDoctor) errs.consultantDoctor = "Required";
    if (!opd.appliedCharge) errs.appliedCharge = "Required";
    return errs;
  };

  const buildApiPayload = () => {
    const doctor = doctorByLabel.get(opd.consultantDoctor);
    const department = opd.departments?.[0] ? departmentByName.get(opd.departments[0]) : null;
    const chargeCategory = chargeCategoryByName.get(opd.chargeCategory);
    const selectedCharge = opd.chargeId ? apiConsultationCharges.find(c => c.id === opd.chargeId) : chargeByLabel.get(opd.charges);
    const applied = Number(opd.appliedCharge || 0), discount = Number(opd.discount || 0), tax = Number(opd.tax || 0);
    const discountAmount = (applied * discount) / 100, taxableAmount = applied - discountAmount;
    return {
      appointmentId: routeRecord?.appointmentId || null, patientId: String(selectedPatient.id),
      opdNo: isEdit ? routeRecord?.token || opd.caseNo || null : null, caseId: opd.caseNo || null,
      appointmentDate: toLocalAppointmentIso(opd.appointmentDate),
      departmentId: department?.id || selectedCharge?.departmentId || doctor?.department_id || null,
      consultantDoctorId: doctor?.id || null, reference: opd.reference || null, generatedBy: null,
      isOldPatient: opd.oldPatient === "Yes", isCasualty: opd.casualty === "Yes",
      isLiveConsultation: opd.liveConsultation === "Yes",
      symptomsType: opd.symptomsType || null, symptomsTitle: opd.symptomsTitle || null,
      symptomsDescription: opd.symptomsDescription || null, note: opd.note || null,
      knownAllergies: opd.allergies || selectedPatient?.allergies || null,
      previousMedicalIssue: opd.previousMedical || null, primaryDiagnosis: opd.diagnosis || null,
      chargeCategoryId: chargeCategory?.id || selectedCharge?.chargeCategoryId || null,
      chargeId: selectedCharge?.id || opd.chargeId || null,
      standardCharge: Number(opd.standardCharge || 0), appliedCharge: applied,
      discountPercentage: discount, discountAmount, taxPercentage: tax,
      taxAmount: (taxableAmount * tax) / 100, amount: Number(opd.amount || 0),
      paidAmount: Number(opd.paidAmount || 0), paymentMode: paymentModeValue(opd.paymentMode),
      applyTpa: Boolean(opd.applyTpa), tpaId: opd.applyTpa ? opd.tpa || selectedPatient?.tpaId || null : null, status: "registered",
    };
  };

  const buildRecord = () => ({
    id: Date.now(), caseId: opd.caseNo, patientName: selectedPatient.name, patientId: selectedPatient.id,
    date: opd.appointmentDate, doctor: opd.consultantDoctor, departments: opd.departments,
    symptoms: opd.symptomsDescription, prescription: opd.prescription, prevMedicalIssue: opd.previousMedical,
    reference: opd.reference, chargeCategory: opd.chargeCategory, charges: opd.charges ? [opd.charges] : [],
    standardCharge: opd.standardCharge, appliedCharge: opd.appliedCharge, discount: opd.discount, tax: opd.tax,
    amount: opd.amount, fee: `₹${opd.amount}`, paymentMode: opd.paymentMode, paidAmount: opd.paidAmount,
    tpa: opd.tpa, oldPatient: opd.oldPatient, casualty: opd.casualty, generatedBy: "Super Admin (9001)",
  });

  const handleSave = async () => {
    if (loading || isView) return;
    const errs = validate(); setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const saved = await saveAppointment(buildApiPayload(), isEdit ? routeRecord?.id : null);
      const record = { ...buildRecord(), id: saved?.id || routeRecord?.id || Date.now(), token: saved?.opdNo || routeRecord?.token || opd.caseNo, caseId: saved?.caseId || routeRecord?.caseId || opd.caseNo, opdNumber: saved?.caseId || routeRecord?.opdNumber || "", uhid: selectedPatient?.uhid || routeRecord?.uhid || "", apiRecord: saved };
      setLoading(false);
      navigate("/super-admin/opd", { state: { savedRecord: record, toast: isEdit ? "Record updated successfully!" : "Appointment booked successfully!" } });
    } catch (err) {
      setLoading(false);
      setErrors(p => ({ ...p, submit: getResponseMessage(err, "Unable to save OPD appointment") }));
    }
  };

  const handleSaveAndPrint = async () => {
    if (isView) { printOPDReceipt(selectedPatient, opd); return; }
    const errs = validate(); setErrors(errs);
    if (Object.keys(errs).length) return;
    setLoading(true);
    try {
      const saved = await saveAppointment(buildApiPayload(), isEdit ? routeRecord?.id : null);
      const record = { ...buildRecord(), id: saved?.id || routeRecord?.id || Date.now(), token: saved?.opdNo || routeRecord?.token || opd.caseNo, caseId: saved?.caseId || routeRecord?.caseId || opd.caseNo, apiRecord: saved };
      printOPDReceipt(selectedPatient, opd);
      setLoading(false);
      navigate("/super-admin/opd", { state: { savedRecord: record, toast: "Appointment booked successfully!!" } });
    } catch (err) {
      setLoading(false);
      setErrors(p => ({ ...p, submit: getResponseMessage(err, "Unable to save OPD appointment") }));
    }
  };

  const pageTitle    = isView ? "View OPD Record" : isEdit ? "Edit OPD Record" : "Add OPD";
  const pageSubtitle = isView ? `Viewing record for ${routeRecord?.patientName || ""}` : isEdit ? `Editing record for ${routeRecord?.patientName || ""}` : "Outpatient Department — detailed patient consultation form";

  return (
    <div className="opd-add-page flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="opd-add-content">

          <PageHeader
            title={pageTitle}
            subtitle={pageSubtitle}
            breadcrumbs={[
              { label: "Super Admin", path: "/super-admin/dashboard" },
              { label: "OPD", path: "/super-admin/opd" },
              { label: pageTitle },
            ]}
            actions={
              <Button variant="ghost" size="sm" leftIcon={<ArrowLeft size={14} />} onClick={() => navigate("/super-admin/opd")}>
                Back to OPD
              </Button>
            }
          />

          {/* Banners */}
          {isView && (
            <div className="mt-3 flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-400 px-4 py-2.5 rounded-xl text-sm font-medium">
              <Eye size={15} />
              <span>You are viewing this record in read-only mode.</span>
              <button onClick={() => navigate("/super-admin/opd/add", { state: { mode: "edit", record: routeRecord } })} className="ml-auto text-xs underline underline-offset-2 hover:opacity-80">Switch to Edit</button>
            </div>
          )}
          {errors.patient && <div className="mt-3 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm">⚠ {errors.patient}</div>}
          {errors.submit  && <div className="mt-3 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-2 rounded-xl text-sm">{errors.submit}</div>}
          {lookupError   && <div className="mt-3 flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-xl text-xs">Live OPD lookups could not load. The form is using local fallback options.</div>}

          {/* Patient search bar */}
          {!isView && (
            <div className={['opd-patient-search', errors.patient ? 'border-red-300 dark:border-red-700' : ''].join(' ')}>
              <div ref={searchRef} className="relative flex-1 min-w-0 sm:min-w-[260px] max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={14} />
                <input
                  type="text" value={query}
                  placeholder="Search / Select Patient by name, ID or phone..."
                  onChange={(e) => { setQuery(e.target.value); setShowDrop(true); if (selectedPatient) setSelectedPatient(null); if (errors.patient) setErrors(p => ({ ...p, patient: "" })); }}
                  onFocus={() => setShowDrop(true)}
                  className="input-base pl-9 pr-8 h-10"
                />
                {query && <button onClick={clearPatient} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"><X size={11} /></button>}
                {showDrop && query && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-xl shadow-xl z-[300] overflow-hidden">
                    {filteredPts.length > 0 ? filteredPts.map(pt => (
                      <button key={pt.id} onClick={() => pickPatient(pt)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition text-left">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center shrink-0 overflow-hidden">
                          {pt.photo ? <img src={pt.photo} alt={pt.name} className="w-full h-full object-cover" /> : <User size={14} className="text-primary-600" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                            {pt.name}
                            {EXISTING_OPD_PATIENT_IDS.has(pt.id) && (
                              <span className="ml-1.5 text-[9px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-semibold">OLD</span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400">{pt.phone} · {pt.gender} · {pt.bloodGroup}</p>
                          {pt.allergies && pt.allergies !== "None" && <p className="text-[10px] text-red-500 font-medium">⚠ Allergies: {pt.allergies}</p>}
                        </div>
                      </button>
                    )) : <div className="px-4 py-3 text-xs text-slate-400 text-center">No patient found</div>}
                  </div>
                )}
              </div>
              <Button size="sm" className="h-10" leftIcon={<Plus size={13} />} onClick={() => setShowModal(true)}>New Patient</Button>
              {loadingLookups && <span className="text-[10px] text-slate-400 whitespace-nowrap">Loading live data...</span>}
              {selectedPatient && <button onClick={clearPatient} className="text-slate-400 hover:text-red-500 transition ml-auto"><X size={16} /></button>}
            </div>
          )}

          {selectedPatient && !isView && (
            <div className={['mt-2 px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 border',
              opd.oldPatient === "Yes" ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400' : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700 text-green-700 dark:text-green-400',
            ].join(' ')}>
              <span>{opd.oldPatient === "Yes" ? "⚡" : "✦"}</span>
              <span><strong>{opd.oldPatient === "Yes" ? "Old" : "New"}</strong>{opd.oldPatient === "Yes" ? " patient with prior OPD records." : " patient with first OPD visit."}</span>
            </div>
          )}

          {selectedPatient?.allergies && selectedPatient.allergies !== "None" && (
            <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2">
              <span>⚠</span><span>Patient has known allergies: <strong>{selectedPatient.allergies}</strong></span>
            </div>
          )}

          {/* ── MAIN LAYOUT ── */}
          <div className="opd-add-grid">

            {/* LEFT 60% */}
            <div className="opd-add-main">
              {selectedPatient ? (
                <div className="opd-patient-card">
                  <div className="flex flex-col sm:flex-row gap-5">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-base font-extrabold text-surface-900 dark:text-slate-100 mb-3">
                        {selectedPatient.name}
                        {opd.oldPatient === "Yes" && (
                          <span className="ml-2 text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold">OLD PATIENT</span>
                        )}
                      </h2>
                      <div className="space-y-1.5">
                        {selectedPatient.guardianName && <IconRow icon="guardian">{selectedPatient.guardianName}</IconRow>}
                        <div className="flex items-center gap-4 flex-wrap">
                          {selectedPatient.gender      && <IconRow icon="gender">{selectedPatient.gender}</IconRow>}
                          {selectedPatient.bloodGroup  && <IconRow icon="blood">{selectedPatient.bloodGroup}</IconRow>}
                          {selectedPatient.maritalStatus && <IconRow icon="heart">{selectedPatient.maritalStatus}</IconRow>}
                        </div>
                        {selectedPatient.age     && <IconRow icon="clock">{selectedPatient.age}</IconRow>}
                        {selectedPatient.phone   && <IconRow icon="phone">{selectedPatient.phone}</IconRow>}
                        {selectedPatient.email   && <IconRow icon="email">{selectedPatient.email}</IconRow>}
                        {selectedPatient.address && <IconRow icon="location">{selectedPatient.address}</IconRow>}
                      </div>
                      <div className="flex items-end gap-5 mt-3">
                        <QRViz seed={selectedPatient.id} />
                      </div>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-surface-700 dark:text-slate-300 border-t border-primary-100 dark:border-slate-800 pt-3">
                        {selectedPatient.allergies  && <p><span className="font-semibold">Any Known Allergies </span>{selectedPatient.allergies}</p>}
                        {selectedPatient.remarks    && <p><span className="font-semibold">Remarks </span>{selectedPatient.remarks}</p>}
                        {selectedPatient.tpa        && <p><span className="font-semibold">TPA </span>{selectedPatient.tpa}</p>}
                        {selectedPatient.nationalId && <p><span className="font-semibold">National ID </span>{selectedPatient.nationalId}</p>}
                      </div>
                    </div>
                    <div className="shrink-0 self-start">
                      <div className="w-28 h-32 rounded-xl bg-surface-100 dark:bg-slate-700 overflow-hidden border border-primary-100 dark:border-slate-600 flex items-center justify-center shadow-sm">
                        {selectedPatient.photo ? <img src={selectedPatient.photo} alt={selectedPatient.name} className="w-full h-full object-cover" /> : <User size={40} className="text-slate-300 dark:text-slate-500" />}
                      </div>
                      <p className="text-[10px] text-center text-slate-400 mt-1">Patient Photo</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="opd-empty-patient">
                  <User size={32} className="text-primary-300 dark:text-slate-600" />
                  <p className="text-sm font-semibold text-surface-500 dark:text-slate-500">Search and select a patient to view profile</p>
                </div>
              )}

              {/* Symptoms */}
              <Section title="Symptoms">
                {isView ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ViewField label="Symptoms Type" value={opd.symptomsType} />
                    <ViewField label="Symptoms Title" value={opd.symptomsTitle} />
                    <ViewField label="Description" value={opd.symptomsDescription} />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <SearchableSelect label="Symptoms Type" value={opd.symptomsType} onChange={o("symptomsType")} options={["Fever","Cold & Cough","Headache","Chest Pain","Abdominal Pain","Vomiting","Diarrhea","Skin Rash","Body Pain","Breathlessness"]} allowCustom />
                    <SearchableSelect label="Symptoms Title" value={opd.symptomsTitle} onChange={o("symptomsTitle")} options={["High Grade Fever","Low Grade Fever","Dry Cough","Productive Cough","Migraine","Tension Headache","Acute Chest Pain","Severe Body Pain"]} allowCustom />
                    <Textarea label="Symptoms Description" rows={2} value={opd.symptomsDescription} onChange={o("symptomsDescription")} placeholder="Describe symptoms..." />
                  </div>
                )}
              </Section>

              {/* Clinical Notes */}
              <Section title="Clinical Notes">
                {isView ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                    <ViewField label="Note" value={opd.note} />
                    <ViewField label="Any Known Allergies" value={opd.allergies} />
                    <div className="col-span-2"><ViewField label="Previous Medical Issue" value={opd.previousMedical} /></div>
                    <div className="col-span-2"><ViewField label="Prescription" value={opd.prescription} /></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
                      <Textarea label="Note" rows={3} value={opd.note} onChange={o("note")} placeholder="Clinical notes..." />
                      <Textarea label="Any Known Allergies" rows={3} value={opd.allergies} onChange={o("allergies")} placeholder="List allergies..." />
                    </div>
                    <Textarea label="Previous Medical Issue" rows={3} value={opd.previousMedical} onChange={o("previousMedical")} placeholder="Describe previous medical history..." />
                    <Textarea label="Prescription" rows={3} value={opd.prescription} onChange={o("prescription")} placeholder="Write prescription..." />
                  </>
                )}
              </Section>
            </div>

            {/* RIGHT 40% */}
            <div className="opd-add-side">
              <Section title="Appointment Details">
                {isView ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ViewField label="Appointment Date" value={opd.appointmentDate} />
                    <ViewField label="Department" value={(opd.departments || []).join(", ")} />
                    <ViewField label="Patient Type" value={opd.oldPatient === "Yes" ? "Old" : "New"} />
                    <ViewField label="Reference" value={opd.reference} />
                    <ViewField label="Consultant Doctor" value={opd.consultantDoctor} />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-3">
                      <Input label="Appointment Date & Time" required type="datetime-local" value={opd.appointmentDate} onChange={o("appointmentDate")} error={errors.appointmentDate} />
                    </div>
                    <div className="mt-3">
                      {/* ── CHANGED: clear consultantDoctor when department changes ── */}
                      <SearchableSelect
                        label="Department"
                        placeholder="Select department..."
                        options={departmentOptions}
                        value={opd.departments?.[0] || ""}
                        onChange={(e) => setOpd(p => ({
                          ...p,
                          departments: e.target.value ? [e.target.value] : [],
                          consultantDoctor: "",
                        }))}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div>
                        <Label>{opd.oldPatient === "Yes" ? "Old" : "New"} <span className="text-[10px] font-normal text-slate-400">(auto-detected)</span></Label>
                        <div className={['flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-sm',
                          opd.oldPatient === "Yes" ? 'border-amber-300 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-700' : 'border-green-300 bg-green-50 dark:bg-green-900/10 dark:border-green-700',
                        ].join(' ')}>
                          <span className={`font-semibold text-sm ${opd.oldPatient === "Yes" ? "text-amber-700 dark:text-amber-400" : "text-green-700 dark:text-green-400"}`}>{opd.oldPatient === "Yes" ? "Old" : "New"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3"><Input label="Reference" value={opd.reference} onChange={o("reference")} placeholder="Enter reference..." /></div>
                    <div className="mt-3">
                      <SearchableSelect
                        label="Consultant Doctor"
                        required
                        value={opd.consultantDoctor}
                        onChange={o("consultantDoctor")}
                        options={doctorOptions}
                        error={errors.consultantDoctor}
                        disabled={!opd.departments?.[0]}
                        placeholder={opd.departments?.[0] ? `Select doctor for ${opd.departments[0]}` : "Select department first"}
                      />
                      {/* hint when department is selected */}
                      {opd.departments?.[0] && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          {apiDoctors.length} doctor{apiDoctors.length !== 1 ? "s" : ""} available in {opd.departments[0]}.
                        </p>
                      )}
                    </div>
                  </>
                )}
              </Section>

              {/* Billing */}
              <Section title="Billing">
                {isView ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ViewField label="Charge Category" value={opd.chargeCategory} />
                    <div className="col-span-2"><ViewField label="Charges" value={asChargeList(opd.charges).join(", ")} /></div>
                    <ViewField label="Standard Charge" value={opd.standardCharge ? `₹${opd.standardCharge}` : ""} />
                    <ViewField label="Applied Charge"  value={opd.appliedCharge  ? `₹${opd.appliedCharge}`  : ""} />
                    <ViewField label="Discount"        value={opd.discount ? `${opd.discount}%` : ""} />
                    <ViewField label="Tax"             value={opd.tax      ? `${opd.tax}%`      : ""} />
                    <ViewField label="Total Amount"    value={opd.amount   ? `₹${opd.amount}`   : ""} />
                    <ViewField label="Payment Mode"    value={opd.paymentMode} />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <SearchableSelect label="Charge Category" value={opd.chargeCategory} onChange={handleChargeCategoryChange} options={chargeCategoryOptions} />
                    <SearchableSelect
                      label="Charge"
                      placeholder={opd.chargeCategory ? "Select charge..." : "Select charge category first"}
                      options={filteredChargeOptions}
                      value={opd.charges}
                      disabled={!opd.chargeCategory}
                      onChange={(e) => {
                        const selectedLabel = e.target.value;
                        const selectedCharge = chargeByLabel.get(selectedLabel);
                        setOpd(p => selectedCharge ? applyConsultationCharge({ ...p, charges: selectedLabel }, selectedCharge) : { ...p, charges: selectedLabel, chargeId: "" });
                      }}
                    />
                    {opd.charges && (
                      <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800 rounded-xl px-3 py-2">
                        <p className="text-[10px] text-primary-600 dark:text-primary-400 font-medium">✦ Billing auto-filled · category multiplier applied · you can override below</p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input label="Standard Charge (₹)" value={opd.standardCharge} onChange={o("standardCharge")} placeholder="0.00" readOnly={opd.charges.length > 0} />
                      <Input label="Applied Charge (₹)" required value={opd.appliedCharge} onChange={o("appliedCharge")} placeholder="0.00" error={errors.appliedCharge} readOnly={opd.charges.length > 0} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <Label>Discount</Label>
                        <div className="flex items-center gap-1">
                          <input value={opd.discount} onChange={o("discount")} readOnly={opd.charges.length > 0} className="input-base flex-1 read-only:bg-slate-50 dark:read-only:bg-slate-800/50" />
                          <span className="text-xs text-slate-500 font-medium">%</span>
                        </div>
                      </div>
                      <div>
                        <Label>Tax</Label>
                        <div className="flex items-center gap-1">
                          <input value={opd.tax} onChange={o("tax")} readOnly={opd.charges.length > 0} className="input-base flex-1 read-only:bg-slate-50 dark:read-only:bg-slate-800/50" />
                          <span className="text-xs text-slate-500 font-medium">%</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label>Amount (₹) <span className="text-slate-400 font-normal normal-case text-[10px]">(auto-calculated)</span></Label>
                      <input readOnly value={opd.amount} placeholder="0.00" className="input-base bg-slate-50 dark:bg-slate-800/50 font-semibold" />
                    </div>
                    <SearchableSelect label="Payment Mode" value={opd.paymentMode} onChange={o("paymentMode")} options={["Cash","Card","UPI","Online","Insurance","Cheque"]} />
                  </div>
                )}
              </Section>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className="opd-add-footer">
        <Button variant="secondary" size="sm" leftIcon={<ArrowLeft size={13} />} onClick={() => navigate("/super-admin/opd")}>Back</Button>
        {!isView && (<>
          <Button variant="primary" size="sm" leftIcon={<Printer size={13} />} onClick={handleSaveAndPrint} loading={loading || savingAppointment}>Save &amp; Print</Button>
          <Button variant="primary" size="sm" leftIcon={<Save size={13} />} onClick={handleSave} loading={loading || savingAppointment}>Book Appointment</Button>
        </>)}
        {isView && (
          <Button variant="primary" size="sm" leftIcon={<Printer size={13} />} onClick={() => printOPDReceipt(selectedPatient, opd)}>Print Receipt</Button>
        )}
      </div>

      {/* ══ ADD PATIENT MODAL ══ */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setNpErrors({}); }}
        title="Add New Patient"
        size="6xl"
        footer={
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => { setShowModal(false); setNpErrors({}); }}>Cancel</Button>
            <Button variant="primary" leftIcon={<Save size={13} />} onClick={handleSaveNewPatient} loading={createLoading}>Save Patient</Button>
          </div>
        }
      >
        <div className="px-5 py-5 space-y-4">

          {/* Name + Guardian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name" required error={npErrors.name}>
              <input
                type="text" value={np.name} placeholder="Full name (alphabets only)"
                onChange={(e) => { const val = e.target.value.replace(/[^a-zA-Z\s]/g, ""); setNp(prev => ({ ...prev, name: val })); if (npErrors.name) setNpErrors(p => ({ ...p, name: "" })); }}
                className="input-base"
              />
            </Field>
            <Input label="Guardian Name" value={np.guardianName} onChange={nf("guardianName")} placeholder="Guardian / father name" />
          </div>

          {/* Gender, DOB, Age, Blood Group, Marital Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 items-end">
            <SearchableSelect label="Gender" required value={np.gender} onChange={nf("gender")} options={["Male","Female","Other"]} error={npErrors.gender} />
            <Field label="Date Of Birth" required error={npErrors.dob}>
              <input type="date" value={np.dob} max={new Date().toISOString().split("T")[0]}
                onChange={(e) => { setNp(prev => ({ ...prev, dob: e.target.value })); if (npErrors.dob) setNpErrors(p => ({ ...p, dob: "" })); }}
                className="input-base"
              />
            </Field>
            <div><Label>Age (Yrs)</Label><input readOnly value={np.ageYear !== "" ? String(np.ageYear) : ""} placeholder="—" className="input-base bg-slate-50 dark:bg-slate-800/50 text-center" /></div>
            <div><Label>Months</Label><input readOnly value={np.ageMonth !== "" ? String(np.ageMonth) : ""} placeholder="—" className="input-base bg-slate-50 dark:bg-slate-800/50 text-center" /></div>
            <div><Label>Days</Label><input readOnly value={np.ageDay !== "" ? String(np.ageDay) : ""} placeholder="—" className="input-base bg-slate-50 dark:bg-slate-800/50 text-center" /></div>
            <SearchableSelect label="Blood Group" value={np.bloodGroup} onChange={nf("bloodGroup")} options={["A+","A-","B+","B-","O+","O-","AB+","AB-"]} />
            <SearchableSelect label="Marital Status" value={np.maritalStatus} onChange={nf("maritalStatus")} options={["Single","Married","Divorced","Widowed"]} />
          </div>

          {/* Phone, Email, Photo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Field label="Phone" required error={npErrors.phone}>
              <input type="tel" inputMode="numeric" maxLength={10} value={np.phone} placeholder="10-digit mobile number"
                onChange={(e) => { const val = e.target.value.replace(/\D/g, "").slice(0, 10); setNp(prev => ({ ...prev, phone: val })); if (npErrors.phone) setNpErrors(p => ({ ...p, phone: "" })); }}
                className="input-base"
              />
              {np.phone && np.phone.length < 10 && !npErrors.phone && <p className="text-amber-500 text-[10px] mt-1">{10 - np.phone.length} more digit{10 - np.phone.length !== 1 ? "s" : ""} needed</p>}
            </Field>
            <Input label="Email" value={np.email} onChange={nf("email")} placeholder="Email address" error={npErrors.email} />
            <div>
              <Label>Patient Photo <span className="text-slate-400 font-normal text-[10px]">(JPG / PNG)</span></Label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handlePhoto(e.dataTransfer.files[0]); }}
                className={['flex items-center justify-center border rounded-xl cursor-pointer h-[42px] transition-colors',
                  dragOver ? 'border-primary-400 bg-primary-50' : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100',
                ].join(' ')}
              >
                {photoPreview ? <img src={photoPreview} alt="preview" className="h-full object-contain rounded-xl" /> : <div className="flex items-center gap-1.5 text-slate-400 text-xs"><Upload size={11} /><span>Drop or click</span></div>}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhoto(e.target.files[0])} />
            </div>
          </div>

          <Input label="Address" value={np.address} onChange={nf("address")} placeholder="City, State, Country" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea label="Remarks" rows={3} value={np.remarks} onChange={nf("remarks")} placeholder="Any physical identifiers, notes..." />
            <Textarea label="Any Known Allergies" rows={3} value={np.allergies} onChange={nf("allergies")} placeholder="List known allergies..." />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SearchableSelect label="TPA" value={np.tpa} onChange={nf("tpa")} options={["Star Health","ICICI Lombard","HDFC Ergo","New India Assurance","United India Insurance"]} />
            <Input label="TPA ID" value={np.tpaId} onChange={nf("tpaId")} placeholder="Policy / member ID" />
            <div>
              <Label>TPA Validity</Label>
              <input type="date" value={np.tpaValidity} min={new Date().toISOString().split("T")[0]} onChange={nf("tpaValidity")} className="input-base" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="National Identification Number (Aadhaar)" error={npErrors.nationalId}>
              <input type="text" inputMode="numeric" maxLength={12} value={np.nationalId} placeholder="12-digit Aadhaar number"
                onChange={(e) => { const val = e.target.value.replace(/\D/g, "").slice(0, 12); setNp(prev => ({ ...prev, nationalId: val })); if (npErrors.nationalId) setNpErrors(p => ({ ...p, nationalId: "" })); }}
                className="input-base"
              />
              {np.nationalId && np.nationalId.length > 0 && np.nationalId.length < 12 && !npErrors.nationalId && <p className="text-amber-500 text-[10px] mt-1">{12 - np.nationalId.length} more digit{12 - np.nationalId.length !== 1 ? "s" : ""} needed</p>}
            </Field>
            <Field label="Alternate Number" error={npErrors.alternateNumber}>
              <input type="tel" inputMode="numeric" maxLength={10} value={np.alternateNumber} placeholder="10-digit secondary phone"
                onChange={(e) => { const val = e.target.value.replace(/\D/g, "").slice(0, 10); setNp(prev => ({ ...prev, alternateNumber: val })); if (npErrors.alternateNumber) setNpErrors(p => ({ ...p, alternateNumber: "" })); }}
                className="input-base"
              />
              {np.alternateNumber && np.alternateNumber.length > 0 && np.alternateNumber.length < 10 && !npErrors.alternateNumber && <p className="text-amber-500 text-[10px] mt-1">{10 - np.alternateNumber.length} more digit{10 - np.alternateNumber.length !== 1 ? "s" : ""} needed</p>}
            </Field>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OPDAdd;

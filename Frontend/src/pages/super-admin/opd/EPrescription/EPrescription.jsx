import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  CalendarDays,
  ClipboardPlus,
  FileCheck2,
  Pill,
  Printer,
  Save,
  Search,
  Stethoscope,
  TestTube2,
  UserRound,
  X,
} from "lucide-react";

import Button from "@components/ui/Button/Button";
import Badge from "@components/ui/Badge/Badge";
import PageHeader from "@components/layout/PageHeader/PageHeader";
import apiClient from "@api/apiClient";

const unwrap = (response) => response?.data?.result?.data ?? response?.data?.result ?? response?.data?.data ?? response?.data;

const EMPTY_FORM = {
  chiefComplaint: "",
  diagnosis: "",
  advice: "",
  followUpDate: "",
  vitals: {
    bloodPressure: "",
    pulse: "",
    temperature: "",
    spo2: "",
    weight: "",
  },
  medicines: [
    { medicine: "", dose: "", interval: "", duration: "", instruction: "" },
  ],
  pathologies: [],
  radiologies: [],
  status: "draft",
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#0f766e] focus:ring-3 focus:ring-teal-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100";

const Textarea = ({ value, onChange, placeholder, rows = 4 }) => (
  <textarea className={`${inputClass} resize-none`} value={value} onChange={onChange} placeholder={placeholder} rows={rows} />
);

const Field = ({ label, children }) => (
  <label className="block">
    <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
    {children}
  </label>
);

const MultiTestInput = ({ label, value = [], onChange, placeholder }) => {
  const [draft, setDraft] = useState("");
  const tests = Array.isArray(value) ? value : [];

  const addTests = (raw) => {
    const nextItems = String(raw || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
    if (!nextItems.length) return;
    const existing = new Set(tests.map((item) => normalize(item)));
    const merged = [...tests];
    nextItems.forEach((item) => {
      if (!existing.has(normalize(item))) {
        merged.push(item);
        existing.add(normalize(item));
      }
    });
    onChange(merged);
    setDraft("");
  };

  const removeTest = (index) => {
    onChange(tests.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <Field label={label}>
      <div className="min-h-11 rounded-lg border border-slate-200 bg-white px-2 py-1.5 transition focus-within:border-[#0f766e] focus-within:ring-3 focus-within:ring-teal-100 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex flex-wrap items-center gap-2">
          {tests.map((test, index) => (
            <span key={`${test}-${index}`} className="inline-flex max-w-full items-center gap-1 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-semibold text-primary-700 ring-1 ring-primary-100">
              <span className="truncate">{test}</span>
              <button type="button" className="text-primary-500 hover:text-red-500" onClick={() => removeTest(index)} aria-label={`Remove ${test}`}>
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            className="min-w-[160px] flex-1 border-0 bg-transparent px-1 py-1.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => addTests(draft)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTests(draft);
              }
              if (e.key === "Backspace" && !draft && tests.length) {
                removeTest(tests.length - 1);
              }
            }}
            placeholder={tests.length ? "Add another test" : placeholder}
          />
        </div>
      </div>
      <p className="mt-1 text-[11px] text-slate-400">Press Enter or comma after each test.</p>
    </Field>
  );
};

const normalize = (value) => String(value || "").trim().toLowerCase();

const extractScanValue = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const parsed = JSON.parse(raw);
    return parsed.uhid || parsed.patientId || parsed.id || parsed.phone || raw;
  } catch {
    // Continue with URL/plain text parsing.
  }
  try {
    const url = new URL(raw);
    return url.searchParams.get("uhid") || url.searchParams.get("patientId") || url.searchParams.get("id") || url.pathname.split("/").filter(Boolean).pop() || raw;
  } catch {
    return raw;
  }
};

const patientSearchValues = (patient) => [
  patient.id,
  patient.patientId,
  patient.uhid,
  patient.name,
  patient.phone,
  patient.mobile,
  patient.mobileNumber,
  patient.alternateNumber,
  patient.email,
  patient.adharNo,
].map(normalize).filter(Boolean);

const calculateAge = (patient) => {
  const dob = patient?.dob || patient?.dateOfBirth || patient?.date_of_birth;
  if (!dob) return patient?.age || "-";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return patient?.age || "-";
  const now = new Date();
  let y = now.getFullYear() - birth.getFullYear();
  let m = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) m -= 1;
  if (m < 0) { y -= 1; m += 12; }
  return `${y}Y ${m}M`;
};

const buildPrescriptionRecord = (patient, opdRows = []) => {
  const dob = patient.dob || patient.dateOfBirth || patient.date_of_birth || null;
  const phone = patient.phone || patient.mobile || patient.mobileNumber || patient.alternateNumber || "";
  const address = [patient.address, patient.city, patient.state].filter(Boolean).join(", ");
  const emergencyContact = [
    patient.emergencyContactName,
    patient.emergencyContactPhone,
    patient.emergencyContactRelation,
  ].filter(Boolean).join(" - ");
  const visits = opdRows
    .filter((row) => String(row.patientId) === String(patient.id))
    .sort((a, b) => new Date(b.appointmentDate || 0) - new Date(a.appointmentDate || 0));
  const visit = visits[0] || null;
  return {
    id: visit?.id,
    apiRecord: visit,
    patient,
    patientId: patient.id,
    patientName: patient.name,
    uhid: patient.uhid,
    phone,
    email: patient.email,
    gender: patient.gender,
    age: calculateAge(patient),
    dob,
    bloodGroup: patient.bloodGroup,
    maritalStatus: patient.maritalStatus,
    address,
    allergies: patient.allergies || patient.knownAllergies || "",
    emergencyContact,
    doctor: visit?.consultantDoctorId ? `Doctor (${visit.consultantDoctorId})` : "Doctor not selected",
    date: visit?.appointmentDate ? new Date(visit.appointmentDate).toLocaleString("en-IN") : "No OPD visit linked",
    token: visit?.opdNo || visit?.caseId || "-",
    caseId: visit?.caseId || visit?.opdNo || "-",
    prescription: visit?.prescription,
  };
};
const parsePrescription = (value) => {
  if (!value) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return { advice: value };
  }
};

const escapeHtml = (value) => String(value ?? "")
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#039;");

const displayValue = (value) => escapeHtml(value || "-");

const printPrescription = (record, form) => {
  const patientName = record?.patientName || record?.patient?.name || "Patient";
  const patient = record?.patient || {};
  const age = record?.age || calculateAge(patient) || "-";
  const gender = record?.gender || patient?.gender || "-";
  const printDate = new Date().toLocaleDateString("en-IN");
  const appointmentDate = record?.date || "-";
  const medicines = form.medicines.filter((m) => m.medicine);
  const html = `<!doctype html><html><head><title>Prescription - ${escapeHtml(patientName)}</title>
  <style>
    @page{size:A4;margin:0}
    *{box-sizing:border-box}
    body{margin:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#1f2937;font-size:12px}
    .sheet{width:210mm;min-height:297mm;margin:0 auto;background:#fff;position:relative;overflow:hidden}
    .brand-header{height:43mm;position:relative;background:linear-gradient(103deg,#f1df16 0 22%,#f5c313 22% 44%,#ef8a37 72%,#e87b31 100%);border-bottom:2mm solid #dc2b79}
    .brand-header:after{content:"";position:absolute;left:75mm;right:-8mm;bottom:-2mm;height:19mm;background:#fff;border-top:1.6mm solid #dc2b79;transform:skewY(-8deg);transform-origin:left bottom}
    .logo{position:absolute;left:7mm;top:4mm;width:28mm;height:28mm;border-radius:50%;background:#fff;overflow:hidden;border:1.4mm solid rgba(255,255,255,.45)}
    .logo img{width:100%;height:100%;object-fit:cover;display:block}
    .brand{position:absolute;left:50mm;top:4mm;color:#8b1d26;text-shadow:1px 1px 0 rgba(255,255,255,.8);font-size:30px;font-weight:900;letter-spacing:.5px;line-height:.95;white-space:nowrap}
    .tagline{position:absolute;left:51mm;top:18mm;color:#25314f;font-size:13px;font-weight:800}
    .chips{position:absolute;left:50mm;top:27mm;display:flex;gap:3mm}
    .chip{background:#d73585;color:#fff;border-radius:1.5mm;padding:1.5mm 3mm;font-size:10px;font-weight:900;text-transform:uppercase}
    .phone-badge{position:absolute;left:7mm;top:32mm;background:#fff;border-radius:1.5mm;border:1px solid #718096;color:#1f3765;font-size:12px;font-weight:900;padding:1mm 5mm}
    .mother-art{position:absolute;right:13mm;top:5mm;width:27mm;height:31mm;border-radius:50% 50% 45% 45%;background:radial-gradient(circle at 50% 18%,#ffe2c4 0 12%,transparent 13%),linear-gradient(150deg,#fff 0 28%,#f5a5c6 29% 64%,#c43b7c 65%);opacity:.95}
    .body{display:grid;grid-template-columns:73mm 1fr;min-height:254mm}
    .sidebar{padding:5mm 4mm 6mm 5mm;border-right:2mm solid #df2c7d;color:#263761}
    .side-box{border:1.2px solid #df2c7d;margin-bottom:3mm;padding:3mm}
    .doctor-name{color:#d73585;font-size:15px;font-weight:900;margin:0 0 2mm}
    .degree{font-size:10px;line-height:1.28;font-weight:800;margin:0;color:#273a67}
    .role{color:#d73585;font-weight:900}
    .memberships{font-size:8.2px;line-height:1.22;font-weight:800}
    .memberships p{margin:0 0 2.1mm}
    .accent{color:#d73585}
    .website{text-align:center;color:#c2442d;font-size:14px;font-weight:900;margin-top:2mm}
    .booking{text-align:center;color:#24416f;font-size:12px;font-weight:900}
    .address{text-align:center;color:#d73585;font-size:7px;font-weight:700}
    .attendant{height:70mm;display:flex;flex-direction:column;justify-content:space-between;color:#d73585;font-size:8px;font-weight:800}
    .attendant .blue{color:#263761}
    .rx-area{position:relative;padding:11mm 9mm 19mm 8mm}
    .watermark{position:absolute;left:50%;top:50%;width:52mm;height:52mm;border-radius:50%;border:2mm solid rgba(38,55,97,.035);transform:translate(-50%,-45%);display:flex;align-items:center;justify-content:center;color:rgba(38,55,97,.045);font-size:40px;font-weight:900}
    .patient-strip{position:relative;z-index:1;border:1px solid #e6b6cd;background:rgba(255,248,251,.88);padding:3mm;display:grid;grid-template-columns:1.2fr .55fr .55fr .8fr;gap:2mm;font-size:10px;margin-bottom:4mm}
    .patient-strip b{color:#d73585}
    .section{position:relative;z-index:1;margin-top:4mm}
    .section-title{display:inline-block;color:#d73585;border-bottom:1px solid #d73585;font-size:10px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;margin-bottom:2mm}
    .notes{display:grid;grid-template-columns:1fr 1fr;gap:3mm}
    .note{min-height:20mm;border-bottom:1px solid #f3c6d9;padding-bottom:2mm;white-space:pre-wrap;line-height:1.45}
    .note.full{grid-column:1/-1}
    .vitals{display:grid;grid-template-columns:repeat(5,1fr);gap:2mm}
    .vital{border:1px solid #f0c0d5;padding:2mm;min-height:10mm}
    .vital b{display:block;color:#d73585;font-size:8px;text-transform:uppercase}
    table{width:100%;border-collapse:collapse;font-size:10px}
    th{background:#ffe8f2;color:#b81e63;text-align:left;padding:2mm;border:1px solid #efb5cf;text-transform:uppercase;font-size:8px}
    td{border:1px solid #f1c2d7;padding:2mm;vertical-align:top}
    .tests{line-height:1.55}
    .follow{display:flex;justify-content:space-between;gap:6mm;margin-top:5mm}
    .sign{text-align:right;margin-top:13mm;color:#263761;font-weight:800}
    .sign span{display:inline-block;min-width:48mm;border-top:1px solid #263761;padding-top:2mm}
    .bottom-bar{position:absolute;left:73mm;right:0;bottom:0;height:16mm;background:linear-gradient(90deg,#dfeff4 0 64%,#3681bb 64% 74%,#0f4f91 74% 84%,#3681bb 84% 100%);border-top:2mm solid #df2c7d}
    @media print{body{background:#fff}.sheet{margin:0;box-shadow:none}.no-print{display:none}}
  </style></head><body>
  <div class="sheet">
    <header class="brand-header">
      <div class="logo"><img src="/images/ashu-skin-care-logo.png" alt="Ashu Skin Care"></div>
      <div class="brand">DR. RABI'S GYNECARE</div>
      <div class="tagline">Odisha's First Laser Cosmetic &amp; Aesthetic Gynecology Clinic</div>
      <div class="chips"><span class="chip">Fertility</span><span class="chip">Gynecology</span><span class="chip">Obstetrics</span><span class="chip">PCOD</span><span class="chip">Laparoscopy</span></div>
      <div class="phone-badge">9090088000</div>
      <div class="mother-art"></div>
    </header>
    <div class="body">
      <aside class="sidebar">
        <div class="side-box">
          <h2 class="doctor-name">Dr Rabi Narayan Satapathy</h2>
          <p class="degree">MBBS, MD (Obst. &amp; Gyn),<br/>Honours. Gold Medalist<br/>FICOG, FICMCH, LLB<br/>MBA (Hospital Management),<br/><span class="role">Ex Deputy Medical Superintendent,<br/>SCB Medical College Cuttack,<br/>Senior Gynaecologist &amp; Obstetrician<br/>Fertility Consultant,<br/>Laparoscopy Surgeon<br/>Minimal invasive Surgeon<br/>Cosmetic Gynecologist</span></p>
        </div>
        <div class="side-box memberships">
          <p>Fellow Member (ICOG) Indian College of Obstetricians &amp; Gynaecologists</p>
          <p class="accent">Patron Member (PSI) The PCOS Society of India</p>
          <p>Life Member of (FOGSI) Federation of Gynaecologists and Obstetrician Societies of India</p>
          <p class="accent">Life Member of (IAGE) Indian Association of Gynaecological Endoscopists</p>
          <p>Life Member of (IFS) Indian Fertility Society</p>
          <p class="accent">Life Member of (ISAR) Indian Society of Assisted Reproduction</p>
          <p>Life Member of (ISOPARB) Indian Society of Perinatology and Reproductive Biology</p>
          <p class="accent">Life Member of (IMS) Indian Menopause Society</p>
          <p>Life Member of (AGOI) Association of Gynecological Oncologist of India</p>
          <p class="accent">Life Member of (IMA) Indian Medical Association</p>
          <p>Life Member of (AIAARO) All India Association for Advancing Research in Obesity</p>
          <p class="accent">Life Member of (AOGO) Association of Gynecologists of Odisha</p>
          <div class="website">www.drrabi.com</div>
          <div class="booking">Book Appointment : 9090088000</div>
          <div class="address">Jaydev Vihar, Biju Patnaik College Road, Bhubaneswar</div>
        </div>
        <div class="side-box attendant">
          <div>Name of The Attendant Present During Consultation</div>
          <div>Relationship with Client</div>
          <div class="blue">Name of The Female Clinic Staff Present During Consultation</div>
          <div>Signature of the Client</div>
          <div>Client Mobile No :</div>
        </div>
      </aside>
      <main class="rx-area">
        <div class="watermark">Rx</div>
        <div class="patient-strip">
          <div><b>Name:</b> ${displayValue(patientName)}</div>
          <div><b>Age:</b> ${displayValue(age)}</div>
          <div><b>Sex:</b> ${displayValue(gender)}</div>
          <div><b>Date:</b> ${displayValue(printDate)}</div>
          <div><b>UHID:</b> ${displayValue(record?.uhid)}</div>
          <div><b>OPD:</b> ${displayValue(record?.token || record?.caseId)}</div>
          <div><b>Phone:</b> ${displayValue(record?.phone || patient?.phone)}</div>
          <div><b>Visit:</b> ${displayValue(appointmentDate)}</div>
        </div>
        <section class="section">
          <div class="section-title">Vitals</div>
          <div class="vitals">
            <div class="vital"><b>BP</b>${displayValue(form.vitals.bloodPressure)}</div>
            <div class="vital"><b>Pulse</b>${displayValue(form.vitals.pulse)}</div>
            <div class="vital"><b>Temp</b>${displayValue(form.vitals.temperature)}</div>
            <div class="vital"><b>SpO2</b>${displayValue(form.vitals.spo2)}</div>
            <div class="vital"><b>Weight</b>${displayValue(form.vitals.weight)}</div>
          </div>
        </section>
        <section class="section">
          <div class="section-title">Clinical Notes</div>
          <div class="notes">
            <div class="note"><b>Complaint:</b><br/>${displayValue(form.chiefComplaint)}</div>
            <div class="note"><b>Diagnosis:</b><br/>${displayValue(form.diagnosis)}</div>
            <div class="note full"><b>Advice:</b><br/>${displayValue(form.advice)}</div>
          </div>
        </section>
        <section class="section">
          <div class="section-title">Medicines</div>
          <table><thead><tr><th>Medicine</th><th>Dose</th><th>Interval</th><th>Duration</th><th>Instruction</th></tr></thead><tbody>
            ${medicines.map((m) => `<tr><td>${displayValue(m.medicine)}</td><td>${displayValue(m.dose)}</td><td>${displayValue(m.interval)}</td><td>${displayValue(m.duration)}</td><td>${displayValue(m.instruction)}</td></tr>`).join("") || "<tr><td colspan='5'>No medicines</td></tr>"}
          </tbody></table>
        </section>
        <section class="section tests">
          <div class="section-title">Investigations</div>
          <div><b>Pathology:</b> ${displayValue(form.pathologies.join(", "))}</div>
          <div><b>Radiology:</b> ${displayValue(form.radiologies.join(", "))}</div>
        </section>
        <div class="follow">
          <div><b>Follow-up:</b> ${displayValue(form.followUpDate)}</div>
          <div><b>Status:</b> ${displayValue(form.status)}</div>
        </div>
        <div class="sign"><span>Doctor Signature</span></div>
      </main>
    </div>
    <div class="bottom-bar"></div>
  </div>
  <script>window.onload=()=>window.print()</script></body></html>`;
  const win = window.open("", "_blank", "width=900,height=1100");
  if (win) {
    win.document.write(html);
    win.document.close();
  }
};

const EPrescription = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialRecord = location.state?.record || null;
  const mode = location.state?.mode || "create";
  const [record, setRecord] = useState(initialRecord);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [patients, setPatients] = useState([]);
  const [opdRows, setOpdRows] = useState([]);
  const [patientQuery, setPatientQuery] = useState("");
  const [lookupError, setLookupError] = useState("");

  useEffect(() => {
    const parsed = parsePrescription(record?.prescription);
    if (!parsed) return;
    setForm((current) => ({
      ...current,
      chiefComplaint: parsed.chiefComplaint || "",
      diagnosis: parsed.diagnosis || "",
      advice: parsed.advice || "",
      followUpDate: parsed.followUpDate ? String(parsed.followUpDate).slice(0, 10) : "",
      vitals: { ...current.vitals, ...(parsed.vitalSigns || parsed.vitals || {}) },
      medicines: Array.isArray(parsed.medicines) && parsed.medicines.length ? parsed.medicines : current.medicines,
      pathologies: Array.isArray(parsed.pathologies) ? parsed.pathologies.map((p) => p.testName || p.name || p).filter(Boolean) : [],
      radiologies: Array.isArray(parsed.radiologies) ? parsed.radiologies.map((r) => r.testName || r.name || r).filter(Boolean) : [],
      status: parsed.status || "draft",
    }));
  }, [record]);

  
  useEffect(() => {
    let cancelled = false;
    const loadLookupData = async () => {
      try {
        const [patientRes, opdRes] = await Promise.all([
          apiClient.get("/patient", { params: { page: 1, limit: 1000 } }),
          apiClient.get("/opd-appointments", { params: { page: 1, limit: 1000 } }),
        ]);
        if (!cancelled) {
          setPatients(Array.isArray(unwrap(patientRes)) ? unwrap(patientRes) : []);
          setOpdRows(Array.isArray(unwrap(opdRes)) ? unwrap(opdRes) : []);
        }
      } catch {
        if (!cancelled) setLookupError("Unable to load patients for prescription scanner.");
      }
    };
    loadLookupData();
    return () => { cancelled = true; };
  }, []);

  const patientMatches = useMemo(() => {
    const q = normalize(patientQuery);
    if (!q) return patients.slice(0, 6);
    return patients.filter((patient) => patientSearchValues(patient).some((value) => value.includes(q))).slice(0, 8);
  }, [patients, patientQuery]);

  const selectPatient = async (patient) => {
    const nextRecord = buildPrescriptionRecord(patient, opdRows);
    setRecord(nextRecord);
    setPatientQuery(patient.uhid || patient.phone || patient.mobile || patient.name || "");
    setLookupError(nextRecord.id ? "" : "Patient selected, but no OPD visit is linked. Create OPD first to save prescription.");
    setError("");
    setMessage("");

    try {
      const fullPatient = unwrap(await apiClient.get(`/patient/${patient.id}`));
      if (!fullPatient?.id) return;
      const mergedPatient = { ...patient, ...fullPatient };
      const fullRecord = buildPrescriptionRecord(mergedPatient, opdRows);
      setRecord(fullRecord);
      setPatients((current) => current.map((item) => (
        String(item.id) === String(mergedPatient.id) ? mergedPatient : item
      )));
      setLookupError(fullRecord.id ? "" : "Patient selected, but no OPD visit is linked. Create OPD first to save prescription.");
    } catch {
      // Keep the list result visible if the detail lookup fails.
    }
  };

  const selectFromScan = (value) => {
    const q = normalize(extractScanValue(value));
    if (!q) {
      setLookupError("Scan or enter UHID, mobile number, or Patient ID.");
      return;
    }
    const match = patients.find((patient) => patientSearchValues(patient).some((item) => item === q || item.includes(q) || q.includes(item)));
    if (!match) {
      setLookupError("No patient found for this scan.");
      return;
    }
    selectPatient(match);
  };

  const patientSummary = useMemo(() => ({
    name: record?.patientName || record?.patient?.name || "Select from OPD list",
    age: record?.age || "-",
    gender: record?.gender || "-",
    uhid: record?.uhid || "-",
    phone: record?.phone || "-",
    email: record?.email || record?.patient?.email || "-",
    dob: (record?.dob || record?.patient?.dob || record?.patient?.dateOfBirth)
      ? new Date(record?.dob || record?.patient?.dob || record?.patient?.dateOfBirth).toLocaleDateString("en-IN")
      : "-",
    bloodGroup: record?.bloodGroup || record?.patient?.bloodGroup || "-",
    maritalStatus: record?.maritalStatus || record?.patient?.maritalStatus || "-",
    address: record?.address || [record?.patient?.address, record?.patient?.city, record?.patient?.state].filter(Boolean).join(", ") || "-",
    allergies: record?.allergies || record?.patient?.allergies || "-",
    emergencyContact: record?.emergencyContact || [
      record?.patient?.emergencyContactName,
      record?.patient?.emergencyContactPhone,
      record?.patient?.emergencyContactRelation,
    ].filter(Boolean).join(" - ") || "-",
  }), [record]);

  const setValue = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const setVital = (field, value) => setForm((current) => ({ ...current, vitals: { ...current.vitals, [field]: value } }));
  const setMedicine = (index, field, value) => {
    setForm((current) => ({
      ...current,
      medicines: current.medicines.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const addMedicine = () => setForm((current) => ({
    ...current,
    medicines: [...current.medicines, { medicine: "", dose: "", interval: "", duration: "", instruction: "" }],
  }));

  const removeMedicine = (index) => setForm((current) => {
    if (current.medicines.length <= 1) {
      return {
        ...current,
        medicines: [{ medicine: "", dose: "", interval: "", duration: "", instruction: "" }],
      };
    }
    return {
      ...current,
      medicines: current.medicines.filter((_, itemIndex) => itemIndex !== index),
    };
  });

  const save = async (status = form.status) => {
    if (!record?.id && !record?.apiRecord?.id) {
      setError("Open e-prescription from an OPD row so it can link to an appointment.");
      return;
    }
    setSaving(true);
    setError("");
    setMessage("");
    const opdAppointmentId = record?.apiRecord?.id || record?.id;
    try {
      const payload = {
        opdAppointmentId,
        vitalSigns: form.vitals,
        medicines: form.medicines.filter((m) => m.medicine),
        pathologies: form.pathologies.map((name) => ({ testName: name, status: "prescribed" })),
        radiologies: form.radiologies.map((name) => ({ testName: name, status: "ordered" })),
        chiefComplaint: form.chiefComplaint,
        diagnosis: form.diagnosis,
        advice: form.advice,
        followUpDate: form.followUpDate || null,
        status,
      };
      const saved = unwrap(await apiClient.post("/prescription", payload));
      setMessage(status === "final" ? "Prescription finalised." : "Prescription saved.");
      setForm((current) => ({ ...current, status: saved?.status || status }));
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save prescription.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        title="E-Prescription"
        subtitle="Clinical prescription workspace linked to OPD visits."
        breadcrumbs={[
          { label: "Super Admin", path: "/super-admin/dashboard" },
          { label: "OPD", path: "/super-admin/opd" },
          { label: "E-Prescription" },
        ]}
        actions={<Button variant="secondary" leftIcon={<ArrowLeft size={15} />} onClick={() => navigate("/super-admin/opd")}>Back to OPD</Button>}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4">
        <aside className="space-y-4">
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Prescription Scanner</p>
                <h2 className="mt-1 text-base font-extrabold">Find Patient</h2>
              </div>
              <UserRound size={20} className="text-[#0f766e]" />
            </div>
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={patientQuery}
                onChange={(e) => setPatientQuery(e.target.value)}
                onPaste={(e) => setTimeout(() => selectFromScan(e.target.value), 0)}
                onKeyDown={(e) => { if (e.key === "Enter") selectFromScan(patientQuery); }}
                placeholder="Scan or type UHID / mobile / Patient ID"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm outline-none focus:border-[#0f766e] focus:ring-3 focus:ring-teal-100"
              />
              {patientQuery ? (
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setPatientQuery("")}>
                  <X size={16} />
                </button>
              ) : null}
            </div>
            <Button className="mt-3 w-full" leftIcon={<Search size={14} />} onClick={() => selectFromScan(patientQuery)}>Open Patient</Button>
            {lookupError ? <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">{lookupError}</div> : null}
            <div className="mt-4 max-h-56 overflow-y-auto divide-y divide-slate-100 rounded-lg border border-slate-100">
              {patientMatches.map((patient) => (
                <button key={patient.id} type="button" onClick={() => selectPatient(patient)} className="w-full px-3 py-2.5 text-left hover:bg-slate-50">
                  <p className="text-sm font-bold text-slate-800">{patient.name}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{patient.uhid || patient.id} · {patient.phone || "-"}</p>
                </button>
              ))}
              {!patientMatches.length ? <p className="px-3 py-5 text-center text-xs text-slate-400">No patient found.</p> : null}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Patient</p>
                <h2 className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">{patientSummary.name}</h2>
              </div>
              <Badge variant={form.status === "final" ? "success" : "warning"}>{form.status === "final" ? "Final" : "Draft"}</Badge>
            </div>
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-400">UHID</p><p className="font-bold">{patientSummary.uhid}</p></div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-400">Phone</p><p className="font-bold">{patientSummary.phone}</p></div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-400">Age</p><p className="font-bold">{patientSummary.age}</p></div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-400">Gender</p><p className="font-bold">{patientSummary.gender}</p></div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-400">DOB</p><p className="font-bold">{patientSummary.dob}</p></div>
              <div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-400">Blood</p><p className="font-bold">{patientSummary.bloodGroup}</p></div>
              <div className="col-span-2 rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-400">Email</p><p className="font-bold break-all">{patientSummary.email}</p></div>
              <div className="col-span-2 rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-400">Address</p><p className="font-bold">{patientSummary.address}</p></div>
              <div className="col-span-2 rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-400">Allergies</p><p className="font-bold">{patientSummary.allergies}</p></div>
              <div className="col-span-2 rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-400">Emergency</p><p className="font-bold">{patientSummary.emergencyContact}</p></div>
            </div>
          </div>

          <div className="card p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Visit</p>
            <div className="mt-4 space-y-3 text-sm">
              <p className="flex items-center gap-2"><Stethoscope size={15} className="text-[#0f766e]" /> {record?.doctor || "Doctor not selected"}</p>
              <p className="flex items-center gap-2"><CalendarDays size={15} className="text-[#0f766e]" /> {record?.date || "-"}</p>
              <p className="flex items-center gap-2"><Activity size={15} className="text-[#0f766e]" /> {record?.token || record?.caseId || "-"}</p>
            </div>
          </div>
        </aside>

        <main className="space-y-4">
          {(error || message) && (
            <div className={`rounded-lg border px-4 py-3 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
              {error || message}
            </div>
          )}

          <section className="card p-5">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardPlus size={18} className="text-[#0f766e]" />
              <h3 className="text-base font-extrabold">Clinical Notes</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Field label="Chief Complaint"><Textarea rows={5} value={form.chiefComplaint} onChange={(e) => setValue("chiefComplaint", e.target.value)} placeholder="Symptoms and presenting complaint" /></Field>
              <Field label="Diagnosis"><Textarea rows={5} value={form.diagnosis} onChange={(e) => setValue("diagnosis", e.target.value)} placeholder="Diagnosis / provisional diagnosis" /></Field>
              <Field label="Advice"><Textarea rows={5} value={form.advice} onChange={(e) => setValue("advice", e.target.value)} placeholder="Advice, diet, procedure notes" /></Field>
            </div>
          </section>

          <section className="card p-5">
            <div className="mb-4 flex items-center gap-2">
              <Activity size={18} className="text-[#0f766e]" />
              <h3 className="text-base font-extrabold">Vitals</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
              {[
                ["bloodPressure", "BP"],
                ["pulse", "Pulse"],
                ["temperature", "Temperature"],
                ["spo2", "SpO2"],
                ["weight", "Weight"],
              ].map(([key, label]) => (
                <Field key={key} label={label}>
                  <input className={inputClass} value={form.vitals[key]} onChange={(e) => setVital(key, e.target.value)} />
                </Field>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Pill size={18} className="text-[#0f766e]" />
                <h3 className="text-base font-extrabold">Medicines</h3>
              </div>
              <Button size="sm" variant="secondary" onClick={addMedicine}>Add Medicine</Button>
            </div>
            <div className="space-y-3">
              {form.medicines.map((medicine, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-[1.3fr_.7fr_.7fr_.7fr_1fr_auto] gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3">
                  {["medicine", "dose", "interval", "duration", "instruction"].map((field) => (
                    <input
                      key={field}
                      className={inputClass}
                      value={medicine[field]}
                      onChange={(e) => setMedicine(index, field, e.target.value)}
                      placeholder={field === "medicine" ? "Medicine name" : field}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => removeMedicine(index)}
                    className="flex h-11 w-11 items-center justify-center rounded-lg border border-red-100 bg-white text-red-500 transition hover:border-red-200 hover:bg-red-50"
                    title="Delete medicine row"
                    aria-label="Delete medicine row"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="card p-5">
            <div className="mb-4 flex items-center gap-2">
              <TestTube2 size={18} className="text-[#0f766e]" />
              <h3 className="text-base font-extrabold">Investigations</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <MultiTestInput
                label="Pathology Tests"
                value={form.pathologies}
                onChange={(tests) => setValue("pathologies", tests)}
                placeholder="CBC, LFT, KFT"
              />
              <MultiTestInput
                label="Radiology Tests"
                value={form.radiologies}
                onChange={(tests) => setValue("radiologies", tests)}
                placeholder="X-Ray, USG"
              />
              <Field label="Follow-up Date">
                <input type="date" className={inputClass} value={form.followUpDate} onChange={(e) => setValue("followUpDate", e.target.value)} />
              </Field>
            </div>
          </section>

          <div className="sticky bottom-0 z-10 flex flex-col sm:flex-row justify-end gap-2 rounded-lg border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur">
            <Button variant="secondary" leftIcon={<Printer size={15} />} onClick={() => printPrescription(record, form)}>Print</Button>
            <Button variant="secondary" leftIcon={<Save size={15} />} onClick={() => save("draft")} loading={saving}>Save Draft</Button>
            <Button leftIcon={<FileCheck2 size={15} />} onClick={() => save("final")} loading={saving}>Finalise</Button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EPrescription;

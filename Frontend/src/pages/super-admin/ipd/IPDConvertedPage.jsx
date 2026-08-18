import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, BedDouble, CalendarDays, Search, Stethoscope, UserRound } from "lucide-react";

import PageHeader from "@components/layout/PageHeader/PageHeader";
import Badge from "@components/ui/Badge/Badge";
import Button from "@components/ui/Button/Button";
import apiClient from "@api/apiClient";

const unwrapList = (response) => {
  const body = response?.data;
  const result = body?.result ?? body?.data ?? body;
  const data = result?.data ?? result?.records ?? result;
  return Array.isArray(data) ? data : [];
};

const normalize = (value) => String(value || "").trim().toLowerCase();

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const buildLookup = (items) => {
  const map = new Map();
  items.forEach((item) => map.set(String(item.id), item));
  return map;
};

const mapConvertedRecord = (row, patientLookup, doctorLookup, departmentLookup) => {
  const patient = patientLookup.get(String(row.patientId));
  const doctor = doctorLookup.get(String(row.consultantDoctorId));
  const department = departmentLookup.get(String(row.departmentId));

  return {
    id: row.id,
    patientId: row.patientId,
    patientName: patient?.name || "Unknown Patient",
    uhid: patient?.uhid || "-",
    phone: patient?.phone || "-",
    gender: patient?.gender || "-",
    dob: patient?.dob,
    address: [patient?.address, patient?.city, patient?.state].filter(Boolean).join(", "),
    doctor: doctor?.name || "Unassigned",
    department: department?.name || "-",
    token: row.opdNo || row.caseId || row.id,
    caseId: row.caseId || row.opdNo || row.id,
    appointmentDate: row.appointmentDate,
    convertedAt: row.updatedAt || row.appointmentDate,
    symptoms: row.symptomsDescription || row.symptomsTitle || row.symptomsType || "-",
    diagnosis: row.primaryDiagnosis || "-",
    apiRecord: row,
  };
};

const IPDConvertedPage = () => {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [opdRes, patientRes, doctorRes, departmentRes] = await Promise.all([
          apiClient.get("/opd-appointments", { params: { page: 1, limit: 1000, status: "admitted" } }),
          apiClient.get("/patient", { params: { page: 1, limit: 1000 } }),
          apiClient.get("/user", { params: { page: 1, limit: 1000 } }),
          apiClient.get("/department", { params: { page: 1, limit: 1000 } }),
        ]);

        if (cancelled) return;
        const patientLookup = buildLookup(unwrapList(patientRes));
        const doctorLookup = buildLookup(unwrapList(doctorRes));
        const departmentLookup = buildLookup(unwrapList(departmentRes));
        setRecords(
          unwrapList(opdRes).map((row) => mapConvertedRecord(row, patientLookup, doctorLookup, departmentLookup)),
        );
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Unable to load converted IPD patients.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    const q = normalize(query);
    if (!q) return records;
    return records.filter((record) => [
      record.patientName,
      record.uhid,
      record.phone,
      record.token,
      record.caseId,
      record.doctor,
      record.department,
    ].some((value) => normalize(value).includes(q)));
  }, [records, query]);

  return (
    <div className="page-container">
      <PageHeader
        title="IPD Converted Patients"
        subtitle="Only OPD patients converted to IPD are shown here."
        breadcrumbs={[
          { label: "Super Admin", path: "/super-admin/dashboard" },
          { label: "IPD" },
        ]}
        actions={<Button leftIcon={<BedDouble size={15} />} onClick={() => navigate("/super-admin/opd")}>Convert from OPD</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <div className="card p-5"><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Converted IPD</p><p className="mt-2 text-3xl font-extrabold">{records.length}</p></div>
        <div className="card p-5"><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Today Converted</p><p className="mt-2 text-3xl font-extrabold">{records.filter((r) => new Date(r.convertedAt).toDateString() === new Date().toDateString()).length}</p></div>
        <div className="card p-5"><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Clinic</p><p className="mt-2 text-lg font-extrabold">Ashu Skin Care</p><p className="text-xs text-slate-500">Gynae & Skin Clinic</p></div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Converted Patient Records</h2>
            <p className="text-xs text-slate-500">These records appear after pressing Convert IPD in OPD.</p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search IPD patient / UHID / mobile"
              className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-[#0f766e] focus:ring-3 focus:ring-teal-100"
            />
          </div>
        </div>

        {error ? <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

        <div className="divide-y divide-slate-100">
          {filtered.map((record) => (
            <div key={record.id} className="grid gap-4 p-4 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-center">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-lg bg-[#0f766e] text-white flex items-center justify-center font-extrabold">
                  {record.patientName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{record.patientName}</p>
                  <p className="text-xs text-slate-500">UHID {record.uhid} · {record.phone}</p>
                </div>
              </div>

              <div className="text-sm text-slate-600">
                <p className="flex items-center gap-2"><Stethoscope size={14} className="text-[#0f766e]" /> {record.doctor}</p>
                <p className="mt-1 text-xs text-slate-500">{record.department}</p>
              </div>

              <div className="text-sm text-slate-600">
                <p className="flex items-center gap-2"><CalendarDays size={14} className="text-[#0f766e]" /> {formatDateTime(record.convertedAt)}</p>
                <p className="mt-1 text-xs text-slate-500">OPD: {record.token}</p>
              </div>

              <div className="flex items-center gap-2 lg:justify-end">
                <Badge variant="primary">Converted IPD</Badge>
                <Link
                  to="/super-admin/opd/add-prescription"
                  state={{ record, mode: "edit" }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Prescription <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          ))}

          {!loading && !filtered.length ? (
            <div className="p-12 text-center text-sm text-slate-500">
              <UserRound size={42} className="mx-auto mb-3 text-slate-300" />
              No converted IPD patients found.
            </div>
          ) : null}

          {loading ? <div className="p-12 text-center text-sm text-slate-500">Loading converted patients...</div> : null}
        </div>
      </div>
    </div>
  );
};

export default IPDConvertedPage;
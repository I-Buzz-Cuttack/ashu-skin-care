import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarClock,
  ClipboardList,
  IndianRupee,
  Plus,
  Stethoscope,
  Users,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  QrCode,
  FileText,
  Clock,
  CalendarDays,
} from "lucide-react";
import apiClient from "../../../api/apiClient";

const unwrap = (response) => {
  const body = response?.data;
  return body?.result ?? body?.data ?? body ?? {};
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const toDateInputValue = (value) => {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isSameInputDate = (value, inputDate) => {
  if (!inputDate) return true;
  return toDateInputValue(value) === inputDate;
};

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(toDateInputValue());

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await apiClient.get("/dashboard/summary");
        if (!cancelled) setSummary(unwrap(response));
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const totals = summary?.totals || {};
  const filteredPatients = useMemo(() => (
    (summary?.recentPatients || []).filter((patient) => isSameInputDate(patient.registeredAt, selectedDate))
  ), [summary, selectedDate]);
  const filteredOpd = useMemo(() => (
    (summary?.recentOpd || []).filter((row) => isSameInputDate(row.appointmentDate, selectedDate))
  ), [summary, selectedDate]);
  const selectedDateLabel = selectedDate ? formatDate(selectedDate) : "All dates";
  const cards = useMemo(() => ([
    { 
      label: "Total Patients Registered", 
      value: totals.patients || 0, 
      icon: Users, 
      trend: "+14% this month",
      gradient: "from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30" 
    },
    { 
      label: "Today OPD Queue", 
      value: totals.opdToday || 0, 
      icon: CalendarClock, 
      trend: "+8 new today",
      gradient: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30" 
    },
    { 
      label: "Upcoming Appointments", 
      value: totals.opdUpcoming || 0, 
      icon: Stethoscope, 
      trend: "Scheduled ahead",
      gradient: "from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30" 
    },
    { 
      label: "Today Collection", 
      value: `₹${Number(totals.todayRevenue || 0).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, 
      icon: IndianRupee, 
      trend: "+18% revenue",
      gradient: "from-amber-500/20 to-emerald-500/20 text-emerald-400 border-emerald-500/30" 
    },
  ]), [totals]);

  return (
    <div className="page-container">
      {/* Hero Welcome Banner */}
      <section className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-teal-950 text-white p-6 sm:p-8 xl:p-10 overflow-hidden relative border border-slate-800 shadow-2xl">
        {/* Radial Glow overlays */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_20%,#14b8a6_0,transparent_35%),radial-gradient(circle_at_80%_80%,#6366f1_0,transparent_35%)] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-bold mb-3">
              <Sparkles size={13} className="text-teal-400" />
              <span>Clinic Operations Intelligence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Clinical Overview Dashboard
            </h1>
            <p className="mt-2 text-sm text-slate-300 max-w-xl leading-relaxed">
              Track real-time OPD flow, patient registrations, doctors consultation fees, and digital prescriptions.
            </p>
          </div>

          {/* Action Pills */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
            <Link 
              to="/super-admin/patients/create" 
              className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 text-white text-xs font-bold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:-translate-y-0.5 transition-all text-center"
            >
              <Plus size={16} /> <span className="truncate">New Patient</span>
            </Link>
            <Link 
              to="/super-admin/opd/add" 
              className="inline-flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 text-xs font-bold shadow-sm hover:-translate-y-0.5 transition-all text-center"
            >
              <ClipboardList size={16} className="text-teal-400" /> <span className="truncate">OPD Entry</span>
            </Link>
            <Link 
              to="/super-admin/opd/add-prescription" 
              className="inline-flex items-center justify-center gap-2 px-3 sm:px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold hover:-translate-y-0.5 transition-all text-center"
            >
              <FileText size={15} className="text-cyan-400" /> <span className="truncate">Prescription</span>
            </Link>
            <Link 
              to="/super-admin/opd/patient-scanner" 
              className="inline-flex items-center justify-center gap-2 px-3 sm:px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold hover:-translate-y-0.5 transition-all text-center"
            >
              <QrCode size={15} className="text-amber-400" /> <span className="truncate">Scanner</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {cards.map(({ label, value, icon: Icon, trend, gradient }) => (
          <div 
            key={label} 
            className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/90 p-5 shadow-lg shadow-slate-200/50 dark:shadow-black/20 card-hover-lift relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${gradient} border flex items-center justify-center`}>
                <Icon size={22} />
              </div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <TrendingUp size={12} /> {trend}
              </span>
            </div>
            
            <div className="mt-4">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</p>
              <p className="mt-1 text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {loading ? "..." : value}
              </p>
            </div>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-teal-200/80 bg-white/90 dark:border-slate-800 dark:bg-slate-900/90 px-5 py-4 shadow-lg shadow-slate-200/40 dark:shadow-black/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-500/10 border border-teal-300 text-teal-600 flex items-center justify-center">
            <CalendarDays size={19} />
          </div>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-teal-700 dark:text-teal-300">Date Wise Patients</p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Showing records for {selectedDateLabel}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
          <button
            type="button"
            onClick={() => setSelectedDate(toDateInputValue())}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:bg-teal-50 hover:text-teal-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Today
          </button>
        </div>
      </section>

      {/* Date Wise Activity Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[420px]">
        {/* Recent Patients */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xl overflow-hidden flex flex-col min-h-[420px]">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-teal-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Date Wise Registered Patients</h2>
            </div>
            <Link to="/super-admin/patients" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 flex-1 bg-gradient-to-b from-white to-teal-50/20 dark:from-slate-900 dark:to-slate-950">
            {filteredPatients.map((patient) => (
              <Link 
                key={patient.id} 
                to={`/super-admin/patients/${patient.id}`} 
                className="flex items-center justify-between px-6 py-4 hover:bg-teal-50/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border border-teal-500/30 text-teal-400 font-bold text-xs flex items-center justify-center">
                    {patient.name ? patient.name.charAt(0).toUpperCase() : "P"}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{patient.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                        UHID: {patient.uhid || "-"}
                      </span>
                      <span>•</span>
                      <span>{patient.phone || "-"}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                    <Clock size={12} /> {formatDate(patient.registeredAt)}
                  </span>
                </div>
              </Link>
            ))}

            {!loading && !filteredPatients.length ? (
              <div className="flex h-full min-h-[330px] items-center justify-center px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                <div>
                  <Users size={36} className="mx-auto mb-3 text-teal-200" />
                  <p className="font-semibold text-slate-700 dark:text-slate-200">No patients registered for {selectedDateLabel}.</p>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Recent OPD Visits */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xl overflow-hidden flex flex-col min-h-[420px]">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} className="text-cyan-500" />
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Date Wise OPD Queue & Visits</h2>
            </div>
            <Link to="/super-admin/opd" className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1">
              View OPD Console <ArrowUpRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 flex-1 bg-gradient-to-b from-white to-cyan-50/20 dark:from-slate-900 dark:to-slate-950">
            {filteredOpd.map((row) => (
              <Link 
                key={row.id} 
                to="/super-admin/opd" 
                className="flex items-center justify-between px-6 py-4 hover:bg-cyan-50/50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-400 font-bold text-xs flex items-center justify-center">
                    <Stethoscope size={16} />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {row.patient?.name || "Unknown patient"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">
                        {row.opdNo || row.caseId || "-"}
                      </span>
                      <span>•</span>
                      <span>Doctor: {row.consultantDoctor?.name || "Unassigned"}</span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    {formatDate(row.appointmentDate)}
                  </span>
                </div>
              </Link>
            ))}

            {!loading && !filteredOpd.length ? (
              <div className="flex h-full min-h-[330px] items-center justify-center px-6 py-12 text-center text-sm text-slate-500 dark:text-slate-400">
                <div>
                  <ClipboardList size={36} className="mx-auto mb-3 text-cyan-200" />
                  <p className="font-semibold text-slate-700 dark:text-slate-200">No OPD visits found for {selectedDateLabel}.</p>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;

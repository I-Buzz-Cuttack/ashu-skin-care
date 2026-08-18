import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Play, Search, ShieldCheck, UserRound, X } from "lucide-react";

import PageHeader from "@components/layout/PageHeader/PageHeader";
import Button from "@components/ui/Button/Button";
import Badge from "@components/ui/Badge/Badge";
import apiClient from "@api/apiClient";

const unwrapList = (response) => {
  const body = response?.data;
  const result = body?.result ?? body?.data ?? body;
  const data = result?.data ?? result?.records ?? result;
  return Array.isArray(data) ? data : [];
};

const normalize = (value) => String(value || "").trim().toLowerCase();

const extractScanValue = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";

  try {
    const parsed = JSON.parse(raw);
    return parsed.uhid || parsed.patientId || parsed.id || parsed.phone || raw;
  } catch {
    // Scanner payload is often plain text or a URL, so fall through.
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
  patient.uhid,
  patient.name,
  patient.phone,
  patient.email,
  patient.adharNo,
].map(normalize).filter(Boolean);
const PatientCard = ({ patient }) => {
  if (!patient) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-center">
        <div>
          <UserRound size={44} className="mx-auto text-slate-300" />
          <p className="mt-4 text-sm font-bold text-slate-700">Scan or search a patient</p>
          <p className="mt-1 text-xs text-slate-400">Patient profile opens here immediately.</p>
        </div>
      </div>
    );
  }

  const rows = [
    ["UHID", patient.uhid],
    ["Mobile", patient.phone],
    ["Email", patient.email],
    ["Gender", patient.gender],
    ["DOB", patient.dob ? new Date(patient.dob).toLocaleDateString("en-IN") : "-"],
    ["Blood Group", patient.bloodGroup],
    ["Address", [patient.address, patient.city, patient.state].filter(Boolean).join(", ")],
    ["Allergies", patient.allergies],
    ["Emergency Contact", [patient.emergencyContactName, patient.emergencyContactPhone].filter(Boolean).join(" - ")],
  ];

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-100 bg-slate-50 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-[#0f766e] text-white flex items-center justify-center text-2xl font-extrabold">
              {(patient.name || "?").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Patient Details</p>
              <h2 className="mt-1 text-2xl font-extrabold text-slate-900">{patient.name}</h2>
              <p className="mt-1 text-sm text-slate-500">Registered {patient.registeredAt ? new Date(patient.registeredAt).toLocaleString("en-IN") : "-"}</p>
            </div>
          </div>
          <Badge variant={(patient.status || "").toLowerCase() === "active" ? "success" : "default"}>{patient.status || "Active"}</Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-5">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-100 p-3">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-800">{value || "-"}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 p-5">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Remarks</p>
        <p className="mt-2 text-sm text-slate-700">{patient.remarks || "No remarks recorded."}</p>
      </div>
    </div>
  );
};

const PatientScanner = () => {
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const response = await apiClient.get("/patient", { params: { page: 1, limit: 1000 } });
        if (!cancelled) setPatients(unwrapList(response));
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Unable to load patients.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => () => {
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
  }, []);

  const matches = useMemo(() => {
    const q = normalize(query);
    if (!q) return patients.slice(0, 8);
    return patients.filter((patient) => patientSearchValues(patient).some((value) => value.includes(q))).slice(0, 12);
  }, [patients, query]);

  const selectFromCode = (code) => {
    const q = normalize(extractScanValue(code));
    if (!q) {
      setError("Enter or scan a UHID, mobile number, or Patient ID.");
      return;
    }
    const match = patients.find((patient) => patientSearchValues(patient).some((value) => value === q || value.includes(q) || q.includes(value)));
    if (match) {
      setSelected(match);
      setQuery(match.uhid || match.id);
      setError("");
    } else {
      setError("No patient found for scanned code.");
    }
  };

  const startCamera = async () => {
    setError("");
    if (!("BarcodeDetector" in window)) {
      setError("Camera QR scan is not available in this browser. Scan with a USB/mobile scanner or type UHID/mobile below.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);
      const detector = new window.BarcodeDetector({ formats: ["qr_code", "code_128", "ean_13"] });
      const tick = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const codes = await detector.detect(videoRef.current);
          if (codes?.[0]?.rawValue) {
            selectFromCode(codes[0].rawValue);
            stopCamera();
            return;
          }
        } catch {
          // Continue scanning while the video settles.
        }
        requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      setError(err?.message || "Unable to open camera.");
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  return (
    <div className="page-container">
      <PageHeader
        title="Patient Scanner"
        subtitle="Scan patient QR, UHID, mobile, or Patient ID to open patient details."
        breadcrumbs={[
          { label: "Super Admin", path: "/super-admin/dashboard" },
          { label: "OPD", path: "/super-admin/opd" },
          { label: "Patient Scanner" },
        ]}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-4">
        <section className="space-y-4">
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Scanner</p>
                <h2 className="mt-1 text-lg font-extrabold">Patient Lookup</h2>
              </div>
              <UserRound size={22} className="text-[#0f766e]" />
            </div>

            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onPaste={(e) => setTimeout(() => selectFromCode(e.target.value), 0)}
                onKeyDown={(e) => { if (e.key === "Enter") selectFromCode(query); }}
                placeholder="Scan or type UHID / mobile / Patient ID"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-10 text-sm outline-none focus:border-[#0f766e] focus:ring-3 focus:ring-teal-100"
              />
              {query && <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" onClick={() => setQuery("")}><X size={16} /></button>}
            </div>
            <div className="mt-3 flex gap-2">
              <Button leftIcon={<Search size={14} />} onClick={() => selectFromCode(query)} disabled={!query}>Open Patient</Button>
              <Button variant="secondary" leftIcon={cameraActive ? <X size={14} /> : <Camera size={14} />} onClick={cameraActive ? stopCamera : startCamera}>
                {cameraActive ? "Stop" : "Camera"}
              </Button>
            </div>

            {error && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
              <video ref={videoRef} className={`aspect-video w-full object-cover ${cameraActive ? "block" : "hidden"}`} muted playsInline />
              {!cameraActive && (
                <div className="flex aspect-video items-center justify-center text-center text-slate-400">
                  <div>
                    <Play size={28} className="mx-auto" />
                    <p className="mt-2 text-xs">Camera preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{loading ? "Loading" : `${matches.length} Matches`}</p>
            </div>
            <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100">
              {matches.map((patient) => (
                <button key={patient.id} onClick={() => setSelected(patient)} className="w-full px-4 py-3 text-left hover:bg-slate-50">
                  <p className="text-sm font-bold text-slate-800">{patient.name}</p>
                  <p className="mt-1 text-xs text-slate-400">{patient.uhid || patient.id} · {patient.phone || "-"}</p>
                </button>
              ))}
              {!matches.length && <p className="px-4 py-8 text-center text-sm text-slate-400">No patient found.</p>}
            </div>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <div className="flex gap-2">
              <ShieldCheck size={17} />
              <p>For best scanning, print patient cards/QR using the OPD patient card or use UHID/mobile in the scanner field.</p>
            </div>
          </div>
        </section>

        <PatientCard patient={selected} />
      </div>
    </div>
  );
};

export default PatientScanner;

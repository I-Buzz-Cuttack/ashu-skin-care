import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Play, Search, ShieldCheck, UserRound, X } from "lucide-react";
import jsQR from "jsqr";

import PageHeader from "@components/layout/PageHeader/PageHeader";
import Button from "@components/ui/Button/Button";
import Badge from "@components/ui/Badge/Badge";
import apiClient from "@api/apiClient";
import { formatPatientId } from "../../patients/utils/patient.utils";

const unwrapList = (response) => {
  const body = response?.data;
  const result = body?.result ?? body?.data ?? body;
  const data = result?.data ?? result?.records ?? result;
  return Array.isArray(data) ? data : [];
};

const normalize = (value) => String(value || "").trim().toLowerCase();

const scanObjectValues = (payload) => [
  payload?.patientId,
  payload?.patient_id,
  payload?.id,
  payload?.uhid,
  payload?.UHID,
  payload?.phone,
  payload?.mobile,
  payload?.mobileNumber,
].map((item) => String(item || "").trim()).filter(Boolean);

const extractScanValues = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    const values = scanObjectValues(parsed);
    return values.length ? values : [raw];
  } catch {
    // Scanner payload is often plain text or a URL, so fall through.
  }

  try {
    const url = new URL(raw);
    const values = [
      url.searchParams.get("patientId"),
      url.searchParams.get("id"),
      url.searchParams.get("uhid"),
      url.searchParams.get("phone"),
      url.searchParams.get("mobile"),
      url.pathname.split("/").filter(Boolean).pop(),
    ].map((item) => String(item || "").trim()).filter(Boolean);
    return values.length ? values : [raw];
  } catch {
    const labeledValues = [];
    const labelPattern = /\b(?:patient\s*id|patientid|id|uhid|mobile|phone|contact)\s*(?:no\.?|number)?\s*[:#-]\s*([^\n\r,|]+)/gi;
    let match = labelPattern.exec(raw);
    while (match) {
      labeledValues.push(match[1].trim());
      match = labelPattern.exec(raw);
    }
    return [...labeledValues, raw];
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
  patient.nationalId,
].map(normalize).filter(Boolean);

const unwrapSingle = (response) => {
  const body = response?.data;
  return body?.result?.data ?? body?.result ?? body?.data ?? body;
};

const formatDate = (value, options) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", options);
};

const calculateAge = (patient) => {
  const dob = patient?.dob || patient?.dateOfBirth || patient?.date_of_birth;
  if (!dob) return patient?.age ? `${patient.age} yrs` : "-";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return patient?.age ? `${patient.age} yrs` : "-";
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  if (now.getDate() < birth.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return `${years}y ${months}m`;
};

const Section = ({ title, children }) => (
  <section className="border-t border-slate-100 p-5">
    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{title}</p>
    <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">{children}</div>
  </section>
);

const InfoTile = ({ label, value }) => (
  <div className="rounded-lg border border-slate-100 bg-white p-3">
    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-800">{value || "-"}</p>
  </div>
);

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

  const address = [patient.address, patient.city, patient.state].filter(Boolean).join(", ");
  const emergency = [
    patient.emergencyContactName,
    patient.emergencyContactPhone,
    patient.emergencyContactRelation,
  ].filter(Boolean).join(" - ");
  const registeredOn = formatDate(patient.registeredAt || patient.createdAt, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

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
              <p className="mt-1 text-sm text-slate-500">UHID {patient.uhid || "-"} · Registered {registeredOn}</p>
            </div>
          </div>
          <Badge variant={(patient.status || "").toLowerCase() === "active" ? "success" : "default"}>{patient.status || "Active"}</Badge>
        </div>
      </div>
      <Section title="Identity">
        <InfoTile label="Patient ID" value={formatPatientId(patient.patientId || patient.id, 0)} />
        <InfoTile label="UHID" value={patient.uhid} />
        <InfoTile label="Gender" value={patient.gender} />
        <InfoTile label="Age" value={calculateAge(patient)} />
      </Section>
      <Section title="Contact">
        <InfoTile label="Mobile" value={patient.phone || patient.mobile || patient.mobileNumber} />
        <InfoTile label="Email" value={patient.email} />
        <InfoTile label="Address" value={address} />
        <InfoTile label="Emergency Contact" value={emergency} />
      </Section>
      <Section title="Medical">
        <InfoTile label="DOB" value={formatDate(patient.dob || patient.dateOfBirth || patient.date_of_birth)} />
        <InfoTile label="Blood Group" value={patient.bloodGroup} />
        <InfoTile label="Allergies" value={patient.allergies || patient.knownAllergies} />
        <InfoTile label="Remarks" value={patient.remarks || "No remarks recorded."} />
      </Section>
    </div>
  );
};

const PatientScanner = () => {
  const [patients, setPatients] = useState([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationRef = useRef(null);
  const detectedRef = useRef(false);

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
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    streamRef.current?.getTracks?.().forEach((track) => track.stop());
  }, []);

  const matches = useMemo(() => {
    const q = normalize(query);
    if (!q) return patients.slice(0, 8);
    return patients.filter((patient) => patientSearchValues(patient).some((value) => value.includes(q))).slice(0, 12);
  }, [patients, query]);

  const openPatient = async (patient) => {
    setSelected(patient);
    setQuery(patient.uhid || patient.patientId || patient.id);
    setError("");
    if (!patient?.id) return;
    setDetailLoading(true);
    try {
      const fullPatient = unwrapSingle(await apiClient.get(`/patient/${patient.id}`));
      if (fullPatient?.id) {
        setSelected((current) => ({ ...current, ...fullPatient }));
        setPatients((current) => current.map((item) => (
          String(item.id) === String(fullPatient.id) ? { ...item, ...fullPatient } : item
        )));
      }
    } catch {
      // The list record is still useful if detail loading fails.
    } finally {
      setDetailLoading(false);
    }
  };

  const selectFromCode = async (code) => {
    const values = extractScanValues(code);
    const queries = values.map(normalize).filter(Boolean);
    if (!queries.length) {
      setError("Enter or scan a UHID, mobile number, or Patient ID.");
      return;
    }
    const match = patients.find((patient) => {
      const searchValues = patientSearchValues(patient);
      return queries.some((q) => searchValues.some((value) => value === q || value.includes(q) || q.includes(value)));
    });
    if (match) {
      await openPatient(match);
    } else {
      setError("No patient found for scanned code.");
    }
  };

  const startCamera = async () => {
    setError("");
    detectedRef.current = false;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setCameraActive(true);
      const detector = "BarcodeDetector" in window
        ? new window.BarcodeDetector({ formats: ["qr_code", "code_128", "ean_13"] })
        : null;
      const tick = async () => {
        const video = videoRef.current;
        if (!video || !streamRef.current || detectedRef.current) return;
        try {
          const codes = detector ? await detector.detect(video) : [];
          if (codes?.[0]?.rawValue) {
            detectedRef.current = true;
            await selectFromCode(codes[0].rawValue);
            stopCamera();
            return;
          }
        } catch {
          // Continue scanning while the video settles.
        }

        const canvas = canvasRef.current;
        if (canvas && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth && video.videoHeight) {
          const context = canvas.getContext("2d", { willReadFrequently: true });
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          const result = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" });
          if (result?.data) {
            detectedRef.current = true;
            await selectFromCode(result.data);
            stopCamera();
            return;
          }
        }

        animationRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      setError(err?.message || "Unable to open camera.");
    }
  };

  const stopCamera = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = null;
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
                onPaste={(e) => {
                  const pasted = e.clipboardData?.getData("text");
                  setTimeout(() => selectFromCode(pasted || e.target.value), 0);
                }}
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
              <canvas ref={canvasRef} className="hidden" />
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
                <button key={patient.id} onClick={() => openPatient(patient)} className="w-full px-4 py-3 text-left hover:bg-slate-50">
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

        <div className="relative">
          {detailLoading && (
            <div className="absolute right-4 top-4 z-10 rounded-lg border border-teal-100 bg-white px-3 py-2 text-xs font-bold text-teal-700 shadow-sm">
              Loading full details...
            </div>
          )}
          <PatientCard patient={selected} />
        </div>
      </div>
    </div>
  );
};

export default PatientScanner;

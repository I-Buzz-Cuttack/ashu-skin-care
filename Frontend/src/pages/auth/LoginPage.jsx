import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { 
  Activity, 
  ArrowRight, 
  BadgeCheck, 
  CalendarDays, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ShieldCheck, 
  Stethoscope, 
  Users,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import apiClient from "../../api/apiClient";
import { setCredentials } from "../../store/slices/authSlice";

const unwrapAuth = (response) => {
  const body = response?.data;
  return body?.result ?? body?.data ?? body;
};

const LoginPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "superadmin@hospital.com",
    password: "superadmin@123",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.post("/auth/login", form);
      const data = unwrapAuth(response);
      dispatch(setCredentials({
        user: data.user,
        token: data.accessToken || data.token,
        role: data.role || data.user?.role || "SUPER_ADMIN",
        permissions: data.permissions || [],
      }));
      navigate("/super-admin/dashboard", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed. Check email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface-50 text-surface-900 grid lg:grid-cols-[1.1fr_0.9fr] overflow-hidden">
      {/* Visual Hero Left Section */}
      <section className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-surface-900 via-surface-800 to-primary-900 text-white p-12 xl:p-16 flex-col justify-between border-r border-primary-900/40">
        {/* Glowing Mesh Background */}
        <div className="absolute inset-0 opacity-45 bg-[radial-gradient(ellipse_at_top_left,#2dd4ac_0%,transparent_48%),radial-gradient(ellipse_at_bottom_right,#b88945_0%,transparent_52%)] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 h-96 w-96 rounded-full bg-primary-500/10 blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary-300 to-primary-700 text-white flex items-center justify-center shadow-lg shadow-primary-500/25 ring-2 ring-primary-300/30">
              <Activity size={24} className="animate-pulse" />
            </span>
            <div>
              <p className="text-xs font-bold text-primary-300 tracking-wider uppercase">Ashu Skin Care</p>
              <h1 className="text-xl font-extrabold text-white tracking-normal">Gynae & Skin Clinic Platform</h1>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-300/25 text-primary-200 text-xs font-bold">
            <Sparkles size={12} /> v2.4 Enterprise Edition
          </span>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-2xl my-auto py-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-primary-200 text-xs font-bold mb-6 backdrop-blur-md">
            <CheckCircle2 size={14} className="text-primary-300" />
            Gynae and skin clinic care made simple
          </div>

          <h2 className="text-4xl xl:text-5xl font-extrabold leading-[1.15] text-white tracking-normal">
            Intelligent OPD, billing & patient records in one calm console.
          </h2>

          {/* Floating Glass Stats Panel */}
          <div className="mt-10 rounded-2xl border border-white/15 bg-white/5 backdrop-blur-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/5">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                <p className="text-sm font-bold text-white">Live OPD Desk Queue</p>
              </div>
              <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-3 py-0.5 text-xs font-bold text-emerald-300">
                Operational
              </span>
            </div>

            <div className="grid grid-cols-3 divide-x divide-white/10">
              {[
                [CalendarDays, "42", "Appointments", "text-primary-300"],
                [Stethoscope, "08", "Consulting", "text-emerald-300"],
                [Users, "124", "Registered Patients", "text-amber-200"],
              ].map(([Icon, value, label, color]) => (
                <div key={label} className="p-6 transition-colors hover:bg-white/5">
                  <Icon size={22} className={color} />
                  <p className="mt-4 text-3xl xl:text-4xl font-extrabold text-white tracking-normal">{value}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-300">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Module Feature Badges */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            {[
              ["Doctor Master", "Specialists & schedules"],
              ["EPrescription", "Digital Rx & dosage"],
              ["Patient Scanner", "Instant QR lookup"],
            ].map(([title, text]) => (
              <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-md hover:bg-white/10 transition-colors">
                <p className="font-bold text-sm text-white">{title}</p>
                <p className="mt-1 text-xs text-slate-400">{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-6">
          <div className="flex items-center gap-2 text-slate-300">
            <ShieldCheck size={16} className="text-primary-300" />
            <span>JWT Encrypted Role-Based Security</span>
          </div>
          <span>© 2026 Ashu Skin Care</span>
        </div>
      </section>

      {/* Login Form Right Section */}
      <section className="flex items-center justify-center p-6 sm:p-12 bg-gradient-to-br from-white via-surface-50 to-primary-50 relative">
        <div className="absolute inset-0 opacity-35 bg-[radial-gradient(circle_at_center,#f7e8c4_0%,transparent_58%)] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile Brand Title */}
          <div className="mb-8 lg:hidden flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-700 text-white flex items-center justify-center shadow-lg shadow-primary-500/30">
              <Activity size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-surface-900">Ashu Skin Care</h1>
              <p className="text-xs text-primary-700">Gynae & Skin Clinic Console</p>
            </div>
          </div>

          {/* Glass Form Card */}
          <div className="rounded-3xl border border-primary-100 bg-white/90 backdrop-blur-2xl shadow-2xl shadow-surface-200/60 p-8 sm:p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-primary-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary-500/10 border border-primary-500/20 px-3 py-1 text-xs font-bold text-primary-700">
                <BadgeCheck size={14} className="text-primary-600" />
                Staff Portal Access
              </div>
              <h2 className="mt-4 text-3xl font-extrabold text-surface-900 tracking-normal">Welcome Back</h2>
              <p className="mt-2 text-sm text-surface-500">
                Enter your authorized hospital credentials to access your console.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-2">
                  Staff Email
                </label>
                <div className="relative flex items-center rounded-xl border border-surface-200 bg-surface-50/80 px-3.5 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/15 transition-all duration-200">
                  <Mail size={18} className="text-surface-400 shrink-0" />
                  <input
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="h-12 w-full bg-transparent px-3 text-sm text-surface-900 placeholder-surface-400 outline-none"
                    placeholder="superadmin@hospital.com"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-surface-500 mb-2">
                  Password
                </label>
                <div className="relative flex items-center rounded-xl border border-surface-200 bg-surface-50/80 px-3.5 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/15 transition-all duration-200">
                  <Lock size={18} className="text-surface-400 shrink-0" />
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    className="h-12 w-full bg-transparent px-3 text-sm text-surface-900 placeholder-surface-400 outline-none"
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="text-surface-500 hover:text-surface-700 p-1"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error ? (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3.5 text-xs font-medium text-rose-300 animate-fade-in">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-primary-700 via-primary-600 to-primary-500 hover:from-primary-800 hover:via-primary-700 hover:to-primary-600 text-white font-bold text-sm shadow-lg shadow-primary-600/25 hover:shadow-primary-600/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 transition-all duration-200 flex items-center justify-center gap-2"
              >
                {loading ? "Authenticating..." : "Open Console"}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-surface-500">
              Need access? Contact hospital IT administrator.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LoginPage;

import { useState, useEffect } from "react";
import { Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  Activity, 
  BarChart3, 
  ClipboardList, 
  LogOut, 
  Stethoscope, 
  Users,
  Search,
  Moon,
  Sun,
  Bell,
  ShieldCheck,
  Sparkles,
  Menu,
  X,
  FilePlus,
  QrCode,
  Building2,
  Receipt,
  Tags,
  Plus,
  BedDouble,
  UserCog,
  KeyRound,
  Mail,
  Phone,
} from "lucide-react";
import { clearAuth, selectCurrentUser, selectIsAuthenticated } from "./store/slices/authSlice";
import apiClient from "./api/apiClient";

import LoginPage from "./pages/auth/LoginPage.jsx";
import DashboardPage from "./pages/super-admin/dashboard/DashboardPage.jsx";
// OPD module
import OPDPage      from "./pages/super-admin/opd/OPDPage.jsx";
import OPDAdd       from "./pages/super-admin/opd/Add/OPDAdd.jsx";
import OpdCategory  from "./pages/super-admin/opd/OpdCategory/OpdCategory.jsx";
import OpdDoctors   from "./pages/super-admin/opd/opd-doctors/OpdDoctors.jsx";
import DepartmentMaster from "./pages/super-admin/opd/DepartmentMaster/DepartmentMaster.jsx";
import DoctorFees from "./pages/super-admin/opd/DoctorFees/DoctorFees.jsx";
import EPrescription from "./pages/super-admin/opd/EPrescription/EPrescription.jsx";
import PatientScanner from "./pages/super-admin/opd/PatientScanner/PatientScanner.jsx";
import IPDConvertedPage from "./pages/super-admin/ipd/IPDConvertedPage.jsx";

// Patient module
import PatientsPage      from "./pages/super-admin/patients/PatientsPage.jsx";
import CreatePatientPage from "./pages/super-admin/patients/create/CreatePatientPage.jsx";
import EditPatientPage   from "./pages/super-admin/patients/edit/EditPatientPage.jsx";
import ViewPatientPage   from "./pages/super-admin/patients/view/ViewPatientPage.jsx";

const NAV_ITEMS = [
  { to: "/super-admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { to: "/super-admin/opd", label: "OPD Console", icon: ClipboardList },
  { to: "/super-admin/doctors", label: "Doctor Master", icon: Stethoscope },
  { to: "/super-admin/patients", label: "Patient Directory", icon: Users },
  { to: "/super-admin/ipd", label: "IPD", icon: BedDouble },
  { to: "/super-admin/members", label: "Members", icon: UserCog },
  { to: "/super-admin/permissions", label: "Permissions", icon: KeyRound },
];

const OPD_SUB_ITEMS = [
  { to: "/super-admin/opd/add", label: "Register OPD", icon: Plus },
  { to: "/super-admin/opd/add-prescription", label: "E-Prescription", icon: FilePlus },
  { to: "/super-admin/opd/patient-scanner", label: "Patient Scanner", icon: QrCode },
  { to: "/super-admin/opd/department", label: "Department Master", icon: Building2 },
  { to: "/super-admin/opd/category", label: "Category Master", icon: Tags },
  { to: "/super-admin/opd/doctor-fees", label: "Doctor Fees", icon: Receipt },
];

function TopNav() {
  const { pathname } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [darkMode, setDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  const logout = async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch {
      // Local logout should still complete if the server is unreachable.
    }
    dispatch(clearAuth());
    navigate("/login", { replace: true });
  };

  return (
    <>
      <nav className="topnav">
        <div className="topnav-inner">
          {/* Brand & Logo */}
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 min-w-0">
            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="p-2 rounded-xl border border-primary-100 dark:border-slate-800 text-surface-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-slate-900 lg:hidden"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <Link to="/super-admin/dashboard" className="topnav-brand group min-w-0">
              <span className="topnav-logo group-hover:rotate-12 transition-transform duration-300">
                <Activity size={20} className="animate-pulse" />
              </span>
              <div className="flex flex-col min-w-0">
                <span className="font-extrabold text-sm sm:text-base leading-tight tracking-normal flex items-center gap-1.5 min-w-0">
                  Ashu Skin Care
                  <span className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary-500/10 text-primary-700 dark:text-primary-400 border border-primary-500/20">
                    <Sparkles size={10} /> PRO
                  </span>
                </span>
                <span className="text-[11px] font-medium text-surface-500 dark:text-slate-500 tracking-normal hidden sm:inline">Gynae & Skin Clinic Console</span>
              </div>
            </Link>

            {/* Navigation Links (Desktop) */}
            <div className="hidden lg:flex items-center gap-1 pl-4 border-l border-primary-100 dark:border-slate-800 overflow-x-auto">
              {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                const isActive = pathname === to || (to !== "/super-admin/dashboard" && pathname.startsWith(to));
                return (
                  <Link
                    key={to}
                    to={to}
                    className={`topnav-link ${isActive ? "active" : ""}`}
                  >
                    <Icon size={16} className={isActive ? "text-primary-600 dark:text-primary-400" : "text-surface-400 dark:text-slate-400"} />
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Global Search & System Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 ml-auto">
            {/* Quick Search Bar */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-100/80 dark:bg-slate-900 border border-primary-100 dark:border-slate-800 text-surface-400 text-xs w-40 xl:w-56 focus-within:ring-2 focus-within:ring-primary-500/25 transition-all cursor-pointer shrink-0">
              <Search size={14} className="text-surface-400" />
              <input 
                type="text" 
                placeholder="Search UHID, Doctor, OPD..." 
                className="bg-transparent border-none p-0 text-xs text-surface-800 dark:text-slate-200 placeholder-surface-400 focus:outline-none w-full"
              />
              <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary-100 dark:bg-slate-800 text-surface-500">⌘K</kbd>
            </div>

            {/* Live Status Badge */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold whitespace-nowrap shrink-0">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <ShieldCheck size={13} />
              <span>OPD Live</span>
            </div>

            {/* Theme Switcher */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-primary-100 dark:border-slate-800 text-surface-500 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-slate-900 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun size={17} className="text-amber-400" /> : <Moon size={17} />}
            </button>

            {/* User Profile Pill */}
            <div className="flex items-center gap-2 sm:gap-3 pl-2 border-l border-primary-100 dark:border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-surface-900 dark:text-slate-100 leading-tight">
                  {user?.name || "Dr. Ashu Sharma"}
                </span>
                <span className="text-[11px] text-primary-700 dark:text-primary-400 font-medium">
                  {user?.role || "Super Admin"}
                </span>
              </div>

              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-400 via-primary-500 to-surface-700 text-white font-bold text-xs flex items-center justify-center shadow-md shadow-primary-500/20 ring-2 ring-primary-300/40">
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>

              <button 
                type="button" 
                onClick={logout} 
                className="topnav-logout" 
                title="Sign Out"
                aria-label="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col bg-surface-900/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-b border-primary-100 dark:border-slate-800 p-4 max-h-[85vh] overflow-y-auto rounded-b-3xl shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-bold text-surface-900 dark:text-slate-100">System Navigation</span>
              </div>
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg border border-primary-100 dark:border-slate-800 text-surface-400 hover:text-surface-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile Search */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-100 dark:bg-slate-800 border border-primary-100 dark:border-slate-700 text-surface-400 text-xs">
              <Search size={15} />
              <input 
                type="text" 
                placeholder="Search UHID, Doctor, OPD..." 
                className="bg-transparent border-none p-0 text-xs text-surface-800 dark:text-slate-200 placeholder-surface-400 focus:outline-none w-full"
              />
            </div>

            {/* Main Sections */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-surface-400 dark:text-slate-500 mb-2">Main Modules</p>
              <div className="grid grid-cols-2 gap-2">
                {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
                  const isActive = pathname === to || (to !== "/super-admin/dashboard" && pathname.startsWith(to));
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        isActive 
                          ? "bg-primary-500/10 text-primary-700 dark:text-primary-400 border border-primary-500/30" 
                          : "bg-surface-50 dark:bg-slate-800/60 text-surface-700 dark:text-slate-300 border border-surface-200/60 dark:border-slate-800"
                      }`}
                    >
                      <Icon size={16} className={isActive ? "text-primary-600" : "text-surface-400"} />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* OPD Sub-modules */}
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-surface-400 dark:text-slate-500 mb-2">OPD Tools & Masters</p>
              <div className="grid grid-cols-2 gap-2">
                {OPD_SUB_ITEMS.map(({ to, label, icon: Icon }) => {
                  const isActive = pathname === to;
                  return (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all ${
                        isActive 
                          ? "bg-primary-500/10 text-primary-700 dark:text-primary-400 border border-primary-500/30 font-bold" 
                          : "bg-surface-50 dark:bg-slate-800/40 text-surface-600 dark:text-slate-400 border border-surface-100 dark:border-slate-800"
                      }`}
                    >
                      <Icon size={14} className="text-primary-600 shrink-0" />
                      <span className="truncate">{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ProtectedRoute({ children }) {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

const unwrapList = (response) => {
  const body = response?.data;
  const result = body?.result ?? body?.data ?? body;
  const data = result?.data ?? result?.records ?? result;
  return Array.isArray(data) ? data : [];
};

function MembersPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadMembers = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await apiClient.get("/user", { params: { page: 1, limit: 1000 } });
        if (!cancelled) setMembers(unwrapList(response));
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Unable to load members.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadMembers();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page-container">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary-600">Super Admin</p>
        <h1 className="mt-2 text-3xl font-extrabold text-surface-900">Members</h1>
        <p className="mt-1 text-sm text-surface-500">Manage staff accounts and prepare member access control.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-surface-100 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-extrabold text-surface-900">Staff Members</p>
            <p className="text-xs text-surface-400">{loading ? "Loading..." : `${members.length} member${members.length === 1 ? "" : "s"}`}</p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
            <UserCog size={14} /> Members
          </span>
        </div>

        {error && <div className="m-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

        <div className="divide-y divide-surface-100">
          {!loading && members.map((member) => (
            <div key={member.id} className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[1.2fr_1fr_1fr_auto] md:items-center">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-400 to-surface-700 text-white flex items-center justify-center text-sm font-bold">
                  {(member.name || "?").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-surface-900">{member.name || "-"}</p>
                  <p className="text-xs text-surface-400">{member.role || "Member"}</p>
                </div>
              </div>
              <p className="flex items-center gap-2 text-sm text-surface-600"><Mail size={14} /> {member.email || "-"}</p>
              <p className="flex items-center gap-2 text-sm text-surface-600"><Phone size={14} /> {member.phone || "-"}</p>
              <span className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${member.isActive === false ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                {member.isActive === false ? "Inactive" : "Active"}
              </span>
            </div>
          ))}
          {loading && <div className="p-12 text-center text-sm text-surface-400">Loading members...</div>}
          {!loading && !members.length && !error && <div className="p-12 text-center text-sm text-surface-400">No members found.</div>}
        </div>
      </div>
    </div>
  );
}

function PermissionsPage() {
  const [members, setMembers] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const selectedMember = members.find((member) => member.id === selectedUserId);
  const selectedIsSuperAdmin = String(selectedMember?.role || "").toUpperCase().replace(/[\s-]+/g, "_") === "SUPER_ADMIN";

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [memberRes, catalogRes] = await Promise.all([
          apiClient.get("/user", { params: { page: 1, limit: 1000 } }),
          apiClient.get("/permission/catalog"),
        ]);
        const nextMembers = unwrapList(memberRes);
        const nextCatalog = unwrapList(catalogRes);
        if (!cancelled) {
          setMembers(nextMembers);
          setCatalog(nextCatalog);
          setSelectedUserId(nextMembers.find((member) => String(member.role).toUpperCase() !== "SUPER_ADMIN")?.id || nextMembers[0]?.id || "");
        }
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Unable to load permission settings.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedUserId) return;
    let cancelled = false;
    const loadPermissions = async () => {
      setMessage("");
      setError("");
      try {
        const permissions = unwrapList(await apiClient.get(`/permission/user/${selectedUserId}`));
        if (!cancelled) {
          setSelectedPermissions(new Set(
            permissions
              .filter((permission) => permission.resource !== "*" && permission.action !== "*")
              .map((permission) => `${permission.resource}:${permission.action}`),
          ));
        }
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || "Unable to load member permissions.");
      }
    };
    loadPermissions();
    return () => { cancelled = true; };
  }, [selectedUserId]);

  const togglePermission = (resource, action) => {
    const key = `${resource}:${action}`;
    setSelectedPermissions((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleModule = (module) => {
    const keys = module.actions.map((action) => `${module.resource}:${action}`);
    const allSelected = keys.every((key) => selectedPermissions.has(key));
    setSelectedPermissions((current) => {
      const next = new Set(current);
      keys.forEach((key) => {
        if (allSelected) next.delete(key);
        else next.add(key);
      });
      return next;
    });
  };

  const savePermissions = async () => {
    if (!selectedUserId || selectedIsSuperAdmin) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const permissions = Array.from(selectedPermissions).map((key) => {
        const [resource, action] = key.split(":");
        return { resource, action };
      });
      await apiClient.put(`/permission/user/${selectedUserId}`, { permissions });
      setMessage("Permissions saved. Ask this member to log out and log in again if they are currently online.");
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to save permissions.");
    } finally {
      setSaving(false);
    }
  };

  const actionLabel = (action) => ({
    read: "View",
    create: "Add",
    update: "Edit",
    delete: "Delete",
    print: "Print",
    export: "Export",
  }[action] || action);

  return (
    <div className="page-container">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-widest text-primary-600">Super Admin</p>
        <h1 className="mt-2 text-3xl font-extrabold text-surface-900">Permissions</h1>
        <p className="mt-1 text-sm text-surface-500">Choose a member and control which parts of the website they can use.</p>
      </div>

      <div className="card p-5 space-y-5">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
          <div className="flex items-center gap-3">
            <ShieldCheck size={22} />
            <div>
              <p className="font-extrabold">Full Access Enabled</p>
              <p className="text-sm">Super Admin can view and work on every available section.</p>
            </div>
          </div>
        </div>

        {error && <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {message && <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</div>}

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
          <section className="rounded-xl border border-surface-100 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-surface-400">Select Member</p>
            <select
              value={selectedUserId}
              onChange={(event) => setSelectedUserId(event.target.value)}
              disabled={loading}
              className="mt-3 h-11 w-full rounded-lg border border-surface-200 bg-white px-3 text-sm font-semibold outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10"
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name || member.email} - {member.role}
                </option>
              ))}
            </select>
            <div className="mt-4 rounded-lg bg-surface-50 p-3 text-sm text-surface-600">
              <p className="font-bold text-surface-900">{selectedMember?.name || "No member selected"}</p>
              <p className="mt-1">{selectedMember?.email || "-"}</p>
              <p className="mt-1 text-xs font-bold uppercase text-primary-700">{selectedMember?.role || "-"}</p>
            </div>
            {selectedIsSuperAdmin && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700">
                Super Admin always has full access. Select another member to assign permissions.
              </p>
            )}
          </section>

          <section className="rounded-xl border border-surface-100 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-surface-400">Access Control</p>
                <h2 className="mt-1 text-lg font-extrabold text-surface-900">Website Sections</h2>
              </div>
              <button
                type="button"
                onClick={savePermissions}
                disabled={!selectedUserId || selectedIsSuperAdmin || saving}
                className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Permissions"}
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 xl:grid-cols-2">
              {catalog.map((module) => {
                const allSelected = module.actions?.every((action) => selectedPermissions.has(`${module.resource}:${action}`));
                return (
                  <div key={module.resource} className="rounded-lg border border-surface-100 p-4">
                    <label className="flex items-center justify-between gap-3">
                      <span className="font-bold text-surface-900">{module.label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(allSelected)}
                        onChange={() => toggleModule(module)}
                        disabled={selectedIsSuperAdmin}
                        className="h-4 w-4 accent-primary-600"
                      />
                    </label>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {module.actions?.map((action) => {
                        const key = `${module.resource}:${action}`;
                        return (
                          <label key={key} className="inline-flex items-center gap-2 rounded-full border border-surface-200 px-3 py-1.5 text-xs font-semibold text-surface-700">
                            <input
                              type="checkbox"
                              checked={selectedPermissions.has(key)}
                              onChange={() => togglePermission(module.resource, action)}
                              disabled={selectedIsSuperAdmin}
                              className="h-3.5 w-3.5 accent-primary-600"
                            />
                            {actionLabel(action)}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {loading && <div className="p-8 text-center text-sm text-surface-400">Loading permissions...</div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function AppShell() {
  return (
    <div className="min-h-screen app-shell-bg flex flex-col">
      <TopNav />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/super-admin/dashboard" replace />} />
          <Route path="/super-admin" element={<Navigate to="/super-admin/dashboard" replace />} />
          <Route path="/super-admin/dashboard" element={<DashboardPage />} />

          <Route path="/super-admin/opd" element={<OPDPage />} />
          <Route path="/super-admin/opd/add" element={<OPDAdd />} />
          <Route path="/super-admin/opd/add-prescription" element={<EPrescription />} />
          <Route path="/super-admin/opd/patient-scanner" element={<PatientScanner />} />
          <Route path="/super-admin/opd/department" element={<DepartmentMaster />} />
          <Route path="/super-admin/opd/category" element={<OpdCategory />} />
          <Route path="/super-admin/opd/doctor-fees" element={<DoctorFees />} />
          <Route path="/super-admin/opd/opd-doctors" element={<OpdDoctors />} />
          <Route path="/super-admin/doctors" element={<OpdDoctors />} />

          <Route path="/super-admin/ipd" element={<IPDConvertedPage />} />
          <Route path="/super-admin/ipd/admitted-patients" element={<IPDConvertedPage />} />
          <Route path="/super-admin/members" element={<MembersPage />} />
          <Route path="/super-admin/permissions" element={<PermissionsPage />} />
          <Route path="/super-admin/patients" element={<PatientsPage />} />
          <Route path="/super-admin/patients/create" element={<CreatePatientPage />} />
          <Route path="/super-admin/patients/:id" element={<ViewPatientPage />} />
          <Route path="/super-admin/patients/:id/edit" element={<EditPatientPage />} />

          <Route path="*" element={<Navigate to="/super-admin/dashboard" replace />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const isAuthenticated = useSelector(selectIsAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/super-admin/dashboard" replace /> : <LoginPage />} />
      <Route path="/*" element={<ProtectedRoute><AppShell /></ProtectedRoute>} />
    </Routes>
  );
}

export default App;

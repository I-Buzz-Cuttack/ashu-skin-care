import { ChevronRight, Home, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentRole } from '@store/slices/authSlice';
import { getRoleDashboardPath, resolveRolePath } from '@utils/rolePath.utils';

const routeNameMap = {
  "super-admin": "Super Admin",
  dashboard: "Dashboard",
  opd: "OPD Console",
  patients: "Patients Directory",
  doctors: "Doctors Master",
  pharma: "Pharmacy",
  medicines: "Medicines",
};

const PageHeader = ({ title, subtitle, actions, breadcrumbs: propBreadcrumbs }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentRole = useSelector(selectCurrentRole);

  let breadcrumbs = [];

  const pathnames = location.pathname.split("/").filter(Boolean);
  const filteredPathnames = pathnames.filter(name => name !== "status");

  if (Array.isArray(propBreadcrumbs) && propBreadcrumbs.length > 0) {
    breadcrumbs = propBreadcrumbs.map((b) => {
      if (typeof b === 'string') return { label: b };
      if (b.link) return { label: b.label, path: b.link, raw: b };
      if (b.path) return { label: b.label, path: b.path, raw: b };
      return { label: b.label, raw: b };
    });

    breadcrumbs = breadcrumbs.map((crumb, idx) => {
      if (!crumb.path && !(crumb.raw && typeof crumb.raw.onClick === 'function')) {
        const path = "/" + filteredPathnames.slice(0, idx + 1).join("/");
        return { ...crumb, path };
      }
      return crumb;
    });
  } else {
    breadcrumbs = filteredPathnames.map((name, index) => {
      const path = "/" + filteredPathnames.slice(0, index + 1).join("/");
      return {
        label: routeNameMap[name] || name.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        path,
      };
    });
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
      <div>
        {/* Modern Breadcrumb Row */}
        <nav className="flex items-center gap-1.5 mb-2.5">
          <button
            onClick={() => navigate(getRoleDashboardPath(currentRole))}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-teal-500 hover:bg-teal-500/10 transition-all cursor-pointer border border-slate-200/80 dark:border-slate-800"
            title="Dashboard"
          >
            <Home size={13} />
          </button>

          {breadcrumbs.map((crumb, i) => {
            const isLast = i === breadcrumbs.length - 1;
            const key = crumb.path || crumb.label;

            const handleClick = () => {
              if (isLast) return;
              if (crumb.raw && typeof crumb.raw.onClick === 'function') {
                return crumb.raw.onClick();
              }
              if (crumb.path) return navigate(resolveRolePath(crumb.path, currentRole));
              if (crumb.raw && crumb.raw.link) return navigate(resolveRolePath(crumb.raw.link, currentRole));
            };

            return (
              <div key={`${i}-${key}`} className="flex items-center gap-1.5">
                <ChevronRight size={13} className="text-slate-300 dark:text-slate-600" />
                <button
                  onClick={handleClick}
                  className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${
                    isLast
                      ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/40 cursor-default"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                  }`}
                  disabled={isLast}
                >
                  {crumb.label}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Title and Subtitle */}
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
        </div>

        {subtitle && (
          <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">{actions}</div>
      )}
    </div>
  );
};

export default PageHeader;

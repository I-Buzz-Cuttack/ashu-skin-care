import { NavLink, useLocation } from "react-router-dom";
import { ChevronRight, Activity } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

const CollapsedFlyout = ({ item, anchorY, onClose, onNavigate }) => {
  const { pathname } = useLocation();
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const subItems = item.subItems || item.children || [];
  const estimatedH = 64 + 17 + subItems.length * 48 + 16;
  const top = Math.min(anchorY, window.innerHeight - estimatedH - 12);

  return createPortal(
    <div
      ref={ref}
      style={{ top: Math.max(8, top), left: 72, position: "fixed", zIndex: 9999 }}
      className="min-w-[220px] rounded-2xl shadow-2xl
                 bg-white dark:bg-slate-800
                 border border-slate-200 dark:border-slate-700
                 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-100 dark:border-slate-700">
        <span className="text-blue-500 dark:text-blue-400 shrink-0 flex items-center">
          {item.icon}
        </span>
        <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">
          {item.label}
        </span>
      </div>

      {/* Sub-items */}
      <div className="py-1.5">
        {subItems.map((sub) => {
          const isActive = sub.exact
            ? pathname === sub.path
            : pathname === sub.path || pathname.startsWith(sub.path + "/");

          return (
            <NavLink
              key={sub.path}
              to={sub.path}
              onClick={() => { onNavigate?.(); onClose(); }}
              className={`flex items-center gap-3 px-4 py-2.5 text-[13.5px] transition-colors
                ${isActive
                  ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-blue-600 dark:hover:text-blue-400"
                }`}
            >
              <span className={`shrink-0 flex items-center ${isActive ? "text-blue-500 dark:text-blue-400" : "text-blue-400 dark:text-slate-400"}`}>
                {sub.icon}
              </span>
              {sub.label}
            </NavLink>
          );
        })}
      </div>
    </div>,
    document.body
  );
};

const NavItem = ({ item, collapsed, onNavigate, openFlyoutKey, onFlyoutToggle }) => {
  const { pathname } = useLocation();
  const hasChildren = item.children?.length > 0;
  const hasSubItems = !hasChildren && item.subItems?.length > 0;
  const hasNested = hasChildren || hasSubItems;
  const itemKey = item.path || item.label;

  const subItemActive =
    hasNested &&
    (item.subItems || item.children || []).some((s) =>
      s.exact
        ? pathname === s.path
        : pathname === s.path || pathname.startsWith(s.path + "/")
    );

  const [open, setOpen] = useState(subItemActive);
  const iconBtnRef = useRef(null);

  useEffect(() => {
    if (subItemActive) setOpen(true);
  }, [subItemActive]);
  const isSubItemActive = (sub) => pathname === sub.path;

  if (collapsed) {
    const isFlyoutOpen = openFlyoutKey === itemKey;

    if (!hasNested) {
      return (
        <NavLink
          to={item.path}
          title={item.label}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-150
             ${isActive
               ? "bg-blue-500/15 dark:bg-blue-500/25 text-blue-600 dark:text-blue-400"
               : "text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
             }`
          }
        >
          {item.icon}
        </NavLink>
      );
    }

    return (
      <button
        ref={iconBtnRef}
        type="button"
        title={item.label}
        onClick={() => {
          const rect = iconBtnRef.current?.getBoundingClientRect();
          const anchorY = rect ? rect.top : 0;
          onFlyoutToggle(isFlyoutOpen ? null : { item, anchorY, key: itemKey });
        }}
        className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all duration-150 relative
          ${subItemActive || isFlyoutOpen
            ? "bg-blue-500/15 dark:bg-blue-500/25 text-blue-600 dark:text-blue-400"
            : "text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
          }`}
      >
        {item.icon}
        {subItemActive && !isFlyoutOpen && (
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
        )}
      </button>
    );
  }

  if (hasNested) {
    const subList = item.subItems || item.children || [];
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="sidebar-item w-full justify-between group"
        >
          <span className="flex items-center gap-3">
            <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-colors
              ${subItemActive
                ? "bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400"
                : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
              }`}
            >
              {item.icon}
            </span>
            <span className={`font-medium transition-colors
              ${subItemActive
                ? "text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100"
              }`}
            >
              {item.label}
            </span>
          </span>
          <ChevronRight
            size={13}
            className={`transition-transform duration-200 flex-shrink-0
              ${open ? "rotate-90" : ""}
              ${subItemActive ? "text-blue-400 dark:text-blue-500" : "text-slate-300 dark:text-slate-600"}`}
          />
        </button>

        <div
          className="overflow-hidden transition-[max-height,opacity] duration-200 ease-in-out"
          style={{ maxHeight: open ? `${subList.length * 44}px` : "0px", opacity: open ? 1 : 0 }}
        >
          <div className="ml-4 mt-1 mb-0.5 pl-7 border-l border-slate-100 dark:border-slate-700/60 space-y-0.5">
            {subList.map((sub) => {
              const isActive = sub.exact
                ? pathname === sub.path
                : pathname === sub.path || pathname.startsWith(sub.path + "/");
              return (
                <NavLink
                  key={sub.path}
                  to={sub.path}
                  onClick={onNavigate}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-[13px] transition-all duration-150 cursor-pointer
                    ${isActive
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/40 font-semibold"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-700/60"
                    }`}
                >
                  <span className={`flex-shrink-0 transition-colors ${isActive ? "text-blue-500 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`}>
                    {sub.icon}
                  </span>
                  {sub.label}
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) => `sidebar-item group ${isActive ? "active" : ""}`}
    >
      {({ isActive }) => (
        <>
          <span className={`shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200
            ${isActive
              ? "bg-white/20"
              : "bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
            }`}
          >
            {item.icon}
          </span>
          <span className="flex-1">{item.label}</span>
          {item.badge && (
            <span className="ml-auto px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-500 text-white">
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};

const SidebarBase = ({
  navItems = [],
  roleLabel,
  roleColor = "text-blue-700",
  roleBg = "bg-blue-50",
  logo,
  collapsed = false,
  onNavigate,
}) => {
  const navRef = useRef(null);
  const [flyout, setFlyout] = useState(null);

  useEffect(() => {
    const active = navRef.current?.querySelector(".active");
    active?.scrollIntoView({ block: "center", behavior: "instant" });
  }, []);

  useEffect(() => {
    if (!collapsed) setFlyout(null);
  }, [collapsed]);

  const closeFlyout = useCallback(() => setFlyout(null), []);

  const grouped = navItems.reduce((acc, item) => {
    const group = item.group || "Main";
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  return (
    <>
      <aside
        className={`${collapsed ? "w-[64px]" : "w-[min(18rem,85vw)] md:w-64"} h-full flex flex-col shrink-0 transition-all duration-300
                    bg-white dark:bg-slate-900
                    border-r border-slate-100 dark:border-slate-700/60
                    relative z-50 shadow-2xl md:shadow-none`}
      >
        {/* Brand */}
        <div className={`h-[60px] flex items-center shrink-0 border-b border-slate-100 dark:border-slate-700/60 ${collapsed ? "justify-center px-0" : "px-4"}`}>
          {logo || (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md bg-gradient-to-br from-blue-500 to-indigo-500">
                <Activity size={17} className="text-white" />
              </div>
              {!collapsed && (
                <div>
                  <p className="text-sm font-bold font-display text-slate-900 dark:text-slate-100 leading-none">Ashu Clinic</p>
                  <p className="mt-1">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${roleBg} ${roleColor}`}>
                      {roleLabel}
                    </span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav
          ref={navRef}
          className={`flex-1 overflow-y-auto scrollbar-thin py-4 space-y-5 ${collapsed ? "px-1.5" : "px-3"}`}
        >
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              {group !== "Main" && !collapsed && (
                <p className="px-3 mb-2 text-[9px] font-bold uppercase tracking-widest text-slate-300 dark:text-slate-600 font-display">
                  {group}
                </p>
              )}
              {group !== "Main" && collapsed && (
                <div className="mx-auto w-4 border-t border-slate-100 dark:border-slate-700/60 mb-2" />
              )}
              <div className={`${collapsed ? "space-y-1 flex flex-col items-center" : "space-y-0.5"}`}>
                {items.map((item) => (
                  <NavItem
                    key={item.path || item.label}
                    item={item}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                    openFlyoutKey={flyout?.key}
                    onFlyoutToggle={setFlyout}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={`py-3 shrink-0 border-t border-slate-100 dark:border-slate-700/60 ${collapsed ? "px-2" : "px-4"}`}>
          {collapsed ? (
            <div className="flex justify-center">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/80 border border-blue-100/80 dark:border-slate-700/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex-1">All systems operational</span>
              <span className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400">v1.0</span>
            </div>
          )}
        </div>
      </aside>

      {/* Flyout via portal — renders directly into document.body, never clipped */}
      {collapsed && flyout && (
        <CollapsedFlyout
          item={flyout.item}
          anchorY={flyout.anchorY}
          onClose={closeFlyout}
          onNavigate={onNavigate}
        />
      )}
    </>
  );
};

export default SidebarBase;
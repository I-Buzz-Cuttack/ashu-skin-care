// src/components/tables/TableActions/TableActions.jsx
import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Eye, Pencil, Trash2, X } from 'lucide-react';

const TableActions = ({ actions = [], row, onView, onEdit, onDelete }) => {
  const [open, setOpen]         = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [style, setStyle]       = useState({});
  const btnRef = useRef(null);

  /* ── Detect mobile ── */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  /* ── Close on outside click ── */
  useEffect(() => {
    if (!open || isMobile) return;
    const handler = (e) => {
      if (btnRef.current && !btnRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, isMobile]);

  /* ── Close on scroll ── */
  useEffect(() => {
    if (!open || isMobile) return;
    const handler = () => setOpen(false);
    window.addEventListener('scroll', handler, true);
    return () => window.removeEventListener('scroll', handler, true);
  }, [open, isMobile]);

  /* ── Lock body scroll on mobile ── */
  useEffect(() => {
    document.body.style.overflow = (isMobile && open) ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open, isMobile]);

  const handleToggle = (e) => {
    e.stopPropagation();
    if (open) { setOpen(false); return; }

    // Measure synchronously before any render
    const rect = btnRef.current.getBoundingClientRect();
    const DROPDOWN_H = 130; // approx height
    const spaceBelow = window.innerHeight - rect.bottom;
    const goUp = spaceBelow < DROPDOWN_H && rect.top > DROPDOWN_H;

    setStyle(goUp
      ? { position: 'fixed', bottom: window.innerHeight - rect.top + 6,  right: window.innerWidth - rect.right, zIndex: 9999 }
      : { position: 'fixed', top:    rect.bottom + 6, right: window.innerWidth - rect.right, zIndex: 9999 }
    );
    setOpen(true);
  };

  const defaultActions = [
    { label: 'View',   icon: <Eye    size={15} />, onClick: () => onView?.(row) },
    { label: 'Edit',   icon: <Pencil size={15} />, onClick: () => onEdit?.(row) },
    { label: 'Delete', icon: <Trash2 size={15} />, onClick: () => onDelete?.(row), danger: true, divider: true },
  ];

  // const resolvedResource = resource || inferResourceFromPath(location.pathname);
  // const finalActions = (actions.length ? actions : defaultActions).filter((action) => {
  //   if (action.noPermissionCheck) return true;
  //   const permissionAction = action.permissionAction || inferActionFromLabel(action.label);
  //   if (!resolvedResource || !permissionAction) return true;
  //   return can(resolvedResource, permissionAction);
  // });

  const finalActions = actions.length ? actions : defaultActions;

  if (!finalActions.length) return null;

  const Dropdown = (
    <div
      style={style}
      onMouseDown={(e) => e.stopPropagation()}
      className="py-1.5 min-w-[160px] rounded-xl shadow-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 animate-pop"
    >
      {finalActions.map((action, i) => (
        <div key={i}>
          {action.divider && i > 0 && <div className="my-1 h-px bg-slate-100 dark:bg-slate-700/60" />}
          <button
            onClick={() => { action.onClick?.(); setOpen(false); }}
            className={[
              'w-full flex items-center gap-2.5 px-4 py-2 text-sm text-left transition-colors',
              action.danger
                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60',
            ].join(' ')}
          >
            {action.icon && <span>{action.icon}</span>}
            {action.label}
          </button>
        </div>
      ))}
    </div>
  );

  const MobileSheet = (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.2s ease-out' }}
        onClick={() => setOpen(false)}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-2xl border-t border-slate-200 dark:border-slate-700/60 shadow-2xl"
        style={{ animation: 'slideUp 0.25s ease-out' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Actions</p>
          <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="py-2 px-3">
          {finalActions.map((action, i) => (
            <div key={i}>
              {action.divider && i > 0 && <div className="my-1.5 h-px bg-slate-100 dark:bg-slate-800" />}
              <button
                onClick={() => { action.onClick?.(); setOpen(false); }}
                className={[
                  'w-full flex items-center gap-3.5 px-3 py-3.5 rounded-xl text-sm font-medium text-left transition-colors',
                  action.danger
                    ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 active:bg-red-100'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 active:bg-slate-100',
                ].join(' ')}
              >
                {action.icon && (
                  <span className={[
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    action.danger ? 'bg-red-50 dark:bg-red-900/30 text-red-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
                  ].join(' ')}>
                    {action.icon}
                  </span>
                )}
                {action.label}
              </button>
            </div>
          ))}
        </div>
        <div className="h-5" />
      </div>
    </>
  );

  return (
    <div className="relative inline-block" onClick={(e) => e.stopPropagation()}>
      <button
        ref={btnRef}
        onClick={handleToggle}
        className={[
          'flex items-center justify-center w-7 h-7 rounded-lg transition-all',
          'text-slate-400 dark:text-slate-500',
          open
            ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300',
        ].join(' ')}
        aria-label="Row actions"
        aria-expanded={open}
      >
        <MoreVertical size={14} />
      </button>

      {open && createPortal(isMobile ? MobileSheet : Dropdown, document.body)}
    </div>
  );
};

export default TableActions;

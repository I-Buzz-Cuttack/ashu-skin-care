// src/components/tables/DataTable/DataTable.jsx
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronUp, ChevronDown, ChevronsUpDown,
  Search, SlidersHorizontal, X, RotateCcw, Download,
  Calendar, ChevronDown as ChevronDownSm,
} from 'lucide-react';
import EmptyState from '../../feedback/EmptyState/EmptyState';

/* Inject dropdown animation once */
if (typeof document !== 'undefined' && !document.getElementById('dt-anim')) {
  const s = document.createElement('style');
  s.id = 'dt-anim';
  s.textContent = `
    @keyframes dtFadeIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes dtSlideUp {
      from { opacity: 0; transform: translateY(100%); }
      to   { opacity: 1; transform: translateY(0); }
    }
  `;
  document.head.appendChild(s);
}

/* ─────────────────────────────────────────────────────────────
   SortIcon
───────────────────────────────────────────────────────────── */
const SortIcon = ({ col, sortKey, sortDir }) => {
  if (!col.sortable) return null;
  if (sortKey !== col.key)
    return <ChevronsUpDown size={12} className="ml-1 text-slate-300 dark:text-slate-600 shrink-0" />;
  return sortDir === 'asc'
    ? <ChevronUp   size={12} className="ml-1 text-blue-500 shrink-0" />
    : <ChevronDown size={12} className="ml-1 text-blue-500 shrink-0" />;
};

/* ─────────────────────────────────────────────────────────────
   DropdownPortal — renders dropdown at body level so it is
   never clipped by overflow:hidden / overflow-x:auto parents
───────────────────────────────────────────────────────────── */
const DropdownPortal = ({ anchorRef, open, children, minWidth = 120 }) => {
  const [style, setStyle] = useState({});

  useEffect(() => {
    if (!open || !anchorRef.current) return;

    const calc = () => {
      const rect = anchorRef.current?.getBoundingClientRect();
      if (!rect) return;

      // Flip upward if there is not enough room below
      const spaceBelow = window.innerHeight - rect.bottom;
      const openUp = spaceBelow < 260 && rect.top > 260;

      setStyle({
        position : 'fixed',
        left     : rect.left,
        width    : Math.max(rect.width, minWidth),
        zIndex   : 99999,
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + 4 }
          : { top   : rect.bottom + 4 }),
      });
    };

    calc();
    window.addEventListener('scroll', calc, true);
    window.addEventListener('resize', calc);
    return () => {
      window.removeEventListener('scroll', calc, true);
      window.removeEventListener('resize', calc);
    };
  }, [open, anchorRef, minWidth]);

  if (!open) return null;
  return createPortal(
    <div style={style}>{children}</div>,
    document.body,
  );
};

/* ─────────────────────────────────────────────────────────────
   PillSelect — fully portaled dropdown, never clipped
───────────────────────────────────────────────────────────── */
const PillSelect = ({ label, value, options = [], onChange }) => {
  const [open, setOpen] = useState(false);
  const btnRef          = useRef(null);
  const containerRef    = useRef(null);

  const active        = value !== '' && value != null;
  const selectedLabel = options.find(o => o.value === value)?.label ?? 'All';

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        !e.target.closest('[data-dt-pill-portal]')
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleSelect = (val) => { onChange(val); setOpen(false); };

  return (
    <div ref={containerRef} className="relative inline-flex shrink-0">
      {/* Pill trigger */}
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={[
          'inline-flex items-center gap-1.5 h-8 pl-3 pr-2.5 rounded-lg border',
          'text-xs font-medium whitespace-nowrap select-none cursor-pointer',
          'transition-all duration-150 outline-none',
          open || active
            ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
            : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500',
        ].join(' ')}
      >
        {label && (
          <span className={[
            'font-semibold',
            open || active ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500',
          ].join(' ')}>
            {label}
          </span>
        )}
        <span>{selectedLabel}</span>
        <ChevronDownSm
          size={11}
          className={[
            'transition-transform duration-150',
            open ? 'rotate-180' : '',
            open || active ? 'text-blue-400' : 'text-slate-400 dark:text-slate-500',
          ].join(' ')}
        />
      </button>

      {/* Portaled dropdown — escapes any overflow parent */}
      <DropdownPortal anchorRef={btnRef} open={open} minWidth={130}>
        <div
          data-dt-pill-portal
          className={[
            'rounded-xl border shadow-lg overflow-hidden',
            'bg-white dark:bg-slate-800',
            'border-slate-200 dark:border-slate-600',
          ].join(' ')}
          style={{ animation: 'dtFadeIn 0.12s ease-out' }}
        >
          {options.map(opt => {
            const selected = opt.value === (value ?? '');
            return (
              <button
                key={opt.value}
                type="button"
                onMouseDown={e => e.preventDefault()}
                onClick={() => handleSelect(opt.value)}
                className={[
                  'w-full flex items-center justify-between gap-3 px-3 py-2 text-xs text-left',
                  'transition-colors duration-100',
                  selected
                    ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60',
                ].join(' ')}
              >
                <span>{opt.label}</span>
                {selected && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0 text-blue-500">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </DropdownPortal>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   DateRangePill — portaled date popover, never clipped
───────────────────────────────────────────────────────────── */
const DateRangePill = ({ filterId, filterValues, onFilterChange, label }) => {
  const [open, setOpen] = useState(false);
  const btnRef          = useRef(null);
  const containerRef    = useRef(null);

  const from   = filterValues[`${filterId}_from`] ?? '';
  const to     = filterValues[`${filterId}_to`]   ?? '';
  const active = from || to;

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target) &&
        !e.target.closest('[data-dt-date-portal]')
      ) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const fmt = (d) => {
    if (!d) return null;
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const display = active
    ? `${fmt(from) ?? '—'}  –  ${fmt(to) ?? '—'}`
    : (label ?? 'Date range');

  return (
    <div ref={containerRef} className="relative inline-flex shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen(o => !o)}
        className={[
          'inline-flex items-center gap-1.5 h-8 pl-3 pr-2.5 rounded-lg border',
          'text-xs font-medium whitespace-nowrap select-none cursor-pointer',
          'transition-all duration-150 outline-none',
          open || active
            ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-300'
            : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-500',
        ].join(' ')}
      >
        <Calendar size={12} className={open || active ? 'text-blue-400' : 'text-slate-400 dark:text-slate-500'} />
        <span>{display}</span>
        <ChevronDownSm
          size={11}
          className={[
            'transition-transform duration-150',
            open ? 'rotate-180' : '',
            open || active ? 'text-blue-400' : 'text-slate-400 dark:text-slate-500',
          ].join(' ')}
        />
      </button>

      {/* Portaled date popover — escapes any overflow parent */}
      <DropdownPortal anchorRef={btnRef} open={open} minWidth={260}>
        <div
          data-dt-date-portal
          className="p-3 rounded-xl border shadow-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700"
          style={{ animation: 'dtFadeIn 0.12s ease-out' }}
        >
          <div className="flex flex-col gap-2">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">From</p>
              <input
                type="date"
                value={from}
                onChange={e => onFilterChange(`${filterId}_from`, e.target.value)}
                className="input-base h-8 text-xs w-full"
              />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">To</p>
              <input
                type="date"
                value={to}
                onChange={e => onFilterChange(`${filterId}_to`, e.target.value)}
                className="input-base h-8 text-xs w-full"
              />
            </div>
          </div>
          <div className="flex justify-end mt-2.5 gap-2">
            {active && (
              <button
                onClick={() => {
                  onFilterChange(`${filterId}_from`, '');
                  onFilterChange(`${filterId}_to`, '');
                  setOpen(false);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                Clear
              </button>
            )}
            <button
              onClick={() => setOpen(false)}
              className="text-xs font-semibold text-white px-3 py-1 rounded-lg transition-all"
              style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}
            >
              Apply
            </button>
          </div>
        </div>
      </DropdownPortal>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   DataTable
───────────────────────────────────────────────────────────── */
const DataTable = ({
  columns           = [],
  data              = [],
  loading           = false,
  keyField          = 'id',
  onSort,
  emptyMessage      = 'No records found',
  className         = '',
  mobileCardRender,
  filters           = [],
  filterValues      = {},
  onFilterChange,
  onFilterReset,
  onExport,
  searchPlaceholder = 'Search…',
  toolbarLeft,
  toolbarRight,
}) => {
  const [sortKey, setSortKey]       = useState(null);
  const [sortDir, setSortDir]       = useState('asc');
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* ── Body scroll lock when mobile drawer open ── */
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerOpen]);

  /* ── Sort ── */
  const handleSort = (key) => {
    if (!key) return;
    const newDir = sortKey === key && sortDir === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDir(newDir);
    setSortKey(key);
    setSortDir(newDir);
    onSort?.(key, newDir);
  };

  const sortedData = onSort
    ? data
    : [...data].sort((a, b) => {
        if (!sortKey) return 0;
        const cmp = String(a[sortKey] ?? '').localeCompare(
          String(b[sortKey] ?? ''), undefined, { numeric: true },
        );
        return sortDir === 'asc' ? cmp : -cmp;
      });

  /* ── Active non-search filter count (for badge) ── */
  const activeCount = filters.filter(f => {
    if (f.type === 'search') return false;
    if (f.type === 'date-range') return filterValues[`${f.id}_from`] || filterValues[`${f.id}_to`];
    return filterValues[f.id] != null && filterValues[f.id] !== '';
  }).length;

  const hasToolbar = toolbarLeft || toolbarRight || onExport || filters.length > 0;

  const searchFilter  = filters.find(f => f.type === 'search');
  const selectFilters = filters.filter(f => f.type === 'select');
  const dateFilters   = filters.filter(f => f.type === 'date-range' || f.type === 'date');

  /* ─────────────────────────────────────────────
     DESKTOP toolbar
  ───────────────────────────────────────────── */
  const DesktopToolbar = hasToolbar && (
    <div className="hidden md:flex items-center gap-2 flex-wrap px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">

      {toolbarLeft && (
        <>
          {toolbarLeft}
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5 shrink-0" />
        </>
      )}

      {/* Search */}
      {searchFilter && (
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search
            size={13}
            className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
          />
          <input
            type="text"
            value={filterValues[searchFilter.id] ?? ''}
            onChange={e => onFilterChange?.(searchFilter.id, e.target.value)}
            placeholder={searchFilter.placeholder ?? searchPlaceholder}
            className="input-base pl-8 pr-8 h-8 text-xs"
          />
          {filterValues[searchFilter.id] && (
            <button
              onClick={() => onFilterChange?.(searchFilter.id, '')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-colors"
            >
              <X size={11} />
            </button>
          )}
        </div>
      )}

      {/* Select pills — portaled, no clipping */}
      {selectFilters.map(f => (
        <PillSelect
          key={f.id}
          label={f.label}
          value={filterValues[f.id] ?? ''}
          options={f.options ?? []}
          onChange={val => onFilterChange?.(f.id, val)}
        />
      ))}

      {/* Date range / date — portaled, no clipping */}
      {dateFilters.map(f =>
        f.type === 'date-range' ? (
          <DateRangePill
            key={f.id}
            filterId={f.id}
            filterValues={filterValues}
            onFilterChange={onFilterChange}
            label={f.label}
          />
        ) : (
          <div key={f.id} className="relative inline-flex items-center">
            <Calendar size={12} className="absolute left-2.5 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={filterValues[f.id] ?? ''}
              onChange={e => onFilterChange?.(f.id, e.target.value)}
              className="input-base h-8 text-xs pl-7"
            />
          </div>
        ),
      )}

      {/* Reset */}
      {onFilterReset && (
        <button
          onClick={onFilterReset}
          className={[
            'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold',
            'border transition-all duration-150',
            activeCount > 0
              ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              : 'bg-white dark:bg-slate-800/60 border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-600 cursor-default pointer-events-none',
          ].join(' ')}
        >
          <RotateCcw size={11} />
          Reset
        </button>
      )}

      {/* Export */}
      {onExport && (
        <button
          onClick={onExport}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold
                     text-slate-600 dark:text-slate-300
                     border border-slate-200 dark:border-slate-600
                     bg-white dark:bg-slate-800
                     hover:bg-slate-50 dark:hover:bg-slate-700
                     transition-all duration-150"
        >
          <Download size={12} />
          Export
        </button>
      )}

      {/* Right slot */}
      {toolbarRight && (
        <div className="ml-auto flex items-center gap-2">
          {toolbarRight}
        </div>
      )}
    </div>
  );

  /* ─────────────────────────────────────────────
     MOBILE toolbar
  ───────────────────────────────────────────── */
  const MobileToolbar = hasToolbar && (
    <div className="flex md:hidden flex-col gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">

      {toolbarLeft && (
        <div className="flex items-center gap-2 flex-wrap">{toolbarLeft}</div>
      )}

      <div className="flex items-center gap-2">
        {searchFilter && (
          <div className="relative flex-1 min-w-0">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
            />
            <input
              type="text"
              value={filterValues[searchFilter.id] ?? ''}
              onChange={e => onFilterChange?.(searchFilter.id, e.target.value)}
              placeholder={searchFilter.placeholder ?? searchPlaceholder}
              className="input-base pl-8 h-8 text-xs"
            />
          </div>
        )}

        {(selectFilters.length > 0 || dateFilters.length > 0) && (
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative inline-flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold shrink-0
                       text-slate-600 dark:text-slate-300
                       bg-white dark:bg-slate-800
                       border border-slate-200 dark:border-slate-600
                       hover:bg-slate-50 dark:hover:bg-slate-700
                       transition-all duration-200"
          >
            <SlidersHorizontal size={13} />
            Filters
            {activeCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}
              >
                {activeCount}
              </span>
            )}
          </button>
        )}

        {toolbarRight && (
          <div className="ml-auto flex items-center gap-2 shrink-0">{toolbarRight}</div>
        )}
      </div>
    </div>
  );

  /* ─────────────────────────────────────────────
     MOBILE drawer
  ───────────────────────────────────────────── */
  const MobileOptionGroup = ({ f }) => {
    const current = filterValues[f.id] ?? '';
    return (
      <div>
        {f.label && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{f.label}</p>
        )}
        <div className="flex flex-wrap gap-2">
          {(f.options ?? []).map(opt => {
            const selected = opt.value === current;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onFilterChange?.(f.id, opt.value)}
                className={[
                  'inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium',
                  'transition-all duration-150',
                  selected
                    ? 'bg-blue-500 border-blue-500 text-white dark:bg-blue-600 dark:border-blue-600'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300',
                ].join(' ')}
              >
                {selected && (
                  <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const MobileDateRange = ({ f }) => (
    <div>
      {f.label && (
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{f.label}</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">From</p>
          <input type="date" value={filterValues[`${f.id}_from`] ?? ''} onChange={e => onFilterChange?.(`${f.id}_from`, e.target.value)} className="input-base h-9 text-xs w-full" />
        </div>
        <div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">To</p>
          <input type="date" value={filterValues[`${f.id}_to`] ?? ''} onChange={e => onFilterChange?.(`${f.id}_to`, e.target.value)} className="input-base h-9 text-xs w-full" />
        </div>
      </div>
    </div>
  );

  const renderMobileControl = (f) => {
    if (f.type === 'select')     return <MobileOptionGroup key={f.id} f={f} />;
    if (f.type === 'date-range') return <MobileDateRange   key={f.id} f={f} />;
    if (f.type === 'date') {
      return (
        <div key={f.id}>
          {f.label && (
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">{f.label}</p>
          )}
          <input type="date" value={filterValues[f.id] ?? ''} onChange={e => onFilterChange?.(f.id, e.target.value)} className="input-base h-9 text-sm w-full" />
        </div>
      );
    }
    return null;
  };

  const MobileDrawer = drawerOpen && createPortal(
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
        style={{ animation: 'dtFadeIn 0.2s ease-out' }}
        onClick={() => setDrawerOpen(false)}
      />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-slate-900 rounded-t-2xl border-t border-slate-200 dark:border-slate-700/60 shadow-2xl"
        style={{ animation: 'dtSlideUp 0.25s ease-out' }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-slate-500 dark:text-slate-400" />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Filters</p>
            {activeCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold text-white" style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
                {activeCount} active
              </span>
            )}
          </div>
          <button onClick={() => setDrawerOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4 max-h-[55vh] overflow-y-auto">
          {[...selectFilters, ...dateFilters].map(f => renderMobileControl(f))}
        </div>
        <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100 dark:border-slate-800">
          {onFilterReset && (
            <button
              onClick={() => { onFilterReset(); setDrawerOpen(false); }}
              className="flex-1 h-10 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            >
              Reset
            </button>
          )}
          <button
            onClick={() => setDrawerOpen(false)}
            className="flex-1 h-10 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}
          >
            Apply
          </button>
        </div>
        <div className="h-5" />
      </div>
    </>,
    document.body,
  );

  /* ─── Skeletons ─── */
  const SkeletonDesktop = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <tr key={i} className="opacity-70">
        {columns.map(col => (
          <td key={col.key}>
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse" style={{ width: `${45 + (i * 13) % 45}%` }} />
          </td>
        ))}
      </tr>
    ));

  const SkeletonMobile = () =>
    Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="px-4 py-4 flex items-center justify-between gap-3 animate-pulse">
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/3" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/2" />
          <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-lg w-1/4" />
        </div>
        <div className="h-5 w-14 bg-slate-100 dark:bg-slate-800 rounded-lg" />
      </div>
    ));

  /* ─── Auto mobile card ─── */
  const AutoMobileCard = ({ row }) => {
    const visible   = columns.filter(c => !c.mobileHidden);
    const [primary, ...rest] = visible;
    const actionCol = columns.find(c => c.mobileAction);
    const bodycols  = rest.filter(c => !c.mobileAction);
    return (
      <div className="px-4 py-3.5 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-0.5">
          {primary && (
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
              {primary.render ? primary.render(row[primary.key], row, 0) : (row[primary.key] ?? '—')}
            </div>
          )}
          {bodycols.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-1">
              {bodycols.map(col => (
                <span key={col.key} className="text-xs text-slate-500 dark:text-slate-400">
                  {col.mobileLabel !== false && col.label && (
                    <span className="text-slate-400 dark:text-slate-500 mr-1">{col.label}:</span>
                  )}
                  {col.render ? col.render(row[col.key], row, 0) : (row[col.key] ?? '—')}
                </span>
              ))}
            </div>
          )}
        </div>
        {actionCol && (
          <div className="shrink-0 flex items-center">
            {actionCol.render ? actionCol.render(row[actionCol.key], row, 0) : (row[actionCol.key] ?? null)}
          </div>
        )}
      </div>
    );
  };

  /* ─── Mobile list ─── */
  const MobileList = () => {
    if (loading) return <SkeletonMobile />;
    if (sortedData.length === 0)
      return <div className="py-16 text-center"><EmptyState message={emptyMessage} /></div>;
    return sortedData.map((row, rowIdx) => (
      <div key={row[keyField] ?? rowIdx} className="border-b border-slate-100 dark:border-slate-800 last:border-b-0 animate-fade-in">
        {mobileCardRender ? mobileCardRender(row) : <AutoMobileCard row={row} />}
      </div>
    ));
  };

  /* ─── Main render ─── */
  return (
    <>
      <div className={[
        'overflow-hidden rounded-2xl border shadow-sm',
        'bg-white dark:bg-slate-900',
        'border-slate-100 dark:border-slate-700/60',
        className,
      ].join(' ')}>

        {DesktopToolbar}
        {MobileToolbar}

        {/* Desktop table — overflow-x-auto scoped here, rounded-b-2xl fixes clipped corners */}
        <div className="hidden md:block overflow-x-auto rounded-b-2xl">
          <table className="table-base">
            <thead>
              <tr>
                {columns.map(col => (
                  <th
                    key={col.key}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={() => col.sortable && handleSort(col.key)}
                    className={col.sortable ? 'cursor-pointer select-none hover:text-blue-500 transition-colors' : ''}
                  >
                    <span className="flex items-center">
                      {col.label}
                      <SortIcon col={col} sortKey={sortKey} sortDir={sortDir} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonDesktop />
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="py-16 text-center">
                    <EmptyState message={emptyMessage} />
                  </td>
                </tr>
              ) : (
                sortedData.map((row, rowIdx) => (
                  <tr key={row[keyField] ?? rowIdx} className="animate-fade-in">
                    {columns.map(col => (
                      <td key={col.key}>
                        {col.render
                          ? col.render(row[col.key], row, rowIdx)
                          : (row[col.key] ?? '—')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden">
          <MobileList />
        </div>
      </div>

      {MobileDrawer}
    </>
  );
};

export default DataTable;
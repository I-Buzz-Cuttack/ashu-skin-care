// src/components/tables/Pagination/Pagination.jsx
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

/**
 * Pagination
 *
 * Props:
 *  page         – current page (1-based)
 *  totalPages   – total number of pages
 *  onPageChange – (page: number) => void
 *  totalItems   – optional, total record count (for "Showing X–Y of Z" label)
 *  pageSize     – optional, records per page (for label calculation)
 *  siblingCount – number of sibling pages either side of current (default 1)
 *  className    – string
 */
const Pagination = ({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  siblingCount = 1,
  className = '',
}) => {
  if (!totalPages || totalPages <= 1) return null;

  /* ── Build page number sequence ── */
  const buildPages = () => {
    const left  = Math.max(2, page - siblingCount);
    const right = Math.min(totalPages - 1, page + siblingCount);
    const pages = [1];
    if (left > 2)  pages.push('start-ellipsis');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('end-ellipsis');
    if (totalPages > 1) pages.push(totalPages);
    return pages;
  };

  const pages = buildPages();

  /* ── Styles ── */
  const btnBase = [
    'flex items-center justify-center w-8 h-8 rounded-lg text-xs font-semibold',
    'transition-all duration-150 select-none',
  ].join(' ');

  const btnNormal = [
    'text-slate-500 dark:text-slate-400',
    'hover:bg-slate-100 dark:hover:bg-slate-800',
    'hover:text-slate-800 dark:hover:text-slate-200',
  ].join(' ');

  const btnActive  = 'text-white shadow-sm';
  const btnDisabled = 'opacity-30 cursor-not-allowed pointer-events-none';

  const PageBtn = ({ value }) => {
    const isActive = value === page;
    return (
      <button
        type="button"
        aria-label={`Page ${value}`}
        aria-current={isActive ? 'page' : undefined}
        onClick={() => onPageChange(value)}
        style={isActive ? { background: 'linear-gradient(135deg,#3b82f6,#6366f1)' } : undefined}
        className={[btnBase, isActive ? btnActive : btnNormal].join(' ')}
      >
        {value}
      </button>
    );
  };

  const NavBtn = ({ icon: Icon, disabled, label, onClick }) => (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={[btnBase, disabled ? btnDisabled : btnNormal].join(' ')}
    >
      <Icon size={14} />
    </button>
  );

  /* ── Range label ── */
  const rangeLabel = (() => {
    if (totalItems === undefined || !pageSize) return null;
    const start = Math.min((page - 1) * pageSize + 1, totalItems);
    const end   = Math.min(page * pageSize, totalItems);
    return (
      <p className="text-xs text-slate-400 dark:text-slate-500">
        Showing{' '}
        <span className="font-semibold text-slate-600 dark:text-slate-300">{start}–{end}</span>
        {' '}of{' '}
        <span className="font-semibold text-slate-600 dark:text-slate-300">{totalItems}</span>
      </p>
    );
  })();

  return (
    <div className={[
      // Stack vertically on mobile, row on sm+
      'flex flex-col sm:flex-row items-center justify-between gap-3 px-1',
      className,
    ].join(' ')}>

      {/* Range label — centred on mobile, left on sm+ */}
      {rangeLabel && (
        <div className="w-full sm:w-auto text-center sm:text-left">
          {rangeLabel}
        </div>
      )}

      <div className="flex items-center gap-1" role="navigation" aria-label="Pagination">
        {/* First — hidden on mobile to save space */}
        <span className="hidden sm:inline-flex">
          <NavBtn
            icon={ChevronsLeft}
            label="First page"
            disabled={page === 1}
            onClick={() => onPageChange(1)}
          />
        </span>

        {/* Prev */}
        <NavBtn
          icon={ChevronLeft}
          label="Previous page"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
        />

        {/* Page numbers */}
        {pages.map((p) =>
          typeof p === 'string' ? (
            <span
              key={p}
              className="w-8 text-center text-slate-300 dark:text-slate-600 text-xs"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <PageBtn key={p} value={p} />
          )
        )}

        {/* Next */}
        <NavBtn
          icon={ChevronRight}
          label="Next page"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
        />

        {/* Last — hidden on mobile */}
        <span className="hidden sm:inline-flex">
          <NavBtn
            icon={ChevronsRight}
            label="Last page"
            disabled={page === totalPages}
            onClick={() => onPageChange(totalPages)}
          />
        </span>
      </div>
    </div>
  );
};

export default Pagination;
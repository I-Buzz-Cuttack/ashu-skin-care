// src/utils/pagination.utils.js

/**
 * buildPaginationMeta — compute pagination metadata from API response.
 *
 * Usage:
 *   const meta = buildPaginationMeta({ total: 127, page: 3, limit: 10 });
 *   // → { totalPages: 13, from: 21, to: 30, hasNext: true, hasPrev: true }
 */
export const buildPaginationMeta = ({ total = 0, page = 1, limit = 10 }) => {
  const totalPages = Math.ceil(total / limit) || 1;
  const from       = total === 0 ? 0 : (page - 1) * limit + 1;
  const to         = Math.min(page * limit, total);
  return {
    totalPages,
    from,
    to,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};

/**
 * getPageNumbers — returns an array of page numbers with '...' ellipsis.
 * Used by the Pagination component internally.
 */
export const getPageNumbers = (current, total, delta = 2) => {
  const pages = [];
  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }
  return pages;
};

/**
 * DEFAULT_PAGE_SIZE_OPTIONS — common page size options for <Select>.
 */
export const PAGE_SIZE_OPTIONS = [
  { value: 10,  label: '10 per page' },
  { value: 25,  label: '25 per page' },
  { value: 50,  label: '50 per page' },
  { value: 100, label: '100 per page' },
];

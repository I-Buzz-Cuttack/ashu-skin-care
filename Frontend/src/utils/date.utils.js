// src/utils/date.utils.js
/**
 * Format a date string or Date object.
 * Usage: formatDate('2024-03-28') → '28 Mar 2024'
 */
export const formatDate = (date, opts = {}) => {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d)) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', ...opts,
  });
};

/**
 * formatDateTime — '28 Mar 2024, 10:30 AM'
 */
export const formatDateTime = (date) => {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d)) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

/**
 * calcAge — returns age from DOB string.
 * Usage: calcAge('1990-01-15') → 34
 */
export const calcAge = (dob) => {
  if (!dob) return '—';
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

/**
 * timeAgo — '2 hours ago'
 */
export const timeAgo = (date) => {
  if (!date) return '—';
  const d   = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60)    return `${diff}s ago`;
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

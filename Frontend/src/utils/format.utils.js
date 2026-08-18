// src/utils/format.utils.js

/**
 * formatCurrency — ₹12,500 or ₹1.2L
 */
export const formatCurrency = (amount, compact = false) => {
  if (amount === null || amount === undefined) return '—';
  if (compact && amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (compact && amount >= 1000)   return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${Number(amount).toLocaleString('en-IN')}`;
};

/**
 * formatPhone — 9876543210 → +91 98765 43210
 */
export const formatPhone = (phone) => {
  if (!phone) return '—';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return `+91 ${digits.slice(0,5)} ${digits.slice(5)}`;
  return phone;
};

/**
 * capitalize — 'hello world' → 'Hello World'
 */
export const capitalize = (str) =>
  str ? str.replace(/\b\w/g, (c) => c.toUpperCase()) : '';

/**
 * truncate — 'Long string...' → 'Long str...'
 */
export const truncate = (str, max = 30) =>
  str && str.length > max ? `${str.slice(0, max)}…` : str || '';

/**
 * getInitials — 'John Doe' → 'JD'
 */
export const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase();

/**
 * formatFileSize — 1048576 → '1.0 MB'
 */
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

// src/components/ui/Badge/Badge.jsx
const VARIANTS = {
  success: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50',
  danger:  'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50',
  warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50',
  info:    'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800/50',
  primary: 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800/50',
  default: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
  purple:  'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800/50',
  pink:    'bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 border border-pink-200 dark:border-pink-800/50',
  teal:    'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/50',
};

const DOT_COLORS = {
  success: 'bg-emerald-500', danger:  'bg-red-500',
  warning: 'bg-amber-500',  info:    'bg-primary-500',
  primary: 'bg-primary-500', default: 'bg-slate-400',
  purple:  'bg-purple-500', pink:    'bg-pink-500',
  teal:    'bg-teal-500',
};

const Badge = ({ children, variant = 'default', dot = false, className = '' }) => (
  <span className={['badge font-display', VARIANTS[variant] || VARIANTS.default, className].join(' ')}>
    {dot && <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[variant] || DOT_COLORS.default}`} />}
    {children}
  </span>
);

export default Badge;

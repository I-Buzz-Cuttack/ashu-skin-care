// src/components/feedback/Alert/Alert.jsx
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const VARIANTS = {
  success: {
    border: 'border-emerald-200 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/20',
    icon: CheckCircle2, iconCls: 'text-emerald-500',
    textCls: 'text-emerald-800 dark:text-emerald-300',
    titleCls: 'text-emerald-900 dark:text-emerald-200',
  },
  error: {
    border: 'border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20',
    icon: XCircle, iconCls: 'text-red-500',
    textCls: 'text-red-700 dark:text-red-300',
    titleCls: 'text-red-900 dark:text-red-200',
  },
  warning: {
    border: 'border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-900/20',
    icon: AlertTriangle, iconCls: 'text-amber-500',
    textCls: 'text-amber-700 dark:text-amber-300',
    titleCls: 'text-amber-900 dark:text-amber-200',
  },
  info: {
    border: 'border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/20',
    icon: Info, iconCls: 'text-blue-500',
    textCls: 'text-blue-700 dark:text-blue-300',
    titleCls: 'text-blue-900 dark:text-blue-200',
  },
};

const Alert = ({ variant = 'info', title, message, onClose, onDismiss, className = '' }) => {
  const s = VARIANTS[variant] || VARIANTS.info;
  const Icon = s.icon;
  const handleClose = onClose || onDismiss;

  return (
    <div className={['flex gap-3 p-4 rounded-2xl border', s.border, className].join(' ')}>
      <Icon size={17} className={`${s.iconCls} shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        {title && <p className={`text-sm font-semibold font-display ${s.titleCls}`}>{title}</p>}
        {message && <p className={`text-sm mt-0.5 leading-relaxed ${s.textCls}`}>{message}</p>}
      </div>
      {handleClose && (
        <button onClick={handleClose} className={`p-1 rounded-lg ${s.iconCls} hover:opacity-70 transition-opacity shrink-0 -mt-0.5 -mr-0.5`}>
          <X size={14} />
        </button>
      )}
    </div>
  );
};

export default Alert;

// src/components/feedback/Toast/Toast.jsx
import { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const VARIANTS = {
  success: { icon: CheckCircle2, cls: 'text-emerald-500', bar: 'bg-emerald-500' },
  error:   { icon: XCircle,      cls: 'text-red-500',     bar: 'bg-red-500'     },
  warning: { icon: AlertTriangle,cls: 'text-amber-500',   bar: 'bg-amber-500'   },
  info:    { icon: Info,         cls: 'text-blue-500',    bar: 'bg-blue-500'    },
};

let _addToast = null;
export const toast = {
  success: (msg, opts) => _addToast?.({ variant: 'success', message: msg, ...opts }),
  error:   (msg, opts) => _addToast?.({ variant: 'error',   message: msg, ...opts }),
  warning: (msg, opts) => _addToast?.({ variant: 'warning', message: msg, ...opts }),
  info:    (msg, opts) => _addToast?.({ variant: 'info',    message: msg, ...opts }),
};

const ToastItem = ({ id, variant = 'info', title, message, duration = 4000, onRemove }) => {
  const s = VARIANTS[variant] || VARIANTS.info;
  const Icon = s.icon;

  useEffect(() => {
    const t = setTimeout(() => onRemove(id), duration);
    return () => clearTimeout(t);
  }, [id, duration, onRemove]);

  return (
    <div className="relative flex items-start gap-3 p-4 pr-10 rounded-2xl shadow-xl overflow-hidden animate-slide-up
                    bg-white dark:bg-slate-800
                    border border-slate-100 dark:border-slate-700/60
                    min-w-[280px] max-w-sm">
      <Icon size={18} className={`${s.cls} shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold font-display text-slate-900 dark:text-slate-100">{title}</p>}
        {message && <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{message}</p>}
      </div>
      <button
        onClick={() => onRemove(id)}
        className="absolute top-3 right-3 p-1 rounded-lg text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
      >
        <X size={13} />
      </button>
      <div className={`absolute bottom-0 left-0 h-0.5 w-full ${s.bar} opacity-40`} />
    </div>
  );
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((t) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { ...t, id }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => { _addToast = addToast; return () => { _addToast = null; }; }, [addToast]);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 items-end pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem {...t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

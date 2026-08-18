// src/components/feedback/EmptyState/EmptyState.jsx
import { Inbox } from 'lucide-react';

const EmptyState = ({ message = 'No records found', description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
      <Inbox size={22} className="text-slate-300 dark:text-slate-600" />
    </div>
    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 font-display">{message}</p>
    {description && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-xs">{description}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;

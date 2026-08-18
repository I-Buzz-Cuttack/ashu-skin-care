import { Calendar } from 'lucide-react';

const DateBar = ({ value = {}, onChange, className = "" }) => {
  return (
    <div
      className={`flex items-center gap-2 w-full sm:w-[420px] px-3 py-2 rounded-xl border
      bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 ${className}`}
    >
      {/* Icon */}
      <Calendar size={16} className="text-slate-400" />

      {/* FROM DATE */}
      <div className="relative w-full">
        {!value.from && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
            dd-mm-yyyy
          </span>
        )}
        <input
          type="date"
          value={value.from || ""}
          onChange={(e) => onChange({ ...value, from: e.target.value })}
          className={`bg-transparent outline-none text-sm w-full relative z-10
            ${!value.from ? "text-transparent" : "text-slate-700 dark:text-slate-200"}`}
        />
      </div>

      <span className="text-slate-400 text-xs">to</span>

      {/* TO DATE */}
      <div className="relative w-full">
        {!value.to && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
            dd-mm-yyyy
          </span>
        )}
        <input
          type="date"
          value={value.to || ""}
          onChange={(e) => onChange({ ...value, to: e.target.value })}
          className={`bg-transparent outline-none text-sm w-full relative z-10
            ${!value.to ? "text-transparent" : "text-slate-700 dark:text-slate-200"}`}
        />
      </div>

      {/* CLEAR BUTTON */}
      {(value.from || value.to) && (
        <button
          onClick={() => onChange({ from: "", to: "" })}
          className="text-xs text-red-500 hover:underline"
        >
          Clear
        </button>
      )}
    </div>
  );
};

export default DateBar;
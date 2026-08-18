// src/components/forms/FormField/FormField.jsx
const FormField = ({ label, error, hint, required, children, className = '' }) => (
  <div className={['flex flex-col gap-1.5', className].join(' ')}>
    {label && (
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-display uppercase tracking-wider">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    {children}
    {error && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>}
    {hint && !error && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
  </div>
);

export default FormField;

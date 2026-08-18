// src/components/ui/Select/Select.jsx
import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(({
  label, error, hint, options = [], placeholder = 'Select…',
  className = '', selectClassName = '', required, ...props
}, ref) => (
  <div className={['flex flex-col gap-1.5', className].join(' ')}>
    {label && (
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-display uppercase tracking-wider">
        {label}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <div className="relative">
      <select
        ref={ref}
        className={['input-base appearance-none pr-9', error ? 'error' : '', selectClassName].join(' ')}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 pointer-events-none" />
    </div>
    {error && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>}
    {hint && !error && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
  </div>
));

Select.displayName = 'Select';
export default Select;

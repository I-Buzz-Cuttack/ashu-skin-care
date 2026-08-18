// src/components/ui/Input/Input.jsx
import { forwardRef } from 'react';

const Input = forwardRef(({
  label, error, hint, icon, iconPosition = 'left',
  leftIcon, rightIcon,
  className = '', inputClassName = '', required, ...props
}, ref) => (
  <div className={['flex flex-col gap-1.5', className].join(' ')}>
    {label && (
      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 font-display uppercase tracking-wider">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <div className="relative">
      {(icon && iconPosition === 'left' || leftIcon) && (
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 pointer-events-none">
          {leftIcon || icon}
        </span>
      )}
      <input
        ref={ref}
        className={[
          'input-base',
          (icon && iconPosition === 'left' || leftIcon) ? 'pl-10' : '',
          (icon && iconPosition === 'right' || rightIcon) ? 'pr-10' : '',
          error ? 'error' : '',
          inputClassName,
        ].join(' ')}
        {...props}
      />
      {(icon && iconPosition === 'right' || rightIcon) && (
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-600 pointer-events-none">
          {rightIcon || icon}
        </span>
      )}
    </div>
    {error && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>}
    {hint && !error && <p className="text-xs text-slate-400 dark:text-slate-500">{hint}</p>}
  </div>
));

Input.displayName = 'Input';
export default Input;

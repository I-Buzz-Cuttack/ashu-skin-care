// src/components/ui/Button/Button.jsx
import Spinner from '../Spinner/Spinner';
import { useLocation } from 'react-router-dom';
import usePermission from '@hooks/usePermission';
import {
  extractNodeText,
  resolveActionPermission,
} from '@utils/actionPermission.utils';

const VARIANTS = {
  primary:   'text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0',
  secondary: 'bg-white dark:bg-slate-800 text-surface-700 dark:text-slate-200 border border-surface-200 dark:border-slate-600 hover:bg-primary-50 dark:hover:bg-slate-700 hover:border-primary-300 dark:hover:border-slate-500',
  danger:    'text-white shadow-md hover:-translate-y-0.5 hover:shadow-lg',
  ghost:     'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100',
  outline:   'border border-primary-300 dark:border-primary-700 text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40',
};

const GRADIENT = {
  primary: 'linear-gradient(135deg, #0f766e 0%, #0d9488 55%, #14b895 100%)',
  danger:  'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
};

const SIZES = {
  xs: 'px-2.5 py-1.5 text-xs gap-1',
  sm: 'px-3 py-2 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-5 py-3 text-base gap-2',
};

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  permissionResource,
  permissionAction,
  permissionMode = 'hide',
  noPermissionCheck = false,
  icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  fullWidth = false,
  leftIcon,
  rightIcon,
  ...props
}) => {
  const location = useLocation();
  const { can } = usePermission();
  const isDisabled = disabled || loading;
  const hasGradient = GRADIENT[variant];
  const iconEl = icon || leftIcon;
  const permission = noPermissionCheck
    ? null
    : resolveActionPermission({
        pathname: location.pathname,
        label: extractNodeText(children),
        resource: permissionResource,
        action: permissionAction,
      });
  const isAllowed = !permission?.resource || can(permission.resource, permission.action);
  const isPermissionDisabled = !isAllowed && permissionMode === 'disable';
  const finalDisabled = isDisabled || isPermissionDisabled;

  if (!isAllowed && permissionMode === 'hide') return null;

  return (
    <button
      type={type}
      disabled={finalDisabled}
      onClick={onClick}
      style={hasGradient ? { background: hasGradient } : undefined}
      className={[
        'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 font-display',
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        fullWidth ? 'w-full' : '',
        finalDisabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
        className,
      ].join(' ')}
      {...props}
    >
      {loading ? (
        <Spinner size="sm" className={variant === 'primary' || variant === 'danger' ? 'text-white' : 'text-current'} />
      ) : (
        <>
          {iconEl && iconPosition === 'left' && <span className="shrink-0">{iconEl}</span>}
          {children}
          {(icon && iconPosition === 'right' || rightIcon) && <span className="shrink-0">{rightIcon || icon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;

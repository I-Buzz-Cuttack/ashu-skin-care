import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const GRADIENTS = {
  blue:    'linear-gradient(135deg, #0f766e 0%, #0d9488 100%)',
  green:   'linear-gradient(135deg, #2f7d5b 0%, #0f766e 100%)',
  amber:   'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  red:     'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
  purple:  'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
  teal:    'linear-gradient(135deg, #14b895 0%, #0f766e 100%)',
  pink:    'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
  indigo:  'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
};

function getGradient(iconBg = '') {
  if (iconBg.includes('blue')   || iconBg.includes('primary'))   return GRADIENTS.blue;
  if (iconBg.includes('green')  || iconBg.includes('emerald') || iconBg.includes('secondary')) return GRADIENTS.green;
  if (iconBg.includes('amber')  || iconBg.includes('yellow')  || iconBg.includes('accent'))    return GRADIENTS.amber;
  if (iconBg.includes('red')    || iconBg.includes('danger'))    return GRADIENTS.red;
  if (iconBg.includes('purple') || iconBg.includes('violet'))    return GRADIENTS.purple;
  if (iconBg.includes('teal'))   return GRADIENTS.teal;
  if (iconBg.includes('pink'))   return GRADIENTS.pink;
  if (iconBg.includes('indigo')) return GRADIENTS.indigo;
  return GRADIENTS.teal;
}

const StatCard = ({
  title, value, change, changeType = 'neutral',
  icon, iconBg = 'bg-teal-100', iconColor = 'text-teal-600',
  description, loading = false, className = '',
}) => {
  const TrendIcon =
    changeType === 'increase' ? TrendingUp  :
    changeType === 'decrease' ? TrendingDown : Minus;

  const trendColor =
    changeType === 'increase' ? 'text-emerald-600 dark:text-emerald-400' :
    changeType === 'decrease' ? 'text-rose-500 dark:text-rose-400' :
                                'text-slate-400 dark:text-slate-500';

  const trendBg =
    changeType === 'increase' ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/50' :
    changeType === 'decrease' ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/50' :
                                'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';

  const gradient = getGradient(iconBg);

  return (
    <div className={[
      'relative overflow-hidden rounded-2xl',
      'bg-white dark:bg-slate-900/90',
      'border border-primary-100/90 dark:border-slate-800',
      'shadow-lg shadow-surface-200/50 dark:shadow-black/20 p-5 transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-1 group',
      className,
    ].join(' ')}>

      {/* Subtle ambient bg glow */}
      <div
        className="absolute top-0 right-0 w-36 h-36 rounded-full opacity-10 pointer-events-none -translate-y-8 translate-x-8 transition-opacity group-hover:opacity-20 blur-xl"
        style={{ background: gradient }}
      />

      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2 font-display">
            {title}
          </p>

          {loading ? (
            <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          ) : (
            <p className="text-2xl md:text-3xl font-extrabold text-surface-900 dark:text-white leading-tight tracking-normal truncate">
              {value ?? '—'}
            </p>
          )}

          {change && !loading && (
            <div className={[
              'inline-flex items-center gap-1.5 mt-3',
              'text-xs font-bold px-2 py-0.5 rounded-lg border',
              trendBg, trendColor,
            ].join(' ')}>
              <TrendIcon size={12} />
              <span>{change}</span>
              {description && (
                <span className="text-slate-400 dark:text-slate-500 font-normal ml-0.5 hidden sm:inline">
                  {description}
                </span>
              )}
            </div>
          )}

          {!change && description && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
              {description}
            </p>
          )}
        </div>

        {icon && (
          <div
            className="w-11 h-11 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary-500/20"
            style={{ background: gradient }}
          >
            <span className="text-white [&>svg]:w-5 [&>svg]:h-5">
              {icon}
            </span>
          </div>
        )}
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl"
        style={{ background: gradient }}
      />
    </div>
  );
};

export default StatCard;

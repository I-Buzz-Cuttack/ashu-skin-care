// src/components/ui/Avatar/Avatar.jsx
const SIZES = {
  xs: 'w-6 h-6 text-[9px]',
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

const getInitials = (name = '') =>
  name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

const Avatar = ({ name = '', src, size = 'md', className = '' }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={['rounded-xl object-cover', SIZES[size] || SIZES.md, className].join(' ')}
      />
    );
  }
  return (
    <div className={[
      'rounded-xl flex items-center justify-center font-bold font-display shrink-0',
      'bg-gradient-to-br from-blue-500 to-indigo-600 text-white',
      SIZES[size] || SIZES.md, className,
    ].join(' ')}>
      {getInitials(name)}
    </div>
  );
};

export default Avatar;

// src/components/forms/SearchBar/SearchBar.jsx
import { Search, X } from 'lucide-react';
import { useState } from 'react';

const SearchBar = ({ placeholder = 'Search…', value, onChange, onClear, className = '' }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className={['relative flex items-center', className].join(' ')}>
      <Search size={14} className={`absolute left-3.5 pointer-events-none transition-colors ${focused ? 'text-blue-500' : 'text-slate-300 dark:text-slate-600'}`} />
      <input
        type="text"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className="input-base pl-10 pr-9"
      />
      {value && (
        <button onClick={onClear}
          className="absolute right-3 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors">
          <X size={13} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;

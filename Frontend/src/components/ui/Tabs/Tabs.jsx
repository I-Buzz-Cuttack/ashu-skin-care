// src/components/ui/Tabs/Tabs.jsx
const Tabs = ({ tabs = [], active, activeTab, onChange, className = '' }) => {
  const current = active ?? activeTab;
  return (
    <div className={['flex gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl', className].join(' ')}>
      {tabs.map(tab => (
        <button
          key={tab.value ?? tab.key}
          onClick={() => onChange(tab.value ?? tab.key)}
          className={[
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold font-display transition-all duration-200',
            current === (tab.value ?? tab.key)
              ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
          ].join(' ')}
        >
          {tab.icon && <span className="shrink-0">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md
              ${current === (tab.value ?? tab.key)
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500'}`}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs;

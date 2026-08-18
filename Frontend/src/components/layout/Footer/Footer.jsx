// src/components/layout/Footer/Footer.jsx
import { Heart } from 'lucide-react';

const Footer = () => (
  <footer className="global-footer">
    <div className="flex items-center gap-2">
      <span className="font-semibold text-slate-500 dark:text-slate-400 font-display">Ashu Clinic</span>
      <span className="text-slate-300 dark:text-slate-700">·</span>
      <span>© {new Date().getFullYear()} Ashu Skin Care</span>
    </div>
    <div className="hidden sm:flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        <span className="text-slate-400 dark:text-slate-500">Ashu Clinic</span>
        <span className="text-slate-300 dark:text-slate-700">·</span>
        <span className="text-slate-400 dark:text-slate-500">All Systems Operational</span>
      </div>
      <span className="text-slate-300 dark:text-slate-700">·</span>
      <span className="text-slate-400 dark:text-slate-500">
        {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
      </span>
    </div>
    <div className="flex items-center gap-1 text-slate-300 dark:text-slate-600">
      Built with <Heart size={10} className="text-red-400 mx-0.5" /> v1.0.0
    </div>
  </footer>
);

export default Footer;

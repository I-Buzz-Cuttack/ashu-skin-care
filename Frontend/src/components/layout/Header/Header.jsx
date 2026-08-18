// src/components/layout/Header/Header.jsx
import {
  Menu, Bell, Search, LogOut, User, Settings,
  Activity, Sparkles, Sun, Moon, X, ChevronRight, BedSingle,
  Calendar, Users, Stethoscope, FlaskConical, FileText,
  LayoutDashboard, Bed, Pill, ClipboardList, CreditCard,
  UserCog, Building2, BarChart2, Syringe
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toggleSidebar, toggleCollapse } from '@store/slices/uiSlice';
import { clearAuth, selectCurrentUser, selectCurrentRole } from '@store/slices/authSlice';
import { selectUnreadCount, setUnreadCount } from '@store/slices/notificationSlice';
import { ROLE_LABELS } from '@constants/roles';
import { ROUTES } from '@constants/routes';
import Avatar from '../../ui/Avatar/Avatar';
import { useOutsideClick } from '@hooks/useOutsideClick';
import { useTheme } from '@context/ThemeContext';
import { resolveRolePath } from '@utils/rolePath.utils';
import apiClient from '@api/apiClient';

/* ── Searchable Modules ── */
const SEARCH_MODULES = [
  { label: 'Dashboard',         path: '/super-admin/dashboard',          icon: LayoutDashboard,  category: 'Main' },
  { label: 'Patients',          path: '/super-admin/patients',           icon: Users,            category: 'Main' },
  { label: 'Doctors',           path: '/super-admin/doctors',            icon: Stethoscope,      category: 'Staff' },
  { label: 'Staff Management',  path: '/super-admin/staff',              icon: UserCog,          category: 'Staff' },
  { label: 'Appointments',      path: '/super-admin/appointments',       icon: Calendar,         category: 'OPD' },
  { label: 'OPD',               path: '/super-admin/opd',                icon: ClipboardList,    category: 'OPD' },
  { label: 'IPD',               path: '/super-admin/ipd',                icon: Bed,              category: 'IPD' },
  { label: 'Bed Status',        path: '/super-admin/ipd/bed-status',     icon: BedSingle,        category: 'IPD' },
  { label: 'Lab',               path: '/super-admin/lab',                icon: FlaskConical,     category: 'Lab' },
  { label: 'Pharmacy',          path: '/super-admin/pharmacy',           icon: Pill,             category: 'Pharmacy' },
  { label: 'Billing',           path: '/super-admin/billing',            icon: CreditCard,       category: 'Finance' },
  { label: 'Reports',           path: '/super-admin/reports',            icon: BarChart2,        category: 'Finance' },
  { label: 'Documents',         path: '/super-admin/documents',          icon: FileText,         category: 'Admin' },
  { label: 'Departments',       path: '/super-admin/departments',        icon: Building2,        category: 'Admin' },
  { label: 'Vaccinations',      path: '/super-admin/vaccinations',       icon: Syringe,          category: 'Clinical' },
  { label: 'Settings',          path: ROUTES.SETTINGS,                   icon: Settings,         category: 'Admin' },
];

/* ── Mock notifications ── */
const MOCK_NOTIFS = [
  { id: 1, title: 'New patient registered',       description: 'Patient Ravi Kumar admitted to Ward 4.',   time: '2m ago',  type: 'info',    read: false },
  { id: 2, title: 'Lab results ready — John Doe', description: 'CBC and LFT reports available for review.', time: '15m ago', type: 'success', read: false },
  { id: 3, title: 'Appointment cancelled',        description: 'Dr. Priya cancelled the 3 PM slot.',        time: '1h ago',  type: 'warning', read: true  },
];

const NOTIF_DOT = {
  info:    'bg-blue-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error:   'bg-red-500',
};

/* ── Sub-components ── */
const NotifRow = ({ notif, onRead }) => (
  <div
    onClick={() => onRead(notif.id)}
    className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors duration-150
      hover:bg-slate-50 dark:hover:bg-slate-800/60
      ${!notif.read
        ? 'bg-blue-50/40 dark:bg-blue-900/10'
        : 'bg-white dark:bg-transparent'
      }`}
  >
    <span className={`mt-[7px] w-1.5 h-1.5 rounded-full shrink-0 ${NOTIF_DOT[notif.type] ?? 'bg-slate-400'}`} />
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
        {notif.title}
      </p>
      {notif.description && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2">
          {notif.description}
        </p>
      )}
      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{notif.time}</p>
    </div>
    {!notif.read && (
      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
    )}
  </div>
);

const UserSkeleton = () => (
  <div className="flex items-center gap-2.5 px-2.5 py-1.5">
    <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
    <div className="hidden sm:block space-y-1.5">
      <div className="w-20 h-2.5 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
      <div className="w-14 h-2 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
    </div>
  </div>
);

/* ── Search Result Row ── */
const SearchResultRow = ({ item, onSelect, isHighlighted }) => {
  const Icon = item.icon;
  return (
    <button
      onMouseDown={(e) => { e.preventDefault(); onSelect(item); }}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-100
        ${isHighlighted
          ? 'bg-blue-50 dark:bg-blue-900/30'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
        }`}
    >
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0
        ${isHighlighted
          ? 'bg-blue-100 dark:bg-blue-900/50'
          : 'bg-slate-100 dark:bg-slate-700/60'
        }`}>
        <Icon
          size={13}
          className={isHighlighted
            ? 'text-blue-500 dark:text-blue-400'
            : 'text-slate-500 dark:text-slate-400'
          }
        />
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate
          ${isHighlighted
            ? 'text-blue-700 dark:text-blue-300'
            : 'text-slate-700 dark:text-slate-200'
          }`}>
          {item.label}
        </p>
      </div>
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md
        ${isHighlighted
          ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-500 dark:text-blue-400'
          : 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500'
        }`}>
        {item.category}
      </span>
    </button>
  );
};

/* ── Main Header ── */
const Header = () => {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const location    = useLocation();
  const user        = useSelector(selectCurrentUser);
  const role        = useSelector(selectCurrentRole);
  const unreadCount = useSelector(selectUnreadCount);

  const [notifs,         setNotifs]         = useState(MOCK_NOTIFS);
  const [profileOpen,    setProfileOpen]    = useState(false);
  const [notifOpen,      setNotifOpen]      = useState(false);
  const [searchValue,    setSearchValue]    = useState('');
  const [searchFocused,  setSearchFocused]  = useState(false);
  const [searchResults,  setSearchResults]  = useState([]);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);

  const profileRef  = useRef(null);
  const notifRef    = useRef(null);
  const searchRef   = useRef(null);
  const searchBoxRef = useRef(null);

  useOutsideClick(profileRef,   () => setProfileOpen(false));
  useOutsideClick(notifRef,     () => setNotifOpen(false));
  useOutsideClick(searchBoxRef, () => {
    setSearchFocused(false);
    setSearchResults([]);
    setHighlightedIdx(-1);
  });

  const { theme, toggleTheme } = useTheme();

  const isCalendarActive = location.pathname === ROUTES.CALENDAR;

  /* Sync unread count to Redux */
  useEffect(() => {
    dispatch(setUnreadCount(notifs.filter(n => !n.read).length));
  }, [notifs, dispatch]);

  /* Close dropdowns on route change */
  useEffect(() => {
    setNotifOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  /* ⌘K shortcut */
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
        setSearchFocused(true);
      }
      if (e.key === 'Escape') {
        searchRef.current?.blur();
        setSearchFocused(false);
        setSearchResults([]);
        setHighlightedIdx(-1);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* Live search filter */
  useEffect(() => {
    const q = searchValue.trim().toLowerCase();
    if (!q) { setSearchResults([]); setHighlightedIdx(-1); return; }
    const filtered = SEARCH_MODULES.filter(
      m =>
        resolveRolePath(m.path, role, { strict: true }) &&
        (m.label.toLowerCase().includes(q) ||
          m.category.toLowerCase().includes(q))
    );
    setSearchResults(filtered);
    setHighlightedIdx(filtered.length > 0 ? 0 : -1);
  }, [role, searchValue]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIdx(i => Math.min(i + 1, searchResults.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      if (highlightedIdx >= 0 && searchResults[highlightedIdx]) {
        handleSelectResult(searchResults[highlightedIdx]);
      }
    }
  };

  const handleSelectResult = (item) => {
    navigate(resolveRolePath(item.path, role));
    setSearchValue('');
    setSearchResults([]);
    setSearchFocused(false);
    setHighlightedIdx(-1);
    searchRef.current?.blur();
  };

  const handleLogout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch {
      // Local logout should still complete if the server is unreachable.
    }
    dispatch(clearAuth());
    navigate(ROUTES.LOGIN);
  };
  const handleMarkAll = () => setNotifs(p => p.map(n => ({ ...n, read: true })));
  const handleMarkOne = (id) => setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
  const goTo = useCallback((path) => {
    setProfileOpen(false);
    navigate(resolveRolePath(path, role));
  }, [navigate, role]);

  const roleLabel = ROLE_LABELS[role] || role || '';

  const handleSidebarToggle = () => {
    if (window.innerWidth >= 768) { dispatch(toggleCollapse()); return; }
    dispatch(toggleSidebar());
  };

  const showDropdown = searchFocused && searchValue.trim().length > 0;

  return (
    <header className="
      h-14 flex items-center px-4 gap-3 shrink-0 z-20 sticky top-0
      bg-white dark:bg-slate-900
      border-b border-slate-100 dark:border-slate-800
    ">

      {/* ── Sidebar toggle ── */}
      <button
        onClick={handleSidebarToggle}
        className="
          w-[34px] h-[34px] flex items-center justify-center rounded-lg shrink-0
          text-slate-400 dark:text-slate-500
          hover:text-slate-700 dark:hover:text-slate-200
          hover:bg-slate-100 dark:hover:bg-slate-800
          transition-colors duration-150
        "
      >
        <Menu size={17} />
      </button>

      {/* ── Search ── */}
      <div
        ref={searchBoxRef}
        className={`relative flex flex-1 max-w-xs transition-all duration-300 ${searchFocused ? 'max-w-md' : ''}`}
      >
        <Search
          size={13}
          className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-150
            ${searchFocused ? 'text-blue-500' : 'text-slate-300 dark:text-slate-600'}`}
        />
        <input
          ref={searchRef}
          type="text"
          value={searchValue}
          onChange={e => setSearchValue(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onKeyDown={handleSearchKeyDown}
          placeholder="Search patients, doctors, wards…"
          className={`
            w-full h-[34px] pl-9 pr-16 text-[13px] rounded-lg border outline-none
            transition-all duration-200
            bg-slate-50 dark:bg-slate-800/60
            text-slate-700 dark:text-slate-200
            placeholder-slate-400 dark:placeholder-slate-600
            ${searchFocused
              ? 'border-blue-300 dark:border-blue-700 ring-[3px] ring-blue-50 dark:ring-blue-900/30 bg-white dark:bg-slate-800 shadow-sm'
              : 'border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600'
            }
          `}
        />

        {/* Clear button */}
        {searchValue && (
          <button
            onMouseDown={e => { e.preventDefault(); setSearchValue(''); setSearchResults([]); }}
            className="
              absolute right-9 top-1/2 -translate-y-1/2 p-0.5 rounded
              text-slate-300 dark:text-slate-600
              hover:text-slate-500 dark:hover:text-slate-400
              transition-colors
            "
          >
            <X size={11} />
          </button>
        )}

        {/* ⌘K hint */}
        {!searchFocused && !searchValue && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
            <kbd className="text-[10px] font-mono text-slate-300 dark:text-slate-600 bg-slate-100 dark:bg-slate-700/60 px-1 py-0.5 rounded border border-slate-200 dark:border-slate-700">⌘K</kbd>
          </span>
        )}

        {/* Enter hint while focused with no query */}
        {searchFocused && !searchValue && (
          <kbd className="
            absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none
            text-[10px] font-mono text-blue-400
            bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded
            border border-blue-200 dark:border-blue-800
          ">↵</kbd>
        )}

        {/* ── Search Dropdown ── */}
        {showDropdown && (
          <div className="
            absolute top-full left-0 right-0 mt-2 z-50
            rounded-xl border shadow-lg overflow-hidden
            bg-white dark:bg-slate-900
            border-slate-100 dark:border-slate-800
          ">
            {searchResults.length > 0 ? (
              <>
                <div className="
                  px-4 py-2 border-b border-slate-50 dark:border-slate-800
                  bg-slate-50/80 dark:bg-slate-800/50
                ">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="max-h-72 overflow-y-auto py-1 scrollbar-thin">
                  {searchResults.map((item, idx) => (
                    <SearchResultRow
                      key={item.path}
                      item={item}
                      onSelect={handleSelectResult}
                      isHighlighted={idx === highlightedIdx}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-slate-400 dark:text-slate-500">
                  No modules found for{' '}
                  <span className="font-medium text-slate-600 dark:text-slate-300">"{searchValue}"</span>
                </p>
                <p className="text-[11px] text-slate-300 dark:text-slate-600 mt-1">Try a different keyword</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Right actions ── */}
      <div className="ml-auto flex items-center gap-1">

        {/* Bed Status */}
        <button
          onClick={() => navigate(resolveRolePath('/super-admin/ipd/bed-status', role))}
          title="Bed Status"
          className="
            hidden sm:flex items-center gap-1.5 h-[34px] px-3 rounded-lg
            border border-emerald-200 dark:border-emerald-800/60
            text-emerald-600 dark:text-emerald-400
            hover:bg-emerald-50 dark:hover:bg-emerald-900/20
            transition-colors duration-150 text-[12px] font-medium
          "
        >
          <BedSingle size={14} />
          <span className="hidden md:inline">Bed Status</span>
        </button>

        {/* Calendar */}
        <button
          onClick={() => navigate('/calender')}
          title="Calendar"
          className={`
            relative w-[34px] h-[34px] flex items-center justify-center rounded-lg
            transition-colors duration-150
            ${isCalendarActive
              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }
          `}
        >
          <Calendar size={16} />
          {isCalendarActive && (
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          className="
            w-[34px] h-[34px] flex items-center justify-center rounded-lg
            text-slate-400 dark:text-slate-500
            hover:text-slate-700 dark:hover:text-slate-200
            hover:bg-slate-100 dark:hover:bg-slate-800
            transition-colors duration-150
          "
        >
          {theme === 'dark'
            ? <Sun size={16} className="text-amber-400" />
            : <Moon size={16} />
          }
        </button>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 dark:border-slate-700 mx-1 shrink-0" />

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
            className={`
              relative w-[34px] h-[34px] flex items-center justify-center rounded-lg
              transition-colors duration-150
              ${notifOpen
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }
            `}
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="
                absolute top-[7px] right-[7px] w-[7px] h-[7px] rounded-full bg-red-500
                border-[1.5px] border-white dark:border-slate-900
              " />
            )}
          </button>

          {notifOpen && (
            <div className="
              absolute right-0 top-full mt-2 w-[300px] z-50 overflow-hidden animate-pop
              rounded-xl border shadow-lg
              bg-white dark:bg-slate-900
              border-slate-100 dark:border-slate-800
            ">
              {/* Header */}
              <div className="
                flex items-center justify-between px-4 py-3
                border-b border-slate-100 dark:border-slate-800
              ">
                <div className="flex items-center gap-2">
                  <Bell size={13} className="text-slate-400 dark:text-slate-500" />
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-px rounded text-[10px] font-bold bg-red-500 text-white leading-none">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAll}
                    className="text-[11px] font-medium text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* Notif list */}
              <div className="divide-y divide-slate-50 dark:divide-slate-800 max-h-72 overflow-y-auto scrollbar-thin">
                {notifs.map(n => <NotifRow key={n.id} notif={n} onRead={handleMarkOne} />)}
              </div>

              {/* Footer */}
              <div className="
                px-4 py-2.5 text-center
                border-t border-slate-50 dark:border-slate-800
                bg-slate-50/50 dark:bg-slate-800/30
              ">
                <button
                  onClick={() => { goTo(ROUTES.NOTIFICATIONS); setNotifOpen(false); }}
                  className="
                    inline-flex items-center gap-1 text-xs font-medium
                    text-slate-400 dark:text-slate-500
                    hover:text-blue-500 dark:hover:text-blue-400
                    transition-colors
                  "
                >
                  View all notifications <ChevronRight size={11} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-slate-200 dark:border-slate-700 mx-1 shrink-0" />

        {/* Profile */}
        <div ref={profileRef} className="relative">
          {!user ? <UserSkeleton /> : (
            <button
              onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
              className={`
                flex items-center gap-2 h-[34px] pl-1 pr-2.5 rounded-lg text-left
                transition-colors duration-150
                ${profileOpen
                  ? 'bg-slate-100 dark:bg-slate-800'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                }
              `}
            >
              {/* Square avatar */}
              <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0">
                <Avatar name={user.name || 'User'} src={user?.avatar} size="sm" />
              </div>
              <div className="hidden sm:block leading-none">
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-none">
                  {user.name || 'User'}
                </p>
                <p className="text-[11px] mt-0.5 text-slate-400 dark:text-slate-500">{roleLabel}</p>
              </div>
              {/* Online dot */}
              <span className="
                hidden sm:block w-[7px] h-[7px] rounded-full bg-emerald-500 shrink-0
                border-[1.5px] border-white dark:border-slate-900
              " />
            </button>
          )}

          {profileOpen && user && (
            <div className="
              absolute right-0 top-full mt-2 w-52 z-50 py-1.5 animate-pop overflow-hidden
              rounded-xl border shadow-lg
              bg-white dark:bg-slate-900
              border-slate-100 dark:border-slate-800
            ">
              {/* Profile header */}
              <div className="px-4 py-3 mb-1 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                    <Avatar name={user.name || 'User'} src={user?.avatar} size="sm" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold truncate text-slate-800 dark:text-slate-100">
                      {user.name}
                    </p>
                    <p className="text-[11px] truncate text-slate-400 dark:text-slate-500">{user.email}</p>
                  </div>
                </div>
                <span className="
                  inline-flex items-center gap-1 mt-2.5
                  text-[11px] font-semibold px-2 py-0.5 rounded-md
                  bg-blue-50 dark:bg-blue-900/30
                  text-blue-600 dark:text-blue-400
                  border border-blue-100 dark:border-blue-800/50
                ">
                  <Sparkles size={9} /> {roleLabel}
                </span>
              </div>

              <button
                onClick={() => goTo(ROUTES.PROFILE)}
                className="
                  w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px]
                  text-slate-600 dark:text-slate-300
                  hover:bg-slate-50 dark:hover:bg-slate-800
                  hover:text-slate-900 dark:hover:text-slate-100
                  transition-colors
                "
              >
                <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-700/60">
                  <User size={12} className="text-slate-500 dark:text-slate-400" />
                </span>
                My Profile
              </button>

              <button
                onClick={() => goTo(ROUTES.SETTINGS)}
                className="
                  w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px]
                  text-slate-600 dark:text-slate-300
                  hover:bg-slate-50 dark:hover:bg-slate-800
                  hover:text-slate-900 dark:hover:text-slate-100
                  transition-colors
                "
              >
                <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 bg-slate-100 dark:bg-slate-700/60">
                  <Settings size={12} className="text-slate-500 dark:text-slate-400" />
                </span>
                Settings
              </button>

              <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="
                    w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px]
                    text-red-500 hover:text-red-600
                    hover:bg-red-50 dark:hover:bg-red-950/30
                    transition-colors
                  "
                >
                  <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 bg-red-50 dark:bg-red-950/30">
                    <LogOut size={12} className="text-red-400" />
                  </span>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Header;

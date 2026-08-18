// src/pages/CalendarPage.jsx
import {
  ChevronLeft, ChevronRight, Plus, Check, X, Settings,
  Calendar, List, Grid, Clock, Tag, Trash2, Edit3,
  Search, Filter, Bell, MapPin, Users, MoreHorizontal,
  ChevronDown, Sun, Moon
} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

/* ── Constants ── */
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

/* ── Mock Events ── */
const MOCK_EVENTS = [
  { id: 1,  title: 'Doctors Meeting',          date: '2026-04-27', time: '09:00', type: 'meeting',  color: 'bg-blue-500',    textColor: 'text-blue-600',   bgLight: 'bg-blue-50 dark:bg-blue-900/30',   borderColor: 'border-blue-200 dark:border-blue-800' },
  { id: 2,  title: 'Check Ambulance Avail.',   date: '2026-04-28', time: '11:00', type: 'task',     color: 'bg-slate-600',   textColor: 'text-slate-600',  bgLight: 'bg-slate-50 dark:bg-slate-800/50', borderColor: 'border-slate-200 dark:border-slate-700' },
  { id: 3,  title: 'FREE BLOOD PRESSURE',      date: '2026-04-28', time: '10:00', type: 'event',    color: 'bg-purple-500',  textColor: 'text-purple-600', bgLight: 'bg-purple-50 dark:bg-purple-900/30', borderColor: 'border-purple-200 dark:border-purple-800' },
  { id: 4,  title: 'Activity Session',         date: '2026-04-28', time: '14:00', type: 'activity', color: 'bg-emerald-500', textColor: 'text-emerald-600',bgLight: 'bg-emerald-50 dark:bg-emerald-900/30', borderColor: 'border-emerald-200 dark:border-emerald-800' },
  { id: 5,  title: 'Clinical Investigation',   date: '2026-04-30', time: '08:30', type: 'clinical', color: 'bg-amber-500',   textColor: 'text-amber-600',  bgLight: 'bg-amber-50 dark:bg-amber-900/30',  borderColor: 'border-amber-200 dark:border-amber-800' },
  { id: 6,  title: 'Nursing Meeting',          date: '2026-05-04', time: '10:00', type: 'meeting',  color: 'bg-blue-500',    textColor: 'text-blue-600',   bgLight: 'bg-blue-50 dark:bg-blue-900/30',   borderColor: 'border-blue-200 dark:border-blue-800' },
  { id: 7,  title: 'World No Tobacco Day',     date: '2026-05-14', time: '09:00', type: 'event',    color: 'bg-purple-500',  textColor: 'text-purple-600', bgLight: 'bg-purple-50 dark:bg-purple-900/30', borderColor: 'border-purple-200 dark:border-purple-800' },
  { id: 8,  title: 'Staff Meeting',            date: '2026-05-22', time: '11:00', type: 'meeting',  color: 'bg-blue-500',    textColor: 'text-blue-600',   bgLight: 'bg-blue-50 dark:bg-blue-900/30',   borderColor: 'border-blue-200 dark:border-blue-800' },
  { id: 9,  title: 'Vacation',                 date: '2026-05-21', time: '00:00', type: 'leave',    color: 'bg-red-500',     textColor: 'text-red-600',    bgLight: 'bg-red-50 dark:bg-red-900/30',     borderColor: 'border-red-200 dark:border-red-800' },
  { id: 10, title: 'Activity',                 date: '2026-05-24', time: '14:00', type: 'activity', color: 'bg-emerald-500', textColor: 'text-emerald-600',bgLight: 'bg-emerald-50 dark:bg-emerald-900/30', borderColor: 'border-emerald-200 dark:border-emerald-800' },
  { id: 11, title: 'Free Blood Sugar Camp',    date: '2026-04-27', time: '08:00', type: 'event',    color: 'bg-purple-500',  textColor: 'text-purple-600', bgLight: 'bg-purple-50 dark:bg-purple-900/30', borderColor: 'border-purple-200 dark:border-purple-800' },
  { id: 12, title: 'HIV Awareness Day',        date: '2026-05-18', time: '09:00', type: 'event',    color: 'bg-purple-500',  textColor: 'text-purple-600', bgLight: 'bg-purple-50 dark:bg-purple-900/30', borderColor: 'border-purple-200 dark:border-purple-800' },
  { id: 13, title: 'Patient Data Monitoring',  date: '2026-06-01', time: '09:00', type: 'task',     color: 'bg-slate-600',   textColor: 'text-slate-600',  bgLight: 'bg-slate-50 dark:bg-slate-800/50', borderColor: 'border-slate-200 dark:border-slate-700' },
];

const TODO_ITEMS_INIT = [
  { id: 1, title: 'Doctors Meeting',                        date: '05/15/2026', done: false },
  { id: 2, title: 'HIV Vaccine Awareness Day',              date: '05/18/2026', done: false },
  { id: 3, title: 'World Autoimmune/Auto-inflammatory Day', date: '05/20/2026', done: false },
  { id: 4, title: 'World No Tobacco Day',                   date: '05/31/2026', done: false },
  { id: 5, title: 'Patient Data Monitoring',                date: '06/01/2026', done: false },
];

const EVENT_TYPES = ['All', 'Meeting', 'Task', 'Event', 'Activity', 'Clinical', 'Leave'];
const TYPE_COLORS = {
  meeting:  { dot: 'bg-blue-500',    label: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-900/30' },
  task:     { dot: 'bg-slate-500',   label: 'text-slate-600 dark:text-slate-400',  bg: 'bg-slate-100 dark:bg-slate-800' },
  event:    { dot: 'bg-purple-500',  label: 'text-purple-600 dark:text-purple-400',bg: 'bg-purple-50 dark:bg-purple-900/30' },
  activity: { dot: 'bg-emerald-500', label: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  clinical: { dot: 'bg-amber-500',   label: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-900/30' },
  leave:    { dot: 'bg-red-500',     label: 'text-red-600 dark:text-red-400',      bg: 'bg-red-50 dark:bg-red-900/30' },
};

/* ── Add Event Modal ── */
const AddEventModal = ({ onClose, onAdd, selectedDate }) => {
  const [form, setForm] = useState({
    title: '', date: selectedDate || '', time: '09:00', type: 'meeting', description: ''
  });

  const handleSubmit = () => {
    if (!form.title.trim() || !form.date) return;
    const typeInfo = TYPE_COLORS[form.type] || TYPE_COLORS.meeting;
    const EVENT_BG = {
      meeting: 'bg-blue-500', task: 'bg-slate-600', event: 'bg-purple-500',
      activity: 'bg-emerald-500', clinical: 'bg-amber-500', leave: 'bg-red-500'
    };
    onAdd({
      id: Date.now(),
      ...form,
      color: EVENT_BG[form.type],
      textColor: typeInfo.label.split(' ')[0],
      bgLight: typeInfo.bg,
      borderColor: 'border-slate-200 dark:border-slate-700'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4"
         style={{ background: 'rgba(0,0,0,0.4)' }}
         onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl shadow-2xl overflow-hidden
                      bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
           onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between px-5 py-4
                        bg-slate-50 dark:bg-slate-800/60
                        border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
              <Plus size={14} className="text-white" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">New Event</h3>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
              Event Title *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Enter event title..."
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all
                         bg-slate-50 dark:bg-slate-800
                         border-slate-200 dark:border-slate-700
                         text-slate-800 dark:text-slate-100
                         placeholder-slate-400 dark:placeholder-slate-500
                         focus:border-blue-400 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-50 dark:focus:ring-blue-900/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Date *</label>
              <input type="date" value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all
                           bg-slate-50 dark:bg-slate-800
                           border-slate-200 dark:border-slate-700
                           text-slate-800 dark:text-slate-100
                           focus:border-blue-400 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-50 dark:focus:ring-blue-900/30" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Time</label>
              <input type="time" value={form.time}
                onChange={e => setForm(p => ({ ...p, time: e.target.value }))}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all
                           bg-slate-50 dark:bg-slate-800
                           border-slate-200 dark:border-slate-700
                           text-slate-800 dark:text-slate-100
                           focus:border-blue-400 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-50 dark:focus:ring-blue-900/30" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {['meeting','task','event','activity','clinical','leave'].map(t => (
                <button key={t}
                  onClick={() => setForm(p => ({ ...p, type: t }))}
                  className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold capitalize border transition-all
                    ${form.type === t
                      ? 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}>
                  <span className={`w-2 h-2 rounded-full ${TYPE_COLORS[t]?.dot}`} />
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Optional description..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none transition-all resize-none
                         bg-slate-50 dark:bg-slate-800
                         border-slate-200 dark:border-slate-700
                         text-slate-800 dark:text-slate-100
                         placeholder-slate-400 dark:placeholder-slate-500
                         focus:border-blue-400 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-50 dark:focus:ring-blue-900/30"
            />
          </div>
        </div>

        <div className="flex gap-2.5 px-5 pb-5">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors
                       border-slate-200 dark:border-slate-700
                       text-slate-600 dark:text-slate-300
                       hover:bg-slate-50 dark:hover:bg-slate-800">
            Cancel
          </button>
          <button onClick={handleSubmit}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors
                       bg-blue-500 hover:bg-blue-600 text-white shadow-sm">
            Add Event
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Event Detail Popup ── */
const EventDetail = ({ event, onClose, onDelete }) => {
  const tc = TYPE_COLORS[event.type] || TYPE_COLORS.meeting;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4"
         style={{ background: 'rgba(0,0,0,0.4)' }}
         onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden
                      bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
           onClick={e => e.stopPropagation()}>

        <div className={`px-5 py-4 border-b border-slate-100 dark:border-slate-700 ${tc.bg}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider mb-1.5 ${tc.label}`}>
                <span className={`w-2 h-2 rounded-full ${tc.dot}`} />
                {event.type}
              </span>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 leading-snug">{event.title}</h3>
            </div>
            <button onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-colors shrink-0">
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
            <Calendar size={14} className="text-slate-400 shrink-0" />
            {event.date}
          </div>
          {event.time && (
            <div className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300">
              <Clock size={14} className="text-slate-400 shrink-0" />
              {event.time}
            </div>
          )}
          {event.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed pt-1">{event.description}</p>
          )}
        </div>

        <div className="flex gap-2 px-5 pb-5">
          <button onClick={() => { onDelete(event.id); onClose(); }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors
                       text-red-500 border border-red-100 dark:border-red-900/50
                       hover:bg-red-50 dark:hover:bg-red-950/30">
            <Trash2 size={12} /> Delete
          </button>
          <button onClick={onClose}
            className="ml-auto flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors
                       bg-blue-500 hover:bg-blue-600 text-white">
            <Edit3 size={12} /> Edit
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Week View ── */
const WeekView = ({ viewDate, events, onEventClick }) => {
  const startOfWeek = new Date(viewDate);
  startOfWeek.setDate(viewDate.getDate() - viewDate.getDay());

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });

  const today = new Date();
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

  return (
    <div className="flex-1 overflow-auto">
      <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-700/60
                      bg-slate-50 dark:bg-slate-800/40 sticky top-0 z-10">
        {days.map((d, i) => {
          const isToday = fmt(d) === fmt(today);
          return (
            <div key={i} className={`py-3 text-center border-r border-slate-100 dark:border-slate-700/40 last:border-r-0`}>
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{DAYS_OF_WEEK[i]}</p>
              <span className={`inline-flex items-center justify-center w-8 h-8 mt-1 rounded-full text-sm font-bold
                ${isToday ? 'bg-blue-500 text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                {d.getDate()}
              </span>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-7" style={{ minHeight: '400px' }}>
        {days.map((d, i) => {
          const dateStr = fmt(d);
          const dayEvents = events.filter(e => e.date === dateStr);
          const isToday = dateStr === fmt(today);
          return (
            <div key={i}
              className={`border-r border-slate-100 dark:border-slate-700/40 last:border-r-0 p-2 space-y-1.5 min-h-[400px]
                ${isToday ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}>
              {dayEvents.map(ev => (
                <div key={ev.id}
                  onClick={() => onEventClick(ev)}
                  className={`${ev.color} text-white text-[10px] font-semibold px-2 py-1.5 rounded-lg cursor-pointer
                               hover:opacity-90 transition-opacity leading-tight`}>
                  <span className="opacity-75 mr-1">{ev.time}</span>
                  {ev.title}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ── Day View ── */
const DayView = ({ viewDate, events, onEventClick }) => {
  const fmt = d => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const dateStr = fmt(viewDate);
  const dayEvents = events.filter(e => e.date === dateStr);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex-1 overflow-auto">
      <div className="border-b border-slate-100 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 px-5 py-3 sticky top-0 z-10">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
          {DAYS_OF_WEEK[viewDate.getDay()]}, {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getDate()}, {viewDate.getFullYear()}
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500">{dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}</p>
      </div>

      {dayEvents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 dark:text-slate-600">
          <Calendar size={32} className="mb-3 opacity-40" />
          <p className="text-sm font-medium">No events this day</p>
          <p className="text-xs mt-1">Click the + button to add one</p>
        </div>
      ) : (
        <div className="p-4 space-y-2.5">
          {dayEvents.sort((a,b) => a.time.localeCompare(b.time)).map(ev => {
            const tc = TYPE_COLORS[ev.type] || TYPE_COLORS.meeting;
            return (
              <div key={ev.id}
                onClick={() => onEventClick(ev)}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer
                             hover:shadow-sm transition-all ${tc.bg} ${ev.borderColor}`}>
                <div className={`w-3 h-3 rounded-full mt-0.5 shrink-0 ${tc.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{ev.title}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Clock size={11} /> {ev.time}
                    </span>
                    <span className={`text-[11px] font-semibold capitalize px-2 py-0.5 rounded-md ${tc.label} ${tc.bg}`}>
                      {ev.type}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ── Agenda View ── */
const AgendaView = ({ events, onEventClick }) => {
  const sorted = [...events].sort((a,b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  const grouped = sorted.reduce((acc, ev) => {
    if (!acc[ev.date]) acc[ev.date] = [];
    acc[ev.date].push(ev);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-auto p-4 space-y-5">
      {Object.entries(grouped).map(([date, evs]) => {
        const d = new Date(date + 'T00:00:00');
        return (
          <div key={date}>
            <div className="flex items-center gap-3 mb-2.5">
              <div className="text-center">
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{DAYS_OF_WEEK[d.getDay()]}</p>
                <p className="text-lg font-bold text-slate-700 dark:text-slate-200 leading-none">{d.getDate()}</p>
              </div>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-700/60" />
            </div>
            <div className="space-y-2 ml-10">
              {evs.map(ev => {
                const tc = TYPE_COLORS[ev.type] || TYPE_COLORS.meeting;
                return (
                  <div key={ev.id}
                    onClick={() => onEventClick(ev)}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer
                                 hover:shadow-sm transition-all ${tc.bg} ${ev.borderColor}`}>
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${tc.dot}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{ev.title}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-slate-400 dark:text-slate-500">{ev.time}</span>
                      <span className={`hidden sm:block text-[10px] font-semibold capitalize px-2 py-0.5 rounded-md ${tc.label}`}>
                        {ev.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/* ── Main Calendar Page ── */
const CalendarPage = () => {
  const today = new Date();
  const [viewDate, setViewDate]       = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);
  const [view, setView]               = useState('month');
  const [todos, setTodos]             = useState(TODO_ITEMS_INIT);
  const [events, setEvents]           = useState(MOCK_EVENTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [filterType, setFilterType]   = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [newTodoText, setNewTodoText] = useState('');
  const [addingTodo, setAddingTodo]   = useState(false);

  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells       = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  );
  while (cells.length % 7 !== 0) cells.push(null);

  const filteredEvents = events.filter(ev => {
    const matchType = filterType === 'All' || ev.type === filterType.toLowerCase();
    const matchSearch = !searchQuery || ev.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    return filteredEvents.filter(e => e.date === dateStr);
  };

  const isToday = (day) => {
    if (!day) return false;
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const prevPeriod = () => {
    if (view === 'month') setViewDate(new Date(year, month - 1, 1));
    else if (view === 'week') { const d = new Date(viewDate); d.setDate(d.getDate() - 7); setViewDate(d); }
    else { const d = new Date(viewDate); d.setDate(d.getDate() - 1); setViewDate(d); }
  };
  const nextPeriod = () => {
    if (view === 'month') setViewDate(new Date(year, month + 1, 1));
    else if (view === 'week') { const d = new Date(viewDate); d.setDate(d.getDate() + 7); setViewDate(d); }
    else { const d = new Date(viewDate); d.setDate(d.getDate() + 1); setViewDate(d); }
  };
  const goToday = () => setViewDate(new Date(today.getFullYear(), today.getMonth(), view === 'day' ? today.getDate() : 1));

  const handleDayClick = (day) => {
    if (!day) return;
    const d = new Date(year, month, day);
    setSelectedDay(d);
    if (view === 'month') { setViewDate(d); setView('day'); }
  };

  const toggleTodo = (id) => setTodos(p => p.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const deleteTodo = (id) => setTodos(p => p.filter(t => t.id !== id));
  const addTodo    = () => {
    if (!newTodoText.trim()) return;
    setTodos(p => [...p, { id: Date.now(), title: newTodoText.trim(), date: `${String(today.getMonth()+1).padStart(2,'0')}/${String(today.getDate()).padStart(2,'0')}/${today.getFullYear()}`, done: false }]);
    setNewTodoText('');
    setAddingTodo(false);
  };

  const handleAddEvent = (ev) => setEvents(p => [...p, ev]);
  const handleDeleteEvent = (id) => setEvents(p => p.filter(e => e.id !== id));

  const titleLabel = () => {
    if (view === 'month') return `${MONTH_NAMES[month]} ${year}`;
    if (view === 'week') {
      const start = new Date(viewDate);
      start.setDate(viewDate.getDate() - viewDate.getDay());
      const end = new Date(start); end.setDate(start.getDate() + 6);
      return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()} – ${start.getMonth() !== end.getMonth() ? MONTH_NAMES[end.getMonth()]+' ' : ''}${end.getDate()}, ${year}`;
    }
    return `${DAYS_OF_WEEK[viewDate.getDay()]}, ${MONTH_NAMES[viewDate.getMonth()]} ${viewDate.getDate()}, ${year}`;
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 font-sans">

      {/* ── Page Header ── */}
      <div className="shrink-0 px-5 pt-5 pb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center shadow-sm">
                <Calendar size={16} className="text-white" />
              </span>
              Calendar
            </h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1 ml-[42px]">
              {filteredEvents.length} events this month
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search events…"
                className="pl-8 pr-4 py-2 text-sm rounded-xl border outline-none transition-all w-44
                           bg-white dark:bg-slate-800
                           border-slate-200 dark:border-slate-700
                           text-slate-700 dark:text-slate-200
                           placeholder-slate-400 dark:placeholder-slate-500
                           focus:border-blue-400 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-50 dark:focus:ring-blue-900/30"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="appearance-none pl-3 pr-8 py-2 text-sm rounded-xl border outline-none transition-all cursor-pointer
                           bg-white dark:bg-slate-800
                           border-slate-200 dark:border-slate-700
                           text-slate-700 dark:text-slate-200
                           focus:border-blue-400 dark:focus:border-blue-600">
                {EVENT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {/* Add Event */}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors
                         bg-blue-500 hover:bg-blue-600 text-white shadow-sm">
              <Plus size={14} /> Add Event
            </button>
          </div>
        </div>

        {/* ── View Controls ── */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <button onClick={prevPeriod}
              className="p-1.5 rounded-lg transition-colors text-slate-400 dark:text-slate-500
                         hover:bg-white dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200
                         border border-slate-200 dark:border-slate-700">
              <ChevronLeft size={15} />
            </button>
            <button onClick={nextPeriod}
              className="p-1.5 rounded-lg transition-colors text-slate-400 dark:text-slate-500
                         hover:bg-white dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200
                         border border-slate-200 dark:border-slate-700">
              <ChevronRight size={15} />
            </button>
            <button onClick={goToday}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border
                         border-slate-200 dark:border-slate-600
                         bg-white dark:bg-slate-800
                         text-slate-600 dark:text-slate-300
                         hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Today
            </button>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 ml-1">
              {titleLabel()}
            </h2>
          </div>

          <div className="flex rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs font-semibold
                          bg-white dark:bg-slate-800">
            {[
              { key: 'month',  label: 'Month', Icon: Grid },
              { key: 'week',   label: 'Week',  Icon: List },
              { key: 'day',    label: 'Day',   Icon: Clock },
              { key: 'agenda', label: 'Agenda',Icon: Bell },
            ].map(({ key, label, Icon }) => (
              <button key={key} onClick={() => setView(key)}
                className={`flex items-center gap-1.5 px-3 py-2 transition-colors
                  ${view === key
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}>
                <Icon size={12} /> {label}
              </button>
            ))}
          </div>
        </div>

        {/* Type Legend */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">
          {Object.entries(TYPE_COLORS).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex flex-1 overflow-hidden gap-0 px-5 pb-5">

        {/* Calendar Area */}
        <div className="flex-1 flex flex-col overflow-hidden
                        bg-white dark:bg-slate-900
                        rounded-2xl border border-slate-200 dark:border-slate-700
                        shadow-sm mr-4">

          {view === 'month' && (
            <>
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-slate-100 dark:border-slate-700/60
                              bg-slate-50 dark:bg-slate-800/40 shrink-0">
                {DAYS_OF_WEEK.map(d => (
                  <div key={d} className="py-2.5 text-center text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {d}
                  </div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="flex-1 overflow-auto grid grid-cols-7" style={{ gridAutoRows: 'minmax(100px, 1fr)' }}>
                {cells.map((day, idx) => {
                  const dayEvents = getEventsForDay(day);
                  const todayCell = isToday(day);
                  return (
                    <div key={idx}
                      onClick={() => handleDayClick(day)}
                      className={`border-b border-r border-slate-100 dark:border-slate-700/40 p-2 relative transition-colors
                        ${!day ? 'bg-slate-50/40 dark:bg-slate-800/20' : 'hover:bg-blue-50/20 dark:hover:bg-blue-900/10 cursor-pointer'}
                        ${todayCell ? 'bg-blue-50/40 dark:bg-blue-900/10 ring-1 ring-inset ring-blue-200 dark:ring-blue-800/50' : ''}
                        ${idx % 7 === 6 ? 'border-r-0' : ''}`}>
                      {day && (
                        <>
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold mb-1.5 transition-colors
                            ${todayCell
                              ? 'bg-blue-500 text-white shadow-sm'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}>
                            {day}
                          </span>
                          <div className="space-y-0.5">
                            {dayEvents.slice(0, 3).map(ev => (
                              <div key={ev.id}
                                onClick={e => { e.stopPropagation(); setSelectedEvent(ev); }}
                                className={`text-[10px] font-semibold text-white px-1.5 py-0.5 rounded-md truncate cursor-pointer
                                             hover:opacity-90 transition-opacity ${ev.color}`}>
                                {ev.time && <span className="opacity-70 mr-1 font-normal">{ev.time}</span>}
                                {ev.title}
                              </div>
                            ))}
                            {dayEvents.length > 3 && (
                              <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 pl-1 cursor-pointer hover:text-blue-500 transition-colors">
                                +{dayEvents.length - 3} more
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {view === 'week' && (
            <WeekView
              viewDate={viewDate}
              events={filteredEvents}
              onEventClick={setSelectedEvent}
            />
          )}

          {view === 'day' && (
            <DayView
              viewDate={viewDate}
              events={filteredEvents}
              onEventClick={setSelectedEvent}
            />
          )}

          {view === 'agenda' && (
            <AgendaView events={filteredEvents} onEventClick={setSelectedEvent} />
          )}
        </div>

        {/* ── To Do List Sidebar ── */}
        <div className="w-64 flex flex-col shrink-0
                        bg-white dark:bg-slate-900
                        rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5
                          border-b border-slate-100 dark:border-slate-700/60
                          bg-slate-50 dark:bg-slate-800/60 rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Check size={14} className="text-blue-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">To Do List</span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold
                               bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400">
                {todos.filter(t => !t.done).length}
              </span>
            </div>
            <button
              onClick={() => setAddingTodo(true)}
              className="w-7 h-7 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors
                         flex items-center justify-center text-white shadow-sm">
              <Plus size={13} />
            </button>
          </div>

          {/* Add Todo Input */}
          {addingTodo && (
            <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-700/60 bg-blue-50/30 dark:bg-blue-900/10">
              <input
                autoFocus
                type="text"
                value={newTodoText}
                onChange={e => setNewTodoText(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') addTodo(); if (e.key === 'Escape') { setAddingTodo(false); setNewTodoText(''); }}}
                placeholder="New task..."
                className="w-full px-3 py-2 rounded-lg text-xs border outline-none
                           bg-white dark:bg-slate-800
                           border-slate-200 dark:border-slate-700
                           text-slate-800 dark:text-slate-100
                           placeholder-slate-400 dark:placeholder-slate-500
                           focus:border-blue-400 dark:focus:border-blue-600"
              />
              <div className="flex gap-1.5 mt-2">
                <button onClick={addTodo}
                  className="flex-1 py-1.5 text-xs font-semibold rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors">
                  Add
                </button>
                <button onClick={() => { setAddingTodo(false); setNewTodoText(''); }}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700
                             text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Todo Items */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-700/40">
            {todos.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-slate-400 dark:text-slate-600">
                <Check size={24} className="mb-2 opacity-30" />
                <p className="text-xs">All done! Great job.</p>
              </div>
            )}
            {todos.map(todo => (
              <div key={todo.id}
                className="flex items-start gap-2.5 px-4 py-3 group
                           hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all
                    ${todo.done
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-slate-300 dark:border-slate-600 group-hover:border-blue-400'
                    }`}>
                  {todo.done && <Check size={10} className="text-white" />}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-medium leading-relaxed ${
                    todo.done
                      ? 'line-through text-slate-400 dark:text-slate-600'
                      : 'text-slate-700 dark:text-slate-200'
                  }`}>{todo.title}</p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{todo.date}</p>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="p-0.5 rounded text-slate-300 dark:text-slate-700 hover:text-red-400 transition-colors
                             opacity-0 group-hover:opacity-100 shrink-0">
                  <X size={11} />
                </button>
              </div>
            ))}
          </div>

          {/* Stats Footer */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-700/60
                          bg-slate-50 dark:bg-slate-800/60 rounded-b-2xl">
            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 mb-2">
              <span>{todos.filter(t => t.done).length} of {todos.length} done</span>
              <button onClick={() => setTodos(p => p.filter(t => !t.done))}
                className="text-red-400 hover:text-red-500 transition-colors font-medium text-[11px]">
                Clear done
              </button>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: todos.length ? `${(todos.filter(t => t.done).length / todos.length) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      {showAddModal && (
        <AddEventModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddEvent}
          selectedDate={selectedDay ? `${selectedDay.getFullYear()}-${String(selectedDay.getMonth()+1).padStart(2,'0')}-${String(selectedDay.getDate()).padStart(2,'0')}` : ''}
        />
      )}

      {selectedEvent && (
        <EventDetail
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
};

export default CalendarPage;
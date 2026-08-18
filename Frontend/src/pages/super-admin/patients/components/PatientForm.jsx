import { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import {
  CalendarDays,
  FileImage,
  Fingerprint,
  ImagePlus,
  CreditCard,
  Mail,
  Phone,
  Search,
  User,
  X,
} from 'lucide-react';
import Input from '../../../../components/ui/Input/Input';
import Button from '../../../../components/ui/Button/Button';
import FormField from '../../../../components/forms/FormField/FormField';
import {
  PATIENT_BLOOD_OPTIONS,
  PATIENT_EMPTY_FORM,
  PATIENT_GENDER_OPTIONS,
  PATIENT_MARITAL_STATUS_OPTIONS,
  PATIENT_TPA_OPTIONS,
} from '../constants/patient.constants';
import { INDIAN_STATES, cityOptionsForState } from '../constants/indianLocations';
import { calculateAgeFromDob } from '../utils/patient.validation';

// ─── Validation ───────────────────────────────────────────────────────────────
const validatePatient = (form) => {
  const errors = {};

  if (!form.name?.trim()) {
    errors.name = 'Patient name is required';
  } else if (!/^[A-Za-z\s]+$/.test(form.name.trim())) {
    errors.name = 'Name must contain alphabets only';
  }

  if (!form.gender) {
    errors.gender = 'Gender is required';
  }

  if (!form.phone?.trim()) {
    errors.phone = 'Phone number is required';
  } else if (!/^\d{10}$/.test(form.phone)) {
    errors.phone = 'Enter a valid 10-digit phone number';
  }

  if (form.alternateNumber && !/^\d{10}$/.test(form.alternateNumber)) {
    errors.alternateNumber = 'Enter a valid 10-digit phone number';
  }

  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Enter a valid email address';
  }

  if (form.adharNo && !/^\d{12}$/.test(form.adharNo)) {
    errors.adharNo = 'Aadhar number must be exactly 12 digits';
  }

  if (form.ageYears !== '' && form.ageYears !== undefined) {
    const y = Number(form.ageYears);
    if (isNaN(y) || y < 0 || y > 150) errors.ageYears = 'Enter a valid age (0–150)';
  }

  if (form.ageMonths !== '' && form.ageMonths !== undefined) {
    const m = Number(form.ageMonths);
    if (isNaN(m) || m < 0 || m > 11) errors.ageMonths = 'Months must be 0–11';
  }

  if (form.ageDays !== '' && form.ageDays !== undefined) {
    const d = Number(form.ageDays);
    if (isNaN(d) || d < 0 || d > 30) errors.ageDays = 'Days must be 0–30';
  }

  if (form.patientPhoto instanceof File && !form.patientPhoto.type?.startsWith('image/')) {
    errors.patientPhoto = 'Only image files are allowed';
  }

  return errors;
};

// ─── SearchableSelect ─────────────────────────────────────────────────────────
// A fully custom searchable dropdown rendered via ReactDOM.createPortal.
// ✅ Always opens BELOW the trigger (position:fixed, top = trigger.bottom + 4px)
// ✅ Never clipped by overflow:hidden/auto parents (modals, cards, etc.)
// ✅ Searchable — type to filter options instantly
// ✅ Clear button to reset value
// ✅ Repositions on scroll/resize
const SearchableSelect = ({
  name,
  value,
  onChange,
  options,
  placeholder,
  isLoading = false,
}) => {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [menuStyle, setMenuStyle] = useState({});
  const triggerRef  = useRef(null);
  const menuRef     = useRef(null);
  const searchRef   = useRef(null);

  const selected = options.find((o) => o.value === value);

  const filtered = query.trim()
    ? options.filter((o) =>
        o.label.toLowerCase().includes(query.toLowerCase())
      )
    : options;

  const computeStyle = () => {
    if (!triggerRef.current) return {};
    const rect = triggerRef.current.getBoundingClientRect();
    return {
      position: 'fixed',
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
    };
  };

  const openMenu = () => {
    setMenuStyle(computeStyle());
    setQuery('');
    setOpen(true);
    // Focus search input after paint
    setTimeout(() => searchRef.current?.focus(), 50);
  };

  const closeMenu = () => {
    setOpen(false);
    setQuery('');
  };

  const handleSelect = (opt) => {
    onChange({ target: { name, value: opt.value } });
    closeMenu();
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { name, value: '' } });
    closeMenu();
  };

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (
        !triggerRef.current?.contains(e.target) &&
        !menuRef.current?.contains(e.target)
      ) closeMenu();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Reposition on scroll / resize while open
  useEffect(() => {
    if (!open) return;
    const reposition = () => setMenuStyle(computeStyle());
    window.addEventListener('scroll', reposition, true);
    window.addEventListener('resize', reposition);
    return () => {
      window.removeEventListener('scroll', reposition, true);
      window.removeEventListener('resize', reposition);
    };
  }, [open]);

  // Keyboard: Escape closes
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') closeMenu(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div className="relative w-full">
      {/* ── Trigger ── */}
      <button
        ref={triggerRef}
        type="button"
        disabled={isLoading}
        onClick={() => (open ? closeMenu() : openMenu())}
        className={[
          'w-full h-10 rounded-lg border px-3 text-sm text-left relative',
          'transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400',
          'bg-white dark:bg-slate-900',
          isLoading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
          open
            ? 'border-primary-400 ring-2 ring-primary-500/30'
            : 'border-slate-200 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600',
          selected
            ? 'text-slate-900 dark:text-slate-100 pr-14'
            : 'text-slate-400 dark:text-slate-500 pr-8',
        ].join(' ')}
      >
        {/* Selected label or placeholder */}
        <span className="block truncate">
          {isLoading ? 'Loading…' : selected ? selected.label : placeholder}
        </span>

        {/* Clear button — only when a value is selected */}
        {selected && !isLoading && (
          <span
            role="button"
            tabIndex={-1}
            onMouseDown={handleClear}
            className="absolute inset-y-0 right-7 flex items-center px-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={12} />
          </span>
        )}

        {/* Chevron */}
        <span className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-slate-400 dark:text-slate-500">
          <svg
            width="14" height="14" viewBox="0 0 14 14" fill="none"
            style={{
              transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.15s ease',
            }}
          >
            <path
              d="M3.5 5.25L7 8.75L10.5 5.25"
              stroke="currentColor" strokeWidth="1.5"
              strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {/* ── Portal menu — mounted on document.body, always below ── */}
      {open && ReactDOM.createPortal(
        <div
          ref={menuRef}
          style={menuStyle}
          className="rounded-lg border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900 shadow-xl overflow-hidden"
        >
          {/* Search input */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-slate-400 dark:text-slate-500">
                <Search size={13} />
              </span>
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search…"
                className={[
                  'w-full h-8 rounded-md border border-slate-200 dark:border-slate-700/60',
                  'bg-slate-50 dark:bg-slate-800',
                  'pl-7 pr-3 text-xs text-slate-900 dark:text-slate-100',
                  'placeholder:text-slate-400 dark:placeholder:text-slate-500',
                  'focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400',
                ].join(' ')}
              />
            </div>
          </div>

          {/* Options list */}
          <ul className="py-1 max-h-48 overflow-y-auto text-sm">
            {filtered.length === 0 ? (
              <li className="px-3 py-2 text-slate-400 dark:text-slate-500 text-center text-xs">
                No results found
              </li>
            ) : (
              filtered.map((opt) => (
                <li
                  key={opt.value}
                  onMouseDown={() => handleSelect(opt)}
                  className={[
                    'px-3 py-2 cursor-pointer select-none',
                    opt.value === value
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
                  ].join(' ')}
                >
                  {opt.label}
                </li>
              ))
            )}
          </ul>
        </div>,
        document.body
      )}
    </div>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const SECTION_HEADER_ICON =
  'inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400';

const FieldIcon = ({ icon }) => (
  <span className="text-slate-400 dark:text-slate-500">{icon}</span>
);

const DropZone = ({ file, preview, error, onPick, onDrop, onClear }) => (
  <FormField
    label="Patient Photo"
    error={error}
    hint="Accepts only image files."
    required={false}
    className="lg:col-span-3"
  >
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      className={[
        'rounded-2xl border-2 border-dashed p-4 sm:p-5 transition-all cursor-pointer',
        'bg-slate-50/70 dark:bg-slate-800/50',
        error
          ? 'border-red-300 dark:border-red-700/60'
          : 'border-slate-200 dark:border-slate-700/70 hover:border-primary-300 dark:hover:border-primary-700',
      ].join(' ')}
      onClick={onPick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPick(); }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div className="h-24 w-24 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 flex items-center justify-center text-primary-600 dark:text-primary-400 overflow-hidden shrink-0">
          {preview ? (
            <img
              src={preview}
              alt="Patient preview"
              className="h-full w-full object-cover"
            />
          ) : (
            <ImagePlus size={26} />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100">
            {preview ? 'Patient photo selected' : 'Drag and drop patient photo here'}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {preview ? 'Click to replace this image' : 'or click to browse an image file'}
          </p>
          {file && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/60 px-3 py-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              <FileImage size={14} />
              <span className="truncate max-w-[220px]">{file.name}</span>
              <button
                type="button"
                className="ml-1 text-xs font-semibold text-red-500 hover:text-red-600"
                onClick={(e) => { e.stopPropagation(); onClear?.(); }}
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  </FormField>
);

// ─── Main Form ────────────────────────────────────────────────────────────────
const PatientForm = ({
  initialValues = PATIENT_EMPTY_FORM,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
  showCancel = true,
}) => {
  const [form, setForm] = useState({ ...PATIENT_EMPTY_FORM, ...initialValues });
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const cityOptions = cityOptionsForState(form.state);

  useEffect(() => {
    setForm({ ...PATIENT_EMPTY_FORM, ...initialValues });
    setErrors({});
  }, [initialValues]);

  useEffect(() => {
    const preview = form.patientPhotoPreview;
    return () => {
      if (preview?.startsWith('blob:')) URL.revokeObjectURL(preview);
    };
  }, [form.patientPhotoPreview]);

  const setField = (name, value) =>
    setForm((cur) => ({ ...cur, [name]: value }));

  const syncAgeFromDob = (dob) => {
    const { years, months, days } = calculateAgeFromDob(dob);
    setForm((cur) => ({ ...cur, dob, ageYears: years, ageMonths: months, ageDays: days }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'dob') {
      syncAgeFromDob(value);
      return;
    }

    // Name: alphabets + spaces only
    if (name === 'name') {
      if (value === '' || /^[A-Za-z\s]*$/.test(value)) {
        setField(name, value);
        if (errors.name) setErrors((cur) => ({ ...cur, name: '' }));
      }
      return;
    }

    // Numeric-only fields
    if (['phone', 'alternateNumber', 'ageYears', 'ageMonths', 'ageDays'].includes(name)) {
      setField(name, value.replace(/\D/g, ''));
      return;
    }

    // Aadhar: digits only, max 12
    if (name === 'adharNo') {
      setField(name, value.replace(/\D/g, '').slice(0, 12));
      return;
    }

    if (name === 'state') {
      const nextCities = cityOptionsForState(value).map((city) => city.value);
      setForm((cur) => ({
        ...cur,
        state: value,
        city: nextCities.includes(cur.city) ? cur.city : '',
      }));
      return;
    }

    setForm((cur) => ({ ...cur, [name]: value }));
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type?.startsWith('image/')) {
      setErrors((cur) => ({ ...cur, patientPhoto: 'Only image files are allowed' }));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setForm((cur) => ({
        ...cur,
        patientPhoto: file,
        patientPhotoName: file.name,
        patientPhotoPreview: String(reader.result || ''),
      }));
      setErrors((cur) => ({ ...cur, patientPhoto: '' }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validatePatient(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload = { ...form };
    delete payload.patientPhoto;
    delete payload.patientPhotoName;
    delete payload.patientPhotoPreview;
    delete payload.ageYears;
    delete payload.ageMonths;
    delete payload.ageDays;
    if (form.patientPhotoPreview) {
      payload.photo = form.patientPhotoPreview;
    }

    onSubmit?.(payload);
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const clearPhoto = () => {
    setForm((cur) => ({
      ...cur,
      patientPhoto: '',
      patientPhotoName: '',
      patientPhotoPreview: '',
    }));
    setErrors((cur) => ({ ...cur, patientPhoto: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Fields ─────────────────────────────────────────────────────────────────
  const fields = [
    {
      node: (
        <FormField label="Name" error={errors.name} required>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter patient name"
            leftIcon={<FieldIcon icon={<User size={14} />} />}
            inputClassName="h-10 text-sm"
            required
          />
        </FormField>
      ),
    },
    {
      node: (
        <FormField label="Gender" error={errors.gender} required>
          <SearchableSelect
            name="gender"
            value={form.gender}
            onChange={handleChange}
            options={PATIENT_GENDER_OPTIONS}
            placeholder="Select gender"
          />
        </FormField>
      ),
    },
    {
      node: (
        <FormField label="Date of Birth">
          <Input
            type="date"
            name="dob"
            value={form.dob}
            onChange={handleChange}
            leftIcon={<FieldIcon icon={<CalendarDays size={14} />} />}
            inputClassName="h-10 text-sm"
          />
        </FormField>
      ),
    },
    {
      node: (
        <FormField label="Age" error={errors.ageYears || errors.ageMonths || errors.ageDays}>
          <div className="grid grid-cols-3 gap-2.5">
            <Input
              type="text"
              name="ageYears"
              value={form.ageYears}
              onChange={handleChange}
              placeholder="Years"
              inputClassName="h-10 text-center text-sm"
              inputMode="numeric"
              maxLength={3}
            />
            <Input
              type="text"
              name="ageMonths"
              value={form.ageMonths}
              onChange={handleChange}
              placeholder="Months"
              inputClassName="h-10 text-center text-sm"
              inputMode="numeric"
              maxLength={2}
            />
            <Input
              type="text"
              name="ageDays"
              value={form.ageDays}
              onChange={handleChange}
              placeholder="Days"
              inputClassName="h-10 text-center text-sm"
              inputMode="numeric"
              maxLength={2}
            />
          </div>
        </FormField>
      ),
    },
    {
      node: (
        <FormField label="Blood Group">
          <SearchableSelect
            name="bloodGroup"
            value={form.bloodGroup}
            onChange={handleChange}
            options={PATIENT_BLOOD_OPTIONS}
            placeholder="Select blood group"
          />
        </FormField>
      ),
    },
    {
      node: (
        <FormField label="Marital Status">
          <SearchableSelect
            name="maritalStatus"
            value={form.maritalStatus}
            onChange={handleChange}
            options={PATIENT_MARITAL_STATUS_OPTIONS}
            placeholder="Select marital status"
          />
        </FormField>
      ),
    },
    {
      node: (
        <DropZone
          file={form.patientPhoto}
          preview={form.patientPhotoPreview}
          error={errors.patientPhoto}
          onPick={openFilePicker}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files?.[0]); }}
          onClear={clearPhoto}
        />
      ),
    },
    {
      node: (
        <FormField label="Phone" error={errors.phone} required>
          <Input
            type="text"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="10-digit phone number"
            leftIcon={<FieldIcon icon={<Phone size={14} />} />}
            inputClassName="h-10 text-sm"
            inputMode="numeric"
            maxLength={10}
            required
          />
        </FormField>
      ),
    },
    {
      node: (
        <FormField label="Email" error={errors.email}>
          <Input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            leftIcon={<FieldIcon icon={<Mail size={14} />} />}
            inputClassName="h-10 text-sm"
          />
        </FormField>
      ),
    },
    {
      node: (
        <FormField label="Alternate Number (Optional)" error={errors.alternateNumber}>
          <Input
            type="text"
            name="alternateNumber"
            value={form.alternateNumber}
            onChange={handleChange}
            placeholder="10-digit phone number"
            leftIcon={<FieldIcon icon={<Phone size={14} />} />}
            inputClassName="h-10 text-sm"
            inputMode="numeric"
            maxLength={10}
          />
        </FormField>
      ),
    },
    {
      node: (
        <FormField label="State">
          <SearchableSelect
            name="state"
            value={form.state}
            onChange={handleChange}
            options={INDIAN_STATES}
            placeholder="Select state"
          />
        </FormField>
      ),
    },
     {
      node: (
        <FormField label="City">
          <SearchableSelect
            name="city"
            value={form.city}
            onChange={handleChange}
            options={cityOptions}
            placeholder={form.state ? 'Select city' : 'Select state first'}
            isLoading={!form.state}
          />
        </FormField>
      ),
    },
     {
      node: (
        <FormField label="Address">
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            rows={3}
            placeholder="Enter address"
            className="input-base min-h-[92px] text-sm"
          />
        </FormField>
      ),
    },
    {
      node: (
        <FormField label="Insurance Provider">
          <SearchableSelect
            name="insuranceProvider"
            value={form.insuranceProvider}
            onChange={handleChange}
            options={PATIENT_TPA_OPTIONS}
            placeholder="Select insurance provider"
          />
        </FormField>
      ),
    },
    {
      node: (
        <FormField label="Insurance Policy No">
          <Input
            name="insurancePolicyNo"
            value={form.insurancePolicyNo}
            onChange={handleChange}
            placeholder="Enter policy number"
            leftIcon={<FieldIcon icon={<CreditCard size={14} />} />}
            inputClassName="h-10 text-sm"
          />
        </FormField>
      ),
    },
    {
      node: (
        <FormField label="Aadhar Number" error={errors.adharNo}>
          <Input
            name="adharNo"
            value={form.adharNo}
            onChange={handleChange}
            placeholder="Enter 12-digit Aadhar number"
            leftIcon={<FieldIcon icon={<Fingerprint size={14} />} />}
            inputClassName="h-10 text-sm"
            inputMode="numeric"
            maxLength={12}
          />
        </FormField>
      ),
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <section className="rounded-2xl border border-slate-200/80 dark:border-slate-700/60 bg-white/90 dark:bg-slate-900/40 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className={SECTION_HEADER_ICON}>
            <User size={18} />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-slate-900 dark:text-slate-100">
              Patient Registration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 max-w-2xl">
              Fill all patient intake details in one compact section.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {fields.map((field, i) => (
            <div key={i}>{field.node}</div>
          ))}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Fields marked with an asterisk are required.
        </p>
        <div className="flex items-center gap-3">
          {showCancel && onCancel ? (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          ) : null}
          <Button type="submit" className="min-w-[160px]">
            {submitLabel}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default PatientForm;

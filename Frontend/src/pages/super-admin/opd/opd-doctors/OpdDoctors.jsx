import { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Edit2,
  Plus,
  Save,
  Trash2,
  Eye,
  EyeOff,
  ActivitySquare,
  Stethoscope,
} from 'lucide-react';

import PageHeader   from '@components/layout/PageHeader/PageHeader';
import DataTable    from '@components/tables/DataTable/DataTable';
import Pagination   from '@components/tables/Pagination/Pagination';
import SearchBar    from '@components/forms/SearchBar/SearchBar';
import Button       from '@components/ui/Button/Button';
import Modal        from '@components/modals/Modal/Modal';
import ConfirmModal from '@components/modals/ConfirmModal/ConfirmModal';
import TableActions from '@components/tables/TableActions/TableActions';
import StatCard     from '@components/cards/StatCard/StatCard';
import { useModal }   from '@hooks/useModal';
import { useDebounce } from '@hooks/useDebounce';
import { selectCurrentUser } from '@store/slices/authSlice';
import { useDoctor } from '../../../../lib/opddoctor/opddoctorService';
import { useGetDepartmentsQuery } from '../../../../store/api/departmentApi/department';
import { useGetDesignationsQuery } from '../../../../store/api/opddoctorApi/opddoctorApi';

// ─── Constants ────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  name:           '',
  email:          '',
  phone:          '',
  password:       '',
  employee_code:  '',
  department_id:  '',
  designation_id: '',
  isActive:       true,
};

const PAGE_LIMIT = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDeptName = (departments, id) => {
  if (!departments || !Array.isArray(departments)) return '—';
  const found = departments.find((d) => d.id === id || d._id === id);
  return found?.name || '—';
};

const readDepartmentId = (row) => row.departmentId || row.department_id || '';
const readDesignationId = (row) => row.designationId || row.designation_id || '';
const readEmployeeCode = (row) => row.employee_code || row.employeeCode || row.id?.slice(-6)?.toUpperCase() || 'DOC';

const getDesigName = (designations, id) => {
  if (!designations || !Array.isArray(designations)) return '—';
  const found = designations.find((d) => d.id === id || d._id === id);
  return found?.name || found?.designation_name || '—';
};

const inputCls = (hasError) =>
  [
    'w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition',
    'bg-white dark:bg-slate-800 text-gray-800 dark:text-slate-100',
    'placeholder-gray-400 dark:placeholder-slate-500',
    hasError
      ? 'border-red-400 focus:ring-2 focus:ring-red-300'
      : 'border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-primary-500 focus:border-primary-400',
  ].join(' ');

// ─── Small local UI pieces ────────────────────────────────────────────────────

const AvatarPlaceholder = ({ name, size = 36 }) => {
  const initials = name
    ? name.replace('Dr. ', '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';
  const palette = ['#3b82f6','#8b5cf6','#ec4899','#10b981','#f59e0b','#06b6d4','#ef4444','#6366f1'];
  const bg = palette[(name?.charCodeAt(4) ?? 0) % palette.length];
  return (
    <div
      className="rounded-full flex items-center justify-center font-bold text-white shrink-0"
      style={{ width: size, height: size, background: bg, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
};

const DeptPill = ({ name }) => {
  const palette = ['#3b82f6', '#ef4444', '#f59e0b', '#ec4899', '#06b6d4', '#f97316', '#8b5cf6', '#10b981', '#6366f1', '#14b8a6', '#64748b', '#a855f7'];
  const color = palette[(name?.length || 0) % palette.length];
  return (
    <span
      className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap"
      style={{ background: color + '22', color, border: `1px solid ${color}44` }}
    >
      {name}
    </span>
  );
};

// ─── Page ─────────────────────────────────────────────────────────────────────

const DoctorPage = () => {

  // Current authenticated user
  const currentUser = useSelector(selectCurrentUser);

  // ── Fetch departments from backend API ─────────────────────────────────────
  const { data: departments = [], isLoading: departmentsLoading } = useGetDepartmentsQuery();
  
  // ── Fetch designations from backend API ────────────────────────────────────
  const { data: designations = [], isLoading: designationsLoading } = useGetDesignationsQuery();

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [search,       setSearch]       = useState('');
  const [filterDept,   setFilterDept]   = useState('');
  const [filterDesig,  setFilterDesig]  = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page,         setPage]         = useState(1);
  const [modalOpen,    setModalOpen]    = useState(false);
  const [editRow,      setEditRow]      = useState(null);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [errors,       setErrors]       = useState({});
  const [showPwd,      setShowPwd]      = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const deleteModal     = useModal();

  // ── API ────────────────────────────────────────────────────────────────────
  const {
    listQuery,
    create,
    update,
    remove,
    createLoading,
    updateLoading,
    deleteLoading,
  } = useDoctor({
    page,
    limit:          PAGE_LIMIT,
    role_id:        2,
    search:         debouncedSearch || undefined,
    department_id:  filterDept      || undefined,
    designation_id: filterDesig     || undefined,
    isActive:       filterStatus !== '' ? filterStatus : undefined,
  });

  const { data: apiData, isLoading, isFetching } = listQuery;

  const doctors    = apiData?.data       ?? [];
  const total      = apiData?.total      ?? 0;
  const totalPages = apiData?.totalPages ?? 1;
  const activeCount = doctors.filter((d) => d.isActive).length;
  const saving      = createLoading || updateLoading;

  // ── Modal handlers ─────────────────────────────────────────────────────────

  const openAdd = () => {
    setEditRow(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditRow(row);
    setForm({
      name:           row.name           || '',
      email:          row.email          || '',
      phone:          row.phone          || '',
      password:       '',
      employee_code:  readEmployeeCode(row),
      department_id:  readDepartmentId(row),
      designation_id: readDesignationId(row),
      isActive:       Boolean(row.isActive),
    });
    setErrors({});
    setModalOpen(true);
  };

  const closeModal = () => { if (!saving) setModalOpen(false); };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = () => {
    const e = {};
    if (!form.name.trim())
      e.name = 'Full name is required.';
    if (!form.email.trim())
      e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = 'Enter a valid email address.';
    if (!form.phone.trim())
      e.phone = 'Phone number is required.';
    else if (!/^[+\d\s-]{7,20}$/.test(form.phone.trim()))
      e.phone = 'Enter a valid phone number.';
    if (!editRow && !form.password)
      e.password = 'Password is required for new doctors.';
    else if (!editRow && form.password.length < 6)
      e.password = 'Password must be at least 6 characters.';
    if (!form.employee_code.trim())
      e.employee_code = 'Employee code is required.';
    if (!form.department_id)
      e.department_id = 'Department is required.';
    if (!form.designation_id)
      e.designation_id = 'Designation is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save / Delete ──────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!validate()) return;
    const payload = {
      ...form,
      name:          form.name.trim(),
      email:         form.email.trim().toLowerCase(),
      employee_code: form.employee_code.trim().toUpperCase(),
      employeeCode:  form.employee_code.trim().toUpperCase(),
      role:          'DOCTOR',
      role_id:       2,
      roleId:        2,
      departmentId:  form.department_id || null,
      designationId: form.designation_id || null,
    };
    if (editRow && !payload.password) delete payload.password;
    try {
      if (editRow) {
        await update({ id: editRow.id, ...payload });
      } else {
        await create(payload);
      }
      setModalOpen(false);
    } catch {
      // toast already fired inside useDoctor
    }
  };

  const handleDelete = async () => {
    try {
      await remove(deleteModal.data?.id);
      deleteModal.close();
    } catch {
      // toast already fired inside useDoctor
    }
  };

  // ── Table columns ──────────────────────────────────────────────────────────

  const columns = [
    {
      key: 'name',
      label: 'Doctor',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-2.5">
          <AvatarPlaceholder name={row.name} size={36} />
          <div>
            <p className="font-semibold text-sm text-gray-800 dark:text-slate-100 leading-tight">{row.name}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'employee_code',
      label: 'Employee Code',
      render: (_value, row) => (
        <span className="inline-block rounded-md bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 text-xs font-mono font-semibold text-primary-600 dark:text-primary-400">
          {readEmployeeCode(row)}
        </span>
      ),
    },
    {
      key: 'departmentId',
      label: 'Department',
      render: (_value, row) => <DeptPill name={getDeptName(departments, readDepartmentId(row))} />,
    },
    {
      key: 'designationId',
      label: 'Designation',
      render: (_value, row) => (
        <span className="text-sm text-gray-700 dark:text-slate-300">
          {getDesigName(designations, readDesignationId(row))}
        </span>
      ),
    },
    {
      key: 'phone',
      label: 'Contact',
      render: (value) => (
        <span className="text-sm text-gray-500 dark:text-slate-400 whitespace-nowrap">{value}</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
          <span className={`w-1.5 h-1.5 rounded-full ${value ? 'bg-green-500' : 'bg-gray-400 dark:bg-slate-500'}`} />
          <span className={value ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}>
            {value ? 'Active' : 'Inactive'}
          </span>
        </span>
      ),
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <TableActions
          actions={[
            { label: 'Edit',   icon: <Edit2  size={14} />, onClick: () => openEdit(row) },
            { label: 'Delete', icon: <Trash2 size={14} />, onClick: () => deleteModal.open(row), danger: true },
          ]}
        />
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="page-container">

      <PageHeader
        title="Doctors"
        subtitle="Manage all hospital doctors and their profiles."
        breadcrumbs={[
          { label: 'Super Admin', path: '/super-admin/dashboard' },
          { label: 'Doctors' },
        ]}
        actions={
          <Button variant="primary" leftIcon={<Plus size={15} />} onClick={openAdd}>
            Add Doctor
          </Button>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard
          title="Total Doctors"
          value={isLoading ? '—' : total}
          icon={<Stethoscope size={18} />}
        />
        <StatCard
          title="Active Doctors"
          value={isLoading ? '—' : activeCount}
          icon={<ActivitySquare size={18} />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Table Card */}
      <div className="card">

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3 flex-wrap">
          <SearchBar
            value={search}
            onChange={(value) => { setSearch(value); setPage(1); }}
            placeholder="Search doctor by name, email, phone, employee code…"
            className="max-w-xs"
          />
          <select
            value={filterDept}
            onChange={(e) => { setFilterDept(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 dark:border-slate-700 px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Departments</option>
            {departmentsLoading ? (
              <option disabled>Loading departments...</option>
            ) : (
              departments.map((dept) => (
                <option key={dept.id || dept._id} value={dept.id || dept._id}>
                  {dept.name}
                </option>
              ))
            )}
          </select>
          <select
            value={filterDesig}
            onChange={(e) => { setFilterDesig(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 dark:border-slate-700 px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Designations</option>
            {designationsLoading ? (
              <option disabled>Loading designations...</option>
            ) : (
              designations.map((desig) => (
                <option key={desig.id || desig._id} value={desig.id || desig._id}>
                  {desig.name || desig.designation_name}
                </option>
              ))
            )}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
            className="rounded-lg border border-gray-200 dark:border-slate-700 px-3 py-1.5 text-sm bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={doctors}
            keyField="id"
            loading={isLoading || isFetching}
          />
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            limit={PAGE_LIMIT}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* ── Add / Edit Modal ── */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editRow ? 'Edit Doctor' : 'Add Doctor'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={closeModal} disabled={saving}>
              Cancel
            </Button>
            <Button
              variant="primary"
              leftIcon={<Save size={14} />}
              onClick={handleSave}
              loading={saving}
            >
              {editRow ? 'Update' : 'Save'}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Dr. Robert Johnson"
              className={inputCls(!!errors.name)}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              value={form.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="doctor@hospital.com"
              className={inputCls(!!errors.email)}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              value={form.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+91 98765 43210"
              className={inputCls(!!errors.phone)}
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
              Employee Code <span className="text-red-500">*</span>
            </label>
            <input
              value={form.employee_code}
              onChange={(e) => handleChange('employee_code', e.target.value.toUpperCase())}
              placeholder="e.g. DOC001"
              className={inputCls(!!errors.employee_code)}
            />
            {errors.employee_code && <p className="mt-1 text-xs text-red-500">{errors.employee_code}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
              Password{!editRow && <span className="text-red-500"> *</span>}
              {editRow && (
                <span className="ml-1 font-normal text-gray-400 dark:text-slate-500">
                  (leave blank to keep current)
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder={editRow ? '••••••••' : 'Min 6 characters'}
                className={inputCls(!!errors.password) + ' pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
              Department <span className="text-red-500">*</span>
            </label>
            <select
              value={form.department_id}
              onChange={(e) => handleChange('department_id', e.target.value)}
              className={inputCls(!!errors.department_id)}
              disabled={departmentsLoading}
            >
              <option value="">Select department</option>
              {departmentsLoading ? (
                <option disabled>Loading departments...</option>
              ) : (
                departments.map((dept) => (
                  <option key={dept.id || dept._id} value={dept.id || dept._id}>
                    {dept.name}
                  </option>
                ))
              )}
            </select>
            {errors.department_id && <p className="mt-1 text-xs text-red-500">{errors.department_id}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1.5">
              Designation <span className="text-red-500">*</span>
            </label>
            <select
              value={form.designation_id}
              onChange={(e) => handleChange('designation_id', e.target.value)}
              className={inputCls(!!errors.designation_id)}
              disabled={designationsLoading}
            >
              <option value="">Select designation</option>
              {designationsLoading ? (
                <option disabled>Loading designations...</option>
              ) : (
                designations.map((desig) => (
                  <option key={desig.id || desig._id} value={desig.id || desig._id}>
                    {desig.name || desig.designation_name}
                  </option>
                ))
              )}
            </select>
            {errors.designation_id && <p className="mt-1 text-xs text-red-500">{errors.designation_id}</p>}
          </div>

          <div className="sm:col-span-2 flex items-center justify-between rounded-xl border border-gray-200 dark:border-slate-600 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-slate-200">Status</p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                Active doctors are visible across the system.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleChange('isActive', !form.isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.isActive ? 'bg-green-500' : 'bg-gray-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  form.isActive ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title="Remove Doctor"
        message={`Are you sure you want to remove "${deleteModal.data?.name}"? This action cannot be undone.`}
        variant="danger"
        loading={deleteLoading}
      />

    </div>
  );
};

export default DoctorPage;

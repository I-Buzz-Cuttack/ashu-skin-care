import { useMemo, useState } from 'react';
import { IndianRupee, Percent, Plus, ReceiptText, Save } from 'lucide-react';

import PageHeader from '@components/layout/PageHeader/PageHeader';
import DataTable from '@components/tables/DataTable/DataTable';
import Button from '@components/ui/Button/Button';
import Badge from '@components/ui/Badge/Badge';
import Modal from '@components/modals/Modal/Modal';
import ConfirmModal from '@components/modals/ConfirmModal/ConfirmModal';
import TableActions from '@components/tables/TableActions/TableActions';
import StatCard from '@components/cards/StatCard/StatCard';
import { useModal } from '@hooks/useModal';
import { useToast } from '@hooks/useToast';
import { useOpdCharge } from '@lib/opd/opdservice';
import { useGetOpdCategoriesQuery } from '@store/api/opdApi';
import { useGetDepartmentsQuery } from '@store/api/departmentApi/department';
import { useGetDoctorsQuery } from '@store/api/doctorApi/doctor';

const EMPTY_FORM = {
  name: '',
  chargeCategoryId: '',
  departmentId: '',
  doctorId: '',
  standardCharge: '',
  discountPercentage: '0',
  taxPercentage: '0',
  isActive: true,
};

const EMPTY_FILTERS = { search: '', category: '', department: '', doctor: '', status: '' };

const currency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const numberValue = (value) => Number(value || 0);

const inputCls = (error) => [
  'w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
  'placeholder-slate-400 focus:ring-3 focus:ring-primary-100 dark:focus:ring-primary-900/30',
  error ? 'border-red-400' : 'border-slate-200 dark:border-slate-600 focus:border-primary-400',
].join(' ');

const unwrapDoctor = (doctor) => ({
  ...doctor,
  departmentId: doctor.departmentId || doctor.department_id,
});

const DoctorFees = () => {
  const toast = useToast();
  const formModal = useModal();
  const deleteModal = useModal();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const { listQuery, create, update, remove, createLoading, updateLoading, deleteLoading } = useOpdCharge({ page: 1, limit: 1000 });
  const { data: categoryData } = useGetOpdCategoriesQuery({ page: 1, limit: 1000, isActive: true });
  const { data: departments = [] } = useGetDepartmentsQuery();
  const { data: doctorData } = useGetDoctorsQuery({ page: 1, limit: 1000, role_id: 2 });

  const charges = listQuery.data?.data ?? [];
  const categories = categoryData?.data ?? [];
  const doctors = (doctorData?.data ?? []).map(unwrapDoctor);
  const saving = createLoading || updateLoading;

  const categoryById = useMemo(() => new Map(categories.map((item) => [item.id, item])), [categories]);
  const departmentById = useMemo(() => new Map(departments.map((item) => [item.id, item])), [departments]);
  const doctorById = useMemo(() => new Map(doctors.map((item) => [item.id, item])), [doctors]);

  const rows = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return charges.filter((row) => {
      const searchText = [row.name, categoryById.get(row.chargeCategoryId)?.name, departmentById.get(row.departmentId)?.name, doctorById.get(row.doctorId)?.name].join(' ').toLowerCase();
      return (!q || searchText.includes(q)) &&
        (!filters.category || row.chargeCategoryId === filters.category) &&
        (!filters.department || row.departmentId === filters.department) &&
        (!filters.doctor || row.doctorId === filters.doctor) &&
        (filters.status === '' || String(Boolean(row.isActive)) === filters.status);
    });
  }, [charges, categoryById, departmentById, doctorById, filters]);

  const averageFee = rows.length ? rows.reduce((sum, row) => sum + numberValue(row.standardCharge), 0) / rows.length : 0;
  const taxableCount = rows.filter((row) => numberValue(row.taxPercentage) > 0).length;

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    formModal.open();
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || '',
      chargeCategoryId: row.chargeCategoryId || '',
      departmentId: row.departmentId || '',
      doctorId: row.doctorId || '',
      standardCharge: String(row.standardCharge ?? ''),
      discountPercentage: String(row.discountPercentage ?? 0),
      taxPercentage: String(row.taxPercentage ?? 0),
      isActive: Boolean(row.isActive),
    });
    setErrors({});
    formModal.open();
  };

  const handleChange = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };
      if (field === 'departmentId') next.doctorId = '';
      return next;
    });
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Fee name is required.';
    if (!form.chargeCategoryId) next.chargeCategoryId = 'Charge category is required.';
    if (!form.standardCharge || Number(form.standardCharge) < 0) next.standardCharge = 'Enter a valid fee.';
    ['discountPercentage', 'taxPercentage'].forEach((field) => {
      const value = Number(form[field]);
      if (Number.isNaN(value) || value < 0 || value > 100) next[field] = 'Use 0 to 100.';
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const payload = {
      name: form.name.trim(),
      chargeCategoryId: form.chargeCategoryId,
      departmentId: form.departmentId || null,
      doctorId: form.doctorId || null,
      standardCharge: Number(form.standardCharge || 0),
      discountPercentage: Number(form.discountPercentage || 0),
      taxPercentage: Number(form.taxPercentage || 0),
      isActive: form.isActive,
    };
    try {
      if (editing) await update({ id: editing.id, ...payload });
      else await create(payload);
      formModal.close();
    } catch {
      // service already shows a toast
    }
  };

  const handleDelete = async () => {
    try {
      await remove(deleteModal.data?.id);
      deleteModal.close();
    } catch {
      // service already shows a toast
    }
  };

  const filteredDoctors = form.departmentId ? doctors.filter((doctor) => doctor.departmentId === form.departmentId) : doctors;

  const columns = [
    {
      key: 'name',
      label: 'Fee Name',
      sortable: true,
      render: (value, row) => (
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{value}</p>
          <p className="text-xs text-slate-400">{categoryById.get(row.chargeCategoryId)?.name || row.chargeCategory?.name || 'General OPD'}</p>
        </div>
      ),
    },
    {
      key: 'departmentId',
      label: 'Department',
      render: (value) => departmentById.get(value)?.name || <span className="text-slate-400">All departments</span>,
    },
    {
      key: 'doctorId',
      label: 'Doctor',
      render: (value) => doctorById.get(value)?.name || <span className="text-slate-400">Any doctor</span>,
    },
    {
      key: 'standardCharge',
      label: 'Doctor Fee',
      sortable: true,
      render: (value) => <span className="font-semibold text-emerald-700 dark:text-emerald-300">{currency(value)}</span>,
    },
    {
      key: 'taxPercentage',
      label: 'Tax',
      render: (value, row) => <span className="text-sm text-slate-500">{numberValue(row.discountPercentage)}% disc / {numberValue(value)}% tax</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (value) => <Badge variant={value ? 'success' : 'default'}>{value ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'actions',
      label: '',
      width: '72px',
      mobileAction: true,
      render: (_, row) => <TableActions row={row} onEdit={openEdit} onDelete={() => deleteModal.open(row)} />,
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Doctor Fees"
        subtitle="Consultation fee master for OPD billing by category, department, and doctor."
        breadcrumbs={[
          { label: 'Super Admin', path: '/super-admin/dashboard' },
          { label: 'OPD', path: '/super-admin/opd' },
          { label: 'Doctor Fees' },
        ]}
        actions={<Button leftIcon={<Plus size={15} />} onClick={openAdd}>Add Fee</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Fee Rules" value={listQuery.isLoading ? '-' : rows.length} icon={<ReceiptText size={18} />} />
        <StatCard title="Average Fee" value={currency(averageFee)} icon={<IndianRupee size={18} />} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
        <StatCard title="Tax Enabled" value={taxableCount} icon={<Percent size={18} />} iconBg="bg-amber-100" iconColor="text-amber-600" />
      </div>

      <div className="card overflow-hidden">
        <DataTable
          columns={columns}
          data={rows}
          loading={listQuery.isLoading || listQuery.isFetching}
          keyField="id"
          emptyMessage="No doctor fee rules found"
          className="rounded-none border-0 shadow-none"
          filters={[
            { id: 'search', type: 'search', placeholder: 'Search fee, doctor, category...' },
            { id: 'category', type: 'select', label: 'Category', options: [{ label: 'All', value: '' }, ...categories.map((item) => ({ label: item.name, value: item.id }))] },
            { id: 'department', type: 'select', label: 'Department', options: [{ label: 'All', value: '' }, ...departments.map((item) => ({ label: item.name, value: item.id }))] },
            { id: 'doctor', type: 'select', label: 'Doctor', options: [{ label: 'All', value: '' }, ...doctors.map((item) => ({ label: item.name, value: item.id }))] },
            { id: 'status', type: 'select', label: 'Status', options: [{ label: 'All', value: '' }, { label: 'Active', value: 'true' }, { label: 'Inactive', value: 'false' }] },
          ]}
          filterValues={filters}
          onFilterChange={(id, value) => setFilters((current) => ({ ...current, [id]: value }))}
          onFilterReset={() => setFilters(EMPTY_FILTERS)}
        />
      </div>

      <Modal
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        title={editing ? 'Edit Doctor Fee' : 'Add Doctor Fee'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={formModal.close} disabled={saving}>Cancel</Button>
            <Button leftIcon={<Save size={14} />} onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Save'}</Button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="sm:col-span-2 block">
            <span className="text-xs font-semibold text-slate-500">Fee Name <span className="text-red-500">*</span></span>
            <input className={inputCls(errors.name)} value={form.name} onChange={(e) => handleChange('name', e.target.value)} placeholder="e.g. Dermatology consultation" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">Charge Category <span className="text-red-500">*</span></span>
            <select className={inputCls(errors.chargeCategoryId)} value={form.chargeCategoryId} onChange={(e) => handleChange('chargeCategoryId', e.target.value)}>
              <option value="">Select category</option>
              {categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            {errors.chargeCategoryId && <p className="mt-1 text-xs text-red-500">{errors.chargeCategoryId}</p>}
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">Department</span>
            <select className={inputCls()} value={form.departmentId} onChange={(e) => handleChange('departmentId', e.target.value)}>
              <option value="">All departments</option>
              {departments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">Doctor</span>
            <select className={inputCls()} value={form.doctorId} onChange={(e) => handleChange('doctorId', e.target.value)}>
              <option value="">Any doctor</option>
              {filteredDoctors.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">Doctor Fee <span className="text-red-500">*</span></span>
            <input type="number" min="0" className={inputCls(errors.standardCharge)} value={form.standardCharge} onChange={(e) => handleChange('standardCharge', e.target.value)} placeholder="500" />
            {errors.standardCharge && <p className="mt-1 text-xs text-red-500">{errors.standardCharge}</p>}
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">Discount %</span>
            <input type="number" min="0" max="100" className={inputCls(errors.discountPercentage)} value={form.discountPercentage} onChange={(e) => handleChange('discountPercentage', e.target.value)} />
            {errors.discountPercentage && <p className="mt-1 text-xs text-red-500">{errors.discountPercentage}</p>}
          </label>
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">Tax %</span>
            <input type="number" min="0" max="100" className={inputCls(errors.taxPercentage)} value={form.taxPercentage} onChange={(e) => handleChange('taxPercentage', e.target.value)} />
            {errors.taxPercentage && <p className="mt-1 text-xs text-red-500">{errors.taxPercentage}</p>}
          </label>
          <div className="sm:col-span-2 flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-600 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Active fee rule</p>
              <p className="text-xs text-slate-400">Active rules are available while creating OPD appointments.</p>
            </div>
            <input type="checkbox" checked={form.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} className="h-4 w-4 accent-[#0f766e]" />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title="Remove Fee Rule"
        message={`Are you sure you want to remove "${deleteModal.data?.name}"?`}
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default DoctorFees;

import { useMemo, useState } from 'react';
import { Building2, CheckCircle2, Plus, Save } from 'lucide-react';

import PageHeader from '@components/layout/PageHeader/PageHeader';
import DataTable from '@components/tables/DataTable/DataTable';
import Button from '@components/ui/Button/Button';
import Badge from '@components/ui/Badge/Badge';
import Modal from '@components/modals/Modal/Modal';
import ConfirmModal from '@components/modals/ConfirmModal/ConfirmModal';
import TableActions from '@components/tables/TableActions/TableActions';
import StatCard from '@components/cards/StatCard/StatCard';
import { useToast } from '@hooks/useToast';
import { useModal } from '@hooks/useModal';
import {
  useCreateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetDepartmentsQuery,
  useUpdateDepartmentMutation,
} from '@store/api/departmentApi/department';

const EMPTY_FORM = { name: '', isActive: true };
const EMPTY_FILTERS = { search: '', status: '' };

const inputCls = (hasError) => [
  'w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-slate-800',
  'text-slate-900 dark:text-slate-100 placeholder-slate-400',
  'focus:ring-3 focus:ring-primary-100 dark:focus:ring-primary-900/30',
  hasError ? 'border-red-400' : 'border-slate-200 dark:border-slate-600 focus:border-primary-400',
].join(' ');

const DepartmentMaster = () => {
  const toast = useToast();
  const addModal = useModal();
  const deleteModal = useModal();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const { data = [], isLoading, isFetching } = useGetDepartmentsQuery();
  const [createDepartment, createState] = useCreateDepartmentMutation();
  const [updateDepartment, updateState] = useUpdateDepartmentMutation();
  const [deleteDepartment, deleteState] = useDeleteDepartmentMutation();

  const saving = createState.isLoading || updateState.isLoading;

  const rows = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    return data.filter((row) => {
      const statusMatch = filters.status === '' || String(Boolean(row.isActive)) === filters.status;
      const searchMatch = !q || row.name?.toLowerCase().includes(q);
      return statusMatch && searchMatch;
    });
  }, [data, filters]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    addModal.open();
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ name: row.name || '', isActive: Boolean(row.isActive) });
    setErrors({});
    addModal.open();
  };

  const handleChange = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Department name is required.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const payload = { name: form.name.trim(), isActive: form.isActive };
    try {
      if (editing) {
        await updateDepartment({ id: editing.id, ...payload }).unwrap();
        toast.success('Department updated successfully.');
      } else {
        await createDepartment(payload).unwrap();
        toast.success('Department created successfully.');
      }
      addModal.close();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save department.');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDepartment(deleteModal.data?.id).unwrap();
      toast.success('Department removed.');
      deleteModal.close();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to remove department.');
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Department',
      sortable: true,
      render: (value) => <span className="font-semibold text-slate-800 dark:text-slate-100">{value}</span>,
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (value) => <Badge variant={value ? 'success' : 'default'}>{value ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (value) => value
        ? <span className="text-sm text-slate-500">{new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
        : <span className="text-slate-400">-</span>,
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
        title="Department Master"
        subtitle="Maintain OPD departments used for doctors, fees, and appointments."
        breadcrumbs={[
          { label: 'Super Admin', path: '/super-admin/dashboard' },
          { label: 'OPD', path: '/super-admin/opd' },
          { label: 'Department Master' },
        ]}
        actions={<Button leftIcon={<Plus size={15} />} onClick={openAdd}>Add Department</Button>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard title="Total Departments" value={isLoading ? '-' : data.length} icon={<Building2 size={18} />} />
        <StatCard title="Active Departments" value={isLoading ? '-' : data.filter((d) => d.isActive).length} icon={<CheckCircle2 size={18} />} iconBg="bg-emerald-100" iconColor="text-emerald-600" />
      </div>

      <div className="card overflow-hidden">
        <DataTable
          columns={columns}
          data={rows}
          loading={isLoading || isFetching}
          keyField="id"
          emptyMessage="No departments found"
          className="rounded-none border-0 shadow-none"
          filters={[
            { id: 'search', type: 'search', placeholder: 'Search department...' },
            { id: 'status', type: 'select', label: 'Status', options: [
              { label: 'All', value: '' },
              { label: 'Active', value: 'true' },
              { label: 'Inactive', value: 'false' },
            ] },
          ]}
          filterValues={filters}
          onFilterChange={(id, value) => setFilters((current) => ({ ...current, [id]: value }))}
          onFilterReset={() => setFilters(EMPTY_FILTERS)}
        />
      </div>

      <Modal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        title={editing ? 'Edit Department' : 'Add Department'}
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={addModal.close} disabled={saving}>Cancel</Button>
            <Button leftIcon={<Save size={14} />} onClick={handleSave} loading={saving}>{editing ? 'Update' : 'Save'}</Button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block">
            <span className="text-xs font-semibold text-slate-500">Department Name <span className="text-red-500">*</span></span>
            <input value={form.name} onChange={(e) => handleChange('name', e.target.value)} className={inputCls(errors.name)} placeholder="e.g. Dermatology" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </label>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-600 p-4">
            <div>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Active</p>
              <p className="text-xs text-slate-400">Available for OPD booking and fee setup.</p>
            </div>
            <input type="checkbox" checked={form.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} className="h-4 w-4 accent-[#0f766e]" />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title="Remove Department"
        message={`Are you sure you want to remove "${deleteModal.data?.name}"?`}
        variant="danger"
        loading={deleteState.isLoading}
      />
    </div>
  );
};

export default DepartmentMaster;

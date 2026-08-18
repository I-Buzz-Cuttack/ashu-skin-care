import { useState, useMemo, useEffect } from 'react';
import { Plus, Save, Tags, CheckCircle2 } from 'lucide-react';

import PageHeader   from '@components/layout/PageHeader/PageHeader';
import DataTable    from '@components/tables/DataTable/DataTable';
import Pagination   from '@components/tables/Pagination/Pagination';
import Button       from '@components/ui/Button/Button';
import Badge        from '@components/ui/Badge/Badge';
import StatCard     from '@components/cards/StatCard/StatCard';
import Modal        from '@components/modals/Modal/Modal';
import ConfirmModal from '@components/modals/ConfirmModal/ConfirmModal';
import TableActions from '@components/tables/TableActions/TableActions';

import { useModal }      from '@hooks/useModal';
import { useToast }      from '@hooks/useToast';
import { usePagination } from '@hooks/usePagination';
import { useDebounce }   from '@hooks/useDebounce';

import { useOpdCategory } from '../../../../lib/opd/opdservice';

/* ─────────────────── constants ─────────────────── */
const EMPTY_FORM = { name: '', multiplier: '1', description: '', isActive: true };

const STATUS_FILTER_OPTIONS = [
  { label: 'All Status', value: ''      },
  { label: 'Active',     value: 'true'  },
  { label: 'Inactive',   value: 'false' },
];

const EMPTY_FILTERS = { search: '', status: '' };

/* ─────────────────── helpers ─────────────────── */
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/* ─────────────────── shared form primitives ─────────────────── */
const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-slate-600 dark:text-slate-400">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
  </div>
);

const inputCls = (err) => [
  'w-full rounded-lg border px-3 py-2 text-sm',
  'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100',
  'placeholder-slate-400 dark:placeholder-slate-500',
  'focus:outline-none focus:ring-2 focus:ring-primary-500 transition',
  err ? 'border-red-400' : 'border-slate-200 dark:border-slate-600',
].join(' ');

/* ═══════════════════════════════════════════════════════════════
   PAGE COMPONENT
═══════════════════════════════════════════════════════════════ */
const OpdCategoryPage = () => {
  const toast = useToast();

  const [filterValues, setFilterValues] = useState(EMPTY_FILTERS);
  const [form,         setForm]         = useState(EMPTY_FORM);
  const [errors,       setErrors]       = useState({});
  const [activeRow,    setActiveRow]    = useState(null);

  const debouncedSearch          = useDebounce(filterValues.search, 300);
  const { page, limit, setPage } = usePagination(1, 10);

  const addModal    = useModal();
  const editModal   = useModal();
  const deleteModal = useModal();

  /* ── API ── */
  const {
    listQuery,
    create,
    update,
    remove,
    createLoading,
    updateLoading,
    deleteLoading,
  } = useOpdCategory({
    page,
    limit,
    name:     debouncedSearch || undefined,
    isActive: filterValues.status === '' ? undefined : filterValues.status === 'true',
  });

  const records     = listQuery.data?.data  ?? [];
  const total       = listQuery.data?.total ?? 0;
  const activeCount = records.filter(r => r.isActive).length;
  const saving      = createLoading || updateLoading;

  /* ── Reset page on filter change ── */
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filterValues.status]); // eslint-disable-line

  /* ── Filter config for DataTable ── */
  const filterConfig = [
    { id: 'search', type: 'search', placeholder: 'Search OPD category…'             },
    { id: 'status', type: 'select', label: 'Status', options: STATUS_FILTER_OPTIONS },
  ];

  /* ── Filter handlers ── */
  const handleFilterChange = (id, val) => setFilterValues(prev => ({ ...prev, [id]: val }));
  const handleFilterReset  = () => setFilterValues(EMPTY_FILTERS);

  /* ── Form change ── */
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  /* ── Validation ── */
  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'OPD category name is required.';
    if (form.multiplier === '' || Number.isNaN(Number(form.multiplier))) {
      next.multiplier = 'Multiplier must be a number.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  /* ── Open modals ── */
  const openAdd = () => {
    setActiveRow(null);
    setForm(EMPTY_FORM);
    setErrors({});
    addModal.open();
  };

  const openEdit = (row) => {
    setActiveRow(row);
    setForm({
      name:        row.name        || '',
      multiplier:  String(row.multiplier ?? 1),
      description: row.description || '',
      isActive:    Boolean(row.isActive),
    });
    setErrors({});
    editModal.open();
  };

  const openDelete = (row) => deleteModal.open(row);

  /* ── Save ── */
  const handleSave = async (isEdit) => {
    if (!validate()) return;

    const payload = {
      name:        form.name.trim(),
      multiplier:  Number(form.multiplier || 1),
      description: form.description.trim() || null,
      isActive:    form.isActive,
    };

    try {
      if (isEdit) {
        await update({ id: activeRow.id, ...payload });
        toast.success('OPD category updated successfully.');
        editModal.close();
      } else {
        await create(payload);
        toast.success('OPD category created successfully.');
        addModal.close();
      }
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to save OPD category.');
    }
  };

  /* ── Delete ── */
  const handleDelete = async () => {
    try {
      await remove(deleteModal.data?.id);
      toast.success('OPD category removed.');
      deleteModal.close();
    } catch (err) {
      toast.error(err?.data?.message || 'Failed to remove OPD category.');
    }
  };

  /* ── Shared form body ── */
  const renderFormBody = () => (
    <div className="space-y-4">

      <Field label="Category Name" required error={errors.name}>
        <input
          value={form.name}
          onChange={e => handleChange('name', e.target.value)}
          placeholder="e.g. General OPD"
          className={inputCls(!!errors.name)}
        />
      </Field>

      <Field label="Description">
        <textarea
          rows={3}
          value={form.description}
          onChange={e => handleChange('description', e.target.value)}
          placeholder="Short note for this OPD category"
          className={inputCls(false) + ' resize-none'}
        />
      </Field>

      {/* Status toggle */}
      <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Status</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            Inactive categories stay hidden from normal charge selection.
          </p>
        </div>
        <button
          type="button"
          onClick={() => handleChange('isActive', !form.isActive)}
          role="switch"
          aria-checked={form.isActive}
          className={[
            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500',
            form.isActive ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600',
          ].join(' ')}
        >
          <span className={[
            'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform',
            form.isActive ? 'translate-x-4' : 'translate-x-0',
          ].join(' ')} />
        </button>
      </div>

    </div>
  );

  /* ── Columns ── */
  const columns = [
    {
      key: 'name', label: 'OPD Category', sortable: true,
      render: v => (
        <span className="font-semibold text-primary-600 dark:text-primary-400">{v}</span>
      ),
    },
    {
      key: 'description', label: 'Description',
      render: v => v
        ? <span className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 max-w-sm">{v}</span>
        : <span className="text-slate-300 dark:text-slate-600 text-sm">—</span>,
    },
    {
      key: 'isActive', label: 'Status', sortable: true,
      render: v => <Badge variant={v ? 'success' : 'default'}>{v ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      key: 'createdAt', label: 'Created At', sortable: true,
      render: v => <span className="text-xs text-slate-500 dark:text-slate-400">{fmtDate(v)}</span>,
    },
    {
      key: 'actions', label: 'Actions',
      render: (_, row) => (
        <TableActions
          row={row}
          onEdit={openEdit}
          onDelete={openDelete}
        />
      ),
    },
  ];

  /* ── render ── */
  return (
    <div className="page-container">

      <PageHeader
        title="OPD Categories"
        subtitle="Create and manage OPD categories used for outpatient charge rules."
        breadcrumbs={[
          { label: 'Super Admin', path: '/super-admin/dashboard' },
          { label: 'OPD',         path: '/super-admin/opd'        },
          { label: 'OPD Categories' },
        ]}
        actions={
          <Button variant="primary" leftIcon={<Plus size={15} />} onClick={openAdd}>
            Add OPD Category
          </Button>
        }
      />

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <StatCard
          title="Total Categories"
          value={listQuery.isLoading ? '—' : total}
          icon={<Tags size={18} />}
        />
        <StatCard
          title="Active"
          value={listQuery.isLoading ? '—' : activeCount}
          icon={<CheckCircle2 size={18} />}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* ── Table Card ── */}
      <div className="card overflow-hidden">
        <DataTable
          columns={columns}
          data={records}
          keyField="id"
          loading={listQuery.isLoading || listQuery.isFetching}
          emptyMessage="No OPD categories found"
          className="rounded-none border-0 shadow-none"
          filters={filterConfig}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onFilterReset={handleFilterReset}
        />

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {total === 0
              ? 'No records'
              : `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total} categories`}
          </span>
          <Pagination
            page={page}
            totalPages={Math.ceil(total / limit)}
            total={total}
            limit={limit}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* ════ ADD MODAL ════ */}
      <Modal
        isOpen={addModal.isOpen}
        onClose={addModal.close}
        title="Add OPD Category"
        size="md"
        footer={
          <>
            <p className="text-xs text-slate-400 mr-auto">
              Fields marked <span className="text-red-500 font-bold">*</span> are required
            </p>
            <Button variant="outline" onClick={addModal.close} disabled={saving}>Cancel</Button>
            <Button variant="primary" leftIcon={<Save size={14} />} onClick={() => handleSave(false)} loading={saving}>
              Save
            </Button>
          </>
        }
      >
        {renderFormBody()}
      </Modal>

      {/* ════ EDIT MODAL ════ */}
      <Modal
        isOpen={editModal.isOpen}
        onClose={editModal.close}
        title="Edit OPD Category"
        subtitle={activeRow ? `Editing: ${activeRow.name}` : ''}
        size="md"
        footer={
          <>
            <p className="text-xs text-slate-400 mr-auto">
              Fields marked <span className="text-red-500 font-bold">*</span> are required
            </p>
            <Button variant="outline" onClick={editModal.close} disabled={saving}>Cancel</Button>
            <Button variant="primary" leftIcon={<Save size={14} />} onClick={() => handleSave(true)} loading={saving}>
              Update
            </Button>
          </>
        }
      >
        {renderFormBody()}
      </Modal>

      {/* ════ DELETE CONFIRM ════ */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title="Remove OPD Category"
        message={`Are you sure you want to remove "${deleteModal.data?.name}"? This action cannot be undone.`}
        variant="danger"
        loading={deleteLoading}
      />

    </div>
  );
};

export default OpdCategoryPage;
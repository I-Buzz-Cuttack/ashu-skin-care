// src/pages/super-admin/Patients/PatientsPage.jsx
import { useEffect, useMemo, useState } from 'react';
import {
  Users, UserCheck, UserX, AlertTriangle, Plus, Trash2,
} from 'lucide-react';
import PageHeader   from '../../../components/layout/PageHeader/PageHeader';
import Pagination   from '../../../components/tables/Pagination/Pagination';
import Button       from '../../../components/ui/Button/Button';
import Badge        from '../../../components/ui/Badge/Badge';
import ConfirmModal from '../../../components/modals/ConfirmModal/ConfirmModal';
import DataTable    from '../../../components/tables/DataTable/DataTable';
import StatCard     from '../../../components/cards/StatCard/StatCard';
import TableActions from '../../../components/tables/TableActions/TableActions';
import useRoleNavigate from '../../../hooks/useRoleNavigate';
import { usePermission } from '../../../hooks/usePermission';

import { useModal }    from '../../../hooks/useModal';
import { useToast }    from '../../../hooks/useToast';
import { ROUTES }      from '../../../constants/routes';
import { usePatients } from './hooks/usePatients';
import {
  exportPatientsToXlsx,
} from './utils/patient.export';
import { formatPatientId, formatPatientAge } from './utils/patient.utils';

/* ── Static filter options ─────────────────────────────────── */
const GENDER_OPTIONS = [
  { label: 'All Genders', value: '' },
  { label: 'Male',        value: 'male'   },
  { label: 'Female',      value: 'female' },
  { label: 'Other',       value: 'other'  },
];

const TYPE_OPTIONS = [
  { label: 'All Types', value: ''          },
  { label: 'OPD',       value: 'opd'       },
  { label: 'IPD',       value: 'ipd'       },
  { label: 'Emergency', value: 'emergency' },
];

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: ''            },
  { label: 'Active',       value: 'active'       },
  { label: 'Admitted',     value: 'admitted'     },
  { label: 'Discharged',   value: 'discharged'   },
  { label: 'Critical',     value: 'critical'     },
  { label: 'Outpatient',   value: 'outpatient'   },
  { label: 'Inactive',     value: 'inactive'     },
];

const EMPTY_FILTERS = {
  search:   '',
  gender:   '',
  type:     '',
  status:   '',
  doctor:   '',
  dateFrom: '',
  dateTo:   '',
};

/* ── Column config ─────────────────────────────────────────── */
const buildColumns = (onView, onEdit, onDelete, rowOffset) => [
  {
    key:   'serial',
    label: '#',
    width: '52px',
    render: (_v, _row, index) => (
      <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
        {rowOffset + index + 1}
      </span>
    ),
  },
  {
    key:      'patientId',
    label:    'Patient ID',
    sortable: true,
    render: (_v, row, index) => (
      <span className="text-xs font-mono font-semibold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 px-2 py-0.5 rounded-md whitespace-nowrap">
        {formatPatientId(row.patientId ?? row.id, index)}
      </span>
    ),
  },
  {
    key:          'uhid',
    label:        'UHID',
    sortable:     true,
    mobileHidden: true,
    render: (_v, row) => (
      <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
        {row.uhid ?? '—'}
      </span>
    ),
  },
  {
    key:         'name',
    label:       'Patient Name',
    sortable:    true,
    mobileLabel: false,
    render: (_v, row) => (
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold shadow-sm"
          style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}
        >
          {(row.name ?? '?').charAt(0).toUpperCase()}
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">
          {row.name ?? '—'}
        </p>
      </div>
    ),
  },
  {
    key:      'gender',
    label:    'Gender',
    sortable: true,
    render: (_v, row) => {
      const g = (row.gender ?? '').toLowerCase();
      const variant = g === 'male' ? 'primary' : g === 'female' ? 'purple' : 'default';
      return row.gender
        ? <Badge variant={variant}>{row.gender}</Badge>
        : <span className="text-slate-400">—</span>;
    },
  },
  {
    key:      'age',
    label:    'Age',
    sortable: true,
    render: (_v, row) => {
      const age = formatPatientAge(row);
      return (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {age !== '-' ? age : row.age != null ? `${row.age} yrs` : '—'}
        </span>
      );
    },
  },
  {
    key:   'phone',
    label: 'Mobile Number',
    render: (_v, row) => (
      <span className="text-sm text-slate-600 dark:text-slate-300">{row.phone ?? '—'}</span>
    ),
  },
  {
    key:          'bloodGroup',
    label:        'Blood Group',
    mobileHidden: true,
    render: (_v, row) => {
      const bg = row.bloodGroup ?? '';
      return bg
        ? <Badge variant="danger" className="font-mono font-semibold">{bg}</Badge>
        : <span className="text-slate-400">—</span>;
    },
  },
  {
    key:          'registeredAt',
    label:        'Registration Date',
    sortable:     true,
    mobileHidden: true,
    render: (_v, row) => {
      const d = row.registeredAt ?? row.createdAt;
      return (
        <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {d ? new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—'}
        </span>
      );
    },
  },
  {
    key:          'status',
    label:        'Status',
    sortable:     true,
    mobileAction: true,
    render: (_v, row) => {
      const rawStatus = row.status ?? row.patientStatus ?? row.state ?? '';
      const s = rawStatus.toLowerCase();
      if (!s) return <span className="text-slate-400 text-sm">—</span>;

      const variant =
        s === 'admitted' || s === 'active' ? 'success'  :
        s === 'discharged'                 ? 'default'  :
        s === 'critical'                   ? 'danger'   :
        s === 'outpatient'                 ? 'primary'  :
        s === 'inactive'                   ? 'warning'  : 'default';

      const label = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1);
      return <Badge variant={variant}>{label}</Badge>;
    },
  },
  {
    key:          'actions',
    label:        '',
    width:        '48px',
    mobileAction: true,
    render: (_v, row) => (
      <TableActions row={row} onView={onView} onEdit={onEdit} onDelete={onDelete} />
    ),
  },
];

/* ═══════════════════════════════════════════════════════════
   PatientsPage
═══════════════════════════════════════════════════════════ */
const PatientsPage = () => {
  const navigate = useRoleNavigate();
const { can } = usePermission();
  const deleteModal = useModal();
  const toast       = useToast();

  const [selectedIds,  setSelectedIds]  = useState([]);
  const [filterValues, setFilterValues] = useState(EMPTY_FILTERS);

  const {
    search, setSearch,
    page, limit, setPage, setLimit,
    filteredPatients, paginatedPatients,
    stats, totalPages, isLoading,
    removePatients,
    doctors,
  } = usePatients();

  /* ── Sync search to hook ── */
  useEffect(() => {
    setSearch(filterValues.search ?? '');
  }, [filterValues.search, setSearch]);

  /* ── Reset page on filter / limit change ── */
  useEffect(() => { setPage(1); }, [filterValues, limit, setPage]);

  /* ── Prune selections ── */
  useEffect(() => {
    setSelectedIds(cur => cur.filter(id => filteredPatients.some(p => p.id === id)));
  }, [filteredPatients]);

  /* ── Client-side filter ── */
  const displayData = useMemo(() => {
    return paginatedPatients.filter(p => {
      const gMatch = !filterValues.gender || (p.gender ?? '').toLowerCase() === filterValues.gender;
      const sMatch = !filterValues.status || (p.status ?? '').toLowerCase() === filterValues.status;
      const tMatch = !filterValues.type   || (p.type ?? p.patientType ?? '').toLowerCase() === filterValues.type;
      const dMatch = !filterValues.doctor || (p.doctorId ?? p.doctor ?? '') === filterValues.doctor;

      let dateMatch = true;
      if (filterValues.dateFrom || filterValues.dateTo) {
        const reg = new Date(p.registeredAt ?? p.createdAt);
        if (filterValues.dateFrom) dateMatch = dateMatch && reg >= new Date(filterValues.dateFrom);
        if (filterValues.dateTo)   dateMatch = dateMatch && reg <= new Date(filterValues.dateTo + 'T23:59:59');
      }
      return gMatch && sMatch && tMatch && dMatch && dateMatch;
    });
  }, [paginatedPatients, filterValues]);

  /* ── Filter config ── */
  const FILTER_CONFIG = useMemo(() => [
    {
      id:          'search',
      type:        'search',
      placeholder: 'Search by name, Patient ID, mobile…',
    },
    {
      id:      'gender',
      type:    'select',
      label:   'Gender',
      options: GENDER_OPTIONS,
    },
    {
      id:      'type',
      type:    'select',
      label:   'Patient Type',
      options: TYPE_OPTIONS,
    },
    {
      id:      'status',
      type:    'select',
      label:   'Status',
      options: STATUS_OPTIONS,
    },
    {
      id:      'doctor',
      type:    'select',
      label:   'Doctor',
      options: [
        { label: 'All Doctors', value: '' },
        ...(doctors ?? []).map(d => ({ label: d.name ?? d, value: d.id ?? d })),
      ],
    },
    {
      id:    'dateFrom',
      type:  'date',
      label: 'Registered From',
    },
    {
      id:    'dateTo',
      type:  'date',
      label: 'Registered To',
    },
  ], [doctors]);

  const handleFilterChange = (id, val) => setFilterValues(prev => ({ ...prev, [id]: val }));
  const handleFilterReset  = () => setFilterValues(EMPTY_FILTERS);

  /* ── Export ── */
  const handleExport = () => {
    if (!filteredPatients.length) { toast.error('No patients available to export.'); return; }
    exportPatientsToXlsx(filteredPatients, 'patients.xlsx');
    toast.success('Exported as Excel.');
  };

  /* ── Delete ── */
  const openBulkDelete = () => {
    if (!selectedIds.length) { toast.error('Please select at least one patient first.'); return; }
    deleteModal.open([...selectedIds]);
  };

  const handleDelete = () => {
    removePatients(deleteModal.data || []);
    setSelectedIds(cur => cur.filter(id => !(deleteModal.data || []).includes(id)));
    deleteModal.close();
  };

  /* ── Columns ── */
  // const columns = useMemo(() => buildColumns(
  //   row => navigate(ROUTES.SUPER_ADMIN.PATIENT_VIEW.replace(':id', row.id)),
  //   row => navigate(ROUTES.SUPER_ADMIN.PATIENT_EDIT.replace(':id', row.id)),
  //   row => deleteModal.open([row.id]),
  // ), [navigate, deleteModal]);

  const columns = useMemo(() => buildColumns(
  row => navigate(ROUTES.SUPER_ADMIN.PATIENT_VIEW.replace(':id', row.id)),
  row => navigate(ROUTES.SUPER_ADMIN.PATIENT_EDIT.replace(':id', row.id)),
  row => deleteModal.open([row.id]),
), [navigate, deleteModal]);

  const rowOffset = (page - 1) * limit;
  const columnsWithOffset = useMemo(() => columns.map(col =>
    col.key !== 'serial' ? col : {
      ...col,
      render: (_v, _row, idx) => (
        <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">
          {rowOffset + idx + 1}
        </span>
      ),
    }
  ), [columns, rowOffset]);

  /* ── Toolbar ── */
  const toolbarLeft = selectedIds.length > 0 && (
    <Button
      variant="danger"
      size="sm"
      className="h-8"
      leftIcon={<Trash2 size={14} />}
      onClick={openBulkDelete}
    >
      Delete ({selectedIds.length})
    </Button>
  );

  const toolbarRight = (
    <Button
      size="sm"
      className="h-8 shadow-sm"
      leftIcon={<Plus size={13} />}
      onClick={() => navigate(ROUTES.SUPER_ADMIN.PATIENT_CREATE)}
    >
      Add Patient
    </Button>
  );

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div className="page-container flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-surface-500">Loading patients…</p>
        </div>
      </div>
    );
  }

  /* ── Render ── */
  return (
    <div className="page-container">

      <PageHeader
        title="Patients"
        subtitle="All registered clinic patients"
        breadcrumbs={[{ label: 'Super Admin' }, { label: 'Patients' }]}
        actions={
  can('patient', 'create') && (
    // <Button
    //   leftIcon={<Plus size={15} />}
    //   onClick={() => navigate('/patients/create')}
    //   className="h-10"
    // >
    //   Add Patient
    // </Button>
    null
  )
}
      />

      {/* Stat cards */}
      <div className="stat-cards-grid">
        <StatCard
          title="Total Patients"
          value={stats?.total ?? 0}
          icon={<Users />}
          iconBg="bg-primary-100"
          description="all time"
        />
        <StatCard
          title="Active Records"
          value={stats?.active ?? 0}
          icon={<UserCheck />}
          iconBg="bg-green-100"
          changeType="increase"
          description="currently active"
        />
        <StatCard
          title="Inactive"
          value={stats?.inactive ?? 0}
          icon={<UserX />}
          iconBg="bg-amber-100"
          description="not active"
        />
        <StatCard
          title="Listed Here"
          value={filteredPatients?.length ?? 0}
          icon={<AlertTriangle />}
          iconBg="bg-red-100"
          changeType="neutral"
          description="after search"
        />
      </div>

      {/* Table card */}
       <div className="card overflow-hidden">
        <DataTable
          columns={columns}
          data={displayData}
          loading={isLoading}
          keyField="id"
          emptyMessage="No patients found"
          className="rounded-none border-0 shadow-none"
          filters={FILTER_CONFIG}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onFilterReset={handleFilterReset}
          onExport={handleExport}
          toolbarLeft={toolbarLeft}
          toolbarRight={toolbarRight}
        />

        <div className="p-4 border-t border-surface-200 dark:border-slate-700">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </div>

      {/* Confirm delete */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        onConfirm={handleDelete}
        title={deleteModal.data?.length > 1 ? 'Remove Selected Patients' : 'Remove Patient'}
        message={
          deleteModal.data?.length > 1
            ? 'Are you sure you want to remove the selected patients? This action cannot be undone.'
            : 'Are you sure you want to remove this patient? This action cannot be undone.'
        }
        variant="danger"
      />
    </div>
  );
};
export default PatientsPage;

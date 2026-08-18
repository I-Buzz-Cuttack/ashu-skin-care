import Avatar from '@components/ui/Avatar/Avatar';
// import Badge from '@components/ui/Badge/Badge';
import PatientActions from './PatientActions';
import { formatPatientAge } from '../utils/patient.formatters';

const columns = [
  { key: 'name', label: 'Patient', width: 160 },
  { key: 'phone', label: 'Phone', width: 110 },
  { key: 'age', label: 'Age', width: 100 },
  { key: 'blood', label: 'Blood', width: 90 },
  { key: 'tpa', label: 'TPA', width: 130 },
  { key: 'registered', label: 'Registered', width: 110 },
  // { key: 'status', label: 'Status', width: 100 },
  { key: 'actions', label: 'Actions', width: 80, align: 'right' },
];

const PatientTable = ({
  data,
  rowOffset = 0,
  selectedIds = [],
  onToggleRow,
  onToggleAll,
  allSelected = false,
  someSelected = false,
  onView,
  onEdit,
  onDelete,
}) => {
  // const getStatusMeta = (status) => {
  //   const isActive = status === true || status === 'Active';
  //   return {
  //     isActive,
  //     label: isActive ? 'Active' : 'Inactive',
  //     variant: isActive ? 'success' : 'danger',
  //   };
  // };

  return (
    <div className="overflow-x-auto overflow-y-visible relative">
      <table className="table-base table-fixed min-w-[1080px]">
        <thead>
          <tr>
            <th style={{ width: 40 }} className="w-[40px]">
              <label className="inline-flex items-center justify-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(node) => {
                    if (node) node.indeterminate = someSelected && !allSelected;
                  }}
                  onChange={(event) => onToggleAll?.(event.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  aria-label="Select all patients"
                />
              </label>
            </th>
            <th className="w-[62px]">#</th>
            {columns.map((column) => (
              <th
                key={column.key}
                style={{ width: column.width }}
                className={column.align === 'right' ? 'text-right' : ''}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {data.map((row, index) => {
            const checked = selectedIds.includes(row.id);
            // const statusMeta = getStatusMeta(row.status);

            return (
              <tr key={row.id} className="group">
                <td className="w-[56px]">
                  <label className="inline-flex items-center justify-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => onToggleRow?.(row.id, event.target.checked)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                      aria-label={`Select patient ${row.name}`}
                    />
                  </label>
                </td>

                <td className="w-[72px] text-slate-400 dark:text-slate-500 font-medium">
                  {rowOffset + index + 1}
                </td>

                <td className="w-[240px]">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar name={row.name} size="sm" />
                    <div className="min-w-0">
                      <p
                        className="font-semibold text-surface-900 truncate max-w-[165px]"
                        title={row.name}
                      >
                        {row.name || '-'}
                      </p>
                      <p
                        className="text-xs text-surface-400 truncate max-w-[165px]"
                        title={row.email}
                      >
                        {row.email || '-'}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="w-[130px]">{row.phone || '-'}</td>

                <td className="w-[110px]">
                  {`${formatPatientAge(row)} / ${row.gender || '-'}`}
                </td>

                <td className="w-[100px]">{row.bloodGroup || row.blood || '-'}</td>

                <td className="w-[180px]">
                  <span
                    className="block truncate max-w-[150px]"
                    title={row.insuranceProvider || row.insurancePolicyNo || row.tpa || '-'}
                  >
                    {row.insuranceProvider || row.insurancePolicyNo || row.tpa || '-'}
                  </span>
                </td>

                <td className="w-[130px]">
                  {row.registeredAt
                    ? new Date(row.registeredAt).toLocaleDateString()
                    : row.createdAt
                      ? new Date(row.createdAt).toLocaleDateString()
                      : '-'}
                </td>

                {/* <td className="w-[110px]">
                  <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                </td> */}

                <td className="w-[90px]">
                  <PatientActions
                    onView={() => onView?.(row)}
                    onEdit={() => onEdit?.(row)}
                    onDelete={() => onDelete?.(row)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PatientTable;
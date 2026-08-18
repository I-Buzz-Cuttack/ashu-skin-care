import { Eye, PencilLine, Trash2 } from 'lucide-react';
import TableActions from '@components/tables/TableActions/TableActions';

const PatientActions = ({ onView, onEdit, onDelete }) => (
  <div className="flex w-full items-center justify-end">
    <TableActions
      actions={[
        { label: 'View', icon: <Eye size={14} />, onClick: onView },
        { label: 'Edit', icon: <PencilLine size={14} />, onClick: onEdit },
        { label: 'Delete', icon: <Trash2 size={14} />, onClick: onDelete, danger: true },
      ]}
    />
  </div>
);

export default PatientActions;

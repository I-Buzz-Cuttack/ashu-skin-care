// src/components/modals/ConfirmModal/ConfirmModal.jsx
import { AlertTriangle, Trash2 } from 'lucide-react';
import Modal from '../Modal/Modal';
import Button from '../../ui/Button/Button';

const ConfirmModal = ({
  isOpen, onClose, onConfirm,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} size="sm">
    <div className="flex flex-col items-center text-center gap-4 py-2">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center
        ${variant === 'danger'
          ? 'bg-red-50 dark:bg-red-900/30'
          : 'bg-amber-50 dark:bg-amber-900/30'}`}>
        {variant === 'danger'
          ? <Trash2 size={24} className="text-red-500" />
          : <AlertTriangle size={24} className="text-amber-500" />}
      </div>
      <div>
        <h3 className="font-bold font-display text-slate-900 dark:text-slate-100 text-lg">{title}</h3>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">{message}</p>
      </div>
      <div className="flex gap-2.5 w-full mt-1">
        <Button variant="secondary" onClick={onClose} className="flex-1">{cancelLabel}</Button>
        <Button variant="danger" onClick={onConfirm} loading={loading} className="flex-1">{confirmLabel}</Button>
      </div>
    </div>
  </Modal>
);

export default ConfirmModal;

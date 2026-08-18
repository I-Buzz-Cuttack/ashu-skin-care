// src/hooks/useToast.js
import { useDispatch } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';

/**
 * useToast — trigger toast notifications from any component.
 *
 * Usage:
 *   const toast = useToast();
 *   toast.success('Patient saved!');
 *   toast.error('Something went wrong');
 *   toast.warning('Low stock alert');
 *   toast.info('Appointment reminder');
 */
export const useToast = () => {
  const dispatch = useDispatch();

  const show = (type, message, duration = 4000) => {
    dispatch(addToast({ type, message, duration }));
  };

  return {
    success: (msg, dur) => show('success', msg, dur),
    error:   (msg, dur) => show('error',   msg, dur),
    warning: (msg, dur) => show('warning', msg, dur),
    info:    (msg, dur) => show('info',    msg, dur),
  };
};

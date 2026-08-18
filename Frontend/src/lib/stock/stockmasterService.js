/**
 * stockMasterService.js
 *
 * Usage:
 *   const service = useStockMasterService();
 *   await service.update(id, { current_qty, unit_price, total_value });
 */

import { useDispatch } from 'react-redux';
import {
  useCreateStockMasterMutation,
  useUpdateStockMasterMutation,
  usePatchStockMasterMutation,
  useDeleteStockMasterMutation,
} from '../../store/api/stockMasterApi';

// ── TODO: replace with your actual notification action ────────────────────────
// e.g. import { addNotification } from '../slices/notificationSlice';
const notify = (payload) => ({ type: 'notifications/add', payload });

const extractMessage = (error, fallback) =>
  error?.data?.message || error?.data?.error || error?.message || fallback;

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useStockMasterService = () => {
  const dispatch = useDispatch();

  const [createMutation] = useCreateStockMasterMutation();
  const [updateMutation] = useUpdateStockMasterMutation();
  const [patchMutation]  = usePatchStockMasterMutation();
  const [deleteMutation] = useDeleteStockMasterMutation();

  const toast = (type, message) => dispatch(notify({ type, message }));

  const create = async (data) => {
    try {
      const result = await createMutation(data).unwrap();
      toast('success', 'Stock master record created successfully.');
      return { success: true, data: result };
    } catch (error) {
      toast('error', extractMessage(error, 'Failed to create stock master.'));
      return { success: false, error };
    }
  };

  const update = async (id, data) => {
    try {
      const result = await updateMutation({ id, ...data }).unwrap();
      toast('success', 'Stock master updated successfully.');
      return { success: true, data: result };
    } catch (error) {
      toast('error', extractMessage(error, 'Failed to update stock master.'));
      return { success: false, error };
    }
  };

  const patch = async (id, data) => {
    try {
      const result = await patchMutation({ id, ...data }).unwrap();
      toast('success', 'Stock master updated.');
      return { success: true, data: result };
    } catch (error) {
      toast('error', extractMessage(error, 'Failed to patch stock master.'));
      return { success: false, error };
    }
  };

  const remove = async (id) => {
    try {
      await deleteMutation(id).unwrap();
      toast('success', 'Stock master record deleted.');
      return { success: true };
    } catch (error) {
      toast('error', extractMessage(error, 'Failed to delete stock master.'));
      return { success: false, error };
    }
  };

  return { create, update, patch, remove };
};
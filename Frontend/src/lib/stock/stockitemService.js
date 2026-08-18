/**
 * stockItemService.js
 *
 * Usage:
 *   const service = useStockItemService();
 *   await service.create({ item_name: 'Paracetamol', ... });
 *
 * NOTE: Replace `addNotification` below with whatever action your
 *       notificationSlice exports. Common names:
 *         addNotification | showNotification | pushNotification | notify
 */

import { useDispatch } from 'react-redux';
import {
  useCreateStockItemMutation,
  useUpdateStockItemMutation,
  usePatchStockItemMutation,
  useDeleteStockItemMutation,
} from '@store/api/stockItemApi';

// ─── TODO: swap this import to match your slice's actual export ───────────────
// e.g.  import { addNotification }  from '../slices/notificationSlice';
//       import { pushNotification } from '../slices/notificationSlice';

// ── Service Definition ─────────────────────────────────────────────────────────

// Derive the action creator from the reducer if direct export is unavailable.
// Most RTK slices expose actions via `slice.actions`; adjust as needed.
// Fallback: use a no-op so the service never crashes even if wiring is missing.
const notify = (() => {
  // If your slice exports the action creator directly, replace this whole block:
  //   return addNotification;
  return (payload) => ({ type: 'notifications/add', payload });
})();

// ── Helper ────────────────────────────────────────────────────────────────────

const extractMessage = (error, fallback) =>
  error?.data?.message || error?.data?.error || error?.message || fallback;

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useStockItemService = () => {
  const dispatch = useDispatch();

  const [createMutation] = useCreateStockItemMutation();
  const [updateMutation] = useUpdateStockItemMutation();
  const [patchMutation]  = usePatchStockItemMutation();
  const [deleteMutation] = useDeleteStockItemMutation();

  const toast = (type, message) => dispatch(notify({ type, message }));

  // ── Create ─────────────────────────────────────────────────────────────────

  const create = async (data) => {
    try {
      const result = await createMutation(data).unwrap();
      toast('success', 'Stock item created successfully.');
      return { success: true, data: result };
    } catch (error) {
      toast('error', extractMessage(error, 'Failed to create stock item.'));
      return { success: false, error };
    }
  };

  // ── Update (PUT) ───────────────────────────────────────────────────────────

  const update = async (id, data) => {
    try {
      const result = await updateMutation({ id, ...data }).unwrap();
      toast('success', 'Stock item updated successfully.');
      return { success: true, data: result };
    } catch (error) {
      toast('error', extractMessage(error, 'Failed to update stock item.'));
      return { success: false, error };
    }
  };

  // ── Patch (PATCH) ──────────────────────────────────────────────────────────

  const patch = async (id, data) => {
    try {
      const result = await patchMutation({ id, ...data }).unwrap();
      toast('success', 'Stock item updated.');
      return { success: true, data: result };
    } catch (error) {
      toast('error', extractMessage(error, 'Failed to patch stock item.'));
      return { success: false, error };
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const remove = async (id) => {
    try {
      await deleteMutation(id).unwrap();
      toast('success', 'Stock item deleted successfully.');
      return { success: true };
    } catch (error) {
      toast('error', extractMessage(error, 'Failed to delete stock item.'));
      return { success: false, error };
    }
  };

  return { create, update, patch, remove };
};
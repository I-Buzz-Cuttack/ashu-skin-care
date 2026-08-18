// src/lib/pathology/pathologyorderitemservice.js
import { useDispatch } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';

import {
  useGetPathologyOrderItemsQuery,
  useGetPathologyOrderItemsByOrderIdQuery,
  useGetPathologyOrderItemsByStatusQuery,
  useCreatePathologyOrderItemMutation,
  useCreatePathologyOrderItemsBulkMutation,
  useUpdatePathologyOrderItemMutation,
  usePatchPathologyOrderItemMutation,
  useUpdatePathologyOrderItemStatusMutation,
  useCancelPathologyOrderItemMutation,
  useDeletePathologyOrderItemMutation,
} from '../../store/api/pathologyApi/pathologyOrderItem.js';

// ===============================
// 🧩 PATHOLOGY ORDER ITEM SERVICE
// ===============================
export const usePathologyOrderItem = () => {
  const dispatch = useDispatch();

  const [createItem, { isLoading: createLoading }] =
    useCreatePathologyOrderItemMutation();

  const [createBulkItems, { isLoading: createBulkLoading }] =
    useCreatePathologyOrderItemsBulkMutation();

  const [updateItem, { isLoading: updateLoading }] =
    useUpdatePathologyOrderItemMutation();

  const [patchItem, { isLoading: patchLoading }] =
    usePatchPathologyOrderItemMutation();

  const [updateItemStatus, { isLoading: statusLoading }] =
    useUpdatePathologyOrderItemStatusMutation();

  const [cancelItem, { isLoading: cancelLoading }] =
    useCancelPathologyOrderItemMutation();

  const [deleteItem, { isLoading: deleteLoading }] =
    useDeletePathologyOrderItemMutation();

  // CREATE SINGLE
  const create = async (body) => {
    try {
      const res = await createItem(body).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology order item added.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to add order item.' }));
      throw error;
    }
  };

  // CREATE BULK
  const createBulk = async (body) => {
    try {
      const res = await createBulkItems(body).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology order items added successfully!' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to add order items.' }));
      throw error;
    }
  };

  // UPDATE
  const update = async (payload) => {
    try {
      const res = await updateItem(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology order item updated.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update order item.' }));
      throw error;
    }
  };

  // PATCH (partial update)
  const patch = async (payload) => {
    try {
      const res = await patchItem(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology order item updated.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update order item.' }));
      throw error;
    }
  };

  // UPDATE STATUS (with result data)
  const updateStatus = async (payload) => {
    try {
      const res = await updateItemStatus(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Order item status updated.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update item status.' }));
      throw error;
    }
  };

  // CANCEL
  const cancel = async (id) => {
    try {
      const res = await cancelItem(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Order item cancelled.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to cancel order item.' }));
      throw error;
    }
  };

  // DELETE
  const remove = async (id) => {
    try {
      await deleteItem(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology order item deleted.' }));
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to delete order item.' }));
      throw error;
    }
  };

  return {
    // Queries
    useList: useGetPathologyOrderItemsQuery,
    useGetByOrderId: useGetPathologyOrderItemsByOrderIdQuery,
    useGetByStatus: useGetPathologyOrderItemsByStatusQuery,

    // Mutations
    create,
    createBulk,
    update,
    patch,
    updateStatus,
    cancel,
    remove,

    // Loading states
    createLoading,
    createBulkLoading,
    updateLoading,
    patchLoading,
    statusLoading,
    cancelLoading,
    deleteLoading,
  };
};
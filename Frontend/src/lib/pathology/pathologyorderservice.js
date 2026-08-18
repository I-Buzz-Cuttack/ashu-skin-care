// src/lib/pathology/pathologyorderservice.js
import { useDispatch } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';

import {
  useGetPathologyOrdersQuery,
  useGetPathologyOrderByIdQuery,
  useGetPathologyOrdersByPatientQuery,
  useGetPathologyOrdersByStatusQuery,
  useCreatePathologyOrderMutation,
  useUpdatePathologyOrderMutation,
  usePatchPathologyOrderMutation,
  useDeletePathologyOrderMutation,
} from '../../store/api/pathologyApi/pathologyOrder.js';

// ===============================
// 🧩 PATHOLOGY ORDER SERVICE
// ===============================
export const usePathologyOrder = () => {
  const dispatch = useDispatch();

  const [createOrder, { isLoading: createLoading }] =
    useCreatePathologyOrderMutation();

  const [updateOrder, { isLoading: updateLoading }] =
    useUpdatePathologyOrderMutation();

  const [patchOrder, { isLoading: patchLoading }] =
    usePatchPathologyOrderMutation();

  const [deleteOrder, { isLoading: deleteLoading }] =
    useDeletePathologyOrderMutation();

  // CREATE
  const create = async (body) => {
    try {
      const res = await createOrder(body).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology order created successfully!' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to create pathology order.' }));
      throw error;
    }
  };

  // UPDATE
  const update = async (payload) => {
    try {
      const res = await updateOrder(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology order updated successfully!' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update pathology order.' }));
      throw error;
    }
  };

  // PATCH (partial update)
  const patch = async (payload) => {
    try {
      const res = await patchOrder(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology order updated.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update pathology order.' }));
      throw error;
    }
  };

  // DELETE
  const remove = async (id) => {
    try {
      await deleteOrder(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology order deleted successfully!' }));
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to delete pathology order.' }));
      throw error;
    }
  };

  return {
    // Queries
    useList: useGetPathologyOrdersQuery,
    useGetById: useGetPathologyOrderByIdQuery,
    useGetByPatient: useGetPathologyOrdersByPatientQuery,
    useGetByStatus: useGetPathologyOrdersByStatusQuery,

    // Mutations
    create,
    update,
    patch,
    remove,

    // Loading states
    createLoading,
    updateLoading,
    patchLoading,
    deleteLoading,
  };
};
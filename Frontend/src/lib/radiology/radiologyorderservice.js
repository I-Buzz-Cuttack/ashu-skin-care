// src/lib/radiology/radiologyorderservice.js
import { useDispatch } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';

import {
  useGetRadiologyOrdersQuery,
  useGetRadiologyOrderByIdQuery,
  useGetRadiologyOrdersByPatientQuery,
  useGetRadiologyOrdersByDoctorQuery,
  useGetRadiologyOrdersByHospitalQuery,
  useGetPendingRadiologyOrdersByHospitalQuery,
  useCreateRadiologyOrderMutation,
  // useUpdateRadiologyOrderMutation,
  useUpdateRadiologyOrderRecordMutation,
  useUpdateRadiologyOrderStatusMutation,
  useDeleteRadiologyOrderMutation,
} from '../../store/api/radiologyApi/radiologyorder.js';

// ===============================
// 🧩 RADIOLOGY ORDER SERVICE
// ===============================
export const useRadiologyOrder = () => {
  const dispatch = useDispatch();

  const [createOrder, { isLoading: createLoading }] = useCreateRadiologyOrderMutation();
  // const [updateOrder, { isLoading: updateLoading }] = useUpdateRadiologyOrderMutation();
  const [updateOrder, { isLoading: updateLoading }] = useUpdateRadiologyOrderRecordMutation();
  const [updateStatus, { isLoading: statusLoading }] = useUpdateRadiologyOrderStatusMutation();
  const [deleteOrder, { isLoading: deleteLoading }] = useDeleteRadiologyOrderMutation();

  // CREATE
  const create = async (body) => {
    try {
      const res = await createOrder(body).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology order created successfully!' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to create radiology order.' }));
      throw error;
    }
  };

  // UPDATE
  const update = async (payload) => {
    try {
      const res = await updateOrder(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology order updated successfully!' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update radiology order.' }));
      throw error;
    }
  };

  // UPDATE STATUS
  const updateOrderStatus = async (id, status) => {
    try {
      const res = await updateStatus({ id, status }).unwrap();
      dispatch(addToast({ type: 'success', message: `Order status updated to ${status}.` }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update order status.' }));
      throw error;
    }
  };

  // DELETE
  const remove = async (id) => {
    try {
      await deleteOrder(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology order deleted successfully!' }));
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to delete radiology order.' }));
      throw error;
    }
  };

  return {
    // Queries
    useList: useGetRadiologyOrdersQuery,
    useGetById: useGetRadiologyOrderByIdQuery,
    useGetByPatient: useGetRadiologyOrdersByPatientQuery,
    useGetByDoctor: useGetRadiologyOrdersByDoctorQuery,
    useGetByHospital: useGetRadiologyOrdersByHospitalQuery,
    useGetPendingByHospital: useGetPendingRadiologyOrdersByHospitalQuery,
    
    // Mutations
    create,
    update,
    updateOrderStatus,
    remove,
    
    // Loading states
    createLoading,
    updateLoading,
    statusLoading,
    deleteLoading,
  };
};
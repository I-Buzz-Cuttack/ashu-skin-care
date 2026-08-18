// src/lib/radiology/radiologyInvoiceService.js
import { useDispatch } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';

import {
  useGetRadiologyInvoicesQuery,
  useGetRadiologyInvoiceByIdQuery,
  useGetRadiologyInvoicesByPatientQuery,
  useGetRadiologyInvoicesByHospitalQuery,
  useGetPendingRadiologyInvoicesByHospitalQuery,
  useGetRadiologyInvoiceStatsByHospitalQuery,
  useCreateRadiologyInvoiceMutation,
  useCreateRadiologyInvoiceFromOrdersMutation,
  useUpdateRadiologyInvoiceMutation,
  useUpdateRadiologyInvoiceStatusMutation,
  useRecalculateRadiologyInvoiceMutation,
  useDeleteRadiologyInvoiceMutation,
  useHardDeleteRadiologyInvoiceMutation,
} from '../../store/api/radiologyApi/radiologyinvoice';

// ===============================
// 🧩 RADIOLOGY INVOICE SERVICE
// ===============================
export const useRadiologyInvoice = () => {
  const dispatch = useDispatch();

  const [createInvoice,          { isLoading: createLoading          }] = useCreateRadiologyInvoiceMutation();
  const [createFromOrders,       { isLoading: createFromOrdersLoading}] = useCreateRadiologyInvoiceFromOrdersMutation();
  const [updateInvoice,          { isLoading: updateLoading          }] = useUpdateRadiologyInvoiceMutation();
  const [updateInvoiceStatus,    { isLoading: statusLoading          }] = useUpdateRadiologyInvoiceStatusMutation();
  const [recalculateInvoice,     { isLoading: recalculateLoading     }] = useRecalculateRadiologyInvoiceMutation();
  const [deleteInvoice,          { isLoading: deleteLoading          }] = useDeleteRadiologyInvoiceMutation();
  const [hardDeleteInvoice,      { isLoading: hardDeleteLoading      }] = useHardDeleteRadiologyInvoiceMutation();

  // CREATE
  const create = async (body) => {
    try {
      const res = await createInvoice(body).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology invoice created successfully!' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to create radiology invoice.' }));
      throw error;
    }
  };

  // CREATE FROM ORDERS
  const createFromRadiologyOrders = async (body) => {
    try {
      const res = await createFromOrders(body).unwrap();
      dispatch(addToast({ type: 'success', message: 'Invoice created from radiology orders!' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to create invoice from orders.' }));
      throw error;
    }
  };

  // UPDATE
  const update = async (payload) => {
    try {
      const res = await updateInvoice(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology invoice updated successfully!' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update radiology invoice.' }));
      throw error;
    }
  };

  // UPDATE STATUS
  const updateStatus = async (id, status) => {
    try {
      const res = await updateInvoiceStatus({ id, status }).unwrap();
      dispatch(addToast({ type: 'success', message: `Invoice status updated to ${status}.` }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update invoice status.' }));
      throw error;
    }
  };

  // RECALCULATE
  const recalculate = async (id) => {
    try {
      const res = await recalculateInvoice(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Invoice totals recalculated.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to recalculate invoice.' }));
      throw error;
    }
  };

  // SOFT DELETE
  const remove = async (id) => {
    try {
      await deleteInvoice(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology invoice deleted successfully!' }));
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to delete radiology invoice.' }));
      throw error;
    }
  };

  // HARD DELETE
  const hardRemove = async (id) => {
    try {
      await hardDeleteInvoice(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology invoice permanently deleted.' }));
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to permanently delete invoice.' }));
      throw error;
    }
  };

  return {
    // Queries
    useList:               useGetRadiologyInvoicesQuery,
    useGetById:            useGetRadiologyInvoiceByIdQuery,
    useGetByPatient:       useGetRadiologyInvoicesByPatientQuery,
    useGetByHospital:      useGetRadiologyInvoicesByHospitalQuery,
    useGetPendingByHospital: useGetPendingRadiologyInvoicesByHospitalQuery,
    useGetStatsByHospital: useGetRadiologyInvoiceStatsByHospitalQuery,

    // Mutations
    create,
    createFromRadiologyOrders,
    update,
    updateStatus,
    recalculate,
    remove,
    hardRemove,

    // Loading states
    createLoading,
    createFromOrdersLoading,
    updateLoading,
    statusLoading,
    recalculateLoading,
    deleteLoading,
    hardDeleteLoading,
  };
};
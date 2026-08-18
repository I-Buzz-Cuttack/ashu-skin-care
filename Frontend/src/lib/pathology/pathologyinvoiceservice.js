// src/lib/pathology/pathologyinvoiceservice.js
import { useDispatch } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';

import {
  useGetPathologyInvoicesQuery,
  useGetPathologyInvoiceByIdQuery,
  useGetPathologyInvoicesByOrderIdQuery,
  useGetPathologyInvoicesByPatientIdQuery,
  useGetPathologyInvoicesByStatusQuery,
  useGetPathologyInvoicesByPaymentStatusQuery,
  useCreatePathologyInvoiceMutation,
  useUpdatePathologyInvoiceMutation,
  usePatchPathologyInvoiceMutation,
  useUpdatePathologyInvoiceStatusMutation,
  useUpdatePathologyInvoicePaymentStatusMutation,
  useCancelPathologyInvoiceMutation,
  useIncrementPathologyInvoicePrintMutation,
  useMarkPathologyInvoiceSmsSentMutation,
  useMarkPathologyInvoiceEmailSentMutation,
  useDeletePathologyInvoiceMutation,
  useSearchPathologyInvoicesQuery,
} from '../../store/api/pathologyApi/pathologyInvoice';

// ===============================
// 🧩 PATHOLOGY INVOICE SERVICE
// ===============================
export const usePathologyInvoice = () => {
  const dispatch = useDispatch();

  const [createInvoice,          { isLoading: createLoading          }] = useCreatePathologyInvoiceMutation();
  const [updateInvoice,          { isLoading: updateLoading          }] = useUpdatePathologyInvoiceMutation();
  const [patchInvoice,           { isLoading: patchLoading           }] = usePatchPathologyInvoiceMutation();
  const [updateStatusMutation,   { isLoading: statusLoading          }] = useUpdatePathologyInvoiceStatusMutation();
  const [updatePaymentStatusMut, { isLoading: paymentStatusLoading   }] = useUpdatePathologyInvoicePaymentStatusMutation();
  const [cancelInvoice,          { isLoading: cancelLoading          }] = useCancelPathologyInvoiceMutation();
  const [incrementPrint,         { isLoading: printLoading           }] = useIncrementPathologyInvoicePrintMutation();
  const [markSmsSent,            { isLoading: smsLoading             }] = useMarkPathologyInvoiceSmsSentMutation();
  const [markEmailSent,          { isLoading: emailLoading           }] = useMarkPathologyInvoiceEmailSentMutation();
  const [deleteInvoice,          { isLoading: deleteLoading          }] = useDeletePathologyInvoiceMutation();

  // ── CREATE ──────────────────────────────────────────────
  const create = async (body) => {
    try {
      const res = await createInvoice(body).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology invoice created successfully!' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to create pathology invoice.' }));
      throw error;
    }
  };

  // ── UPDATE ──────────────────────────────────────────────
  const update = async (payload) => {
    try {
      const res = await updateInvoice(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology invoice updated successfully!' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update pathology invoice.' }));
      throw error;
    }
  };

  // ── PATCH ───────────────────────────────────────────────
  const patch = async (payload) => {
    try {
      const res = await patchInvoice(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology invoice updated.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update pathology invoice.' }));
      throw error;
    }
  };

  // ── UPDATE STATUS ───────────────────────────────────────
  const updateStatus = async (id, body) => {
    try {
      const res = await updateStatusMutation({ id, ...body }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Invoice status updated.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update invoice status.' }));
      throw error;
    }
  };

  // ── UPDATE PAYMENT STATUS ───────────────────────────────
  const updatePaymentStatus = async (id, body) => {
    try {
      const res = await updatePaymentStatusMut({ id, ...body }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Invoice payment status updated.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update payment status.' }));
      throw error;
    }
  };

  // ── CANCEL ──────────────────────────────────────────────
  const cancel = async (id) => {
    try {
      const res = await cancelInvoice(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Invoice cancelled successfully.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to cancel invoice.' }));
      throw error;
    }
  };

  // ── INCREMENT PRINT ─────────────────────────────────────
  const print = async (id) => {
    try {
      const res = await incrementPrint(id).unwrap();
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update print count.' }));
      throw error;
    }
  };

  // ── MARK SMS SENT ───────────────────────────────────────
  const smsSent = async (id) => {
    try {
      const res = await markSmsSent(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'SMS notification marked as sent.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to mark SMS sent.' }));
      throw error;
    }
  };

  // ── MARK EMAIL SENT ─────────────────────────────────────
  const emailSent = async (id) => {
    try {
      const res = await markEmailSent(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Email notification marked as sent.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to mark email sent.' }));
      throw error;
    }
  };

  // ── DELETE ──────────────────────────────────────────────
  const remove = async (id) => {
    try {
      await deleteInvoice(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology invoice deleted successfully!' }));
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to delete pathology invoice.' }));
      throw error;
    }
  };

  return {
    // Queries
    useList:                useGetPathologyInvoicesQuery,
    useGetById:             useGetPathologyInvoiceByIdQuery,
    useGetByOrderId:        useGetPathologyInvoicesByOrderIdQuery,
    useGetByPatientId:      useGetPathologyInvoicesByPatientIdQuery,
    useGetByStatus:         useGetPathologyInvoicesByStatusQuery,
    useGetByPaymentStatus:  useGetPathologyInvoicesByPaymentStatusQuery,
    useSearch:              useSearchPathologyInvoicesQuery,

    // Mutations
    create,
    update,
    patch,
    updateStatus,
    updatePaymentStatus,
    cancel,
    print,
    smsSent,
    emailSent,
    remove,

    // Loading states
    createLoading,
    updateLoading,
    patchLoading,
    statusLoading,
    paymentStatusLoading,
    cancelLoading,
    printLoading,
    smsLoading,
    emailLoading,
    deleteLoading,
  };
};
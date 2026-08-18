// src/lib/pathology/pathologypaymentservice.js
import { useDispatch } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';

import {
  useGetPathologyPaymentsQuery,
  useGetPathologyPaymentByIdQuery,
  useGetPathologyPaymentsByInvoiceIdQuery,
  useGetPathologyPaymentsByOrderIdQuery,
  useGetPathologyPaymentsByPatientIdQuery,
  useGetPathologyPaymentsByStatusQuery,
  useGetPathologyPaymentsByModeQuery,
  useCreatePathologyPaymentMutation,
  useUpdatePathologyPaymentMutation,
  usePatchPathologyPaymentMutation,
  useUpdatePathologyPaymentStatusMutation,
  useSettlePathologyPaymentMutation,
  useMarkPathologyPaymentReceiptPrintedMutation,
  useDeletePathologyPaymentMutation,
  useSearchPathologyPaymentsQuery,
} from '../../store/api/pathologyApi/pathologyPayment.js';

// ===============================
// 🧩 PATHOLOGY PAYMENT SERVICE
// ===============================
export const usePathologyPayment = () => {
  const dispatch = useDispatch();

  // ── Mutation instances ──────────────────────────────────
  const [createPayment,     { isLoading: createLoading     }] = useCreatePathologyPaymentMutation();
  const [updatePayment,     { isLoading: updateLoading     }] = useUpdatePathologyPaymentMutation();
  const [patchPayment,      { isLoading: patchLoading      }] = usePatchPathologyPaymentMutation();
  const [updateStatusMut,   { isLoading: statusLoading     }] = useUpdatePathologyPaymentStatusMutation();
  const [settlePayment,     { isLoading: settleLoading     }] = useSettlePathologyPaymentMutation();
  const [receiptPrinted,    { isLoading: receiptLoading    }] = useMarkPathologyPaymentReceiptPrintedMutation();
  const [deletePayment,     { isLoading: deleteLoading     }] = useDeletePathologyPaymentMutation();

  // ── CREATE ──────────────────────────────────────────────
  const create = async (body) => {
    try {
      const res = await createPayment(body).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology payment created successfully!' }));
      return res;
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to create pathology payment.',
      }));
      throw error;
    }
  };

  // ── UPDATE ──────────────────────────────────────────────
  const update = async (payload) => {
    try {
      const res = await updatePayment(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology payment updated successfully!' }));
      return res;
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to update pathology payment.',
      }));
      throw error;
    }
  };

  // ── PATCH ───────────────────────────────────────────────
  const patch = async (payload) => {
    try {
      const res = await patchPayment(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology payment updated.' }));
      return res;
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to update pathology payment.',
      }));
      throw error;
    }
  };

  // ── UPDATE STATUS ───────────────────────────────────────
  const updateStatus = async (id, body) => {
    try {
      const res = await updateStatusMut({ id, ...body }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Payment status updated.' }));
      return res;
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to update payment status.',
      }));
      throw error;
    }
  };

  // ── SETTLE ──────────────────────────────────────────────
  const settle = async (id) => {
    try {
      const res = await settlePayment(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Payment settled successfully.' }));
      return res;
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to settle payment.',
      }));
      throw error;
    }
  };

  // ── MARK RECEIPT PRINTED ────────────────────────────────
  const markReceiptPrinted = async (id) => {
    try {
      const res = await receiptPrinted(id).unwrap();
      return res;
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to mark receipt as printed.',
      }));
      throw error;
    }
  };

  // ── DELETE ──────────────────────────────────────────────
  const remove = async (id) => {
    try {
      await deletePayment(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology payment deleted successfully!' }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to delete pathology payment.',
      }));
      throw error;
    }
  };

  return {
    // ── Query hooks (call directly in components) ─────────
    useList:            useGetPathologyPaymentsQuery,
    useGetById:         useGetPathologyPaymentByIdQuery,
    useGetByInvoiceId:  useGetPathologyPaymentsByInvoiceIdQuery,
    useGetByOrderId:    useGetPathologyPaymentsByOrderIdQuery,
    useGetByPatientId:  useGetPathologyPaymentsByPatientIdQuery,
    useGetByStatus:     useGetPathologyPaymentsByStatusQuery,
    useGetByMode:       useGetPathologyPaymentsByModeQuery,
    useSearch:          useSearchPathologyPaymentsQuery,

    // ── Wrapped mutations ─────────────────────────────────
    create,
    update,
    patch,
    updateStatus,
    settle,
    markReceiptPrinted,
    remove,

    // ── Loading flags ─────────────────────────────────────
    createLoading,
    updateLoading,
    patchLoading,
    statusLoading,
    settleLoading,
    receiptLoading,
    deleteLoading,
  };
};
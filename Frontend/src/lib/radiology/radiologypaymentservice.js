import { useDispatch } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';

import {
  useCreateRadiologyPaymentMutation,
  useGetRadiologyPaymentsQuery,
  useGetRadiologyPaymentByIdQuery,
  useUpdateRadiologyPaymentMutation,
  useDeleteRadiologyPaymentMutation,
  useGetRadiologyPaymentByInvoiceQuery,
  useGetRadiologyPaymentsByPatientQuery,
  useGetRadiologyPaymentsByHospitalQuery,
  useRefundRadiologyPaymentMutation,
  useGetRadiologyPaymentStatsQuery,
} from '../../store/api/radiologyApi/radiologypaymentapi.js';

// ===============================
// 🧩 RADIOLOGY PAYMENT SERVICE
// ===============================
export const useRadiologyPayment = () => {
  const dispatch = useDispatch();

  // ── Mutation instances ──────────────────────────────────
  const [createPayment,  { isLoading: createLoading  }] = useCreateRadiologyPaymentMutation();
  const [updatePayment,  { isLoading: updateLoading  }] = useUpdateRadiologyPaymentMutation();
  const [deletePayment,  { isLoading: deleteLoading  }] = useDeleteRadiologyPaymentMutation();
  const [refundPayment,  { isLoading: refundLoading  }] = useRefundRadiologyPaymentMutation();

  // ── CREATE ──────────────────────────────────────────────
  // POST /radiology/payment
  // body shape: { patientId, patientName, scans[], paymentMode,
  //               paymentAmount, totalAmount, taxAmount, discountAmount,
  //               doctorName, referralDoctor, note, prevReport,
  //               prescriptionNo, applyTpa }
  const create = async (body) => {
    try {
      const res = await createPayment(body).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology payment created successfully!' }));
      return res;
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to create radiology payment.',
      }));
      throw error;
    }
  };

  // ── UPDATE ──────────────────────────────────────────────
  // PUT /radiology/payment/:id
  // payload shape: { id, ...same fields as create }
  const update = async (payload) => {
    try {
      const res = await updatePayment(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology payment updated successfully!' }));
      return res;
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to update radiology payment.',
      }));
      throw error;
    }
  };

  // ── DELETE ──────────────────────────────────────────────
  // DELETE /radiology/payment/:id
  const remove = async (id) => {
    try {
      await deletePayment(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology payment deleted successfully!' }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to delete radiology payment.',
      }));
      throw error;
    }
  };

  // ── REFUND ──────────────────────────────────────────────
  // POST /radiology/payment/:id/refund
  // payload shape: { id, reason?, amount? }
  const refund = async (payload) => {
    try {
      const res = await refundPayment(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Payment refunded successfully!' }));
      return res;
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to process refund.',
      }));
      throw error;
    }
  };

  return {
    // ── Query hooks (call directly in components) ─────────
    // GET /radiology/payment            → useList(params?)
    useList:            useGetRadiologyPaymentsQuery,
    // GET /radiology/payment/:id        → useGetById(id)
    useGetById:         useGetRadiologyPaymentByIdQuery,
    // GET /radiology/payment/invoice/:invoiceId
    useGetByInvoice:    useGetRadiologyPaymentByInvoiceQuery,
    // GET /radiology/payment/patient/:patientId
    useGetByPatient:    useGetRadiologyPaymentsByPatientQuery,
    // GET /radiology/payment/hospital/:hospitalId
    useGetByHospital:   useGetRadiologyPaymentsByHospitalQuery,
    // GET /radiology/payment/hospital/:hospitalId/stats
    useGetStats:        useGetRadiologyPaymentStatsQuery,

    // ── Wrapped mutations ─────────────────────────────────
    create,   // async (body)    → res | throws
    update,   // async (payload) → res | throws
    remove,   // async (id)      → void | throws
    refund,   // async (payload) → res | throws

    // ── Loading flags ─────────────────────────────────────
    createLoading,
    updateLoading,
    deleteLoading,
    refundLoading,
  };
};
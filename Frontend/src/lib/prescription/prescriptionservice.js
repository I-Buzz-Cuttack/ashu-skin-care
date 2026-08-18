import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/notificationSlice';
import {
  // Prescription
  useCreatePrescriptionMutation,
  useGetPrescriptionByIdQuery,
  useGetPrescriptionsByPatientQuery,
  useGetPrescriptionByAppointmentQuery,
  useGetAllPrescriptionsQuery,
  useUpdatePrescriptionMutation,
  useUpdatePrescriptionStatusMutation,
  useDeletePrescriptionMutation,
  useHardDeletePrescriptionMutation,
  // Medicine
  useBulkAddMedicinesMutation,
  useGetMedicinesByPrescriptionQuery,
  useDeleteAllMedicinesMutation,
  useUpdatePrescriptionMedicineMutation,
  useDeletePrescriptionMedicineMutation,
  useUpdateDispenseStatusMutation,
  useBulkUpdateDispenseStatusMutation,
  // Radiology
  useBulkAddRadiologyOrdersMutation,
  useGetRadiologyByPrescriptionQuery,
  useDeleteAllRadiologyOrdersMutation,
  useUpdateRadiologyStatusMutation,
  useVerifyRadiologyResultMutation,
  useUploadRadiologyResultMutation,
  // Pathology
  useBulkAddPathologiesMutation,
  useGetPathologiesByPrescriptionQuery,
  useDeleteAllPathologiesMutation,
  useUpdatePathologyStatusMutation,
  useSelectPathologyForBillingMutation,
} from '../../store/api/prescriptionapi/prescriptionapi.js';

export const usePrescription = (params = {}) => {
  const dispatch = useDispatch();

  const listQuery = useGetAllPrescriptionsQuery(params, {
    skip: !params?.enabled,
    refetchOnMountOrArgChange: true,
  });

  const byIdQuery = useGetPrescriptionByIdQuery(params?.id, {
    skip: !params?.id,
    refetchOnMountOrArgChange: true,
  });

  const byPatientQuery = useGetPrescriptionsByPatientQuery(
    { patientId: params?.patientId },
    { skip: !params?.patientId, refetchOnMountOrArgChange: true },
  );

  const byAppointmentQuery = useGetPrescriptionByAppointmentQuery(
    params?.appointmentId,
    { skip: !params?.appointmentId, refetchOnMountOrArgChange: true },
  );

  const [createPrescriptionMutation, { isLoading: createLoading }] =
    useCreatePrescriptionMutation();

  const [updatePrescriptionMutation, { isLoading: updateLoading }] =
    useUpdatePrescriptionMutation();

  const [updateStatusMutation, { isLoading: statusLoading }] =
    useUpdatePrescriptionStatusMutation();

  const [deleteMutation, { isLoading: deleteLoading }] =
    useDeletePrescriptionMutation();

  const [hardDeleteMutation, { isLoading: hardDeleteLoading }] =
    useHardDeletePrescriptionMutation();

  const [bulkAddMedicinesMutation, { isLoading: medicinesLoading }] =
    useBulkAddMedicinesMutation();
  const [deleteAllMedicinesMutation, { isLoading: deleteMedicinesLoading }] =
    useDeleteAllMedicinesMutation();

  const [bulkAddRadiologyMutation, { isLoading: radiologyLoading }] =
    useBulkAddRadiologyOrdersMutation();
  const [deleteAllRadiologyMutation, { isLoading: deleteRadiologyLoading }] =
    useDeleteAllRadiologyOrdersMutation();

  const [bulkAddPathologiesMutation, { isLoading: pathologiesLoading }] =
    useBulkAddPathologiesMutation();
  const [deleteAllPathologiesMutation, { isLoading: deletePathologiesLoading }] =
    useDeleteAllPathologiesMutation();

  // ── ONLY THIS FUNCTION CHANGED ────────────────────────────────────────────
  const buildPrescriptionBody = (formState, patientRecord, appointmentId) => {
    const {
      headerNote,
      footerNote,
      finding,
      findingPrint,
      files,
    } = formState;

    // patientRecord is the OPD appointment object.
    // It has TWO different IDs:
    //   patientRecord.id          → the appointment's own ID  (use for opdAppointmentId)
    //   patientRecord.patientId   → the actual patient's ID   (use for patientId)
    const patientId =
      patientRecord?.patientId ??        // flat field — most common
      patientRecord?.patient?.id ??      // nested patient object
      patientRecord?.patient_id ??       // snake_case variant
      undefined;

    const opdAppointmentId =
      patientRecord?.id ??               // appointment's own id
      patientRecord?.appointmentId ??
      patientRecord?.opdAppointmentId ??
      (!isNaN(Number(appointmentId)) ? Number(appointmentId) : undefined);

    // Debug log — remove after confirming correct values in Network → Payload
    const doctorId =
      patientRecord?.doctorId ??
      patientRecord?.doctor?.id ??
      patientRecord?.consultantDoctorId ??
      patientRecord?.consultantDoctor?.id ??
      patientRecord?.apiRecord?.consultantDoctorId ??
      undefined;

    return {
      patientId,
      opdAppointmentId,
      doctorId,
      hospitalId:      patientRecord?.hospitalId ?? patientRecord?.hospital?.id ?? undefined,
      headerNote:      headerNote || undefined,
      footerNote:      footerNote || undefined,
      findingCategory: finding?.category || undefined,
      findingList:     finding?.list || undefined,
      findingDesc:     finding?.description || undefined,
      attachments:     files?.length
        ? { files: files.map((f) => f.name), findingPrint }
        : undefined,
      status: 'draft',
    };
  };
  // ── END OF CHANGE ─────────────────────────────────────────────────────────

  const buildMedicinesPayload = (medicines) =>
    medicines
      .filter((m) => m.medicineId)
      .map((m) => ({
        medicineId:     parseInt(m.medicineId, 10),
        dose:           m.dose || undefined,
        interval:       m.interval || undefined,
        duration:       m.duration || undefined,
        instruction:    m.instruction || undefined,
        quantity:       undefined,
        dispenseStatus: 'pending',
      }));

  const buildRadiologyPayload = (radiologyTestIds) =>
    radiologyTestIds.map((id) => ({
      radiologyId: id,
      status:      'ordered',
    }));

  /**
   * Build the pathology array for the bulk endpoint.
   * @param {Array}  pathologyTests — array of { testId, testName?, testCode?, sampleType?, urgency?, notes? }
   * @param {string} patientId
   * @param {number|string} doctorId
   */
  const buildPathologyPayload = (pathologyTests, patientId, doctorId) =>
    (pathologyTests ?? []).filter(Boolean).map((t) => {
      const isString = typeof t === 'string';
      return {
        patientId,
        doctorId:  typeof doctorId === 'string' ? parseInt(doctorId, 10) : doctorId,
        testId:    isString ? t : (t.testId ?? t.id),
        testName:  isString ? undefined : (t.testName || undefined),
        testCode:  isString ? undefined : (t.testCode || undefined),
        sampleType: isString ? undefined : (t.sampleType || undefined),
        urgency:   isString ? 'routine' : (t.urgency || 'routine'),
        status:    'prescribed',
        notes:     isString ? undefined : (t.notes || undefined),
      };
    });

  const savePrescription = async (formState, patientRecord, appointmentId) => {
    const prescriptionBody = buildPrescriptionBody(
      formState,
      patientRecord,
      appointmentId,
    );

    let prescription;
    try {
      prescription = await createPrescriptionMutation(prescriptionBody).unwrap();
      dispatch(addToast({ type: 'success', message: 'Prescription created.' }));
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err?.data?.message || 'Failed to create prescription.',
      }));
      throw err;
    }

    const prescriptionId = prescription?.id ?? prescription?.result?.id;

    const medicinesPayload = buildMedicinesPayload(formState.medicines ?? []);

    if (medicinesPayload.length > 0) {
      try {
        await bulkAddMedicinesMutation({
          prescriptionId,
          medicines: medicinesPayload,
        }).unwrap();
      } catch (err) {
        dispatch(addToast({
          type: 'error',
          message: err?.data?.message || 'Prescription saved but medicines could not be added.',
        }));
      }
    }

    const radiologyPayload = buildRadiologyPayload(
      formState.radiologyTestIds ?? [],
    );

    if (radiologyPayload.length > 0) {
      try {
        await bulkAddRadiologyMutation({
          prescriptionId,
          radiologies: radiologyPayload,
        }).unwrap();
      } catch (err) {
        dispatch(addToast({
          type: 'error',
          message: err?.data?.message || 'Prescription saved but radiology orders could not be added.',
        }));
      }
    }

    // ── Step 4: Add pathology tests (bulk) ───────────────────────────────
    const pathologyPayload = buildPathologyPayload(
      formState.pathologyTests ?? [],
      patientRecord?.patientId ?? patientRecord?.patient?.id ?? patientRecord?.patient_id,
      patientRecord?.doctorId ??
        patientRecord?.doctor?.id ??
        patientRecord?.consultantDoctorId ??
        patientRecord?.consultantDoctor?.id ??
        patientRecord?.apiRecord?.consultantDoctorId,
    );

    if (pathologyPayload.length > 0) {
      try {
        await bulkAddPathologiesMutation({
          prescriptionId,
          pathologies: pathologyPayload,
        }).unwrap();
      } catch (err) {
        dispatch(addToast({
          type: 'error',
          message: err?.data?.message || 'Prescription saved but pathology tests could not be added.',
        }));
        throw err;
      }
    }

    return prescription;
  };

  const replacePrescription = async (
    formState,
    patientRecord,
    appointmentId,
    prescriptionId,
  ) => {
    const editableBody = {
      ...buildPrescriptionBody(formState, patientRecord, appointmentId),
    };
    delete editableBody.status;
    const medicinesPayload = buildMedicinesPayload(formState.medicines ?? []);
    const radiologyPayload = buildRadiologyPayload(formState.radiologyTestIds ?? []);
    const pathologyPayload = buildPathologyPayload(
      formState.pathologyTests ?? [],
      patientRecord?.patientId ?? patientRecord?.patient?.id ?? patientRecord?.patient_id,
      patientRecord?.doctorId ??
        patientRecord?.doctor?.id ??
        patientRecord?.consultantDoctorId ??
        patientRecord?.consultantDoctor?.id ??
        patientRecord?.apiRecord?.consultantDoctorId,
    );

    try {
      const prescription = await updatePrescriptionMutation({
        id: prescriptionId,
        ...editableBody,
      }).unwrap();

      await Promise.all([
        deleteAllMedicinesMutation(prescriptionId).unwrap(),
        deleteAllRadiologyMutation(prescriptionId).unwrap(),
        deleteAllPathologiesMutation(prescriptionId).unwrap(),
      ]);

      const addRequests = [];
      if (medicinesPayload.length > 0) {
        addRequests.push(
          bulkAddMedicinesMutation({
            prescriptionId,
            medicines: medicinesPayload,
          }).unwrap(),
        );
      }
      if (radiologyPayload.length > 0) {
        addRequests.push(
          bulkAddRadiologyMutation({
            prescriptionId,
            radiologies: radiologyPayload,
          }).unwrap(),
        );
      }
      if (pathologyPayload.length > 0) {
        addRequests.push(
          bulkAddPathologiesMutation({
            prescriptionId,
            pathologies: pathologyPayload,
          }).unwrap(),
        );
      }
      await Promise.all(addRequests);

      dispatch(addToast({ type: 'success', message: 'Prescription updated.' }));
      return prescription;
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err?.data?.message || 'Failed to update prescription.',
      }));
      throw err;
    }
  };

  const updatePrescription = async ({ id, ...body }) => {
    try {
      const res = await updatePrescriptionMutation({ id, ...body }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Prescription updated.' }));
      return res;
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err?.data?.message || 'Failed to update prescription.',
      }));
      throw err;
    }
  };

  const finalisePrescription = async (id) => {
    try {
      const res = await updateStatusMutation({ id, status: 'final' }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Prescription finalised.' }));
      return res;
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err?.data?.message || 'Failed to finalise prescription.',
      }));
      throw err;
    }
  };

  const cancelPrescription = async (id) => {
    try {
      await deleteMutation(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Prescription cancelled.' }));
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err?.data?.message || 'Failed to cancel prescription.',
      }));
      throw err;
    }
  };

  const hardDeletePrescription = async (id) => {
    try {
      await hardDeleteMutation(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Prescription permanently deleted.' }));
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err?.data?.message || 'Failed to delete prescription.',
      }));
      throw err;
    }
  };

  return {
    listQuery,
    byIdQuery,
    byPatientQuery,
    byAppointmentQuery,
    savePrescription,
    replacePrescription,
    updatePrescription,
    finalisePrescription,
    cancelPrescription,
    hardDeletePrescription,
    saveLoading:
      createLoading ||
      updateLoading ||
      medicinesLoading ||
      deleteMedicinesLoading ||
      radiologyLoading ||
      deleteRadiologyLoading ||
      pathologiesLoading ||
      deletePathologiesLoading,
    createLoading,
    updateLoading,
    statusLoading,
    deleteLoading,
    hardDeleteLoading,
  };
};

export const usePrescriptionMedicines = (prescriptionId) => {
  const dispatch = useDispatch();

  const medicinesQuery = useGetMedicinesByPrescriptionQuery(prescriptionId, {
    skip: !prescriptionId,
    refetchOnMountOrArgChange: true,
  });

  const [updateMutation, { isLoading: updateLoading }] =
    useUpdatePrescriptionMedicineMutation();

  const [deleteMutation, { isLoading: deleteLoading }] =
    useDeletePrescriptionMedicineMutation();

  const [deleteAllMutation, { isLoading: deleteAllLoading }] =
    useDeleteAllMedicinesMutation();

  const [updateDispenseMutation, { isLoading: dispenseLoading }] =
    useUpdateDispenseStatusMutation();

  const [bulkDispenseMutation, { isLoading: bulkDispenseLoading }] =
    useBulkUpdateDispenseStatusMutation();

  const updateMedicine = async ({ id, ...body }) => {
    try {
      const res = await updateMutation({ id, ...body }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Medicine updated.' }));
      return res;
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err?.data?.message || 'Failed to update medicine.',
      }));
      throw err;
    }
  };

  const deleteMedicine = async (id) => {
    try {
      await deleteMutation(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Medicine removed.' }));
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err?.data?.message || 'Failed to remove medicine.',
      }));
      throw err;
    }
  };

  const deleteAllMedicines = async () => {
    try {
      await deleteAllMutation(prescriptionId).unwrap();
      dispatch(addToast({ type: 'success', message: 'All medicines removed.' }));
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err?.data?.message || 'Failed to remove medicines.',
      }));
      throw err;
    }
  };

  const updateDispenseStatus = async (id, dispenseStatus) => {
    try {
      const res = await updateDispenseMutation({ id, dispenseStatus }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Dispense status updated.' }));
      return res;
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err?.data?.message || 'Failed to update dispense status.',
      }));
      throw err;
    }
  };

  const bulkUpdateDispenseStatus = async (dispenseStatus) => {
    try {
      const res = await bulkDispenseMutation({
        prescriptionId,
        dispenseStatus,
      }).unwrap();
      dispatch(addToast({ type: 'success', message: 'All medicines updated.' }));
      return res;
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err?.data?.message || 'Failed to update medicines.',
      }));
      throw err;
    }
  };

  return {
    medicinesQuery,
    updateMedicine,
    deleteMedicine,
    deleteAllMedicines,
    updateDispenseStatus,
    bulkUpdateDispenseStatus,
    updateLoading,
    deleteLoading,
    deleteAllLoading,
    dispenseLoading,
    bulkDispenseLoading,
  };
};

export const usePrescriptionRadiology = (prescriptionId) => {
  const dispatch = useDispatch();

  const radiologyQuery = useGetRadiologyByPrescriptionQuery(prescriptionId, {
    skip: !prescriptionId,
    refetchOnMountOrArgChange: true,
  });

  const [updateStatusMutation, { isLoading: statusLoading }] =
    useUpdateRadiologyStatusMutation();

  const [uploadResultMutation, { isLoading: uploadLoading }] =
    useUploadRadiologyResultMutation();

  const [verifyMutation, { isLoading: verifyLoading }] =
    useVerifyRadiologyResultMutation();

  const [deleteAllMutation, { isLoading: deleteAllLoading }] =
    useDeleteAllRadiologyOrdersMutation();

  const updateStatus = async (id, status) => {
    try {
      const res = await updateStatusMutation({ id, status }).unwrap();
      dispatch(addToast({ type: 'success', message: `Status updated to ${status}.` }));
      return res;
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err?.data?.message || 'Failed to update status.',
      }));
      throw err;
    }
  };

  const uploadResult = async (id, resultFile, resultNote) => {
    try {
      const res = await uploadResultMutation({ id, resultFile, resultNote }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Result uploaded.' }));
      return res;
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err?.data?.message || 'Failed to upload result.',
      }));
      throw err;
    }
  };

  const verifyResult = async (id) => {
    try {
      const res = await verifyMutation(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Result verified.' }));
      return res;
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err?.data?.message || 'Failed to verify result.',
      }));
      throw err;
    }
  };

  const deleteAllOrders = async () => {
    try {
      await deleteAllMutation(prescriptionId).unwrap();
      dispatch(addToast({ type: 'success', message: 'All radiology orders removed.' }));
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err?.data?.message || 'Failed to remove radiology orders.',
      }));
      throw err;
    }
  };

  return {
    radiologyQuery,
    updateStatus,
    uploadResult,
    verifyResult,
    deleteAllOrders,
    statusLoading,
    uploadLoading,
    verifyLoading,
    deleteAllLoading,
  };
};

// ══════════════════════════════════════════════════════════════════════════════
// usePrescribedPathology
// Focused hook for pages that manage pathology tests on an existing prescription
// (e.g. pathology prescription screen, billing generation screen)
// ══════════════════════════════════════════════════════════════════════════════
export const usePrescribedPathology = (prescriptionId) => {
  const dispatch = useDispatch();

  const pathologyQuery = useGetPathologiesByPrescriptionQuery(prescriptionId, {
    skip: !prescriptionId,
    refetchOnMountOrArgChange: true,
  });

  const [updateStatusMutation, { isLoading: statusLoading }] =
    useUpdatePathologyStatusMutation();

  const [selectForBillingMutation, { isLoading: selectLoading }] =
    useSelectPathologyForBillingMutation();

  const [deleteAllMutation, { isLoading: deleteAllLoading }] =
    useDeleteAllPathologiesMutation();

  // Update a single test's status
  // status: 'prescribed' | 'selected' | 'invoiced' | 'cancelled'
  const updateStatus = async (id, status) => {
    try {
      const res = await updateStatusMutation({ id, status }).unwrap();
      dispatch(addToast({ type: 'success', message: `Pathology test marked as ${status}.` }));
      return res;
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err?.data?.message || 'Failed to update pathology test status.',
      }));
      throw err;
    }
  };

  // Bulk-select tests for billing: 'prescribed' → 'selected'
  // Accepts an array of prescribed_pathology IDs
  const selectForBilling = async (ids) => {
    try {
      const res = await selectForBillingMutation({ ids }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Tests selected for billing.' }));
      return res;
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err?.data?.message || 'Failed to select tests for billing.',
      }));
      throw err;
    }
  };

  // Remove all pathology tests from this prescription
  const deleteAllTests = async () => {
    try {
      await deleteAllMutation(prescriptionId).unwrap();
      dispatch(addToast({ type: 'success', message: 'All pathology tests removed.' }));
    } catch (err) {
      dispatch(addToast({
        type: 'error',
        message: err?.data?.message || 'Failed to remove pathology tests.',
      }));
      throw err;
    }
  };

  return {
    pathologyQuery,
    updateStatus,
    selectForBilling,
    deleteAllTests,
    statusLoading,
    selectLoading,
    deleteAllLoading,
  };
};

import { baseApi } from '../baseApi';

// ─── Response helpers ──────────────────────────────────────────────────────
// Backend envelope: { result, statusCode, status, message }
// List responses:   { result: { data: [], pagination: {} } }
// Single responses: { result: { ...record } }

const unwrapSingle = (response) => {
  if (response?.result !== undefined) return response.result;
  return response;
};

const unwrapList = (response) => {
  const r = response?.result;
  if (r?.data !== undefined) {
    return {
      data: r.data,
      total: r.pagination?.total ?? r.data.length,
      page: r.pagination?.page ?? 1,
      limit: r.pagination?.limit ?? r.data.length,
      totalPages: r.pagination?.totalPages ?? 1,
    };
  }
  if (Array.isArray(r)) return { data: r, total: r.length, page: 1, limit: r.length, totalPages: 1 };
  if (Array.isArray(response)) return { data: response, total: response.length, page: 1, limit: response.length, totalPages: 1 };
  return { data: [], total: 0, page: 1, limit: 10, totalPages: 0 };
};

// ══════════════════════════════════════════════════════════════════════════════
// PRESCRIPTION API
// ══════════════════════════════════════════════════════════════════════════════
export const prescriptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // ── Prescription CRUD ──────────────────────────────────────────────────

    // POST /api/prescription
    // Body: { patientId, hospitalId?, opdAppointmentId?, doctorId?,
    //         chiefComplaint?, diagnosis?, diagnosisCode?, vitalSigns?,
    //         headerNote?, footerNote?, findingCategory?, findingList?,
    //         findingDesc?, advice?, followUpDate?, referredTo?,
    //         attachments?, status? }
    createPrescription: builder.mutation({
      query: (body) => ({
        url: '/prescription',
        method: 'POST',
        body,
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: [{ type: 'Prescription', id: 'LIST' }],
    }),

    // GET /api/prescription?page&limit&status&patientId&hospitalId&doctorId
    getAllPrescriptions: builder.query({
      query: (params = {}) => ({ url: '/prescription', params }),
      transformResponse: unwrapList,
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: 'Prescription', id })),
              { type: 'Prescription', id: 'LIST' },
            ]
          : [{ type: 'Prescription', id: 'LIST' }],
    }),

    // GET /api/prescription/:id
    getPrescriptionById: builder.query({
      query: (id) => `/prescription/${id}`,
      transformResponse: unwrapSingle,
      providesTags: (result, error, id) => [{ type: 'Prescription', id }],
    }),

    // GET /api/prescription/patient/:patientId?page&limit
    getPrescriptionsByPatient: builder.query({
      query: ({ patientId, ...params }) => ({
        url: `/prescription/patient/${patientId}`,
        params,
      }),
      transformResponse: unwrapList,
      providesTags: (result, error, { patientId }) => [
        { type: 'Prescription', id: `PATIENT_${patientId}` },
      ],
    }),

    // GET /api/prescription/hospital/:hospitalId?page&limit
    getPrescriptionsByHospital: builder.query({
      query: ({ hospitalId, ...params }) => ({
        url: `/prescription/hospital/${hospitalId}`,
        params,
      }),
      transformResponse: unwrapList,
      providesTags: (result, error, { hospitalId }) => [
        { type: 'Prescription', id: `HOSPITAL_${hospitalId}` },
      ],
    }),

    // GET /api/prescription/appointment/:appointmentId
    getPrescriptionByAppointment: builder.query({
      query: (appointmentId) => `/prescription/appointment/${appointmentId}`,
      transformResponse: unwrapSingle,
      providesTags: (result, error, appointmentId) => [
        { type: 'Prescription', id: `APPT_${appointmentId}` },
      ],
    }),

    // GET /api/prescription/hospital/:hospitalId/stats
    getPrescriptionStats: builder.query({
      query: (hospitalId) => `/prescription/hospital/${hospitalId}/stats`,
      transformResponse: unwrapSingle,
      providesTags: (result, error, hospitalId) => [
        { type: 'Prescription', id: `STATS_${hospitalId}` },
      ],
    }),

    // PUT /api/prescription/:id
    // Body: same optional fields as create (minus patientId)
    updatePrescription: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/prescription/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Prescription', id },
        { type: 'Prescription', id: 'LIST' },
      ],
    }),

    // PATCH /api/prescription/:id/status
    // Body: { status: 'draft' | 'final' | 'cancelled' }
    updatePrescriptionStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/prescription/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, { id }) => [
        { type: 'Prescription', id },
        { type: 'Prescription', id: 'LIST' },
      ],
    }),

    // DELETE /api/prescription/:id  (soft delete → marks as cancelled)
    deletePrescription: builder.mutation({
      query: (id) => ({ url: `/prescription/${id}`, method: 'DELETE' }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, id) => [
        { type: 'Prescription', id },
        { type: 'Prescription', id: 'LIST' },
      ],
    }),

    // DELETE /api/prescription/:id/hard  (permanent, only for cancelled)
    hardDeletePrescription: builder.mutation({
      query: (id) => ({ url: `/prescription/${id}/hard`, method: 'DELETE' }),
      transformResponse: unwrapSingle,
      invalidatesTags: [{ type: 'Prescription', id: 'LIST' }],
    }),

    // ── Prescription Medicine ──────────────────────────────────────────────

    // POST /api/prescription/:prescriptionId/medicines/bulk
    // Body: { medicines: [{ medicineId, categoryId?, dose, doseUnit?,
    //                       interval, duration, instruction?, quantity?,
    //                       notes?, dispenseStatus? }] }
    // ↑ This is the primary call from AddPrescriptionPage
    bulkAddMedicines: builder.mutation({
      query: ({ prescriptionId, medicines }) => ({
        url: `/prescription/${prescriptionId}/medicines/bulk`,
        method: 'POST',
        body: { medicines },
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, { prescriptionId }) => [
        { type: 'PrescriptionMedicine', id: `LIST_${prescriptionId}` },
        { type: 'Prescription', id: prescriptionId },
      ],
    }),

    // POST /api/prescription/medicine  (single add)
    addMedicine: builder.mutation({
      query: (body) => ({
        url: '/prescription/medicine',
        method: 'POST',
        body,
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, { prescriptionId }) => [
        { type: 'PrescriptionMedicine', id: `LIST_${prescriptionId}` },
      ],
    }),

    // GET /api/prescription/:prescriptionId/medicines
    getMedicinesByPrescription: builder.query({
      query: (prescriptionId) => `/prescription/${prescriptionId}/medicines`,
      transformResponse: unwrapSingle,
      providesTags: (result, error, prescriptionId) => [
        { type: 'PrescriptionMedicine', id: `LIST_${prescriptionId}` },
      ],
    }),

    // GET /api/prescription/medicine/:id
    getPrescriptionMedicineById: builder.query({
      query: (id) => `/prescription/medicine/${id}`,
      transformResponse: unwrapSingle,
      providesTags: (result, error, id) => [{ type: 'PrescriptionMedicine', id }],
    }),

    // GET /api/prescription/medicine?page&limit&prescriptionId&dispenseStatus
    getAllPrescriptionMedicines: builder.query({
      query: (params = {}) => ({ url: '/prescription/medicine', params }),
      transformResponse: unwrapList,
      providesTags: [{ type: 'PrescriptionMedicine', id: 'LIST' }],
    }),

    // GET /api/prescription/medicine/hospital/:hospitalId/pending?page&limit
    getPendingDispense: builder.query({
      query: ({ hospitalId, ...params }) => ({
        url: `/prescription/medicine/hospital/${hospitalId}/pending`,
        params,
      }),
      transformResponse: unwrapList,
      providesTags: (result, error, { hospitalId }) => [
        { type: 'PrescriptionMedicine', id: `PENDING_${hospitalId}` },
      ],
    }),

    // GET /api/prescription/medicine/hospital/:hospitalId/stats
    getDispenseStats: builder.query({
      query: (hospitalId) => `/prescription/medicine/hospital/${hospitalId}/stats`,
      transformResponse: unwrapSingle,
    }),

    // GET /api/prescription/medicine/by-medicine/:medicineId?page&limit
    getMedicinesByMedicineId: builder.query({
      query: ({ medicineId, ...params }) => ({
        url: `/prescription/medicine/by-medicine/${medicineId}`,
        params,
      }),
      transformResponse: unwrapList,
    }),

    // PUT /api/prescription/medicine/:id
    // Body: { dose?, doseUnit?, interval?, duration?, instruction?, quantity?, notes? }
    updatePrescriptionMedicine: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/prescription/medicine/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, { id }) => [
        { type: 'PrescriptionMedicine', id },
      ],
    }),

    // PATCH /api/prescription/medicine/:id/dispense-status
    // Body: { dispenseStatus: 'pending' | 'dispensed' | 'partially_dispensed' | 'cancelled' }
    updateDispenseStatus: builder.mutation({
      query: ({ id, dispenseStatus }) => ({
        url: `/prescription/medicine/${id}/dispense-status`,
        method: 'PATCH',
        body: { dispenseStatus },
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, { id }) => [
        { type: 'PrescriptionMedicine', id },
      ],
    }),

    // PATCH /api/prescription/:prescriptionId/medicines/dispense-status
    // Body: { dispenseStatus }  — bulk update all medicines in a prescription
    bulkUpdateDispenseStatus: builder.mutation({
      query: ({ prescriptionId, dispenseStatus }) => ({
        url: `/prescription/${prescriptionId}/medicines/dispense-status`,
        method: 'PATCH',
        body: { dispenseStatus },
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, { prescriptionId }) => [
        { type: 'PrescriptionMedicine', id: `LIST_${prescriptionId}` },
      ],
    }),

    // DELETE /api/prescription/medicine/:id
    deletePrescriptionMedicine: builder.mutation({
      query: (id) => ({ url: `/prescription/medicine/${id}`, method: 'DELETE' }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, id) => [
        { type: 'PrescriptionMedicine', id },
        { type: 'PrescriptionMedicine', id: 'LIST' },
      ],
    }),

    // DELETE /api/prescription/:prescriptionId/medicines  (remove all)
    deleteAllMedicines: builder.mutation({
      query: (prescriptionId) => ({
        url: `/prescription/${prescriptionId}/medicines`,
        method: 'DELETE',
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, prescriptionId) => [
        { type: 'PrescriptionMedicine', id: `LIST_${prescriptionId}` },
      ],
    }),

    // ── Prescription Radiology ─────────────────────────────────────────────

    // POST /api/prescription/:prescriptionId/radiologies/bulk
    // Body: { radiologies: [{ radiologyId, notes?, status? }] }
    // ↑ This is the primary call from AddPrescriptionPage
    bulkAddRadiologyOrders: builder.mutation({
      query: ({ prescriptionId, radiologies }) => ({
        url: `/prescription/${prescriptionId}/radiologies/bulk`,
        method: 'POST',
        body: { radiologies },
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, { prescriptionId }) => [
        { type: 'PrescriptionRadiology', id: `LIST_${prescriptionId}` },
        { type: 'Prescription', id: prescriptionId },
      ],
    }),

    // POST /api/prescription/radiology  (single add)
    addRadiologyOrder: builder.mutation({
      query: (body) => ({
        url: '/prescription/radiology',
        method: 'POST',
        body,
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, { prescriptionId }) => [
        { type: 'PrescriptionRadiology', id: `LIST_${prescriptionId}` },
      ],
    }),

    // GET /api/prescription/:prescriptionId/radiologies
    getRadiologyByPrescription: builder.query({
      query: (prescriptionId) => `/prescription/${prescriptionId}/radiologies`,
      transformResponse: unwrapSingle,
      providesTags: (result, error, prescriptionId) => [
        { type: 'PrescriptionRadiology', id: `LIST_${prescriptionId}` },
      ],
    }),

    // GET /api/prescription/radiology/:id
    getRadiologyOrderById: builder.query({
      query: (id) => `/prescription/radiology/${id}`,
      transformResponse: unwrapSingle,
      providesTags: (result, error, id) => [{ type: 'PrescriptionRadiology', id }],
    }),

    // GET /api/prescription/radiology?page&limit&prescriptionId&status&hospitalId
    getAllRadiologyOrders: builder.query({
      query: (params = {}) => ({ url: '/prescription/radiology', params }),
      transformResponse: unwrapList,
      providesTags: [{ type: 'PrescriptionRadiology', id: 'LIST' }],
    }),

    // GET /api/prescription/radiology/hospital/:hospitalId/status/:status?page&limit
    getRadiologyOrdersByStatus: builder.query({
      query: ({ hospitalId, status, ...params }) => ({
        url: `/prescription/radiology/hospital/${hospitalId}/status/${status}`,
        params,
      }),
      transformResponse: unwrapList,
    }),

    // GET /api/prescription/radiology/hospital/:hospitalId/stats
    getRadiologyStats: builder.query({
      query: (hospitalId) =>
        `/prescription/radiology/hospital/${hospitalId}/stats`,
      transformResponse: unwrapSingle,
    }),

    // GET /api/prescription/radiology/by-test/:radiologyId?page&limit
    getOrdersByRadiologyTest: builder.query({
      query: ({ radiologyId, ...params }) => ({
        url: `/prescription/radiology/by-test/${radiologyId}`,
        params,
      }),
      transformResponse: unwrapList,
    }),

    // PUT /api/prescription/radiology/:id
    // Body: { radiologyId?, notes?, resultNote? }
    updateRadiologyOrder: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/prescription/radiology/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, { id }) => [
        { type: 'PrescriptionRadiology', id },
      ],
    }),

    // PATCH /api/prescription/radiology/:id/status
    // Body: { status: 'ordered'|'scheduled'|'in_progress'|'resulted'|'completed'|'cancelled' }
    updateRadiologyStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/prescription/radiology/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, { id }) => [
        { type: 'PrescriptionRadiology', id },
      ],
    }),

    // PATCH /api/prescription/radiology/:id/result
    // Body: { resultFile: string (path/url), resultNote?: string }
    uploadRadiologyResult: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/prescription/radiology/${id}/result`,
        method: 'PATCH',
        body,
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, { id }) => [
        { type: 'PrescriptionRadiology', id },
      ],
    }),

    // PATCH /api/prescription/radiology/:id/verify  (marks as completed)
    verifyRadiologyResult: builder.mutation({
      query: (id) => ({
        url: `/prescription/radiology/${id}/verify`,
        method: 'PATCH',
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, id) => [
        { type: 'PrescriptionRadiology', id },
      ],
    }),

    // DELETE /api/prescription/radiology/:id
    deleteRadiologyOrder: builder.mutation({
      query: (id) => ({
        url: `/prescription/radiology/${id}`,
        method: 'DELETE',
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, id) => [
        { type: 'PrescriptionRadiology', id },
        { type: 'PrescriptionRadiology', id: 'LIST' },
      ],
    }),

    // DELETE /api/prescription/:prescriptionId/radiologies  (remove all)
    deleteAllRadiologyOrders: builder.mutation({
      query: (prescriptionId) => ({
        url: `/prescription/${prescriptionId}/radiologies`,
        method: 'DELETE',
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, prescriptionId) => [
        { type: 'PrescriptionRadiology', id: `LIST_${prescriptionId}` },
      ],
    }),

    // ── Prescribed Pathology ─────────────────────────────────────────────

    // POST /api/prescription/:prescriptionId/pathologies/bulk
    // Body: { pathologies: [{ patientId, doctorId, testId, testName?,
    //                       testCode?, sampleType?, urgency?, notes?, status? }] }
    bulkAddPathologies: builder.mutation({
      query: ({ prescriptionId, pathologies }) => ({
        url: `/prescription/${prescriptionId}/pathologies/bulk`,
        method: 'POST',
        body: { pathologies },
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, { prescriptionId }) => [
        { type: 'PrescribedPathology', id: `LIST_${prescriptionId}` },
        { type: 'Prescription', id: prescriptionId },
      ],
    }),

    // POST /api/prescribed-pathology  (single add)
    addPathology: builder.mutation({
      query: (body) => ({
        url: '/prescribed-pathology',
        method: 'POST',
        body,
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, { prescriptionId }) => [
        { type: 'PrescribedPathology', id: `LIST_${prescriptionId}` },
      ],
    }),

    // GET /api/prescription/:prescriptionId/pathologies
    getPathologiesByPrescription: builder.query({
      query: (prescriptionId) => `/prescription/${prescriptionId}/pathologies`,
      transformResponse: unwrapSingle,
      providesTags: (result, error, prescriptionId) => [
        { type: 'PrescribedPathology', id: `LIST_${prescriptionId}` },
      ],
    }),

    // GET /api/prescribed-pathology/:id
    getPathologyById: builder.query({
      query: (id) => `/prescribed-pathology/${id}`,
      transformResponse: unwrapSingle,
      providesTags: (result, error, id) => [{ type: 'PrescribedPathology', id }],
    }),

    // GET /api/prescribed-pathology?page&limit&status&patientId&doctorId
    getAllPathologies: builder.query({
      query: (params = {}) => ({ url: '/prescribed-pathology', params }),
      transformResponse: unwrapList,
      providesTags: [{ type: 'PrescribedPathology', id: 'LIST' }],
    }),

    // GET /api/prescribed-pathology/patient/:patientId
    getPathologiesByPatient: builder.query({
      query: (patientId) => `/prescribed-pathology/patient/${patientId}`,
      transformResponse: unwrapSingle,
      providesTags: (result, error, patientId) => [
        { type: 'PrescribedPathology', id: `PATIENT_${patientId}` },
      ],
    }),

    // GET /api/prescribed-pathology/doctor/:doctorId
    getPathologiesByDoctor: builder.query({
      query: (doctorId) => `/prescribed-pathology/doctor/${doctorId}`,
      transformResponse: unwrapSingle,
      providesTags: (result, error, doctorId) => [
        { type: 'PrescribedPathology', id: `DOCTOR_${doctorId}` },
      ],
    }),

    // GET /api/prescribed-pathology/by-test/:testId?page&limit
    getPathologiesByTest: builder.query({
      query: ({ testId, ...params }) => ({
        url: `/prescribed-pathology/by-test/${testId}`,
        params,
      }),
      transformResponse: unwrapList,
    }),

    // GET /api/prescribed-pathology/status/:status?page&limit
    getPathologiesByStatus: builder.query({
      query: ({ status, ...params }) => ({
        url: `/prescribed-pathology/status/${status}`,
        params,
      }),
      transformResponse: unwrapList,
    }),

    // GET /api/prescribed-pathology/patient/:patientId/status/:status
    getPatientPathologiesByStatus: builder.query({
      query: ({ patientId, status }) =>
        `/prescribed-pathology/patient/${patientId}/status/${status}`,
      transformResponse: unwrapSingle,
      providesTags: (result, error, { patientId }) => [
        { type: 'PrescribedPathology', id: `PATIENT_${patientId}` },
      ],
    }),

    // GET /api/prescribed-pathology/stats
    getPathologyStats: builder.query({
      query: () => '/prescribed-pathology/stats',
      transformResponse: unwrapSingle,
    }),

    // GET /api/prescribed-pathology/patient/:patientId/stats
    getPatientPathologyStats: builder.query({
      query: (patientId) => `/prescribed-pathology/patient/${patientId}/stats`,
      transformResponse: unwrapSingle,
    }),

    // PUT /api/prescribed-pathology/:id
    updatePathology: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/prescribed-pathology/${id}`,
        method: 'PUT',
        body,
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, { id }) => [
        { type: 'PrescribedPathology', id },
      ],
    }),

    // PATCH /api/prescribed-pathology/:id/status
    // Body: { status: 'prescribed'|'selected'|'invoiced'|'cancelled' }
    updatePathologyStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/prescribed-pathology/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, { id }) => [
        { type: 'PrescribedPathology', id },
      ],
    }),

    // PATCH /api/prescribed-pathology/select-for-billing
    // Body: { ids: string[] }  — bulk update status → 'selected'
    selectPathologyForBilling: builder.mutation({
      query: (body) => ({
        url: '/prescribed-pathology/select-for-billing',
        method: 'PATCH',
        body,
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: [{ type: 'PrescribedPathology', id: 'LIST' }],
    }),

    // DELETE /api/prescribed-pathology/:id
    deletePathology: builder.mutation({
      query: (id) => ({
        url: `/prescribed-pathology/${id}`,
        method: 'DELETE',
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, id) => [
        { type: 'PrescribedPathology', id },
        { type: 'PrescribedPathology', id: 'LIST' },
      ],
    }),

    // DELETE /api/prescription/:prescriptionId/pathologies  (remove all)
    deleteAllPathologies: builder.mutation({
      query: (prescriptionId) => ({
        url: `/prescription/${prescriptionId}/pathologies`,
        method: 'DELETE',
      }),
      transformResponse: unwrapSingle,
      invalidatesTags: (result, error, prescriptionId) => [
        { type: 'PrescribedPathology', id: `LIST_${prescriptionId}` },
      ],
    }),

  }),
  overrideExisting: false,
});
export const {
  // Prescription
  useCreatePrescriptionMutation,
  useGetAllPrescriptionsQuery,
  useGetPrescriptionByIdQuery,
  useGetPrescriptionsByPatientQuery,
  useGetPrescriptionsByHospitalQuery,
  useGetPrescriptionByAppointmentQuery,
  useGetPrescriptionStatsQuery,
  useUpdatePrescriptionMutation,
  useUpdatePrescriptionStatusMutation,
  useDeletePrescriptionMutation,
  useHardDeletePrescriptionMutation,

  // Prescription Medicine
  useBulkAddMedicinesMutation,
  useAddMedicineMutation,
  useGetMedicinesByPrescriptionQuery,
  useGetPrescriptionMedicineByIdQuery,
  useGetAllPrescriptionMedicinesQuery,
  useGetPendingDispenseQuery,
  useGetDispenseStatsQuery,
  useGetMedicinesByMedicineIdQuery,
  useUpdatePrescriptionMedicineMutation,
  useUpdateDispenseStatusMutation,
  useBulkUpdateDispenseStatusMutation,
  useDeletePrescriptionMedicineMutation,
  useDeleteAllMedicinesMutation,

  // Prescription Radiology
  useBulkAddRadiologyOrdersMutation,
  useAddRadiologyOrderMutation,
  useGetRadiologyByPrescriptionQuery,
  useGetRadiologyOrderByIdQuery,
  useGetAllRadiologyOrdersQuery,
  useGetRadiologyOrdersByStatusQuery,
  useGetRadiologyStatsQuery,
  useGetOrdersByRadiologyTestQuery,
  useUpdateRadiologyOrderMutation,
  useUpdateRadiologyStatusMutation,
  useUploadRadiologyResultMutation,
  useVerifyRadiologyResultMutation,
  useDeleteRadiologyOrderMutation,
  useDeleteAllRadiologyOrdersMutation,

  // Prescribed Pathology
  useBulkAddPathologiesMutation,
  useAddPathologyMutation,
  useGetPathologiesByPrescriptionQuery,
  useGetPathologyByIdQuery,
  useGetAllPathologiesQuery,
  useGetPathologiesByPatientQuery,
  useGetPathologiesByDoctorQuery,
  useGetPathologiesByTestQuery,
  useGetPathologiesByStatusQuery,
  useGetPatientPathologiesByStatusQuery,
  useGetPathologyStatsQuery,
  useGetPatientPathologyStatsQuery,
  useUpdatePathologyMutation,
  useUpdatePathologyStatusMutation,
  useSelectPathologyForBillingMutation,
  useDeletePathologyMutation,
  useDeleteAllPathologiesMutation,
} = prescriptionApi;
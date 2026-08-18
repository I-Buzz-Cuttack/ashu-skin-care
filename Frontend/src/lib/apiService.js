/**
 * ============================================================
 *  lib/apiService.js  —  HMS Domain API Service Library
 * ============================================================
 *
 *  ONE STOP SHOP for all non-auth API calls across the HMS app.
 *
 *  Covers:
 *    Patients | Appointments | Doctors | Hospitals | Billing
 *    Lab | Radiology | Ambulance | Pharmacy | Menu Settings
 *
 *  ┌─────────────────────────────────────────────────────────┐
 *  │  HOW TO USE (React component — recommended):            │
 *  │                                                         │
 *  │  import { usePatients } from '@lib/apiService';         │
 *  │                                                         │
 *  │  const {                                                │
 *  │    list, getById, create, update, remove, isLoading     │
 *  │  } = usePatients();                                     │
 *  │                                                         │
 *  │  // Fetch list (auto-runs on mount)                     │
 *  │  const { data } = list({ page: 1, search: 'John' });   │
 *  │                                                         │
 *  │  // Create                                              │
 *  │  await create({ name: 'John', age: 30 });               │
 *  │                                                         │
 *  │  // Update                                              │
 *  │  await update({ id: 5, name: 'Jane' });                 │
 *  │                                                         │
 *  │  // Delete                                              │
 *  │  await remove(5);                                       │
 *  └─────────────────────────────────────────────────────────┘
 *
 *  ┌─────────────────────────────────────────────────────────┐
 *  │  HOW TO USE (direct RTK hooks — fine-grained control):  │
 *  │                                                         │
 *  │  import {                                               │
 *  │    useGetPatientsQuery,                                 │
 *  │    useCreatePatientMutation,                            │
 *  │  } from '@lib/apiService';                              │
 *  │                                                         │
 *  │  const { data, isLoading } = useGetPatientsQuery({      │
 *  │    page: 1, limit: 20, search: 'ali'                    │
 *  │  });                                                    │
 *  └─────────────────────────────────────────────────────────┘
 *
 *  ┌─────────────────────────────────────────────────────────┐
 *  │  HOW TO MAKE ANY AD-HOC API CALL:                       │
 *  │                                                         │
 *  │  import { useApi } from '@lib/apiService';              │
 *  │                                                         │
 *  │  const { get, post, put, del } = useApi();              │
 *  │                                                         │
 *  │  // GET  /custom-endpoint                               │
 *  │  const data = await get('/custom-endpoint');            │
 *  │                                                         │
 *  │  // POST /custom-endpoint with body                     │
 *  │  const res  = await post('/some-path', { field: 1 });   │
 *  └─────────────────────────────────────────────────────────┘
 */

import { useCallback } from 'react';
import { useDispatch }  from 'react-redux';
import { addToast }     from '@store/slices/notificationSlice';

// ── Patients ─────────────────────────────────────────────────
import {
  useGetPatientsQuery,
  useGetPatientByIdQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
} from '@store/api/patientsApi';

// ── Appointments ─────────────────────────────────────────────
import {
  useGetAppointmentsQuery,
  useGetAppointmentByIdQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
} from '@store/api/appointmentsApi';

// ── Doctors ───────────────────────────────────────────────────
import {
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
} from '@store/api/doctorsApi';

// ── Hospitals ─────────────────────────────────────────────────
import {
  useGetHospitalsQuery,
  useGetHospitalByIdQuery,
  useCreateHospitalMutation,
  useUpdateHospitalMutation,
} from '@store/api/hospitalsApi';

// ── Billing ───────────────────────────────────────────────────
import {
  useGetBillsQuery,
  useGetBillByIdQuery,
  useCreateBillMutation,
  useUpdateBillMutation,
  useGetPaymentsQuery,
  useCreatePaymentMutation,
} from '@store/api/billingApi';

// ── Lab ───────────────────────────────────────────────────────
import {
  useGetLabOrdersQuery,
  useCreateLabOrderMutation,
  useUpdateLabOrderMutation,
  useGetLabResultsQuery,
  useCreateLabResultMutation,
  useGetLabCatalogQuery,
  useGetSamplesQuery as useGetLabSamplesQuery,
} from '@store/api/labApi';

// ── Radiology ─────────────────────────────────────────────────
// category
import {
  useGetRadiologyCategoriesQuery,
  useCreateRadiologyCategoryMutation,
  useUpdateRadiologyCategoryMutation,
  useDeleteRadiologyCategoryMutation,
} from '../store/api/radiologyApi/radiologycategory';

// radiology orders
import {
  useGetRadiologyOrdersQuery,
  useGetRadiologyOrderByIdQuery,
  useGetRadiologyOrdersByPatientQuery,
  useGetRadiologyOrdersByDoctorQuery,
  useGetRadiologyOrdersByHospitalQuery,
  useGetPendingRadiologyOrdersByHospitalQuery,
  useCalculateRadiologyAmountQuery,
  useCreateRadiologyOrderMutation,
  useUpdateRadiologyOrderRecordMutation as useUpdateRadiologyOrderMutation,
  useUpdateRadiologyOrderStatusMutation,
  useDeleteRadiologyOrderMutation,
} from '../store/api/radiologyApi/radiologyorder';

// ── Ambulance ─────────────────────────────────────────────────
import {
  useGetDispatchesQuery,
  useCreateDispatchMutation,
  useGetFleetQuery,
  useUpdateVehicleStatusMutation,
  useGetCallsQuery,
  useCreateCallMutation,
  useGetDriversQuery,
  useCreateDriverMutation,
  useUpdateDriverMutation,
} from '@store/api/ambulanceApi';

// ── Pharmacy ─────────────────────────────────────────────────
import {
  useGetMedicinesQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useGetMedicineStockQuery as useGetStockQuery,
  useGetSuppliersQuery,
  useCreateSupplierMutation,
} from '@store/api/pharmacyApi';

// ── Prescriptions ───────────────────────────────────────────────
import {
  useGetAllPrescriptionsQuery as useGetPrescriptionsQuery,
  useUpdatePrescriptionMutation,
} from '@store/api/prescriptionapi/prescriptionapi';

// ── Menu Settings ─────────────────────────────────────────────
import {
  useGetMenuSettingsByRoleQuery,
  useUpdateMenuSettingsByRoleMutation,
  useUpsertMenuSettingsBulkMutation,
} from '@store/api/menuSettingsApi';

// ── Base API (for ad-hoc calls) ───────────────────────────────
import { baseApi } from '@store/api/baseApi';


// =============================================================
//  SECTION 1 — Domain-Specific Hooks
//  Each hook groups all CRUD operations for one entity.
// =============================================================

// ─────────────────────────────────────────────────────────────
//  usePatients()
//  Provides all patient-related API operations.
// ─────────────────────────────────────────────────────────────
/**
 * usePatients()
 *
 * @returns {{
 *   list:      (params?) => RTKQueryResult,
 *   getById:   (id) => RTKQueryResult,
 *   create:    (body) => Promise<Patient>,
 *   update:    ({ id, ...body }) => Promise<Patient>,
 *   remove:    (id) => Promise<void>,
 *   isLoading: boolean,
 *   createLoading: boolean,
 *   updateLoading: boolean,
 *   removeLoading: boolean,
 * }}
 *
 * @example
 *   const { list, create } = usePatients();
 *   const { data, isLoading } = list({ page: 1, search: 'Ali' });
 *   await create({ name: 'Ali', age: 30, gender: 'male' });
 */
export const usePatients = () => {
  const dispatch = useDispatch();
  const [createPatient, { isLoading: createLoading }] = useCreatePatientMutation();
  const [updatePatient, { isLoading: updateLoading }] = useUpdatePatientMutation();
  const [deletePatient, { isLoading: removeLoading }] = useDeletePatientMutation();

  const create = useCallback(async (body) => {
    const res = await createPatient(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Patient created successfully.' }));
    return res;
  }, [createPatient, dispatch]);

  const update = useCallback(async (payload) => {
    const res = await updatePatient(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Patient updated successfully.' }));
    return res;
  }, [updatePatient, dispatch]);

  const remove = useCallback(async (id) => {
    await deletePatient(id).unwrap();
    dispatch(addToast({ type: 'success', message: 'Patient deleted successfully.' }));
  }, [deletePatient, dispatch]);

  return {
    list:          (params) => useGetPatientsQuery(params),   // eslint-disable-line react-hooks/rules-of-hooks
    getById:       (id)     => useGetPatientByIdQuery(id),    // eslint-disable-line react-hooks/rules-of-hooks
    create,
    update,
    remove,
    createLoading,
    updateLoading,
    removeLoading,
  };
};

// ─────────────────────────────────────────────────────────────
//  useAppointments()
// ─────────────────────────────────────────────────────────────
/**
 * useAppointments()
 *
 * @example
 *   const { list, create, cancel } = useAppointments();
 *   const { data } = list({ doctorId: 3, date: '2024-01-01' });
 *   await create({ patientId: 1, doctorId: 2, date: '...' });
 *   await cancel(appointmentId);
 */
export const useAppointments = () => {
  const dispatch = useDispatch();
  const [createAppointment, { isLoading: createLoading }] = useCreateAppointmentMutation();
  const [updateAppointment, { isLoading: updateLoading }] = useUpdateAppointmentMutation();
  const [cancelAppointment, { isLoading: cancelLoading }] = useDeleteAppointmentMutation();

  const create = useCallback(async (body) => {
    const res = await createAppointment(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Appointment scheduled successfully.' }));
    return res;
  }, [createAppointment, dispatch]);

  const update = useCallback(async (payload) => {
    const res = await updateAppointment(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Appointment updated.' }));
    return res;
  }, [updateAppointment, dispatch]);

  const cancel = useCallback(async (id) => {
    await cancelAppointment(id).unwrap();
    dispatch(addToast({ type: 'warning', message: 'Appointment cancelled.' }));
  }, [cancelAppointment, dispatch]);

  return {
    list:          (params) => useGetAppointmentsQuery(params),    // eslint-disable-line react-hooks/rules-of-hooks
    getById:       (id)     => useGetAppointmentByIdQuery(id),     // eslint-disable-line react-hooks/rules-of-hooks
    create,
    update,
    cancel,
    createLoading,
    updateLoading,
    cancelLoading,
  };
};

// ─────────────────────────────────────────────────────────────
//  useDoctors()
// ─────────────────────────────────────────────────────────────
/**
 * useDoctors()
 *
 * @example
 *   const { list, create } = useDoctors();
 *   const { data } = list({ specialty: 'Cardiology' });
 */
export const useDoctors = () => {
  const dispatch = useDispatch();
  const [createDoctor, { isLoading: createLoading }] = useCreateDoctorMutation();
  const [updateDoctor, { isLoading: updateLoading }] = useUpdateDoctorMutation();

  const create = useCallback(async (body) => {
    const res = await createDoctor(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Doctor added successfully.' }));
    return res;
  }, [createDoctor, dispatch]);

  const update = useCallback(async (payload) => {
    const res = await updateDoctor(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Doctor updated.' }));
    return res;
  }, [updateDoctor, dispatch]);

  return {
    list:    (params) => useGetDoctorsQuery(params),    // eslint-disable-line react-hooks/rules-of-hooks
    getById: (id)     => useGetDoctorByIdQuery(id),     // eslint-disable-line react-hooks/rules-of-hooks
    create,
    update,
    createLoading,
    updateLoading,
  };
};

// ─────────────────────────────────────────────────────────────
//  useHospitals()
// ─────────────────────────────────────────────────────────────
export const useHospitals = () => {
  const dispatch = useDispatch();
  const [createHospital, { isLoading: createLoading }] = useCreateHospitalMutation();
  const [updateHospital, { isLoading: updateLoading }] = useUpdateHospitalMutation();

  const create = useCallback(async (body) => {
    const res = await createHospital(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Hospital created.' }));
    return res;
  }, [createHospital, dispatch]);

  const update = useCallback(async (payload) => {
    const res = await updateHospital(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Hospital updated.' }));
    return res;
  }, [updateHospital, dispatch]);

  return {
    list:    (params) => useGetHospitalsQuery(params),   // eslint-disable-line react-hooks/rules-of-hooks
    getById: (id)     => useGetHospitalByIdQuery(id),    // eslint-disable-line react-hooks/rules-of-hooks
    create,
    update,
    createLoading,
    updateLoading,
  };
};

// ─────────────────────────────────────────────────────────────
//  useBilling()
// ─────────────────────────────────────────────────────────────
/**
 * useBilling()
 *
 * @example
 *   const { bills, payments, createBill, recordPayment } = useBilling();
 *   const { data } = bills({ patientId: 1 });
 *   await createBill({ patientId: 1, items: [...] });
 */
export const useBilling = () => {
  const dispatch = useDispatch();
  const [createBillMut,    { isLoading: billLoading    }] = useCreateBillMutation();
  const [updateBillMut,    { isLoading: updateLoading  }] = useUpdateBillMutation();
  const [createPaymentMut, { isLoading: paymentLoading }] = useCreatePaymentMutation();

  const createBill = useCallback(async (body) => {
    const res = await createBillMut(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Bill created successfully.' }));
    return res;
  }, [createBillMut, dispatch]);

  const updateBill = useCallback(async (payload) => {
    const res = await updateBillMut(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Bill updated.' }));
    return res;
  }, [updateBillMut, dispatch]);

  const recordPayment = useCallback(async (body) => {
    const res = await createPaymentMut(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Payment recorded successfully.' }));
    return res;
  }, [createPaymentMut, dispatch]);

  return {
    bills:         (params) => useGetBillsQuery(params),       // eslint-disable-line react-hooks/rules-of-hooks
    getBillById:   (id)     => useGetBillByIdQuery(id),        // eslint-disable-line react-hooks/rules-of-hooks
    payments:      (params) => useGetPaymentsQuery(params),    // eslint-disable-line react-hooks/rules-of-hooks
    createBill,
    updateBill,
    recordPayment,
    billLoading,
    updateLoading,
    paymentLoading,
  };
};

// ─────────────────────────────────────────────────────────────
//  useLab()
// ─────────────────────────────────────────────────────────────
/**
 * useLab()
 *
 * @example
 *   const { orders, results, catalog, createOrder, updateResult } = useLab();
 */
export const useLab = () => {
  const dispatch = useDispatch();
  const [createOrder,   { isLoading: createLoading }] = useCreateLabOrderMutation();
  const [updateOrder,   { isLoading: updateOrderLoading }] = useUpdateLabOrderMutation();
  const [createResult,  { isLoading: resultLoading  }] = useCreateLabResultMutation();

  const createLabOrder = useCallback(async (body) => {
    const res = await createOrder(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Lab order created.' }));
    return res;
  }, [createOrder, dispatch]);

  const updateLabOrder = useCallback(async (payload) => {
    const res = await updateOrder(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Lab order updated.' }));
    return res;
  }, [updateOrder, dispatch]);

  const createLabResult = useCallback(async (payload) => {
    const res = await createResult(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Lab result saved.' }));
    return res;
  }, [createResult, dispatch]);

  return {
    orders:          (params) => useGetLabOrdersQuery(params),    // eslint-disable-line react-hooks/rules-of-hooks
    results:         (params) => useGetLabResultsQuery(params),   // eslint-disable-line react-hooks/rules-of-hooks
    catalog:         (params) => useGetLabCatalogQuery(params),   // eslint-disable-line react-hooks/rules-of-hooks
    samples:         (params) => useGetLabSamplesQuery(params),   // eslint-disable-line react-hooks/rules-of-hooks
    createLabOrder,
    updateLabOrder,
    createLabResult,
    createLoading,
    updateOrderLoading,
    resultLoading,
  };
};

// ─────────────────────────────────────────────────────────────
//  useRadiology()
// ─────────────────────────────────────────────────────────────
export const useRadiology = () => {
  const dispatch = useDispatch();
  const [createOrder, { isLoading: createLoading }] = useCreateRadiologyOrderMutation();
  const [updateOrder, { isLoading: updateLoading }] = useUpdateRadiologyOrderMutation();

  const createRadiologyOrder = useCallback(async (body) => {
    const res = await createOrder(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Radiology order created.' }));
    return res;
  }, [createOrder, dispatch]);

  const updateRadiologyOrder = useCallback(async (payload) => {
    const res = await updateOrder(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Radiology order updated.' }));
    return res;
  }, [updateOrder, dispatch]);

  return {
    orders:  (params) => useGetRadiologyOrdersQuery(params), // eslint-disable-line react-hooks/rules-of-hooks
    createRadiologyOrder,
    updateRadiologyOrder,
    createLoading,
    updateLoading,
  };
};

// ─────────────────────────────────────────────────────────────
//  useAmbulance()
// ─────────────────────────────────────────────────────────────
/**
 * useAmbulance()
 *
 * @example
 *   const { fleet, dispatches, createDispatch } = useAmbulance();
 *   const { data } = fleet();
 *   await createDispatch({ vehicleId: 1, destination: '...' });
 */
export const useAmbulance = () => {
  const dispatch = useDispatch();
  const [createDispatchMut,     { isLoading: dispatchLoading }] = useCreateDispatchMutation();
  const [updateVehicleStatusMut,{ isLoading: vehicleLoading  }] = useUpdateVehicleStatusMutation();
  const [createCallMut,         { isLoading: callLoading     }] = useCreateCallMutation();
  const [createDriverMut,       { isLoading: driverLoading   }] = useCreateDriverMutation();
  const [updateDriverMut,       { isLoading: driverUpdLoading}] = useUpdateDriverMutation();

  const createDispatch = useCallback(async (body) => {
    const res = await createDispatchMut(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Ambulance dispatched.' }));
    return res;
  }, [createDispatchMut, dispatch]);

  const updateVehicle = useCallback(async (payload) => {
    const res = await updateVehicleStatusMut(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Vehicle status updated.' }));
    return res;
  }, [updateVehicleStatusMut, dispatch]);

  const createCall = useCallback(async (body) => {
    const res = await createCallMut(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Emergency call registered.' }));
    return res;
  }, [createCallMut, dispatch]);

  const addDriver = useCallback(async (body) => {
    const res = await createDriverMut(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Driver added.' }));
    return res;
  }, [createDriverMut, dispatch]);

  const updateDriver = useCallback(async (payload) => {
    const res = await updateDriverMut(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Driver updated.' }));
    return res;
  }, [updateDriverMut, dispatch]);

  return {
    dispatches:     (params) => useGetDispatchesQuery(params),   // eslint-disable-line react-hooks/rules-of-hooks
    fleet:          (params) => useGetFleetQuery(params),        // eslint-disable-line react-hooks/rules-of-hooks
    calls:          (params) => useGetCallsQuery(params),        // eslint-disable-line react-hooks/rules-of-hooks
    drivers:        (params) => useGetDriversQuery(params),      // eslint-disable-line react-hooks/rules-of-hooks
    createDispatch,
    updateVehicle,
    createCall,
    addDriver,
    updateDriver,
    dispatchLoading,
    vehicleLoading,
    callLoading,
    driverLoading,
    driverUpdLoading,
  };
};

// ─────────────────────────────────────────────────────────────
//  usePharmacy()
// ─────────────────────────────────────────────────────────────
/**
 * usePharmacy()
 *
 * @example
 *   const { medicines, stock, createMedicine, updateStock } = usePharmacy();
 *   const { data } = medicines({ search: 'Aspirin' });
 *   await updateStock({ medicineId: 1, quantity: 100 });
 */
export const usePharmacy = () => {
  const dispatch = useDispatch();
  const [updatePrescriptionMut, { isLoading: rxLoading      }] = useUpdatePrescriptionMutation();
  const [createMedicineMut,     { isLoading: medCreateLoad  }] = useCreateMedicineMutation();
  const [updateMedicineMut,     { isLoading: medUpdateLoad  }] = useUpdateMedicineMutation();
  const [createSupplierMut,     { isLoading: suppCreateLoad }] = useCreateSupplierMutation();

  const dispensePrescription = useCallback(async (payload) => {
    const res = await updatePrescriptionMut(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Prescription dispensed.' }));
    return res;
  }, [updatePrescriptionMut, dispatch]);

  const createMedicine = useCallback(async (body) => {
    const res = await createMedicineMut(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Medicine added to catalog.' }));
    return res;
  }, [createMedicineMut, dispatch]);

  const updateMedicine = useCallback(async (payload) => {
    const res = await updateMedicineMut(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Medicine updated.' }));
    return res;
  }, [updateMedicineMut, dispatch]);

  const addSupplier = useCallback(async (body) => {
    const res = await createSupplierMut(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Supplier added.' }));
    return res;
  }, [createSupplierMut, dispatch]);

  return {
    prescriptions:   (params) => useGetPrescriptionsQuery(params),   // eslint-disable-line react-hooks/rules-of-hooks
    medicines:       (params) => useGetMedicinesQuery(params),        // eslint-disable-line react-hooks/rules-of-hooks
    stock:           (params) => useGetStockQuery(params),            // eslint-disable-line react-hooks/rules-of-hooks
    suppliers:       (params) => useGetSuppliersQuery(params),        // eslint-disable-line react-hooks/rules-of-hooks
    dispensePrescription,
    createMedicine,
    updateMedicine,
    addSupplier,
    rxLoading,
    medCreateLoad,
    medUpdateLoad,
    suppCreateLoad,
  };
};

// ─────────────────────────────────────────────────────────────
//  useMenuSettings()
// ─────────────────────────────────────────────────────────────
export const useMenuSettings = () => {
  const dispatch = useDispatch();
  const [updateSettingsMut, { isLoading: updateLoading }] = useUpdateMenuSettingsByRoleMutation();
  const [bulkUpdateMut,     { isLoading: bulkLoading   }] = useUpsertMenuSettingsBulkMutation();

  const saveSettings = useCallback(async (payload) => {
    const res = await updateSettingsMut(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Menu settings saved.' }));
    return res;
  }, [updateSettingsMut, dispatch]);

  const bulkSave = useCallback(async (body) => {
    const res = await bulkUpdateMut(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Menu settings updated.' }));
    return res;
  }, [bulkUpdateMut, dispatch]);

  return {
    settings:    (role)   => useGetMenuSettingsByRoleQuery(role), // eslint-disable-line react-hooks/rules-of-hooks
    saveSettings,
    bulkSave,
    updateLoading,
    bulkLoading,
  };
};


// =============================================================
//  SECTION 2 — useApi()  — Generic Ad-hoc Request Hook
//  Use this when you need to call an endpoint that isn't
//  covered by any of the domain hooks above.
// =============================================================

/**
 * useApi()
 *
 * Provides imperative get/post/put/del helpers that use the
 * RTK Query store underneath (so requests are still cached).
 *
 * @returns {{ get, post, put, del }}
 *
 * @example
 *   const { get, post } = useApi();
 *
 *   // Fetch any endpoint
 *   const data = await get('/reports/summary?month=4');
 *
 *   // POST to any endpoint
 *   const res = await post('/custom/action', { key: 'value' });
 *
 *   // PUT
 *   await put('/some-resource/5', { field: 'updated' });
 *
 *   // DELETE
 *   await del('/some-resource/5');
 */
export const useApi = () => {
  const dispatch = useDispatch();

  /**
   * Internal helper — dispatches a one-off RTK Query mutation.
   * @param {'GET'|'POST'|'PUT'|'PATCH'|'DELETE'} method
   * @param {string} url
   * @param {object} [body]
   * @param {object} [params]
   * @returns {Promise<any>} resolved data
   */
  const _request = useCallback(async (method, url, body = undefined, params = undefined) => {
    let result;
    if (baseApi.endpoints.adhocRequest?.initiate) {
      result = await dispatch(baseApi.endpoints.adhocRequest.initiate({ url, method, body, params }));
    } else {
      result = await _adhocQuery(dispatch, { url, method, body, params });
    }
    
    if (result.error) throw result.error;
    return result.data;
  }, [dispatch]);

  const get  = useCallback((url, params)       => _request('GET',    url, undefined, params), [_request]);
  const post = useCallback((url, body, params)  => _request('POST',   url, body,      params), [_request]);
  const put  = useCallback((url, body, params)  => _request('PUT',    url, body,      params), [_request]);
  const patch= useCallback((url, body, params)  => _request('PATCH',  url, body,      params), [_request]);
  const del  = useCallback((url, params)        => _request('DELETE', url, undefined, params), [_request]);

  return { get, post, put, patch, del };
};

/**
 * _adhocQuery — internal fallback for useApi()
 * Uses the store's baseQuery directly.
 * @private
 */
async function _adhocQuery(dispatch, { url, method, body, params }) {
  if (method === 'GET') {
    const tempApi = baseApi.injectEndpoints({
      endpoints: (builder) => ({
        adhocQuery: builder.query({ query: (args) => ({ url: args.url, params: args.params, method: 'GET' }) }),
      }),
      overrideExisting: true,
    });
    return dispatch(tempApi.endpoints.adhocQuery.initiate({ url, params }, { forceRefetch: true }));
  } else {
    const tempApi = baseApi.injectEndpoints({
      endpoints: (builder) => ({
        adhocMutation: builder.mutation({ query: (args) => ({ url: args.url, method: args.method, body: args.body, params: args.params }) }),
      }),
      overrideExisting: true,
    });
    return dispatch(tempApi.endpoints.adhocMutation.initiate({ url, method, body, params }));
  }
}


// =============================================================
//  SECTION 3 — Re-export all raw RTK Query hooks
//  Import these for fine-grained control or when the domain
//  hooks don't fit your exact use case.
// =============================================================

// Patients
export {
  useGetPatientsQuery,
  useGetPatientByIdQuery,
  useCreatePatientMutation,
  useUpdatePatientMutation,
  useDeletePatientMutation,
};

// Appointments
export {
  useGetAppointmentsQuery,
  useGetAppointmentByIdQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
};

// Doctors
export {
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
};

// Hospitals
export {
  useGetHospitalsQuery,
  useGetHospitalByIdQuery,
  useCreateHospitalMutation,
  useUpdateHospitalMutation,
};

// Billing
export {
  useGetBillsQuery,
  useGetBillByIdQuery,
  useCreateBillMutation,
  useUpdateBillMutation,
  useGetPaymentsQuery,
  useCreatePaymentMutation,
};

// Lab
export {
  useGetLabOrdersQuery,
  useCreateLabOrderMutation,
  useUpdateLabOrderMutation,
  useGetLabResultsQuery,
  useCreateLabResultMutation,
  useGetLabCatalogQuery,
  useGetLabSamplesQuery,
};

// Radiology
export {
  useGetRadiologyOrdersQuery,
  useGetRadiologyOrderByIdQuery,
  useGetRadiologyOrdersByPatientQuery,
  useGetRadiologyOrdersByDoctorQuery,
  useGetRadiologyOrdersByHospitalQuery,
  useGetPendingRadiologyOrdersByHospitalQuery,
  useCalculateRadiologyAmountQuery,
  useCreateRadiologyOrderMutation,
  useUpdateRadiologyOrderMutation,
  useUpdateRadiologyOrderStatusMutation,
  useDeleteRadiologyOrderMutation,
};

// Ambulance
export {
  useGetDispatchesQuery,
  useCreateDispatchMutation,
  useGetFleetQuery,
  useUpdateVehicleStatusMutation,
  useGetCallsQuery,
  useCreateCallMutation,
  useGetDriversQuery,
  useCreateDriverMutation,
  useUpdateDriverMutation,
};

// Pharmacy
export {
  useGetPrescriptionsQuery,
  useUpdatePrescriptionMutation,
  useGetMedicinesQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useGetStockQuery,
  useGetSuppliersQuery,
  useCreateSupplierMutation,
};

// Menu Settings
export {
  useGetMenuSettingsByRoleQuery,
  useUpdateMenuSettingsByRoleMutation,
  useUpsertMenuSettingsBulkMutation,
};

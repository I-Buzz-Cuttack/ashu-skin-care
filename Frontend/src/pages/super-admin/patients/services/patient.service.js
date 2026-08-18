import { PATIENT_SEED_DATA } from '../constants/patient.constants';

let patientStore = [...PATIENT_SEED_DATA];

const clone = (value) => JSON.parse(JSON.stringify(value));

export const listPatients = () => clone(patientStore);

export const getPatientById = (id) => {
  const patientId = Number(id);
  return clone(patientStore.find((patient) => patient.id === patientId) || null);
};

export const createPatient = (payload) => {
  const nextPatient = {
    ...payload,
    id: Date.now(),
    registered: new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }),
  };

  patientStore = [nextPatient, ...patientStore];
  return clone(nextPatient);
};

export const updatePatient = (id, payload) => {
  const patientId = Number(id);
  let updatedPatient = null;

  patientStore = patientStore.map((patient) => {
    if (patient.id !== patientId) return patient;

    updatedPatient = { ...patient, ...payload, id: patient.id };
    return updatedPatient;
  });

  return clone(updatedPatient);
};

export const deletePatient = (id) => {
  const patientId = Number(id);
  patientStore = patientStore.filter((patient) => patient.id !== patientId);
};

export const deletePatients = (ids = []) => {
  const patientIds = new Set(ids.map((id) => Number(id)));
  patientStore = patientStore.filter((patient) => !patientIds.has(patient.id));
};

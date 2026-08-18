import { useDispatch } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';

import {
  useGetHospitalsQuery,
  useCreateHospitalMutation,
  useUpdateHospitalMutation,
  useDeleteHospitalMutation,
} from '../../store/api/hospitalApi/hospital.js';

// ===============================
// 🧩 HOSPITAL SERVICE
// ===============================
export const useHospital = (params = {}) => {
  const dispatch = useDispatch();

  const listQuery = useGetHospitalsQuery(params);

  const [createHospitalMutation, { isLoading: createLoading }] =
    useCreateHospitalMutation();

  const [updateHospitalMutation, { isLoading: updateLoading }] =
    useUpdateHospitalMutation();

  const [deleteHospitalMutation, { isLoading: deleteLoading }] =
    useDeleteHospitalMutation();

  const create = async (body) => {
    const res = await createHospitalMutation(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Hospital created.' }));
    return res;
  };

  const update = async (payload) => {
    const res = await updateHospitalMutation(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Hospital updated.' }));
    return res;
  };

  const remove = async (id) => {
    await deleteHospitalMutation(id).unwrap();
    dispatch(addToast({ type: 'success', message: 'Hospital deleted.' }));
  };

  return {
    listQuery,
    create,
    update,
    remove,
    createLoading,
    updateLoading,
    deleteLoading,
  };
};
import { useDispatch } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';

import {
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
} from '../../store/api/doctorApi/doctor.js';

// ===============================
// 🧩 DOCTOR SERVICE
// ===============================
export const useDoctor = (params = {}) => {
  const dispatch = useDispatch();

  const listQuery = useGetDoctorsQuery(params);
  const byIdQuery = useGetDoctorByIdQuery(params?.id, {
    skip: !params?.id,
  });

  const [createDoctorMutation, { isLoading: createLoading }] =
    useCreateDoctorMutation();

  const [updateDoctorMutation, { isLoading: updateLoading }] =
    useUpdateDoctorMutation();

  const [deleteDoctorMutation, { isLoading: deleteLoading }] =
    useDeleteDoctorMutation();

  const create = async (body) => {
    const res = await createDoctorMutation(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Doctor created.' }));
    return res;
  };

  const update = async (payload) => {
    const res = await updateDoctorMutation(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Doctor updated.' }));
    return res;
  };

  const remove = async (id) => {
    await deleteDoctorMutation(id).unwrap();
    dispatch(addToast({ type: 'success', message: 'Doctor deleted.' }));
  };

  return {
    listQuery,
    byIdQuery,
    create,
    update,
    remove,
    createLoading,
    updateLoading,
    deleteLoading,
  };
};
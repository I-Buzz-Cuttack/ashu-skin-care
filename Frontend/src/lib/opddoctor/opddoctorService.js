import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/notificationSlice';
import {
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useCreateDoctorMutation,
  useUpdateDoctorMutation,
  useDeleteDoctorMutation,
} from '../../store/api/doctorApi/doctor';

const READONLY_FIELDS = ['createdAt', 'updatedAt', 'id'];

const stripReadonly = (obj) => {
  const cleaned = { ...obj };
  READONLY_FIELDS.forEach((key) => delete cleaned[key]);
  return cleaned;
};

export const useDoctor = (params = {}) => {
  const dispatch = useDispatch();

  // ── Queries ──────────────────────────────────────────────────────────────

  const listQuery = useGetDoctorsQuery(params, {
    refetchOnMountOrArgChange: true,
  });

  const byIdQuery = useGetDoctorByIdQuery(params?.id, {
    skip: !params?.id,
  });

  // ── Mutations ─────────────────────────────────────────────────────────────

  const [createDoctorMutation, { isLoading: createLoading }] =
    useCreateDoctorMutation();

  const [updateDoctorMutation, { isLoading: updateLoading }] =
    useUpdateDoctorMutation();

  const [deleteDoctorMutation, { isLoading: deleteLoading }] =
    useDeleteDoctorMutation();

  // ── Helpers ───────────────────────────────────────────────────────────────

  const create = async (body) => {
    try {
      const res = await createDoctorMutation(stripReadonly(body)).unwrap();
      dispatch(addToast({ type: 'success', message: 'Doctor created successfully.' }));
      return res;
    } catch (error) {
      console.error('Create doctor error:', error);
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to create doctor.' }));
      throw error;
    }
  };

  const update = async (payload) => {
    try {
      const res = await updateDoctorMutation(stripReadonly(payload)).unwrap();
      dispatch(addToast({ type: 'success', message: 'Doctor updated successfully.' }));
      return res;
    } catch (error) {
      console.error('Update doctor error:', error);
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update doctor.' }));
      throw error;
    }
  };

  const remove = async (id) => {
    try {
      await deleteDoctorMutation(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Doctor deleted successfully.' }));
    } catch (error) {
      console.error('Delete doctor error:', error);
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to delete doctor.' }));
      throw error;
    }
  };

  const removeMultiple = async (ids) => {
    try {
      await Promise.all(ids.map((id) => deleteDoctorMutation(id).unwrap()));
      dispatch(addToast({ type: 'success', message: `${ids.length} doctor(s) deleted successfully.` }));
    } catch (error) {
      console.error('Bulk delete error:', error);
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to delete doctors.' }));
      throw error;
    }
  };

  return {
    listQuery,
    byIdQuery,
    create,
    update,
    remove,
    removeMultiple,
    createLoading,
    updateLoading,
    deleteLoading,
  };
};
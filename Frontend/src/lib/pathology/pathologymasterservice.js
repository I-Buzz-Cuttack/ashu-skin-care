import { useDispatch } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';

import {
  useGetPathologyMastersQuery,
  useCreatePathologyMasterMutation,
  useUpdatePathologyMasterMutation,
  useDeletePathologyMasterMutation,
  usePatchPathologyMasterMutation,
} from '../../store/api/pathologyApi/pathologyMaster.js';

// ===============================
// 🧩 PATHOLOGY MASTER SERVICE
// ===============================
export const usePathologyMaster = () => {
  const dispatch = useDispatch();

  const [createMaster, { isLoading: createLoading }] =
    useCreatePathologyMasterMutation();

  const [updateMaster, { isLoading: updateLoading }] =
    useUpdatePathologyMasterMutation();

  const [patchMaster, { isLoading: patchLoading }] =
    usePatchPathologyMasterMutation();

  const [deleteMaster, { isLoading: deleteLoading }] =
    useDeletePathologyMasterMutation();

  const create = async (body) => {
    try {
      const res = await createMaster(body).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology test created.' }));
      return res;
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to create pathology test.',
      }));
      throw error;
    }
  };

  const update = async (payload) => {
    try {
      const res = await updateMaster(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology test updated.' }));
      return res;
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to update pathology test.',
      }));
      throw error;
    }
  };

  const patch = async (payload) => {
    try {
      const res = await patchMaster(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology test updated.' }));
      return res;
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to update pathology test.',
      }));
      throw error;
    }
  };

  const remove = async (id) => {
    try {
      await deleteMaster(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology test deleted.' }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to delete pathology test.',
      }));
      throw error;
    }
  };

  return {
    list: (params) => useGetPathologyMastersQuery(params),
    create,
    update,
    patch,
    remove,
    createLoading,
    updateLoading,
    patchLoading,
    deleteLoading,
  };
};

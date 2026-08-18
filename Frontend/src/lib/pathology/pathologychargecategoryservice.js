import { useDispatch, useSelector } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';
import { selectCurrentUser } from '@store/slices/authSlice';

import {
  useGetPathologyChargeCategoriesQuery,
  useCreatePathologyChargeCategoryMutation,
  useUpdatePathologyChargeCategoryMutation,
  useDeletePathologyChargeCategoryMutation,
  usePatchPathologyChargeCategoryMutation,
} from '../../store/api/pathologyApi/pathologyChargeCategory.js';

// ===============================
// 🧩 PATHOLOGY CHARGE CATEGORY SERVICE
// ===============================
export const usePathologyChargeCategory = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const currentUserId = Number(currentUser?.id);

  const [createChargeCategory, { isLoading: createLoading }] =
    useCreatePathologyChargeCategoryMutation();

  const [updateChargeCategory, { isLoading: updateLoading }] =
    useUpdatePathologyChargeCategoryMutation();

  const [patchChargeCategory, { isLoading: patchLoading }] =
    usePatchPathologyChargeCategoryMutation();

  const [deleteChargeCategory, { isLoading: deleteLoading }] =
    useDeletePathologyChargeCategoryMutation();

  const create = async (body) => {
    try {
      const res = await createChargeCategory({
        ...body,
        createdBy: body.createdBy ?? (Number.isFinite(currentUserId) ? currentUserId : 1),
      }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Charge category created.' }));
      return res;
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to create charge category.',
      }));
      throw error;
    }
  };

  const update = async (payload) => {
    try {
      const res = await updateChargeCategory(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Charge category updated.' }));
      return res;
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to update charge category.',
      }));
      throw error;
    }
  };

  const patch = async (payload) => {
    try {
      const res = await patchChargeCategory(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Charge category updated.' }));
      return res;
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to update charge category.',
      }));
      throw error;
    }
  };

  const remove = async (id) => {
    try {
      await deleteChargeCategory(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Charge category deleted.' }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to delete charge category.',
      }));
      throw error;
    }
  };

  return {
    list: (params) => useGetPathologyChargeCategoriesQuery(params),
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

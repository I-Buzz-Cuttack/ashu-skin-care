import { useDispatch, useSelector } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';
import { selectCurrentUser } from '@store/slices/authSlice';

import {
  useGetPathologyCategoriesQuery,
  useCreatePathologyCategoryMutation,
  useUpdatePathologyCategoryMutation,
  useDeletePathologyCategoryMutation,
  usePatchPathologyCategoryMutation,
} from '../../store/api/pathologyApi/pathologyCategory.js';

// ===============================
// 🧩 PATHOLOGY CATEGORY SERVICE
// ===============================
export const usePathologyCategory = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);

  const [createCategory, { isLoading: createLoading }] =
    useCreatePathologyCategoryMutation();

  const [updateCategory, { isLoading: updateLoading }] =
    useUpdatePathologyCategoryMutation();

  const [patchCategory, { isLoading: patchLoading }] =
    usePatchPathologyCategoryMutation();

  const [deleteCategory, { isLoading: deleteLoading }] =
    useDeletePathologyCategoryMutation();

  const create = async (body) => {
    try {
      const res = await createCategory({
        ...body,
        createdBy: body.createdBy ?? Number(currentUser?.id || 1),
      }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology category created.' }));
      return res;
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to create pathology category.',
      }));
      throw error;
    }
  };

  const update = async (payload) => {
    try {
      const res = await updateCategory(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology category updated.' }));
      return res;
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to update pathology category.',
      }));
      throw error;
    }
  };

  const patch = async (payload) => {
    try {
      const res = await patchCategory(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology category updated.' }));
      return res;
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to update pathology category.',
      }));
      throw error;
    }
  };

  const remove = async (id) => {
    try {
      await deleteCategory(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Pathology category deleted.' }));
    } catch (error) {
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to delete pathology category.',
      }));
      throw error;
    }
  };

  return {
    list: (params) => useGetPathologyCategoriesQuery(params),
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

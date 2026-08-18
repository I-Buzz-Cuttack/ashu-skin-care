import { useDispatch } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';

import {
  useGetPathologySubCategoriesQuery,
  useCreatePathologySubCategoryMutation,
  useUpdatePathologySubCategoryMutation,
  useDeletePathologySubCategoryMutation,
  usePatchPathologySubCategoryMutation,
} from '../../store/api/pathologyApi/pathologySubCategory.js';

// ===============================
// 🧩 PATHOLOGY SUB-CATEGORY SERVICE
// ===============================
export const usePathologySubCategory = () => {
  const dispatch = useDispatch();

  const [createSubCategory, { isLoading: createLoading }] =
    useCreatePathologySubCategoryMutation();

  const [updateSubCategory, { isLoading: updateLoading }] =
    useUpdatePathologySubCategoryMutation();

  const [patchSubCategory, { isLoading: patchLoading }] =
    usePatchPathologySubCategoryMutation();

  const [deleteSubCategory, { isLoading: deleteLoading }] =
    useDeletePathologySubCategoryMutation();

  const create = async (body) => {
    const res = await createSubCategory(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Pathology sub-category created.' }));
    return res;
  };

  const update = async (payload) => {
    const res = await updateSubCategory(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Pathology sub-category updated.' }));
    return res;
  };

  const patch = async (payload) => {
    const res = await patchSubCategory(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Pathology sub-category updated.' }));
    return res;
  };

  const remove = async (id) => {
    await deleteSubCategory(id).unwrap();
    dispatch(addToast({ type: 'success', message: 'Pathology sub-category deleted.' }));
  };

  return {
    list: (params) => useGetPathologySubCategoriesQuery(params),
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
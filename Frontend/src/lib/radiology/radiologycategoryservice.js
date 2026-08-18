// import { useDispatch } from 'react-redux';
// import { addToast } from '@store/slices/notificationSlice';

// import {
//   useGetRadiologyCategoriesQuery,
//   useCreateRadiologyCategoryMutation,
//   useUpdateRadiologyCategoryMutation,
//   useDeleteRadiologyCategoryMutation,
// } from '../../store/api/radiologyApi/radiologycategory.js';

// // ===============================
// // 🧩 CATEGORY SERVICE
// // ===============================
// export const useRadiologyCategory = () => {
//   const dispatch = useDispatch();

//   const [createCategory, { isLoading: createLoading }] =
//     useCreateRadiologyCategoryMutation();

//   const [updateCategory, { isLoading: updateLoading }] =
//     useUpdateRadiologyCategoryMutation();

//   const [deleteCategory, { isLoading: deleteLoading }] =
//     useDeleteRadiologyCategoryMutation();

//   const create = async (body) => {
//     const res = await createCategory(body).unwrap();
//     dispatch(addToast({ type: 'success', message: 'Category created.' }));
//     return res;
//   };

//   const update = async (payload) => {
//     const res = await updateCategory(payload).unwrap();
//     dispatch(addToast({ type: 'success', message: 'Category updated.' }));
//     return res;
//   };

//   const remove = async (id) => {
//     await deleteCategory(id).unwrap();
//     dispatch(addToast({ type: 'success', message: 'Category deleted.' }));
//   };

//   return {
//     list: (params) => useGetRadiologyCategoriesQuery(params),
//     create,
//     update,
//     remove,
//     createLoading,
//     updateLoading,
//     deleteLoading,
//   };
// };


import { useDispatch } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';
import {
  useGetRadiologyCategoriesQuery,
  useGetRadiologyCategoryByIdQuery,
  useCreateRadiologyCategoryMutation,
  useUpdateRadiologyCategoryMutation,
  usePatchRadiologyCategoryMutation,
  useDeleteRadiologyCategoryMutation,
  useGetRadiologyCategoriesForDropdownQuery,
} from '../../store/api/radiologyApi/radiologycategory';

export const useRadiologyCategory = (params = {}) => {
  const dispatch = useDispatch();

  const listQuery = useGetRadiologyCategoriesQuery(params, {
    refetchOnMountOrArgChange: true,
    skip: !!params?.id,
  });

  const byIdQuery = useGetRadiologyCategoryByIdQuery(params?.id, {
    skip: !params?.id,
  });

  const categoriesDropdownQuery = useGetRadiologyCategoriesForDropdownQuery();

  const [createRadiologyCategoryMutation, { isLoading: createLoading }] =
    useCreateRadiologyCategoryMutation();
  const [updateRadiologyCategoryMutation, { isLoading: updateLoading }] =
    useUpdateRadiologyCategoryMutation();
  const [patchRadiologyCategoryMutation, { isLoading: patchLoading }] =
    usePatchRadiologyCategoryMutation();
  const [deleteRadiologyCategoryMutation, { isLoading: deleteLoading }] =
    useDeleteRadiologyCategoryMutation();

  const create = async (body) => {
    try {
      const res = await createRadiologyCategoryMutation(body).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology category created successfully.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to create radiology category.' }));
      throw error;
    }
  };

  const update = async (payload) => {
    try {
      const res = await updateRadiologyCategoryMutation(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology category updated successfully.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update radiology category.' }));
      throw error;
    }
  };

  const patch = async (id, body) => {
    try {
      const res = await patchRadiologyCategoryMutation({ id, ...body }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology category updated.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update radiology category.' }));
      throw error;
    }
  };

  const remove = async (id) => {
    try {
      await deleteRadiologyCategoryMutation(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology category deleted successfully.' }));
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to delete radiology category.' }));
      throw error;
    }
  };

  const removeMultiple = async (ids) => {
    try {
      await Promise.all(ids.map((id) => deleteRadiologyCategoryMutation(id).unwrap()));
      dispatch(addToast({
        type: 'success',
        message: `${ids.length} radiology categor${ids.length === 1 ? 'y' : 'ies'} deleted successfully.`,
      }));
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to delete radiology categories.' }));
      throw error;
    }
  };

  const categoryOptions = (categoriesDropdownQuery.data?.data ?? []).map((c) => ({
    value: String(c.id),
    label: c.categoryName ?? String(c.id),
  }));

  return {
    listQuery,
    byIdQuery,
    categoriesDropdownQuery,
    categoryOptions,
    create,
    update,
    patch,
    remove,
    removeMultiple,
    createLoading,
    updateLoading,
    patchLoading,
    deleteLoading,
  };
};
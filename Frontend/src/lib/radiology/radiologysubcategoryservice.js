// src/store/hooks/useRadiologySubCategory.js
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/notificationSlice';
import {
  useGetRadiologySubCategoriesQuery,
  useGetRadiologySubCategoriesByCategoryQuery,
  useGetRadiologySubCategoryByIdQuery,
  useCreateRadiologySubCategoryMutation,
  useUpdateRadiologySubCategoryMutation,
  usePatchRadiologySubCategoryMutation,
  useDeleteRadiologySubCategoryMutation,
} from '../../store/api/radiologyApi/radiologysubcategory';

export const useRadiologySubCategory = (params = {}) => {
  const dispatch = useDispatch();

  // ── List (paginated / filtered) ──────────────────────────────────────────
  const listQuery = useGetRadiologySubCategoriesQuery(params, {
    refetchOnMountOrArgChange: true,
    skip: !!params?.id || !!params?.categoryId,
  });

  // ── Single record ────────────────────────────────────────────────────────
  const byIdQuery = useGetRadiologySubCategoryByIdQuery(params?.id, {
    skip: !params?.id,
  });

  // ── By category (the cascading dropdown query) ───────────────────────────
  // Pass params.categoryId to auto-fetch the sub-categories for that category,
  // e.g. when the user picks a category in the "Add Test" modal.
  const byCategoryQuery = useGetRadiologySubCategoriesByCategoryQuery(params?.categoryId, {
    skip: !params?.categoryId,
  });

  // ── Mutations ────────────────────────────────────────────────────────────
  const [createRadiologySubCategoryMutation, { isLoading: createLoading }] =
    useCreateRadiologySubCategoryMutation();

  const [updateRadiologySubCategoryMutation, { isLoading: updateLoading }] =
    useUpdateRadiologySubCategoryMutation();

  const [patchRadiologySubCategoryMutation, { isLoading: patchLoading }] =
    usePatchRadiologySubCategoryMutation();

  const [deleteRadiologySubCategoryMutation, { isLoading: deleteLoading }] =
    useDeleteRadiologySubCategoryMutation();

  // ── CRUD helpers ─────────────────────────────────────────────────────────
  const create = async (body) => {
    try {
      const res = await createRadiologySubCategoryMutation(body).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology sub-category created successfully.' }));
      return res;
    } catch (error) {
      console.error('Create radiology sub-category error:', error);
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to create radiology sub-category.',
      }));
      throw error;
    }
  };

  const update = async (payload) => {
    try {
      const res = await updateRadiologySubCategoryMutation(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology sub-category updated successfully.' }));
      return res;
    } catch (error) {
      console.error('Update radiology sub-category error:', error);
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to update radiology sub-category.',
      }));
      throw error;
    }
  };

  /** Toggle isActive without a full PUT */
  const patch = async (id, body) => {
    try {
      const res = await patchRadiologySubCategoryMutation({ id, ...body }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology sub-category updated.' }));
      return res;
    } catch (error) {
      console.error('Patch radiology sub-category error:', error);
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to update radiology sub-category.',
      }));
      throw error;
    }
  };

  const remove = async (id) => {
    try {
      await deleteRadiologySubCategoryMutation(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology sub-category deleted successfully.' }));
    } catch (error) {
      console.error('Delete radiology sub-category error:', error);
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to delete radiology sub-category.',
      }));
      throw error;
    }
  };

  const removeMultiple = async (ids) => {
    try {
      await Promise.all(ids.map((id) => deleteRadiologySubCategoryMutation(id).unwrap()));
      dispatch(addToast({
        type: 'success',
        message: `${ids.length} radiology sub-categor${ids.length === 1 ? 'y' : 'ies'} deleted successfully.`,
      }));
    } catch (error) {
      console.error('Bulk delete radiology sub-category error:', error);
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to delete radiology sub-categories.',
      }));
      throw error;
    }
  };

  // ── Derived: options shaped for <Select> (cascading sub-category dropdown) ─
  const subCategoryOptions = (byCategoryQuery.data?.data ?? listQuery.data?.data ?? []).map((sc) => ({
    value: String(sc.id),
    label: sc.subCategoryName ?? String(sc.id),
  }));

  return {
    // Queries
    listQuery,
    byIdQuery,
    byCategoryQuery,

    // Derived option array — use this to populate the Sub-Category <Select>
    // after the user picks a Category
    subCategoryOptions,

    // CRUD
    create,
    update,
    patch,
    remove,
    removeMultiple,

    // Loading flags
    createLoading,
    updateLoading,
    patchLoading,
    deleteLoading,
  };
};
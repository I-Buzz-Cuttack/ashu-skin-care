// src/store/hooks/useRadiologyTest.js
import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/notificationSlice';
import {
  useGetRadiologyTestsQuery,
  useSearchRadiologyTestsQuery,
  useGetRadiologyTestByIdQuery,
  useGetRadiologyTestsByCategoryQuery,
  useCreateRadiologyTestMutation,
  useUpdateRadiologyTestMutation,
  usePatchRadiologyTestMutation,
  useDeleteRadiologyTestMutation,
  useGetRadiologyCategoriesForDropdownQuery,
  useGetRadiologyChargeNamesForDropdownQuery,
} from '../../store/api/radiologyApi/radiologyTestApi';

export const useRadiologyTest = (params = {}) => {
  const dispatch = useDispatch();

  // ── List (paginated / filtered) ──────────────────────────────────────────
  const listQuery = useGetRadiologyTestsQuery(params, {
    refetchOnMountOrArgChange: true,
    skip: !!params?.id,                       // skip list when fetching by id
  });

  // ── Single record ────────────────────────────────────────────────────────
  const byIdQuery = useGetRadiologyTestByIdQuery(params?.id, {
    skip: !params?.id,
  });

  // ── By category ──────────────────────────────────────────────────────────
  const byCategoryQuery = useGetRadiologyTestsByCategoryQuery(params?.categoryId, {
    skip: !params?.categoryId,
  });

  // ── Dropdown helpers (active tests only, large limit) ────────────────────
  const categoriesDropdownQuery = useGetRadiologyCategoriesForDropdownQuery();
  const chargeNamesDropdownQuery = useGetRadiologyChargeNamesForDropdownQuery();

  // ── Mutations ────────────────────────────────────────────────────────────
  const [createRadiologyTestMutation, { isLoading: createLoading }] =
    useCreateRadiologyTestMutation();

  const [updateRadiologyTestMutation, { isLoading: updateLoading }] =
    useUpdateRadiologyTestMutation();

  const [patchRadiologyTestMutation, { isLoading: patchLoading }] =
    usePatchRadiologyTestMutation();

  const [deleteRadiologyTestMutation, { isLoading: deleteLoading }] =
    useDeleteRadiologyTestMutation();

  // ── CRUD helpers ─────────────────────────────────────────────────────────
  const create = async (body) => {
    try {
      const res = await createRadiologyTestMutation(body).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology test created successfully.' }));
      return res;
    } catch (error) {
      console.error('Create radiology test error:', error);
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to create radiology test.',
      }));
      throw error;
    }
  };

  const update = async (payload) => {
    try {
      const res = await updateRadiologyTestMutation(payload).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology test updated successfully.' }));
      return res;
    } catch (error) {
      console.error('Update radiology test error:', error);
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to update radiology test.',
      }));
      throw error;
    }
  };

  /** Toggle isActive without a full PUT */
  const patch = async (id, body) => {
    try {
      const res = await patchRadiologyTestMutation({ id, ...body }).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology test updated.' }));
      return res;
    } catch (error) {
      console.error('Patch radiology test error:', error);
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to update radiology test.',
      }));
      throw error;
    }
  };

  const remove = async (id) => {
    try {
      await deleteRadiologyTestMutation(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'Radiology test deleted successfully.' }));
    } catch (error) {
      console.error('Delete radiology test error:', error);
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to delete radiology test.',
      }));
      throw error;
    }
  };

  const removeMultiple = async (ids) => {
    try {
      await Promise.all(ids.map((id) => deleteRadiologyTestMutation(id).unwrap()));
      dispatch(addToast({
        type: 'success',
        message: `${ids.length} radiology test(s) deleted successfully.`,
      }));
    } catch (error) {
      console.error('Bulk delete radiology test error:', error);
      dispatch(addToast({
        type: 'error',
        message: error?.data?.message || 'Failed to delete radiology tests.',
      }));
      throw error;
    }
  };

  // ── Derived: options shaped for <MultiSelect> ────────────────────────────
  // Maps API records → { value: id, label: name }
  const radiologyTestOptions = (listQuery.data?.data ?? []).map((t) => ({
    value: String(t.id),
    label: t.name ?? t.testName ?? t.title ?? String(t.id),
  }));

  const categoryOptions = (categoriesDropdownQuery.data?.data ?? []).map((c) => ({
    value: String(c.id),
    label: c.name ?? c.categoryName ?? String(c.id),
  }));

  const chargeNameOptions = (chargeNamesDropdownQuery.data?.data ?? []).map((cn) => ({
    value: String(cn.id),
    label: cn.name ?? cn.chargeName ?? String(cn.id),
  }));

  return {
    // Queries
    listQuery,
    byIdQuery,
    byCategoryQuery,
    categoriesDropdownQuery,
    chargeNamesDropdownQuery,

    // Derived option arrays (ready for dropdowns / MultiSelect)
    radiologyTestOptions,
    categoryOptions,
    chargeNameOptions,

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
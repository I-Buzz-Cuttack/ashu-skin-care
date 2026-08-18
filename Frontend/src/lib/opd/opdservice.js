import { useDispatch } from 'react-redux';
import { addToast } from '../../store/slices/notificationSlice';
import {
  useCreateOpdCategoryMutation,
  useCreateOpdChargeMutation,
  useDeleteOpdCategoryMutation,
  useDeleteOpdChargeMutation,
  useGetOpdCategoriesQuery,
  useGetOpdChargesQuery,
  useUpdateOpdCategoryMutation,
  useUpdateOpdChargeMutation,
} from '../../store/api/opdApi';

export const useOpdCategory = (params = {}) => {
  const dispatch = useDispatch();

  const listQuery = useGetOpdCategoriesQuery(params, {
    refetchOnMountOrArgChange: true,
  });

  const [createMutation, { isLoading: createLoading }] = useCreateOpdCategoryMutation();
  const [updateMutation, { isLoading: updateLoading }] = useUpdateOpdCategoryMutation();
  const [deleteMutation, { isLoading: deleteLoading }] = useDeleteOpdCategoryMutation();

  const create = async (body) => {
    try {
      const { id, createdAt, updatedAt, ...cleanBody } = body;
      const res = await createMutation(cleanBody).unwrap();
      dispatch(addToast({ type: 'success', message: 'OPD category created successfully.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to create OPD category' }));
      throw error;
    }
  };

  const update = async (payload) => {
    try {
      const { createdAt, updatedAt, ...cleanPayload } = payload;
      const res = await updateMutation(cleanPayload).unwrap();
      dispatch(addToast({ type: 'success', message: 'OPD category updated successfully.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update OPD category' }));
      throw error;
    }
  };

  const remove = async (id) => {
    try {
      const res = await deleteMutation(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'OPD category deleted successfully.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to delete OPD category' }));
      throw error;
    }
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

export const useOpdCharge = (params = {}) => {
  const dispatch = useDispatch();

  const listQuery = useGetOpdChargesQuery(params, {
    refetchOnMountOrArgChange: true,
  });

  const [createMutation, { isLoading: createLoading }] = useCreateOpdChargeMutation();
  const [updateMutation, { isLoading: updateLoading }] = useUpdateOpdChargeMutation();
  const [deleteMutation, { isLoading: deleteLoading }] = useDeleteOpdChargeMutation();

  const create = async (body) => {
    try {
      const { id, createdAt, updatedAt, chargeCategory, ...cleanBody } = body;
      const res = await createMutation(cleanBody).unwrap();
      dispatch(addToast({ type: 'success', message: 'OPD charge created successfully.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to create OPD charge' }));
      throw error;
    }
  };

  const update = async (payload) => {
    try {
      const { createdAt, updatedAt, chargeCategory, ...cleanPayload } = payload;
      const res = await updateMutation(cleanPayload).unwrap();
      dispatch(addToast({ type: 'success', message: 'OPD charge updated successfully.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to update OPD charge' }));
      throw error;
    }
  };

  const remove = async (id) => {
    try {
      const res = await deleteMutation(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'OPD charge deleted successfully.' }));
      return res;
    } catch (error) {
      dispatch(addToast({ type: 'error', message: error?.data?.message || 'Failed to delete OPD charge' }));
      throw error;
    }
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

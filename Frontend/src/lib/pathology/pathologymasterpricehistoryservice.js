import { useDispatch } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';

import {
  useGetPathologyMasterPriceHistoriesQuery,
  useGetPathologyMasterPriceHistoryByMasterIdQuery,
  useCreatePathologyMasterPriceHistoryMutation,
  useUpdatePathologyMasterPriceHistoryMutation,
  useDeletePathologyMasterPriceHistoryMutation,
  usePatchPathologyMasterPriceHistoryMutation,
} from '../../store/api/pathologyApi/pathologyMasterPriceHistory.js';

// ===============================
// 🧩 PATHOLOGY MASTER PRICE HISTORY SERVICE
// ===============================
export const usePathologyMasterPriceHistory = () => {
  const dispatch = useDispatch();

  const [createHistory, { isLoading: createLoading }] =
    useCreatePathologyMasterPriceHistoryMutation();

  const [updateHistory, { isLoading: updateLoading }] =
    useUpdatePathologyMasterPriceHistoryMutation();

  const [patchHistory, { isLoading: patchLoading }] =
    usePatchPathologyMasterPriceHistoryMutation();

  const [deleteHistory, { isLoading: deleteLoading }] =
    useDeletePathologyMasterPriceHistoryMutation();

  const create = async (body) => {
    const res = await createHistory(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Price history entry created.' }));
    return res;
  };

  const update = async (payload) => {
    const res = await updateHistory(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Price history entry updated.' }));
    return res;
  };

  const patch = async (payload) => {
    const res = await patchHistory(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Price history entry updated.' }));
    return res;
  };

  const remove = async (id) => {
    await deleteHistory(id).unwrap();
    dispatch(addToast({ type: 'success', message: 'Price history entry deleted.' }));
  };

  return {
    list: (params) => useGetPathologyMasterPriceHistoriesQuery(params),
    getByMasterId: (masterId) => useGetPathologyMasterPriceHistoryByMasterIdQuery(masterId),
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
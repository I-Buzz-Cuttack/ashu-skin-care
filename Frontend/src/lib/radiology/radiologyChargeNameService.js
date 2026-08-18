import { useDispatch } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';

import {
  useGetChargeNamesQuery,
  useCreateChargeNameMutation,
  useUpdateChargeNameMutation,
  useDeleteChargeNameMutation,
} from '../../store/api/radiologyApi/radiologychargename.js';

export const useRadiologyChargeName = () => {
  const dispatch = useDispatch();

  const [createCharge] = useCreateChargeNameMutation();
  const [updateCharge] = useUpdateChargeNameMutation();
  const [deleteCharge] = useDeleteChargeNameMutation();

  const create = async (body) => {
    const res = await createCharge(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Charge created.' }));
    return res;
  };

  const update = async (payload) => {
    const res = await updateCharge(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Charge updated.' }));
    return res;
  };

  const remove = async (id) => {
    await deleteCharge(id).unwrap();
    dispatch(addToast({ type: 'success', message: 'Charge deleted.' }));
  };

  return {
    list: (params) => useGetChargeNamesQuery(params),
    create,
    update,
    remove,
  };
};
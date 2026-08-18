import { useDispatch } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';

import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from '../../store/api/roleApi/role.js';

// ===============================
// 🧩 ROLE SERVICE
// ===============================
export const useRole = (params = {}) => {
  const dispatch = useDispatch();

  const listQuery = useGetRolesQuery(params);

  const [createRoleMutation, { isLoading: createLoading }] =
    useCreateRoleMutation();

  const [updateRoleMutation, { isLoading: updateLoading }] =
    useUpdateRoleMutation();

  const [deleteRoleMutation, { isLoading: deleteLoading }] =
    useDeleteRoleMutation();

  const create = async (body) => {
    const res = await createRoleMutation(body).unwrap();
    dispatch(addToast({ type: 'success', message: 'Role created.' }));
    return res;
  };

  const update = async (payload) => {
    const res = await updateRoleMutation(payload).unwrap();
    dispatch(addToast({ type: 'success', message: 'Role updated.' }));
    return res;
  };

  const remove = async (id) => {
    await deleteRoleMutation(id).unwrap();
    dispatch(addToast({ type: 'success', message: 'Role deleted.' }));
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
import { useDispatch } from 'react-redux';
import { addToast } from '@store/slices/notificationSlice';
import {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  usePatchUserMutation,
  useDeleteUserMutation,
} from '../../store/api/userApi/user.js';

/**
 * useUser — unified hook for user CRUD operations.
 *
 * @param {object} params  — passed straight to GET /api/user
 *                           e.g. { page: 1, limit: 10, search: 'John' }
 *                           Pass { id } to also fetch a single user.
 */
export const useUser = (params = {}) => {
  const dispatch = useDispatch();

  // ── List query ──────────────────────────────────────────────────────────
  const listQuery = useGetUsersQuery(params, {
    refetchOnMountOrArgChange: true,
  });

  // ── Single-user query (skipped when no id) ──────────────────────────────
  const byIdQuery = useGetUserByIdQuery(params?.id, {
    skip: !params?.id,
  });

  // ── Mutations ───────────────────────────────────────────────────────────
  const [createUserMutation, { isLoading: createLoading }] = useCreateUserMutation();
  const [updateUserMutation, { isLoading: updateLoading }] = useUpdateUserMutation();
  const [patchUserMutation,  { isLoading: patchLoading  }] = usePatchUserMutation();
  const [deleteUserMutation, { isLoading: deleteLoading }] = useDeleteUserMutation();

  // ── Create ──────────────────────────────────────────────────────────────
  const create = async (body) => {
    try {
      // Strip read-only / server-generated fields before sending
      const { id, createdAt, updatedAt, ...cleanBody } = body;
      const res = await createUserMutation(cleanBody).unwrap();
      dispatch(addToast({ type: 'success', message: 'User created successfully.' }));
      return res;
    } catch (error) {
      console.error('Create user error:', error);
      dispatch(addToast({
        type:    'error',
        message: error?.data?.message || 'Failed to create user.',
      }));
      throw error;
    }
  };

  // ── Full update (PUT) ───────────────────────────────────────────────────
  const update = async (payload) => {
    try {
      // Strip read-only fields; keep id so the mutation can build the URL
      const { createdAt, updatedAt, password, ...cleanPayload } = payload;
      const res = await updateUserMutation(cleanPayload).unwrap();
      dispatch(addToast({ type: 'success', message: 'User updated successfully.' }));
      return res;
    } catch (error) {
      console.error('Update user error:', error);
      dispatch(addToast({
        type:    'error',
        message: error?.data?.message || 'Failed to update user.',
      }));
      throw error;
    }
  };

  // ── Partial update (PATCH) ──────────────────────────────────────────────
  const patch = async (payload) => {
    try {
      const { createdAt, updatedAt, ...cleanPayload } = payload;
      const res = await patchUserMutation(cleanPayload).unwrap();
      dispatch(addToast({ type: 'success', message: 'User updated successfully.' }));
      return res;
    } catch (error) {
      console.error('Patch user error:', error);
      dispatch(addToast({
        type:    'error',
        message: error?.data?.message || 'Failed to update user.',
      }));
      throw error;
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const remove = async (id) => {
    try {
      await deleteUserMutation(id).unwrap();
      dispatch(addToast({ type: 'success', message: 'User deleted successfully.' }));
    } catch (error) {
      console.error('Delete user error:', error);
      dispatch(addToast({
        type:    'error',
        message: error?.data?.message || 'Failed to delete user.',
      }));
      throw error;
    }
  };

  // ── Bulk delete ─────────────────────────────────────────────────────────
  const removeMultiple = async (ids) => {
    try {
      await Promise.all(ids.map((id) => deleteUserMutation(id).unwrap()));
      dispatch(addToast({
        type:    'success',
        message: `${ids.length} user(s) deleted successfully.`,
      }));
    } catch (error) {
      console.error('Bulk delete user error:', error);
      dispatch(addToast({
        type:    'error',
        message: error?.data?.message || 'Failed to delete users.',
      }));
      throw error;
    }
  };

  return {
    // Queries
    listQuery,
    byIdQuery,
    // Actions
    create,
    update,
    patch,
    remove,
    removeMultiple,
    // Loading states
    createLoading,
    updateLoading,
    patchLoading,
    deleteLoading,
  };
};
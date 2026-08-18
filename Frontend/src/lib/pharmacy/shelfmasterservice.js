import { useDispatch } from "react-redux";
import { addToast } from "@store/slices/notificationSlice";

import {
  useGetShelvesQuery,
  useCreateShelfMutation,
  useUpdateShelfMutation,
  usePatchShelfMutation,
  useDeleteShelfMutation,
} from "../../store/api/pharmacyApi/shelfmaster";

export const useShelfMaster = () => {
  const dispatch = useDispatch();

  const [createShelf, { isLoading: createLoading }] = useCreateShelfMutation();
  const [updateShelf, { isLoading: updateLoading }] = useUpdateShelfMutation();
  const [patchShelf, { isLoading: patchLoading }] = usePatchShelfMutation();
  const [deleteShelf, { isLoading: deleteLoading }] = useDeleteShelfMutation();

  const create = async (body) => {
    const res = await createShelf(body).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Shelf created successfully.",
      }),
    );
    return res;
  };

  const update = async (payload) => {
    const res = await updateShelf(payload).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Shelf updated successfully.",
      }),
    );
    return res;
  };

  const patch = async (payload) => {
    const res = await patchShelf(payload).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Shelf status updated successfully.",
      }),
    );
    return res;
  };

  const remove = async (id) => {
    const res = await deleteShelf(id).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Shelf deleted successfully.",
      }),
    );
    return res;
  };

  return {
    list: (params) => useGetShelvesQuery(params),
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
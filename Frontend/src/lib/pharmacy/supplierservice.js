import { useDispatch } from "react-redux";
import { addToast } from "@store/slices/notificationSlice";

import {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  usePatchSupplierMutation,
  useDeleteSupplierMutation,
} from "../../store/api/pharmacyApi/supplier";

export const useSupplier = () => {
  const dispatch = useDispatch();

  const [createSupplier, { isLoading: createLoading }] =
    useCreateSupplierMutation();

  const [updateSupplier, { isLoading: updateLoading }] =
    useUpdateSupplierMutation();

  const [patchSupplier, { isLoading: patchLoading }] =
    usePatchSupplierMutation();

  const [deleteSupplier, { isLoading: deleteLoading }] =
    useDeleteSupplierMutation();

  const create = async (body) => {
    const res = await createSupplier(body).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Supplier created successfully.",
      }),
    );
    return res;
  };

  const update = async (payload) => {
    const res = await updateSupplier(payload).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Supplier updated successfully.",
      }),
    );
    return res;
  };

  const patch = async (payload) => {
    const res = await patchSupplier(payload).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Supplier status updated successfully.",
      }),
    );
    return res;
  };

  const remove = async (id) => {
    const res = await deleteSupplier(id).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Supplier deleted successfully.",
      }),
    );
    return res;
  };

  return {
    list: (params) => useGetSuppliersQuery(params),
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
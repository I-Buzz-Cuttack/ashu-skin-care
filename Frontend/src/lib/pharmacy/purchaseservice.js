import { useDispatch } from "react-redux";
import { addToast } from "@store/slices/notificationSlice";

import {
  useGetPurchaseMedicinesQuery,
  useCreatePurchaseMedicineMutation,
  useUpdatePurchaseMedicineMutation,
  usePatchPurchaseMedicineMutation,
  useDeletePurchaseMedicineMutation,
} from "../../store/api/pharmacyApi/purchase";

export const usePurchase = () => {
  const dispatch = useDispatch();

  const [createPurchase, { isLoading: createLoading }] =
    useCreatePurchaseMedicineMutation();

  const [updatePurchase, { isLoading: updateLoading }] =
    useUpdatePurchaseMedicineMutation();

  const [patchPurchase, { isLoading: patchLoading }] =
    usePatchPurchaseMedicineMutation();

  const [deletePurchase, { isLoading: deleteLoading }] =
    useDeletePurchaseMedicineMutation();

  const create = async (body) => {
    const res = await createPurchase(body).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Purchase medicine created successfully.",
      }),
    );
    return res;
  };

  const update = async (payload) => {
    const res = await updatePurchase(payload).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Purchase medicine updated successfully.",
      }),
    );
    return res;
  };

  const patch = async (payload) => {
    const res = await patchPurchase(payload).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Purchase medicine patched successfully.",
      }),
    );
    return res;
  };

  const remove = async (id) => {
    const res = await deletePurchase(id).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Purchase medicine deleted successfully.",
      }),
    );
    return res;
  };

  return {
    list: (params) => useGetPurchaseMedicinesQuery(params),
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
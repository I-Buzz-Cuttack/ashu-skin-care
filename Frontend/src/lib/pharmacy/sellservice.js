import { useDispatch } from "react-redux";
import { addToast } from "@store/slices/notificationSlice";

import {
  useGetSellMedicinesQuery,
  useCreateSellMedicineMutation,
  useUpdateSellMedicineMutation,
  usePatchSellMedicineMutation,
  useDeleteSellMedicineMutation,
  useCreateSalesMasterMutation,
} from "../../store/api/pharmacyApi/sell";

export const useSell = () => {
  const dispatch = useDispatch();

  const [createSellMedicine, { isLoading: createLoading }] =
    useCreateSellMedicineMutation();

  const [createSalesMaster, { isLoading: salesMasterLoading }] =
    useCreateSalesMasterMutation();

  const [updateSellMedicine, { isLoading: updateLoading }] =
    useUpdateSellMedicineMutation();

  const [patchSellMedicine, { isLoading: patchLoading }] =
    usePatchSellMedicineMutation();

  const [deleteSellMedicine, { isLoading: deleteLoading }] =
    useDeleteSellMedicineMutation();

  const create = async (body) => {
    const res = await createSellMedicine(body).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Sell medicine created successfully.",
      }),
    );
    return res;
  };

  const createSalesMasterBill = async (body) => {
    const res = await createSalesMaster(body).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Sales bill created successfully.",
      }),
    );
    return res;
  };

  const update = async (payload) => {
    const res = await updateSellMedicine(payload).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Sell medicine updated successfully.",
      }),
    );
    return res;
  };

  const patch = async (payload) => {
    const res = await patchSellMedicine(payload).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Sell medicine patched successfully.",
      }),
    );
    return res;
  };

  const remove = async (id) => {
    const res = await deleteSellMedicine(id).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Sell medicine deleted successfully.",
      }),
    );
    return res;
  };

  return {
    list: (params) => useGetSellMedicinesQuery(params),
    create,
    update,
    patch,
    remove,
    createSalesMasterBill,
    createLoading,
    updateLoading,
    patchLoading,
    deleteLoading,
    salesMasterLoading,
  };
};
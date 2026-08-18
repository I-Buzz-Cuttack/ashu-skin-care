import { useDispatch } from "react-redux";
import { addToast } from "@store/slices/notificationSlice";

import {
  useCreatePurchaseReturnMutation,
  useGetPurchaseReturnsQuery,
  useGetPurchaseReturnByIdQuery,
  useUpdatePurchaseReturnMutation,
  useDeletePurchaseReturnMutation,
  useCreateSalesReturnMutation,
  useGetSalesReturnsQuery,
  useGetSalesReturnByIdQuery,
  useUpdateSalesReturnMutation,
  useDeleteSalesReturnMutation,
} from "../../store/api/pharmacyApi/returns";

export const usePurchaseReturn = () => {
  const dispatch = useDispatch();

  const [createPurchaseReturn, { isLoading: createLoading }] = useCreatePurchaseReturnMutation();
  const [updatePurchaseReturn, { isLoading: updateLoading }] = useUpdatePurchaseReturnMutation();
  const [deletePurchaseReturn, { isLoading: deleteLoading }] = useDeletePurchaseReturnMutation();

  const create = async (body) => {
    const res = await createPurchaseReturn(body).unwrap();
    dispatch(addToast({ type: "success", message: "Purchase return created successfully." }));
    return res;
  };

  const update = async (payload) => {
    const res = await updatePurchaseReturn(payload).unwrap();
    dispatch(addToast({ type: "success", message: "Purchase return updated." }));
    return res;
  };

  const remove = async (id) => {
    const res = await deletePurchaseReturn(id).unwrap();
    dispatch(addToast({ type: "success", message: "Purchase return deleted." }));
    return res;
  };

  return {
    list: (params) => useGetPurchaseReturnsQuery(params),
    getById: (id) => useGetPurchaseReturnByIdQuery(id),
    create,
    update,
    remove,
    createLoading,
    updateLoading,
    deleteLoading,
  };
};

export const useSalesReturn = () => {
  const dispatch = useDispatch();

  const [createSalesReturn, { isLoading: createLoading }] = useCreateSalesReturnMutation();
  const [updateSalesReturn, { isLoading: updateLoading }] = useUpdateSalesReturnMutation();
  const [deleteSalesReturn, { isLoading: deleteLoading }] = useDeleteSalesReturnMutation();

  const create = async (body) => {
    const res = await createSalesReturn(body).unwrap();
    dispatch(addToast({ type: "success", message: "Sales return created successfully." }));
    return res;
  };

  const update = async (payload) => {
    const res = await updateSalesReturn(payload).unwrap();
    dispatch(addToast({ type: "success", message: "Sales return updated." }));
    return res;
  };

  const remove = async (id) => {
    const res = await deleteSalesReturn(id).unwrap();
    dispatch(addToast({ type: "success", message: "Sales return deleted." }));
    return res;
  };

  return {
    list: (params) => useGetSalesReturnsQuery(params),
    getById: (id) => useGetSalesReturnByIdQuery(id),
    create,
    update,
    remove,
    createLoading,
    updateLoading,
    deleteLoading,
  };
};

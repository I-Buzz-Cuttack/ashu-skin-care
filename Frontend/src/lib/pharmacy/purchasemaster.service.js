import { useDispatch } from "react-redux";
import { addToast } from "@store/slices/notificationSlice";

import {
  useCreatePurchaseMasterMutation,
  useGetPurchasesQuery,
  useGetPurchaseByIdQuery,
  useDeletePurchaseMasterMutation,
} from "../../store/api/pharmacyApi/purchaseMaster";

export const usePurchaseMaster = () => {
  const dispatch = useDispatch();

  const [createPurchaseMaster, { isLoading: createLoading }] = useCreatePurchaseMasterMutation();
  const [deletePurchaseMaster, { isLoading: deleteLoading }] = useDeletePurchaseMasterMutation();

  const create = async (body) => {
    const res = await createPurchaseMaster(body).unwrap();
    dispatch(addToast({ type: "success", message: "Purchase created successfully." }));
    return res;
  };

  const remove = async (id) => {
    const res = await deletePurchaseMaster(id).unwrap();
    dispatch(addToast({ type: "success", message: "Purchase deleted successfully." }));
    return res;
  };

  return {
    list: (params) => useGetPurchasesQuery(params),
    getById: (id) => useGetPurchaseByIdQuery(id),
    create,
    remove,
    createLoading,
    deleteLoading,
  };
};

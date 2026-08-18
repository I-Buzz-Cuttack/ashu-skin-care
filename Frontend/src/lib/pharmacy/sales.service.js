import { useDispatch } from "react-redux";
import { addToast } from "@store/slices/notificationSlice";

import {
  useCreateSaleMutation,
  useGetSalesQuery,
  useGetSaleByIdQuery,
  useDeleteSaleMutation,
} from "../../store/api/pharmacyApi/sales";

export const useSales = () => {
  const dispatch = useDispatch();

  const [createSale, { isLoading: createLoading }] = useCreateSaleMutation();
  const [deleteSale, { isLoading: deleteLoading }] = useDeleteSaleMutation();

  const create = async (body) => {
    const res = await createSale(body).unwrap();
    dispatch(addToast({ type: "success", message: "Sale created successfully." }));
    return res;
  };

  const remove = async (id) => {
    const res = await deleteSale(id).unwrap();
    dispatch(addToast({ type: "success", message: "Sale deleted successfully." }));
    return res;
  };

  return {
    list: (params) => useGetSalesQuery(params),
    getById: (id) => useGetSaleByIdQuery(id),
    create,
    remove,
    createLoading,
    deleteLoading,
  };
};

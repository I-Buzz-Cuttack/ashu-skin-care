import { useDispatch } from "react-redux";
import { addToast } from "@store/slices/notificationSlice";

import {
  useGetMedicineSubcategoriesQuery,
  useCreateMedicineSubcategoryMutation,
  useUpdateMedicineSubcategoryMutation,
  usePatchMedicineSubcategoryMutation,
  useDeleteMedicineSubcategoryMutation,
} from "../../store/api/pharmacyApi/subcategory";

export const useSubCategory = () => {
  const dispatch = useDispatch();

  const [createSubcategory, { isLoading: createLoading }] =
    useCreateMedicineSubcategoryMutation();

  const [updateSubcategory, { isLoading: updateLoading }] =
    useUpdateMedicineSubcategoryMutation();

  const [patchSubcategory, { isLoading: patchLoading }] =
    usePatchMedicineSubcategoryMutation();

  const [deleteSubcategory, { isLoading: deleteLoading }] =
    useDeleteMedicineSubcategoryMutation();

  const create = async (body) => {
    const res = await createSubcategory(body).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Medicine subcategory created successfully.",
      }),
    );
    return res;
  };

  const update = async (payload) => {
    const res = await updateSubcategory(payload).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Medicine subcategory updated successfully.",
      }),
    );
    return res;
  };

  const patch = async (payload) => {
    const res = await patchSubcategory(payload).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Medicine subcategory status updated successfully.",
      }),
    );
    return res;
  };

  const remove = async (id) => {
    const res = await deleteSubcategory(id).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Medicine subcategory deleted successfully.",
      }),
    );
    return res;
  };

  return {
    list: (params) => useGetMedicineSubcategoriesQuery(params),
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
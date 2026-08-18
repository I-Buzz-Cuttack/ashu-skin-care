import { useDispatch } from "react-redux";
import { addToast } from "@store/slices/notificationSlice";

import {
  useGetMedicineCategoriesQuery,
  useCreateMedicineCategoryMutation,
  useUpdateMedicineCategoryMutation,
  usePatchMedicineCategoryMutation,
  useDeleteMedicineCategoryMutation,
} from "../../store/api/pharmacyApi/medicinecategory";

export const useMedicineCategory = () => {
  const dispatch = useDispatch();

  const [createCategory, { isLoading: createLoading }] =
    useCreateMedicineCategoryMutation();

  const [updateCategory, { isLoading: updateLoading }] =
    useUpdateMedicineCategoryMutation();

  const [patchCategory, { isLoading: patchLoading }] =
    usePatchMedicineCategoryMutation();

  const [deleteCategory, { isLoading: deleteLoading }] =
    useDeleteMedicineCategoryMutation();

  const create = async (body) => {
    const res = await createCategory(body).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Medicine category created successfully.",
      }),
    );
    return res;
  };

  const update = async (payload) => {
    const res = await updateCategory(payload).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Medicine category updated successfully.",
      }),
    );
    return res;
  };

  const patch = async (payload) => {
    const res = await patchCategory(payload).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Medicine category status updated successfully.",
      }),
    );
    return res;
  };

  const remove = async (id) => {
    const res = await deleteCategory(id).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Medicine category deleted successfully.",
      }),
    );
    return res;
  };

  return {
    list: (params) => useGetMedicineCategoriesQuery(params),
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
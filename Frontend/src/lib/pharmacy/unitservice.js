import { useDispatch } from "react-redux";
import { addToast } from "@store/slices/notificationSlice";

import {
  useGetMedicineUnitsQuery,
  useCreateMedicineUnitMutation,
  useUpdateMedicineUnitMutation,
  usePatchMedicineUnitMutation,
  useDeleteMedicineUnitMutation,
} from "../../store/api/pharmacyApi/unit";

export const useUnit = () => {
  const dispatch = useDispatch();

  const [createUnit, { isLoading: createLoading }] =
    useCreateMedicineUnitMutation();

  const [updateUnit, { isLoading: updateLoading }] =
    useUpdateMedicineUnitMutation();

  const [patchUnit, { isLoading: patchLoading }] =
    usePatchMedicineUnitMutation();

  const [deleteUnit, { isLoading: deleteLoading }] =
    useDeleteMedicineUnitMutation();

  const create = async (body) => {
    const res = await createUnit(body).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Medicine unit created successfully.",
      }),
    );
    return res;
  };

  const update = async (payload) => {
    const res = await updateUnit(payload).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Medicine unit updated successfully.",
      }),
    );
    return res;
  };

  const patch = async (payload) => {
    const res = await patchUnit(payload).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Medicine unit status updated successfully.",
      }),
    );
    return res;
  };

  const remove = async (id) => {
    const res = await deleteUnit(id).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Medicine unit deleted successfully.",
      }),
    );
    return res;
  };

  return {
    list: (params) => useGetMedicineUnitsQuery(params),
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
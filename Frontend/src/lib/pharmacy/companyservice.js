import { useDispatch } from "react-redux";
import { addToast } from "@store/slices/notificationSlice";

import {
  useGetMedicineCompaniesQuery,
  useCreateMedicineCompanyMutation,
  useUpdateMedicineCompanyMutation,
  usePatchMedicineCompanyMutation,
  useDeleteMedicineCompanyMutation,
} from "../../store/api/pharmacyApi/company";

export const useCompany = () => {
  const dispatch = useDispatch();

  const [createCompany, { isLoading: createLoading }] =
    useCreateMedicineCompanyMutation();

  const [updateCompany, { isLoading: updateLoading }] =
    useUpdateMedicineCompanyMutation();

  const [patchCompany, { isLoading: patchLoading }] =
    usePatchMedicineCompanyMutation();

  const [deleteCompany, { isLoading: deleteLoading }] =
    useDeleteMedicineCompanyMutation();

  const create = async (body) => {
    const res = await createCompany(body).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Medicine company created successfully.",
      }),
    );
    return res;
  };

  const update = async (payload) => {
    const res = await updateCompany(payload).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Medicine company updated successfully.",
      }),
    );
    return res;
  };

  const patch = async (payload) => {
    const res = await patchCompany(payload).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Medicine company status updated successfully.",
      }),
    );
    return res;
  };

  const remove = async (id) => {
    const res = await deleteCompany(id).unwrap();
    dispatch(
      addToast({
        type: "success",
        message: "Medicine company deleted successfully.",
      }),
    );
    return res;
  };

  return {
    list: (params) => useGetMedicineCompaniesQuery(params),
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
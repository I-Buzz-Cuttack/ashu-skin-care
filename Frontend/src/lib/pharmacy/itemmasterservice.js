import { useDispatch } from "react-redux";
import { addToast } from "@store/slices/notificationSlice";

import {
  useGetMedicinesQuery,
  useGetMedicinesByCategoryQuery,
  useGetMedicinesBySubCategoryQuery,
  useGetMedicinesByCompanyQuery,
  useGetMedicinesByUnitQuery,
  useGetMedicinesByShelfQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  usePatchMedicineMutation,
  useDeleteMedicineMutation,
} from "../../store/api/pharmacyApi/itemmaster";

const getErrorMessage = (error, fallback = "Something went wrong.") => {
  return (
    error?.data?.message ||
    error?.data?.error ||
    error?.error ||
    error?.message ||
    fallback
  );
};

export const useItemMaster = (params = {}) => {
  const dispatch = useDispatch();

  const listQuery = useGetMedicinesQuery(params);

  const categoryQuery = useGetMedicinesByCategoryQuery(
    { categoryId: params.categoryId, ...params },
    { skip: !params.categoryId }
  );

  const subCategoryQuery = useGetMedicinesBySubCategoryQuery(
    { subcategoryId: params.subcategoryId, ...params },
    { skip: !params.subcategoryId }
  );

  const companyQuery = useGetMedicinesByCompanyQuery(
    { companyId: params.companyId, ...params },
    { skip: !params.companyId }
  );

  const unitQuery = useGetMedicinesByUnitQuery(
    { unitId: params.unitId, ...params },
    { skip: !params.unitId }
  );

  const shelfQuery = useGetMedicinesByShelfQuery(
    { shelfId: params.shelfId, ...params },
    { skip: !params.shelfId }
  );

  const [createMedicine, { isLoading: createLoading }] =
    useCreateMedicineMutation();

  const [updateMedicine, { isLoading: updateLoading }] =
    useUpdateMedicineMutation();

  const [patchMedicine, { isLoading: patchLoading }] =
    usePatchMedicineMutation();

  const [deleteMedicine, { isLoading: deleteLoading }] =
    useDeleteMedicineMutation();

  const create = async (body) => {
    try {
      const res = await createMedicine(body).unwrap();
      dispatch(
        addToast({
          type: "success",
          message: "Medicine created successfully.",
        }),
      );
      return res;
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          message: getErrorMessage(error, "Failed to create medicine."),
        }),
      );
      throw error;
    }
  };

  const update = async ({ id, ...body }) => {
    try {
      const res = await updateMedicine({ id, ...body }).unwrap();
      dispatch(
        addToast({
          type: "success",
          message: "Medicine updated successfully.",
        }),
      );
      return res;
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          message: getErrorMessage(error, "Failed to update medicine."),
        }),
      );
      throw error;
    }
  };

  const patch = async ({ id, ...body }) => {
    try {
      const res = await patchMedicine({ id, ...body }).unwrap();
      dispatch(
        addToast({
          type: "success",
          message: "Medicine status updated successfully.",
        }),
      );
      return res;
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          message: getErrorMessage(error, "Failed to update medicine status."),
        }),
      );
      throw error;
    }
  };

  const remove = async (id) => {
    try {
      const res = await deleteMedicine(id).unwrap();
      dispatch(
        addToast({
          type: "success",
          message: "Medicine deleted successfully.",
        }),
      );
      return res;
    } catch (error) {
      dispatch(
        addToast({
          type: "error",
          message: getErrorMessage(error, "Failed to delete medicine."),
        }),
      );
      throw error;
    }
  };

  return {
    listQuery,
    categoryQuery,
    subCategoryQuery,
    companyQuery,
    unitQuery,
    shelfQuery,
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
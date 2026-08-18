import { useDispatch } from "react-redux";
import { addToast } from "@store/slices/notificationSlice";

import {
  useCreateLedgerEntryMutation,
  useCreateBulkLedgerEntriesMutation,
  useGetStockLedgerEntriesQuery,
  useGetLedgerEntryByIdQuery,
  useGetLedgerByMedicineQuery,
  useDeleteLedgerEntryMutation,
} from "../../store/api/pharmacyApi/stockLedger";

export const useStockLedger = () => {
  const dispatch = useDispatch();

  const [createEntry, { isLoading: createLoading }] = useCreateLedgerEntryMutation();
  const [createBulkEntries, { isLoading: bulkCreateLoading }] = useCreateBulkLedgerEntriesMutation();
  const [deleteEntry, { isLoading: deleteLoading }] = useDeleteLedgerEntryMutation();

  const create = async (body) => {
    const res = await createEntry(body).unwrap();
    dispatch(addToast({ type: "success", message: "Ledger entry created." }));
    return res;
  };

  const createBulk = async (body) => {
    const res = await createBulkEntries(body).unwrap();
    dispatch(addToast({ type: "success", message: "Ledger entries created." }));
    return res;
  };

  const remove = async (id) => {
    const res = await deleteEntry(id).unwrap();
    dispatch(addToast({ type: "success", message: "Ledger entry deleted." }));
    return res;
  };

  return {
    list: (params) => useGetStockLedgerEntriesQuery(params),
    getById: (id) => useGetLedgerEntryByIdQuery(id),
    getByMedicine: (medicineId) => useGetLedgerByMedicineQuery(medicineId),
    create,
    createBulk,
    remove,
    createLoading,
    bulkCreateLoading,
    deleteLoading,
  };
};

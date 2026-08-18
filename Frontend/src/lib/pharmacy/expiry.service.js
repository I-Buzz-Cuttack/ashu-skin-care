import { useDispatch } from "react-redux";
import { addToast } from "@store/slices/notificationSlice";

import {
  useGetExpiryDashboardQuery,
  useGetExpiredBatchesQuery,
  useGetExpiringSoonBatchesQuery,
  useExportExpiredExcelQuery,
  useExportExpiredPdfQuery,
  useExportExpiringExcelQuery,
  useExportExpiringPdfQuery,
} from "../../store/api/pharmacyApi/expiry";

export const useExpiry = () => {
  const dispatch = useDispatch();

  const exportBlob = (blob, filename) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    dispatch(addToast({ type: "success", message: "Export downloaded." }));
  };

  return {
    getDashboard: () => useGetExpiryDashboardQuery(),
    getExpired: (params) => useGetExpiredBatchesQuery(params),
    getExpiring: (params) => useGetExpiringSoonBatchesQuery(params),
    exportExpiredExcel: (params) => useExportExpiredExcelQuery(params, { skip: false }),
    exportExpiredPdf: (params) => useExportExpiredPdfQuery(params, { skip: false }),
    exportExpiringExcel: (params) => useExportExpiringExcelQuery(params, { skip: false }),
    exportExpiringPdf: (params) => useExportExpiringPdfQuery(params, { skip: false }),
    downloadBlob: (blob, filename) => exportBlob(blob, filename),
  };
};

import { baseApi } from "../baseApi";
import { API } from "@constants/api";

export const stockLedgerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createLedgerEntry: builder.mutation({
      query: (body) => ({ url: API.PHARMACY.STOCK_LEDGER, method: "POST", body }),
      invalidatesTags: [{ type: "StockLedger", id: "LIST" }],
    }),
    createBulkLedgerEntries: builder.mutation({
      query: (body) => ({ url: `${API.PHARMACY.STOCK_LEDGER}/bulk`, method: "POST", body }),
      invalidatesTags: [{ type: "StockLedger", id: "LIST" }],
    }),
    getStockLedgerEntries: builder.query({
      query: (params = {}) => ({ url: API.PHARMACY.STOCK_LEDGER, params }),
      providesTags: [{ type: "StockLedger", id: "LIST" }],
    }),
    getLedgerEntryById: builder.query({
      query: (id) => ({ url: `${API.PHARMACY.STOCK_LEDGER}/${id}` }),
      providesTags: (result, error, id) => [{ type: "StockLedger", id }],
    }),
    getLedgerByMedicine: builder.query({
      query: (medicineId) => ({ url: `${API.PHARMACY.STOCK_LEDGER}/medicine/${medicineId}` }),
      providesTags: [{ type: "StockLedger", id: "LIST" }],
    }),
    deleteLedgerEntry: builder.mutation({
      query: (id) => ({ url: `${API.PHARMACY.STOCK_LEDGER}/${id}`, method: "DELETE" }),
      invalidatesTags: [{ type: "StockLedger", id: "LIST" }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateLedgerEntryMutation,
  useCreateBulkLedgerEntriesMutation,
  useGetStockLedgerEntriesQuery,
  useGetLedgerEntryByIdQuery,
  useGetLedgerByMedicineQuery,
  useDeleteLedgerEntryMutation,
} = stockLedgerApi;

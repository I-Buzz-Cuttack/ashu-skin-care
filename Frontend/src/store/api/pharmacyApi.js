import { baseApi } from './baseApi';
import { API } from '@constants/api';

export const pharmacyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMedicines: builder.query({
      query: (params = {}) => ({ url: API.PHARMACY.MEDICINES, params }),
      providesTags: (result) =>
        result
          ? [...(result.data?.map(({ id }) => ({ type: 'Medicine', id })) || []), { type: 'Medicine', id: 'LIST' }]
          : [{ type: 'Medicine', id: 'LIST' }],
    }),
    getMedicineById: builder.query({
      query: (id) => ({ url: `${API.PHARMACY.MEDICINES}/${id}` }),
      providesTags: (result, error, id) => [{ type: 'Medicine', id }],
    }),
    createMedicine: builder.mutation({
      query: (body) => ({ url: API.PHARMACY.MEDICINES, method: 'POST', body }),
      invalidatesTags: [{ type: 'Medicine', id: 'LIST' }],
    }),
    updateMedicine: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${API.PHARMACY.MEDICINES}/${id}`, method: 'PUT', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Medicine', id }, { type: 'Medicine', id: 'LIST' }],
    }),
    patchMedicine: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${API.PHARMACY.MEDICINES}/${id}`, method: 'PATCH', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Medicine', id }, { type: 'Medicine', id: 'LIST' }],
    }),
    deleteMedicine: builder.mutation({
      query: (id) => ({ url: `${API.PHARMACY.MEDICINES}/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Medicine', id: 'LIST' }],
    }),
    getMedicineByBarcode: builder.query({
      query: (code) => ({ url: `${API.PHARMACY.MEDICINES}/barcode/${code}` }),
    }),
    getMedicineByCode: builder.query({
      query: (code) => ({ url: `${API.PHARMACY.MEDICINES}/code/${code}` }),
    }),

    getMedicineBatches: builder.query({
      query: (params = {}) => ({ url: API.PHARMACY.MEDICINE_BATCH, params }),
      providesTags: [{ type: 'MedicineBatch', id: 'LIST' }],
    }),
    getMedicineBatchById: builder.query({
      query: (id) => ({ url: `${API.PHARMACY.MEDICINE_BATCH}/${id}` }),
      providesTags: (result, error, id) => [{ type: 'MedicineBatch', id }],
    }),
    createMedicineBatch: builder.mutation({
      query: (body) => ({ url: API.PHARMACY.MEDICINE_BATCH, method: 'POST', body }),
      invalidatesTags: [{ type: 'MedicineBatch', id: 'LIST' }],
    }),
    updateMedicineBatch: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${API.PHARMACY.MEDICINE_BATCH}/${id}`, method: 'PUT', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'MedicineBatch', id }, { type: 'MedicineBatch', id: 'LIST' }],
    }),
    patchMedicineBatch: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${API.PHARMACY.MEDICINE_BATCH}/${id}`, method: 'PATCH', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'MedicineBatch', id }, { type: 'MedicineBatch', id: 'LIST' }],
    }),
    deleteMedicineBatch: builder.mutation({
      query: (id) => ({ url: `${API.PHARMACY.MEDICINE_BATCH}/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'MedicineBatch', id: 'LIST' }],
    }),
    getExpiringBatches: builder.query({
      query: (params = {}) => ({ url: `${API.PHARMACY.MEDICINE_BATCH}/expiring`, params }),
      providesTags: [{ type: 'MedicineBatch', id: 'LIST' }],
    }),
    getExpiredBatches: builder.query({
      query: (params = {}) => ({ url: `${API.PHARMACY.MEDICINE_BATCH}/expired`, params }),
      providesTags: [{ type: 'MedicineBatch', id: 'LIST' }],
    }),
    getBatchesByMedicine: builder.query({
      query: (medicineId) => ({ url: `${API.PHARMACY.MEDICINE_BATCH}/medicine/${medicineId}` }),
      providesTags: [{ type: 'MedicineBatch', id: 'LIST' }],
    }),
    getMedicineStock: builder.query({
      query: (medicineId) => ({ url: `${API.PHARMACY.MEDICINE_BATCH}/medicine/${medicineId}/stock` }),
    }),

    getSuppliers: builder.query({
      query: (params = {}) => ({ url: API.PHARMACY.SUPPLIERS, params }),
      providesTags: [{ type: 'Supplier', id: 'LIST' }],
    }),
    getSupplierById: builder.query({
      query: (id) => ({ url: `${API.PHARMACY.SUPPLIERS}/${id}` }),
      providesTags: (result, error, id) => [{ type: 'Supplier', id }],
    }),
    createSupplier: builder.mutation({
      query: (body) => ({ url: API.PHARMACY.SUPPLIERS, method: 'POST', body }),
      invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
    }),
    updateSupplier: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${API.PHARMACY.SUPPLIERS}/${id}`, method: 'PUT', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Supplier', id }, { type: 'Supplier', id: 'LIST' }],
    }),
    patchSupplier: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${API.PHARMACY.SUPPLIERS}/${id}`, method: 'PATCH', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Supplier', id }, { type: 'Supplier', id: 'LIST' }],
    }),
    deleteSupplier: builder.mutation({
      query: (id) => ({ url: `${API.PHARMACY.SUPPLIERS}/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Supplier', id: 'LIST' }],
    }),

    getMedicineCategories: builder.query({
      query: (params = {}) => ({ url: API.PHARMACY.MEDICINE_CATEGORY, params }),
      providesTags: [{ type: 'MedicineCategory', id: 'LIST' }],
    }),
    createMedicineCategory: builder.mutation({
      query: (body) => ({ url: API.PHARMACY.MEDICINE_CATEGORY, method: 'POST', body }),
      invalidatesTags: [{ type: 'MedicineCategory', id: 'LIST' }],
    }),
    updateMedicineCategory: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${API.PHARMACY.MEDICINE_CATEGORY}/${id}`, method: 'PUT', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'MedicineCategory', id }, { type: 'MedicineCategory', id: 'LIST' }],
    }),
    deleteMedicineCategory: builder.mutation({
      query: (id) => ({ url: `${API.PHARMACY.MEDICINE_CATEGORY}/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'MedicineCategory', id: 'LIST' }],
    }),

    getMedicineUnits: builder.query({
      query: (params = {}) => ({ url: API.PHARMACY.MEDICINE_UNIT, params }),
      providesTags: [{ type: 'MedicineUnit', id: 'LIST' }],
    }),
    createMedicineUnit: builder.mutation({
      query: (body) => ({ url: API.PHARMACY.MEDICINE_UNIT, method: 'POST', body }),
      invalidatesTags: [{ type: 'MedicineUnit', id: 'LIST' }],
    }),
    updateMedicineUnit: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${API.PHARMACY.MEDICINE_UNIT}/${id}`, method: 'PUT', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'MedicineUnit', id }, { type: 'MedicineUnit', id: 'LIST' }],
    }),
    deleteMedicineUnit: builder.mutation({
      query: (id) => ({ url: `${API.PHARMACY.MEDICINE_UNIT}/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'MedicineUnit', id: 'LIST' }],
    }),

    getMedicineCompanies: builder.query({
      query: (params = {}) => ({ url: API.PHARMACY.MEDICINE_COMPANY, params }),
      providesTags: [{ type: 'MedicineCompany', id: 'LIST' }],
    }),
    createMedicineCompany: builder.mutation({
      query: (body) => ({ url: API.PHARMACY.MEDICINE_COMPANY, method: 'POST', body }),
      invalidatesTags: [{ type: 'MedicineCompany', id: 'LIST' }],
    }),

    getShelfMasters: builder.query({
      query: (params = {}) => ({ url: API.PHARMACY.SHELF_MASTER, params }),
      providesTags: [{ type: 'Shelf', id: 'LIST' }],
    }),
    createShelfMaster: builder.mutation({
      query: (body) => ({ url: API.PHARMACY.SHELF_MASTER, method: 'POST', body }),
      invalidatesTags: [{ type: 'Shelf', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMedicinesQuery,
  useGetMedicineByIdQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  usePatchMedicineMutation,
  useDeleteMedicineMutation,
  useGetMedicineByBarcodeQuery,
  useGetMedicineByCodeQuery,
  useGetMedicineBatchesQuery,
  useGetMedicineBatchByIdQuery,
  useCreateMedicineBatchMutation,
  useUpdateMedicineBatchMutation,
  usePatchMedicineBatchMutation,
  useDeleteMedicineBatchMutation,
  useGetExpiringBatchesQuery,
  useGetExpiredBatchesQuery,
  useGetBatchesByMedicineQuery,
  useGetMedicineStockQuery,
  useGetSuppliersQuery,
  useGetSupplierByIdQuery,
  useCreateSupplierMutation,
  useUpdateSupplierMutation,
  usePatchSupplierMutation,
  useDeleteSupplierMutation,
  useGetMedicineCategoriesQuery,
  useCreateMedicineCategoryMutation,
  useUpdateMedicineCategoryMutation,
  useDeleteMedicineCategoryMutation,
  useGetMedicineUnitsQuery,
  useCreateMedicineUnitMutation,
  useUpdateMedicineUnitMutation,
  useDeleteMedicineUnitMutation,
  useGetMedicineCompaniesQuery,
  useCreateMedicineCompanyMutation,
  useGetShelfMastersQuery,
  useCreateShelfMasterMutation,
} = pharmacyApi;

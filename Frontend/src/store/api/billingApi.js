// billingApi.js
import { baseApi } from './baseApi';
import { API } from '@constants/api';

export const billingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBills: builder.query({
      query: (params = {}) => ({ url: API.BILLING.BASE, params }),
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'Bill', id })), { type: 'Bill', id: 'LIST' }]
          : [{ type: 'Bill', id: 'LIST' }],
    }),
    getBillById: builder.query({
      query: (id) => API.BILLING.BY_ID(id),
      providesTags: (r, e, id) => [{ type: 'Bill', id }],
    }),
    createBill: builder.mutation({
      query: (body) => ({ url: API.BILLING.BASE, method: 'POST', body }),
      invalidatesTags: [{ type: 'Bill', id: 'LIST' }],
    }),
    updateBill: builder.mutation({
      query: ({ id, ...body }) => ({ url: API.BILLING.BY_ID(id), method: 'PUT', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Bill', id }, { type: 'Bill', id: 'LIST' }],
    }),
    deleteBill: builder.mutation({
      query: (id) => ({ url: API.BILLING.BY_ID(id), method: 'DELETE' }),
      invalidatesTags: (r, e, id) => [{ type: 'Bill', id }, { type: 'Bill', id: 'LIST' }],
    }),
    getPayments: builder.query({
      query: (params = {}) => ({ url: API.BILLING.PAYMENTS, params }),
      providesTags: [{ type: 'Payment', id: 'LIST' }],
    }),
    createPayment: builder.mutation({
      query: (body) => ({ url: API.BILLING.PAYMENTS, method: 'POST', body }),
      invalidatesTags: [{ type: 'Payment', id: 'LIST' }, { type: 'Bill', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetBillsQuery,
  useGetBillByIdQuery,
  useCreateBillMutation,
  useUpdateBillMutation,
  useDeleteBillMutation,
  useGetPaymentsQuery,
  useCreatePaymentMutation,
} = billingApi;

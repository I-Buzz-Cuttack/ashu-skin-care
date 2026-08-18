
import { baseApi } from "../baseApi";

const getPaymentListFromResponse = (result) => {
  if (!result) return [];

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.result)) return result.result;
  if (Array.isArray(result?.result?.data)) return result.result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.data?.result)) return result.data.result;

  return [];
};

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPayments: builder.query({
      query: (params = {}) => ({
        url: "/payment",
        method: "GET",
        params,
      }),
      providesTags: (result) => {
        const payments = getPaymentListFromResponse(result);

        return [
          ...payments.map((item) => ({
            type: "Payment",
            id: item.id ?? item.paymentId ?? item.payment_id,
          })),
          { type: "Payment", id: "LIST" },
        ];
      },
    }),

    getPaymentById: builder.query({
      query: (id) => ({
        url: `/payment/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "Payment", id }],
    }),

    getPaymentsByInvoiceId: builder.query({
      query: (invoiceId) => ({
        url: `/payment/invoice/${invoiceId}`,
        method: "GET",
      }),
      providesTags: (result, error, invoiceId) => [
        { type: "Payment", id: `INVOICE_${invoiceId}` },
      ],
    }),

    createPayment: builder.mutation({
      query: (body) => ({
        url: "/payment",
        method: "POST",
        body,
      }),
      invalidatesTags: (result, error, body) => [
        { type: "Payment", id: "LIST" },
        ...(body?.invoiceId
          ? [{ type: "Payment", id: `INVOICE_${body.invoiceId}` }]
          : []),
      ],
    }),

    updatePayment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/payment/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (result, error, { id, invoiceId }) => [
        { type: "Payment", id },
        { type: "Payment", id: "LIST" },
        ...(invoiceId ? [{ type: "Payment", id: `INVOICE_${invoiceId}` }] : []),
      ],
    }),

    patchPayment: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/payment/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (result, error, { id, invoiceId }) => [
        { type: "Payment", id },
        { type: "Payment", id: "LIST" },
        ...(invoiceId ? [{ type: "Payment", id: `INVOICE_${invoiceId}` }] : []),
      ],
    }),

    deletePayment: builder.mutation({
      query: (id) => ({
        url: `/payment/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Payment", id: "LIST" }],
    }),
  }),

  overrideExisting: true,
});

export const {
  useGetPaymentsQuery,
  useGetPaymentByIdQuery,
  useGetPaymentsByInvoiceIdQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  usePatchPaymentMutation,
  useDeletePaymentMutation,
} = paymentApi;
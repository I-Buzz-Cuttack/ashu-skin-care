import { baseApi } from "./baseApi";

export const appointmentBillingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAppointmentBillings: builder.query({
      query: (params = {}) => ({
        url: "/appointment-billing",
        params,
      }),
      providesTags: [{ type: "AppointmentBilling", id: "LIST" }],
    }),

    getAppointmentBillingById: builder.query({
      query: (id) => `/appointment-billing/${id}`,
      providesTags: (result, error, id) => [{ type: "AppointmentBilling", id }],
    }),

    createAppointmentBilling: builder.mutation({
      query: (body) => ({
        url: "/appointment-billing",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "AppointmentBilling", id: "LIST" }],
    }),

    updateAppointmentBilling: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/appointment-billing/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [{ type: "AppointmentBilling", id: "LIST" }],
    }),

    patchAppointmentBilling: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/appointment-billing/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [{ type: "AppointmentBilling", id: "LIST" }],
    }),

    deleteAppointmentBilling: builder.mutation({
      query: (id) => ({
        url: `/appointment-billing/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "AppointmentBilling", id: "LIST" }],
    }),
  }),
});

export const {
  useGetAppointmentBillingsQuery,
  useGetAppointmentBillingByIdQuery,
  useCreateAppointmentBillingMutation,
  useUpdateAppointmentBillingMutation,
  usePatchAppointmentBillingMutation,
  useDeleteAppointmentBillingMutation,
} = appointmentBillingApi;
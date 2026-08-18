/**
 * appointmentsApi.js
 * Hooks: useGetAppointmentsQuery, useCreateAppointmentMutation,
 *        useUpdateAppointmentMutation, useDeleteAppointmentMutation
 */
import { baseApi } from './baseApi';
import { API } from '@constants/api';

export const appointmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAppointments: builder.query({
      query: (params = {}) => ({ url: API.APPOINTMENTS.BASE, params }),
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'Appointment', id })), { type: 'Appointment', id: 'LIST' }]
          : [{ type: 'Appointment', id: 'LIST' }],
    }),
    getAppointmentById: builder.query({
      query: (id) => API.APPOINTMENTS.BY_ID(id),
      providesTags: (r, e, id) => [{ type: 'Appointment', id }],
    }),
    createAppointment: builder.mutation({
      query: (body) => ({ url: API.APPOINTMENTS.BASE, method: 'POST', body }),
      invalidatesTags: [{ type: 'Appointment', id: 'LIST' }],
    }),
    updateAppointment: builder.mutation({
      query: ({ id, ...body }) => ({ url: API.APPOINTMENTS.BY_ID(id), method: 'PUT', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Appointment', id }, { type: 'Appointment', id: 'LIST' }],
    }),
    deleteAppointment: builder.mutation({
      query: (id) => ({ url: API.APPOINTMENTS.BY_ID(id), method: 'DELETE' }),
      invalidatesTags: (r, e, id) => [{ type: 'Appointment', id }, { type: 'Appointment', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAppointmentsQuery,
  useGetAppointmentByIdQuery,
  useCreateAppointmentMutation,
  useUpdateAppointmentMutation,
  useDeleteAppointmentMutation,
} = appointmentsApi;

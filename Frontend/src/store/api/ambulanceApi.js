// ambulanceApi.js
import { baseApi } from './baseApi';
import { API } from '@constants/api';

export const ambulanceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDispatches: builder.query({
      query: (params = {}) => ({ url: API.AMBULANCE.DISPATCH, params }),
      providesTags: [{ type: 'Ambulance', id: 'DISPATCH' }],
      // Poll every 30s for live dispatch data
    }),
    createDispatch: builder.mutation({
      query: (body) => ({ url: API.AMBULANCE.DISPATCH, method: 'POST', body }),
      invalidatesTags: [{ type: 'Ambulance', id: 'DISPATCH' }],
    }),
    getFleet: builder.query({
      query: (params = {}) => ({ url: API.AMBULANCE.FLEET, params }),
      providesTags: (result) =>
        result
          ? [...result.data.map(({ id }) => ({ type: 'Ambulance', id })), { type: 'Ambulance', id: 'LIST' }]
          : [{ type: 'Ambulance', id: 'LIST' }],
    }),
    updateVehicleStatus: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${API.AMBULANCE.FLEET}/${id}`, method: 'PUT', body }),
      invalidatesTags: (r, e, { id }) => [{ type: 'Ambulance', id }, { type: 'Ambulance', id: 'LIST' }],
    }),
    getCalls: builder.query({
      query: (params = {}) => ({ url: API.AMBULANCE.CALLS, params }),
      providesTags: [{ type: 'Ambulance', id: 'CALLS' }],
    }),
    createCall: builder.mutation({
      query: (body) => ({ url: API.AMBULANCE.CALLS, method: 'POST', body }),
      invalidatesTags: [{ type: 'Ambulance', id: 'CALLS' }, { type: 'Ambulance', id: 'DISPATCH' }],
    }),
    getDrivers: builder.query({
      query: (params = {}) => ({ url: API.AMBULANCE.DRIVERS, params }),
      providesTags: [{ type: 'Driver', id: 'LIST' }],
    }),
    createDriver: builder.mutation({
      query: (body) => ({ url: API.AMBULANCE.DRIVERS, method: 'POST', body }),
      invalidatesTags: [{ type: 'Driver', id: 'LIST' }],
    }),
    updateDriver: builder.mutation({
      query: ({ id, ...body }) => ({ url: `${API.AMBULANCE.DRIVERS}/${id}`, method: 'PUT', body }),
      invalidatesTags: [{ type: 'Driver', id: 'LIST' }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetDispatchesQuery,
  useCreateDispatchMutation,
  useGetFleetQuery,
  useUpdateVehicleStatusMutation,
  useGetCallsQuery,
  useCreateCallMutation,
  useGetDriversQuery,
  useCreateDriverMutation,
  useUpdateDriverMutation,
} = ambulanceApi;

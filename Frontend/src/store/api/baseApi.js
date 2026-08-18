/**
 * baseApi.js — RTK Query base configuration
 *
 * ALL other API service files inject their endpoints into this base.
 * This is where we set:
 *  - baseUrl          (reads from .env)
 *  - auth token header (reads from Redux store)
 *  - auto 401 logout  (via onQueryStarted or middleware)
 *  - tag types        (for cache invalidation)
 *
 * HOW TO ADD A NEW API MODULE:
 *   1. Create src/store/api/myFeatureApi.js
 *   2. Call: baseApi.injectEndpoints({ endpoints: (builder) => ({ ... }) })
 *   3. Export the generated hooks
 *   4. Import the hook in your component
 */

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { clearAuth, updateAccessToken } from '../slices/authSlice';
import { getApiBaseUrl } from '../../utils/apiBaseUrl';

let refreshPromise = null;

const baseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  credentials: 'include',

  // Automatically attach Bearer token from Redux store
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

/**
 * Wrapper that rotates refresh tokens on access-token expiry.
 * On refresh failure -> clear auth state -> PrivateRoute redirects.
 */
const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);
  const requestUrl = typeof args === 'string' ? args : args?.url;

  if (result.error?.status === 401 && requestUrl !== '/auth/login' && requestUrl !== '/auth/refresh') {
    try {
      refreshPromise ??= baseQuery({ url: '/auth/refresh', method: 'POST' }, api, extraOptions)
        .finally(() => { refreshPromise = null; });
      const refreshResult = await refreshPromise;
      const refreshData = refreshResult?.data?.result ?? refreshResult?.data?.data ?? refreshResult?.data;
      const token = refreshData?.accessToken || refreshData?.token;

      if (token) {
        api.dispatch(updateAccessToken(token));
        result = await baseQuery(args, api, extraOptions);
      } else {
        api.dispatch(clearAuth());
      }
    } catch {
      api.dispatch(clearAuth());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,

  // Global cache lifetime: 60 seconds
  keepUnusedDataFor: 60,

  /**
   * Tag types — every entity type that needs cache invalidation.
   * When a mutation has `invalidatesTags: ['Patient']`, all queries
   * tagged with `providesTags: ['Patient']` will automatically refetch.
   */
  tagTypes: [
    'User',
    'Patient',
    'Appointment',
    'Doctor',
    'Hospital',
    'Bill',
    'Payment',
    'Inventory',
    'LabOrder',
    'LabResult',
    'LabCatalog',
    'RadiologyOrder',
    'RadiologyResult',
    'RadiologyCatalog',
    'Ambulance',
    'Driver',
    'Prescription',
    'Medicine',
    'MedicineCategory',
    'Stock',
    'StockItem',
    'StockMaster',
    'InStock',
    'PurchaseOrder',
    'Supplier',
    'Report',
    'Notification',
    'AuditLog',
    'MenuSettings',
    'Shelf',
    'RadiologyChargeName',
    'RadiologyCategory',
    'RadiologyChargeCategory',
    'OpdCategory',
    'OpdCharge',
    'PathologyCategory',
    'PathologySubCategory',
    'PathologyChargeCategory',
    'PathologyMaster',
    'PathologyMasterPriceHistory',
    'PathologyOrder',
    'PathologyOrderItem',
    'PathologyInvoice',
    'PathologyPayment',
    'Ward',
    'Room',
    'Bed',
    'Role',
    'Permission',
  ],

  // No endpoints defined here — all injected by feature files
  endpoints: () => ({}),
});

export default baseApi;

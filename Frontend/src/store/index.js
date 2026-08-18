/**
 * store/index.js — Redux store configuration (trimmed for OPD + Patient module)
 *
 * Only the slices / API endpoints actually used by the extracted
 * OPD and Patient pages are wired up here. The original project's
 * store/index.js injects endpoints for every hospital module — that
 * full file is preserved as store/index.full.js.reference for context,
 * but this trimmed version is what the app actually boots with.
 */

import { configureStore } from '@reduxjs/toolkit';
import authReducer             from './slices/authSlice';
import { uiReducer }           from './slices/uiSlice';
import { notificationReducer } from './slices/notificationSlice';
import { baseApi }             from './api/baseApi';

// ── API modules needed by OPD + Patient pages ─────────────────────────────
import './api/patientApi/patient';
import './api/opdApi';
import './api/doctorApi/doctor';
import './api/departmentApi/department';
import './api/opddoctorApi/opddoctorApi';
import './api/permissionApi/permission';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    notifications: notificationReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(baseApi.middleware),
});

export default store;

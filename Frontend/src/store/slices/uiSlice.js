// uiSlice.js — sidebar, loading, modal global state
import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen:    false,
    sidebarCollapsed: false,
    pageLoading:    false,
  },
  reducers: {
    toggleSidebar:    (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen:   (state, { payload }) => { state.sidebarOpen = payload; },
    toggleCollapse:   (state) => { state.sidebarCollapsed = !state.sidebarCollapsed; },
    setPageLoading:   (state, { payload }) => { state.pageLoading = payload; },
  },
});
export const { toggleSidebar, setSidebarOpen, toggleCollapse, setPageLoading } = uiSlice.actions;
export const selectSidebarOpen     = (state) => state.ui.sidebarOpen;
export const selectSidebarCollapsed = (state) => state.ui.sidebarCollapsed;
export const selectPageLoading     = (state) => state.ui.pageLoading;
export const uiReducer = uiSlice.reducer;

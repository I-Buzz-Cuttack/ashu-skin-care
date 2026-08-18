// notificationSlice.js — in-app toast / notification queue
import { createSlice } from '@reduxjs/toolkit';

let nextId = 1;

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    toasts: [],   // [{ id, type, message, duration }]
    alerts: [],   // persistent in-app notifications
    unreadCount: 0,
  },
  reducers: {
    addToast: (state, { payload }) => {
      state.toasts.push({
        id:       nextId++,
        type:     payload.type    || 'info',    // 'success' | 'error' | 'warning' | 'info'
        message:  payload.message || '',
        duration: payload.duration || 4000,
      });
    },
    removeToast: (state, { payload }) => {
      state.toasts = state.toasts.filter((t) => t.id !== payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },
    setUnreadCount: (state, { payload }) => {
      state.unreadCount = payload;
    },
    decrementUnread: (state) => {
      if (state.unreadCount > 0) state.unreadCount -= 1;
    },
  },
});

export const { addToast, removeToast, clearToasts, setUnreadCount, decrementUnread } = notificationSlice.actions;
export const selectToasts     = (state) => state.notifications.toasts;
export const selectUnreadCount = (state) => state.notifications.unreadCount;
export const notificationReducer = notificationSlice.reducer;

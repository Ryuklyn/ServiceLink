import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '@/utils/axios';

const API_BASE = '/notifications';
export type NotificationCategory = 'BOOKING' | 'JOB_TICKET' | 'PLATFORM' | 'BILLING' | 'SLA' | 'COMPLIANCE' | 'SYSTEM';
export interface NotificationItem { id: number; title: string; message: string; actionUrl?: string; category: NotificationCategory; isRead: boolean; createdAt: string; }
interface NotificationsPage { content: NotificationItem[]; totalPages: number; totalElements: number; number: number; size: number; }

export const fetchNotifications = createAsyncThunk<NotificationsPage, { page?: number; size?: number } | void>(
  'notifications/fetchNotifications', async (arg) => (await api.get<NotificationsPage>(API_BASE, { params: { page: arg?.page ?? 0, size: arg?.size ?? 20 } })).data);
export const fetchUnreadCount = createAsyncThunk<number>('notifications/fetchUnreadCount', async () =>
  (await api.get<{ unreadCount: number }>(`${API_BASE}/unread-count`)).data.unreadCount);
export const markNotificationAsRead = createAsyncThunk<number, number>('notifications/markAsRead', async (id) => { await api.patch(`${API_BASE}/${id}/read`); return id; });
export const markAllNotificationsAsRead = createAsyncThunk<void>('notifications/markAllAsRead', async () => { await api.patch(`${API_BASE}/read-all`); });

interface NotificationState { items: NotificationItem[]; unreadCount: number; loading: boolean; totalPages: number; }
const initialState: NotificationState = { items: [], unreadCount: 0, loading: false, totalPages: 0 };
const notificationSlice = createSlice({ name: 'notifications', initialState, reducers: {
  receiveRealtimeNotification: (state, action: PayloadAction<NotificationItem>) => {
    const isNewNotification = !state.items.some((item) => item.id === action.payload.id);
    if (isNewNotification) {
      state.items.unshift(action.payload);
      if (!action.payload.isRead) state.unreadCount += 1;
    }
  },
}, extraReducers: (builder) => builder
  .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
  .addCase(fetchNotifications.fulfilled, (state, action) => { state.items = action.payload.content; state.totalPages = action.payload.totalPages; state.loading = false; })
  .addCase(fetchNotifications.rejected, (state) => { state.loading = false; })
  .addCase(fetchUnreadCount.fulfilled, (state, action) => { state.unreadCount = action.payload; })
  .addCase(markNotificationAsRead.fulfilled, (state, action) => { const item = state.items.find((n) => n.id === action.payload); if (item && !item.isRead) { item.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); } })
  .addCase(markAllNotificationsAsRead.fulfilled, (state) => { state.items.forEach((n) => n.isRead = true); state.unreadCount = 0; }),
});
export const { receiveRealtimeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;

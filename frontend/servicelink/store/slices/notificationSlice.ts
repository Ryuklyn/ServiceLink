import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api/notifications';

export interface NotificationItem {
    id: number;
    title: string;
    message: string;
    link?: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationsPage {
    content: NotificationItem[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
}

interface FetchNotificationsArg {
    recipientId: number;
    role: string;
    page?: number;
    size?: number;
}
interface FetchUnreadCountArg { recipientId: number; role: string; }
interface MarkAsReadArg { id: number; recipientId: number; }
interface MarkAllAsReadArg { recipientId: number; role: string; }

export const fetchNotifications = createAsyncThunk<NotificationsPage, FetchNotificationsArg>(
    'notifications/fetchNotifications',
    async ({ recipientId, role, page = 0, size = 10 }) => {
        const response = await axios.get<NotificationsPage>(API_BASE, {
            params: { recipientId, role, page, size },
        });
        return response.data;
    }
);

export const fetchUnreadCount = createAsyncThunk<number, FetchUnreadCountArg>(
    'notifications/fetchUnreadCount',
    async ({ recipientId, role }) => {
        const response = await axios.get<{ unreadCount: number }>(`${API_BASE}/unread-count`, {
            params: { recipientId, role },
        });
        return response.data.unreadCount;
    }
);

export const markNotificationAsRead = createAsyncThunk<number, MarkAsReadArg>(
    'notifications/markAsRead',
    async ({ id, recipientId }) => {
        await axios.patch(`${API_BASE}/${id}/read`, null, { params: { recipientId } });
        return id;
    }
);

export const markAllNotificationsAsRead = createAsyncThunk<void, MarkAllAsReadArg>(
    'notifications/markAllAsRead',
    async ({ recipientId, role }) => {
        await axios.patch(`${API_BASE}/read-all`, null, { params: { recipientId, role } });
    }
);

interface NotificationState {
    items: NotificationItem[];
    unreadCount: number;
    loading: boolean;
    totalPages: number;
}

const initialState: NotificationState = {
    items: [],
    unreadCount: 0,
    loading: false,
    totalPages: 0,
};

const notificationSlice = createSlice({
    name: 'notifications',
    initialState,
    reducers: {
        receiveRealtimeNotification: (state, action: PayloadAction<NotificationItem>) => {
            state.items.unshift(action.payload);
            state.unreadCount += 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.pending, (state) => { state.loading = true; })
            .addCase(fetchNotifications.fulfilled, (state, action) => {
                state.items = action.payload.content;
                state.totalPages = action.payload.totalPages;
                state.loading = false;
            })
            .addCase(fetchUnreadCount.fulfilled, (state, action) => {
                state.unreadCount = action.payload;
            })
            .addCase(markNotificationAsRead.fulfilled, (state, action) => {
                const item = state.items.find((n) => n.id === action.payload);
                if (item && !item.isRead) {
                    item.isRead = true;
                    state.unreadCount = Math.max(0, state.unreadCount - 1);
                }
            })
            .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
                state.items.forEach((n) => (n.isRead = true));
                state.unreadCount = 0;
            });
    },
});

export const { receiveRealtimeNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
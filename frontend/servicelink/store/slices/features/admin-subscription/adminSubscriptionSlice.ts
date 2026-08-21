// src/store/slices/features/admin-subscription/adminSubscriptionSlice.ts
"use client";

import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import { ApiError } from "@/lib/api/client";
import { adminSubscriptionApi } from "./adminSubscriptionApi";
import type {
    AuditLogFilters,
    ExtendSubscriptionPayload,
    PagedResult,
    PaymentTransactionRow,
    ProviderSubscriptionRow,
    RevokeSubscriptionPayload,
    SubscriptionHistory,
    SubscriptionListFilters,
    SubscriptionStats,
} from "./adminSubscriptionTypes";

type AsyncStatus = "idle" | "loading" | "succeeded" | "failed";

interface AdminSubscriptionState {
    stats: {
        data: SubscriptionStats | null;
        status: AsyncStatus;
        error: string | null;
    };
    list: {
        data: PagedResult<ProviderSubscriptionRow> | null;
        filters: SubscriptionListFilters;
        status: AsyncStatus;
        error: string | null;
    };
    history: {
        data: SubscriptionHistory | null;
        status: AsyncStatus;
        error: string | null;
    };
    auditLog: {
        data: PagedResult<PaymentTransactionRow> | null;
        filters: AuditLogFilters;
        status: AsyncStatus;
        error: string | null;
    };
    /** shared status for the Extend / Revoke action modals */
    action: {
        status: AsyncStatus;
        error: string | null;
    };
}

const initialListFilters: SubscriptionListFilters = {
    search: "",
    status: "ALL",
    planType: "ALL",
    page: 0,
    size: 5,
};

const initialAuditFilters: AuditLogFilters = {
    search: "",
    gateway: "ALL",
    status: "ALL",
    page: 0,
    size: 6,
};

const initialState: AdminSubscriptionState = {
    stats: { data: null, status: "idle", error: null },
    list: { data: null, filters: initialListFilters, status: "idle", error: null },
    history: { data: null, status: "idle", error: null },
    auditLog: { data: null, filters: initialAuditFilters, status: "idle", error: null },
    action: { status: "idle", error: null },
};

// api's response interceptor (lib/api/client.ts) already normalizes every
// rejection into an ApiError before it reaches these catch blocks, so this
// just prefers that shape and falls back gracefully otherwise.
function errMsg(err: unknown, fallback: string): string {
    if (err instanceof ApiError) return err.message;
    if (err instanceof Error) return err.message;
    return fallback;
}

// ---- Thunks ----------------------------------------------------------

export const fetchSubscriptionStats = createAsyncThunk(
    "adminSubscription/fetchStats",
    async (_: void, { rejectWithValue }) => {
        try {
            return await adminSubscriptionApi.getStats();
        } catch (err) {
            return rejectWithValue(errMsg(err, "Failed to load subscription stats."));
        }
    }
);

export const fetchSubscriptionList = createAsyncThunk(
    "adminSubscription/fetchList",
    async (filters: SubscriptionListFilters, { rejectWithValue }) => {
        try {
            return await adminSubscriptionApi.listSubscriptions(filters);
        } catch (err) {
            return rejectWithValue(errMsg(err, "Failed to load provider subscriptions."));
        }
    }
);

export const fetchSubscriptionHistory = createAsyncThunk(
    "adminSubscription/fetchHistory",
    async (providerId: string, { rejectWithValue }) => {
        try {
            return await adminSubscriptionApi.getHistory(providerId);
        } catch (err) {
            return rejectWithValue(errMsg(err, "Failed to load subscription history."));
        }
    }
);

export const fetchAuditLog = createAsyncThunk(
    "adminSubscription/fetchAuditLog",
    async (filters: AuditLogFilters, { rejectWithValue }) => {
        try {
            return await adminSubscriptionApi.listTransactions(filters);
        } catch (err) {
            return rejectWithValue(errMsg(err, "Failed to load the payment audit log."));
        }
    }
);

export const extendSubscription = createAsyncThunk(
    "adminSubscription/extend",
    async (payload: ExtendSubscriptionPayload, { rejectWithValue }) => {
        try {
            return await adminSubscriptionApi.extendSubscription(payload);
        } catch (err) {
            return rejectWithValue(errMsg(err, "Failed to extend subscription."));
        }
    }
);

export const revokeSubscription = createAsyncThunk(
    "adminSubscription/revoke",
    async (payload: RevokeSubscriptionPayload, { rejectWithValue }) => {
        try {
            return await adminSubscriptionApi.revokeSubscription(payload);
        } catch (err) {
            return rejectWithValue(errMsg(err, "Failed to revoke subscription."));
        }
    }
);

// ---- Slice -------------------------------------------------------------

const adminSubscriptionSlice = createSlice({
    name: "adminSubscription",
    initialState,
    reducers: {
        setListFilters(state, action: PayloadAction<Partial<SubscriptionListFilters>>) {
            state.list.filters = { ...state.list.filters, ...action.payload };
        },
        setAuditFilters(state, action: PayloadAction<Partial<AuditLogFilters>>) {
            state.auditLog.filters = { ...state.auditLog.filters, ...action.payload };
        },
        clearHistory(state) {
            state.history = { data: null, status: "idle", error: null };
        },
        clearActionError(state) {
            state.action.error = null;
            state.action.status = "idle";
        },
    },
    extraReducers: (builder) => {
        builder
            // stats
            .addCase(fetchSubscriptionStats.pending, (state) => {
                state.stats.status = "loading";
                state.stats.error = null;
            })
            .addCase(fetchSubscriptionStats.fulfilled, (state, action) => {
                state.stats.status = "succeeded";
                state.stats.data = action.payload;
            })
            .addCase(fetchSubscriptionStats.rejected, (state, action) => {
                state.stats.status = "failed";
                state.stats.error = (action.payload as string) ?? "Failed to load stats.";
            })

            // list
            .addCase(fetchSubscriptionList.pending, (state) => {
                state.list.status = "loading";
                state.list.error = null;
            })
            .addCase(fetchSubscriptionList.fulfilled, (state, action) => {
                state.list.status = "succeeded";
                state.list.data = action.payload;
            })
            .addCase(fetchSubscriptionList.rejected, (state, action) => {
                state.list.status = "failed";
                state.list.error = (action.payload as string) ?? "Failed to load subscriptions.";
            })

            // history
            .addCase(fetchSubscriptionHistory.pending, (state) => {
                state.history.status = "loading";
                state.history.error = null;
            })
            .addCase(fetchSubscriptionHistory.fulfilled, (state, action) => {
                state.history.status = "succeeded";
                state.history.data = action.payload;
            })
            .addCase(fetchSubscriptionHistory.rejected, (state, action) => {
                state.history.status = "failed";
                state.history.error = (action.payload as string) ?? "Failed to load history.";
            })

            // audit log
            .addCase(fetchAuditLog.pending, (state) => {
                state.auditLog.status = "loading";
                state.auditLog.error = null;
            })
            .addCase(fetchAuditLog.fulfilled, (state, action) => {
                state.auditLog.status = "succeeded";
                state.auditLog.data = action.payload;
            })
            .addCase(fetchAuditLog.rejected, (state, action) => {
                state.auditLog.status = "failed";
                state.auditLog.error = (action.payload as string) ?? "Failed to load audit log.";
            })

            // extend — patch the row in place, no refetch needed
            .addCase(extendSubscription.pending, (state) => {
                state.action.status = "loading";
                state.action.error = null;
            })
            .addCase(extendSubscription.fulfilled, (state, action) => {
                state.action.status = "succeeded";
                const updated = action.payload;
                if (state.list.data) {
                    state.list.data.content = state.list.data.content.map((row) =>
                        row.providerId === updated.providerId ? updated : row
                    );
                }
                if (state.history.data && state.history.data.subscription.providerId === updated.providerId) {
                    state.history.data.subscription = updated;
                }
            })
            .addCase(extendSubscription.rejected, (state, action) => {
                state.action.status = "failed";
                state.action.error = (action.payload as string) ?? "Failed to extend subscription.";
            })

            // revoke — same in-place patch pattern
            .addCase(revokeSubscription.pending, (state) => {
                state.action.status = "loading";
                state.action.error = null;
            })
            .addCase(revokeSubscription.fulfilled, (state, action) => {
                state.action.status = "succeeded";
                const updated = action.payload;
                if (state.list.data) {
                    state.list.data.content = state.list.data.content.map((row) =>
                        row.providerId === updated.providerId ? updated : row
                    );
                }
                if (state.history.data && state.history.data.subscription.providerId === updated.providerId) {
                    state.history.data.subscription = updated;
                }
            })
            .addCase(revokeSubscription.rejected, (state, action) => {
                state.action.status = "failed";
                state.action.error = (action.payload as string) ?? "Failed to revoke subscription.";
            });
    },
});

export const { setListFilters, setAuditFilters, clearHistory, clearActionError } =
    adminSubscriptionSlice.actions;

export default adminSubscriptionSlice.reducer;
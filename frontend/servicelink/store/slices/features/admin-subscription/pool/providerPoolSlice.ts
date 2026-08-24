import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/axios";

// ─── Types ────────────────────────────────────────────────────────────────
// Mirrors ProviderPoolCardDTO on the backend.

export type ProviderPoolStatus = "ACTIVE" | "PENDING_APPROVAL" | "DECLINED";

export interface ProviderPoolCard {
    poolEntryId: number;
    providerId: number;
    fullName: string;
    businessName?: string | null;
    primaryCategoryName?: string | null;
    profilePictureUrl?: string | null;

    averageRating?: number | null;

    // null (not 0) until the provider has completed at least one Pro job —
    // matches the backend's "don't invent a score" rule.
    proJobsCompleted?: number | null;
    attendanceRate?: number | null;
    onTimeRate?: number | null;

    isVerified: boolean;
    // Server-enforced. true only when the provider's subscription is a paid,
    // active plan AND they've opted in via the AvailabilityTab toggle.
    proOrdersEligible: boolean;

    poolStatus: ProviderPoolStatus;
}

interface ProviderPoolState {
    items: ProviderPoolCard[];
    status: "idle" | "loading" | "succeeded" | "failed";
    removingIds: number[];
    error: string | null;
}

const initialState: ProviderPoolState = {
    items: [],
    status: "idle",
    removingIds: [],
    error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────

export const fetchProviderPool = createAsyncThunk<
ProviderPoolCard[],
{ status?: ProviderPoolStatus | "All"; search?: string } | void,
{ rejectValue: string }
>("providerPool/fetch", async (params, { rejectWithValue }) => {
    try {
        const query: Record<string, string> = {};
        if (params?.status && params.status !== "All") query.status = params.status;
        if (params?.search) query.search = params.search;

        const { data } = await api.get<ProviderPoolCard[]>("/pro/provider-pool", { params: query });
        return data;
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? "Failed to load provider pool",
        );
    }
});

export const removeFromProviderPool = createAsyncThunk<
number, // poolEntryId, echoed back for optimistic removal
    number,
{ rejectValue: string }
>("providerPool/remove", async (poolEntryId, { rejectWithValue }) => {
    try {
        await api.delete(`/pro/provider-pool/${poolEntryId}`);
        return poolEntryId;
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? "Failed to remove provider",
        );
    }
});

// ─── Slice ────────────────────────────────────────────────────────────────

const providerPoolSlice = createSlice({
    name: "providerPool",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProviderPool.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchProviderPool.fulfilled, (state, action: PayloadAction<ProviderPoolCard[]>) => {
                state.items = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchProviderPool.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Unknown error";
            })

            .addCase(removeFromProviderPool.pending, (state, action) => {
                state.removingIds.push(action.meta.arg);
            })
            .addCase(removeFromProviderPool.fulfilled, (state, action: PayloadAction<number>) => {
                state.items = state.items.filter((p) => p.poolEntryId !== action.payload);
                state.removingIds = state.removingIds.filter((id) => id !== action.payload);
            })
            .addCase(removeFromProviderPool.rejected, (state, action) => {
                state.removingIds = state.removingIds.filter((id) => id !== action.meta.arg);
                state.error = action.payload ?? "Unknown error";
            });
    },
});

export default providerPoolSlice.reducer;
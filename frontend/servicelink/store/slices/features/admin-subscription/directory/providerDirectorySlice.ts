import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/axios";

// ─── Types ────────────────────────────────────────────────────────────────
// Mirrors ProviderDirectoryCardDTO on the backend.

export interface ProviderDirectoryCard {
    providerId: number;
    fullName: string;
    businessName?: string | null;
    primaryCategoryName?: string | null;
    specializesIn?: string | null;
    profilePictureUrl?: string | null;

    averageRating?: number | null;
    responseTimeLabel?: string | null;
    location?: string | null;
    totalJobs?: number | null;

    isVerified: boolean;
    alreadyInPool: boolean;
}

interface ProviderDirectoryState {
    items: ProviderDirectoryCard[];
    status: "idle" | "loading" | "succeeded" | "failed";
    addingProviderIds: number[];
    error: string | null;
}

const initialState: ProviderDirectoryState = {
    items: [],
    status: "idle",
    addingProviderIds: [],
    error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────

// The backend already only returns providers who are Pro-eligible and not
// yet in this org's pool — no client-side eligibility filtering needed.
export const fetchProviderDirectory = createAsyncThunk<
    ProviderDirectoryCard[],
    { category?: string; search?: string } | void,
    { rejectValue: string }
>("providerDirectory/fetch", async (params, { rejectWithValue }) => {
    try {
        const query: Record<string, string> = {};
        if (params?.category) query.category = params.category;
        if (params?.search) query.search = params.search;

        const { data } = await api.get<ProviderDirectoryCard[]>("/pro/provider-directory", { params: query });
        return data;
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? "Failed to load provider directory",
        );
    }
});

export const addProviderToPool = createAsyncThunk<
    number, // providerId, echoed back so we can drop it from the directory list
    number,
    { rejectValue: string }
>("providerDirectory/addToPool", async (providerId, { rejectWithValue }) => {
    try {
        await api.post(`/pro/provider-pool/${providerId}`);
        return providerId;
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? "Failed to add provider to your pool",
        );
    }
});

// ─── Slice ────────────────────────────────────────────────────────────────

const providerDirectorySlice = createSlice({
    name: "providerDirectory",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProviderDirectory.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchProviderDirectory.fulfilled, (state, action: PayloadAction<ProviderDirectoryCard[]>) => {
                state.items = action.payload;
                state.status = "succeeded";
            })
            .addCase(fetchProviderDirectory.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload ?? "Unknown error";
            })

            .addCase(addProviderToPool.pending, (state, action) => {
                state.addingProviderIds.push(action.meta.arg);
            })
            .addCase(addProviderToPool.fulfilled, (state, action: PayloadAction<number>) => {
                // Once added, the provider is only managed from the Provider
                // Pool page — drop it from the Directory list immediately
                // rather than flipping it to an "Added" state in place.
                state.items = state.items.filter((p) => p.providerId !== action.payload);
                state.addingProviderIds = state.addingProviderIds.filter((id) => id !== action.payload);
            })
            .addCase(addProviderToPool.rejected, (state, action) => {
                state.addingProviderIds = state.addingProviderIds.filter((id) => id !== action.meta.arg);
                state.error = action.payload ?? "Unknown error";
            });
    },
});

export default providerDirectorySlice.reducer;
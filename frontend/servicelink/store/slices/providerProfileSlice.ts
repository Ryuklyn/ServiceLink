import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
// import { privateApi } from "@/lib/api/public";
import api from "@/utils/axios";

// ─── Types ────────────────────────────────────────────────────────────────────
// Mirrors ProviderProfileDTO — Provider entity is synced from KycSubmission on
// approval (see Provider.syncFromKyc), so fullName/profilePictureUrl here are
// already the joined Provider + KycSubmission + User data, not the raw User row.

export interface ProviderProfile {
    id: number;
    fullName: string;
    businessName?: string | null;
    profilePictureUrl?: string | null;
    primaryService?: string;
    isVerified?: boolean;
    isOnline?: boolean;
    averageRating?: number;
    baseDistrict?: string | null;
}

interface ProviderProfileState {
    data: ProviderProfile | null;
    loading: boolean;
    error: string | null;
}

const initialState: ProviderProfileState = {
    data: null,
    loading: false,
    error: null,
};

// ─── Thunk ────────────────────────────────────────────────────────────────────

export const fetchProviderProfile = createAsyncThunk<
    ProviderProfile,
    void,
    { rejectValue: string }
>("providerProfile/fetchMe", async (_, { rejectWithValue }) => {
    try {
        // const { data } = await privateApi.get<ProviderProfile>("/providers/me");
        const { data } = await api.get<ProviderProfile>("/providers/me");
        return data;
    } catch (err: any) {
        const message =
            err?.response?.data?.message ?? err?.message ?? "Failed to load provider profile";
        return rejectWithValue(message);
    }
});

// ─── Slice ────────────────────────────────────────────────────────────────────

const providerProfileSlice = createSlice({
    name: "providerProfile",
    initialState,
    reducers: {
        clearProviderProfile(state) {
            state.data = null;
            state.loading = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProviderProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchProviderProfile.fulfilled,
                (state, action: PayloadAction<ProviderProfile>) => {
                    state.data = action.payload;
                    state.loading = false;
                },
            )
            .addCase(fetchProviderProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Unknown error";
            });
    },
});

export const { clearProviderProfile } = providerProfileSlice.actions;
export default providerProfileSlice.reducer;
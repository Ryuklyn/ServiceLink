import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/axios";

// ─── Types ────────────────────────────────────────────────────────────────────
// Mirrors ProviderProfileDTO / UpdateProviderProfileDTO on the backend.

export interface ProviderProfile {
    id: number;
    fullName: string;
    phone?: string | null;
    businessName?: string | null;
    bio?: string | null;
    profilePictureUrl?: string | null;
    email?: string | null;

    primaryService?: string;
    otherService?: string | null;
    experienceYears?: number | null;

    isVerified?: boolean;
    isActive?: boolean;
    isOnline?: boolean;
    hasCompletedOnboarding: boolean;

    baseDistrict?: string | null;
    serviceAreaText?: string | null;
    coveredDistricts?: string | null; // comma-separated, per UpdateProviderProfileDTO
    latitude?: number | null;
    longitude?: number | null;
    travelRadiusKm?: number | null;

    averageRating?: number;
    totalReviews?: number;
    totalJobs?: number;
    avgResponseMinutes?: number | null;

    punctualityScore?: number | null;
    qualityScore?: number | null;
    communicationScore?: number | null;
    valueScore?: number | null;

    memberSince?: string | null;

    services?: unknown[];
    portfolio?: unknown[];
    recentReviews?: unknown[];
}

export interface ProviderProfileUpdatePayload {
    businessName?: string;
    bio?: string;
    experienceYears?: number;
    baseDistrict?: string;
    serviceAreaText?: string;
    coveredDistricts?: string;
    latitude?: number;
    longitude?: number;
    travelRadiusKm?: number;
}

interface ProviderProfileState {
    data: ProviderProfile | null;
    loading: boolean;
    saving: boolean;
    uploadingPicture: boolean;
    error: string | null;
}

const initialState: ProviderProfileState = {
    data: null,
    loading: false,
    saving: false,
    uploadingPicture: false,
    error: null,
};

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchProviderProfile = createAsyncThunk<
ProviderProfile,
    void,
{ rejectValue: string }
>("providerProfile/fetchMe", async (_, { rejectWithValue }) => {
    try {
        const { data } = await api.get<ProviderProfile>("/providers/me");
        return data;
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? "Failed to load provider profile",
        );
    }
});

export const updateProviderProfile = createAsyncThunk<
ProviderProfile,
    ProviderProfileUpdatePayload,
{ rejectValue: string }
>("providerProfile/updateMe", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await api.patch<ProviderProfile>("/providers/me", payload);
        return data;
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? "Failed to update provider profile",
        );
    }
});

export const uploadProviderPicture = createAsyncThunk<
ProviderProfile,
    File,
{ rejectValue: string }
>("providerProfile/uploadPicture", async (file, { rejectWithValue }) => {
    try {
        const formData = new FormData();
        formData.append("file", file);
        const { data } = await api.post<ProviderProfile>("/providers/me/picture", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return data;
    } catch (err: any) {
        return rejectWithValue(
            err?.response?.data?.message ?? err?.message ?? "Failed to upload photo",
        );
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
            state.saving = false;
            state.uploadingPicture = false;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProviderProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProviderProfile.fulfilled, (state, action: PayloadAction<ProviderProfile>) => {
                state.data = action.payload;
                state.loading = false;
            })
            .addCase(fetchProviderProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? "Unknown error";
            })
            .addCase(updateProviderProfile.pending, (state) => {
                state.saving = true;
                state.error = null;
            })
            .addCase(updateProviderProfile.fulfilled, (state, action: PayloadAction<ProviderProfile>) => {
                state.data = action.payload;
                state.saving = false;
            })
            .addCase(updateProviderProfile.rejected, (state, action) => {
                state.saving = false;
                state.error = action.payload ?? "Unknown error";
            })
            .addCase(uploadProviderPicture.pending, (state) => {
                state.uploadingPicture = true;
                state.error = null;
            })
            .addCase(uploadProviderPicture.fulfilled, (state, action: PayloadAction<ProviderProfile>) => {
                state.data = action.payload;
                state.uploadingPicture = false;
            })
            .addCase(uploadProviderPicture.rejected, (state, action) => {
                state.uploadingPicture = false;
                state.error = action.payload ?? "Unknown error";
            });
    },
});

export const { clearProviderProfile } = providerProfileSlice.actions;
export default providerProfileSlice.reducer;
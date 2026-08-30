import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utils/axios";

export type WorkspaceRole = "ADMIN" | "MANAGER" | "STAFF" | "FINANCE";

interface ProSessionState {
    fullName: string | null;
    role: WorkspaceRole | null;
    workspaceId: number | null;
    workspaceName: string | null;
    organizationId: number | null;
    organizationName: string | null;
    logoUrl: string | null;
    businessType: string | null;
    planType: string | null;
    subscriptionStatus: string | null;
    trialEndsAt: string | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: ProSessionState = {
    fullName: null,
    role: null,
    workspaceId: null,
    workspaceName: null,
    organizationId: null,
    organizationName: null,
    logoUrl: null,
    businessType: null,
    planType: null,
    subscriptionStatus: null,
    trialEndsAt: null,
    status: "idle",
    error: null,
};

export const fetchProSession = createAsyncThunk(
    "proSession/fetch",
    async (_, { rejectWithValue }) => {
        try {
            const res = await api.get("/business/pro-user/me");
            const data = res.data;
            return {
                fullName: data.fullName,
                role: data.role,
                workspaceId: data.workspaceId,
                workspaceName: data.workspaceName,
                organizationId: data.organizationId,
                organizationName: data.organizationName,
                logoUrl: data.logoUrl,
                businessType: data.businessType,
                planType: data.planType,
                subscriptionStatus: data.subscriptionStatus,
                trialEndsAt: data.trialEndsAt,
            };
        } catch {
            return rejectWithValue("Could not load your profile. Please try logging in again.");
        }
    },
);

const proSessionSlice = createSlice({
    name: "proSession",
    initialState,
    reducers: {
        clearProSession: () => initialState,
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProSession.pending, (state) => {
                state.status = "loading";
            })
            .addCase(fetchProSession.fulfilled, (state, action) => {
                state.status = "succeeded";
                Object.assign(state, action.payload);
            })
            .addCase(fetchProSession.rejected, (state, action) => {
                state.status = "failed";
                state.error = (action.payload as string) ?? "Failed to load session";
            });
    },
});

export const { clearProSession } = proSessionSlice.actions;
export default proSessionSlice.reducer;
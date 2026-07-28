import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utils/axios";

export type WorkspaceRole = "ADMIN" | "MANAGER" | "STAFF" | "FINANCE";

interface ProSessionState {
    fullName: string | null;
    role: WorkspaceRole | null; // ← naya: this user's role IN THIS WORKSPACE
    workspaceId: number | null;
    workspaceName: string | null;
    organizationId: number | null;
    organizationName: string | null;
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
        let me: { fullName: string; role: WorkspaceRole; workspaceId: number };
        try {
            const meRes = await api.get("/business/pro-user/me");
            me = meRes.data;
        } catch {
            return rejectWithValue("Could not load your profile. Please try logging in again.");
        }

        let workspace: any, org: any;
        try {
            const workspaceRes = await api.get(`/business/workspace/${me.workspaceId}`);
            workspace = workspaceRes.data;
            const orgRes = await api.get(`/business/organization/${workspace.organizationId}`);
            org = orgRes.data;
        } catch {
            return rejectWithValue("Could not load workspace details.");
        }

        let planType: string | null = null;
        let subscriptionStatus: string | null = null;
        let trialEndsAt: string | null = null;
        try {
            const subRes = await api.get(
                `/business/payment/subscription/workspace/${me.workspaceId}`,
            );
            planType = subRes.data.planType ?? null;
            subscriptionStatus = subRes.data.status ?? null;
            trialEndsAt = subRes.data.trialEndsAt ?? null;
        } catch {
            // No subscription yet — badge falls back to a neutral state
        }

        return {
            fullName: me.fullName,
            role: me.role,
            workspaceId: workspace.id,
            workspaceName: workspace.name,
            organizationId: org.id,
            organizationName: org.companyName,
            businessType: org.businessType,
            planType,
            subscriptionStatus,
            trialEndsAt,
        };
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
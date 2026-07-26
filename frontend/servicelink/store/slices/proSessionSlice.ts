import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/utils/axios";
// import { getProClaims } from "@/utils/jwt";

interface ProSessionState {
    fullName: string | null;
    workspaceId: number | null;
    workspaceName: string | null;
    organizationId: number | null;
    organizationName: string | null;
    businessType: string | null;
    planType: string | null;
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: ProSessionState = {
    fullName: null,
    workspaceId: null,
    workspaceName: null,
    organizationId: null,
    organizationName: null,
    businessType: null,
    planType: null,
    status: "idle",
    error: null,
};

export const fetchProSession = createAsyncThunk("proSession/fetch", async () => {
    const meRes = await api.get("/business/pro-user/me"); // Authorization header via your existing interceptor
    const workspaceRes = await api.get(`/business/workspace/${meRes.data.workspaceId}`);
    const orgRes = await api.get(`/business/organization/${workspaceRes.data.organizationId}`);

    let planType: string | null = null;
    try {
        const subRes = await api.get(`/business/payment/subscription/workspace/${meRes.data.workspaceId}`);
        planType = subRes.data.planType ?? null;
    } catch {}

    return {
        fullName: meRes.data.fullName,
        workspaceId: workspaceRes.data.id,
        workspaceName: workspaceRes.data.name,
        organizationId: orgRes.data.id,
        organizationName: orgRes.data.companyName,
        businessType: orgRes.data.businessType,
        planType,
    };
});
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
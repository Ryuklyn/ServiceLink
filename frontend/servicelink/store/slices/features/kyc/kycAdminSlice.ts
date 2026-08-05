import {
    createSlice, createAsyncThunk, PayloadAction,
} from "@reduxjs/toolkit";
import { kycAdminApi, ListKycParams } from "./kycAdminApi";
import type {
    KycDetail, KycListItem, ScheduleVideoAuditRequest,
} from "./kycTypes";

interface KycAdminState {
    items: KycListItem[];
    selected: KycDetail | null;
    listLoading: boolean;
    detailLoading: boolean;
    actionLoading: boolean;
    error: string | null;
    lastDecisionId: number | null;
}

const initialState: KycAdminState = {
    items: [],
    selected: null,
    listLoading: false,
    detailLoading: false,
    actionLoading: false,
    error: null,
    lastDecisionId: null,
};

// ─── Thunks ────────────────────────────────────────────────────────────────
export const fetchKycList = createAsyncThunk(
    "kycAdmin/fetchList",
    (params: ListKycParams = {}) =>
        kycAdminApi.list(params),
);

export const fetchKycDetail = createAsyncThunk(
    "kycAdmin/fetchDetail",
    (id: number) => kycAdminApi.detail(id),
);

export const approveKyc = createAsyncThunk(
    "kycAdmin/approve",
    (payload: { id: number; reviewNotes?: string }) =>
        kycAdminApi.approve(payload.id, payload.reviewNotes)
            .then(() => payload.id),
);

export const rejectKyc = createAsyncThunk(
    "kycAdmin/reject",
    (payload: { id: number; reviewNotes: string }) =>
        kycAdminApi.reject(payload.id, payload.reviewNotes)
            .then(() => payload.id),
);

export const scheduleVideoAudit = createAsyncThunk(
    "kycAdmin/scheduleVideoAudit",
    (payload: ScheduleVideoAuditRequest & { id: number }) => {
        const { id, ...body } = payload;
        return kycAdminApi.scheduleVideoAudit(id, body).then(() => id);
    },
);

// ─── Slice ─────────────────────────────────────────────────────────────────
const adminSlice = createSlice({
    name: "kycAdmin",
    initialState,
    reducers: {
        clearSelected(state) { state.selected = null; },
        clearError(state)    { state.error = null; },
        setLocalStatus(
            state,
            action: PayloadAction<{ id: number; status: string }>,
        ) {
            const item = state.items.find((i) => i.id === action.payload.id);
            if (item) item.status = action.payload.status as any;
            if (state.selected?.id === action.payload.id) {
                state.selected.status = action.payload.status as any;
            }
        },
    },
    extraReducers: (b) => {
        b
            .addCase(fetchKycList.pending,   (s) => { s.listLoading = true;  s.error = null; })
            .addCase(fetchKycList.fulfilled, (s, a) => { s.listLoading = false; s.items = a.payload; })
            .addCase(fetchKycList.rejected,  (s, a) => { s.listLoading = false; s.error = a.error.message ?? "Failed to load KYC list"; })

            .addCase(fetchKycDetail.pending,   (s) => { s.detailLoading = true; })
            .addCase(fetchKycDetail.fulfilled, (s, a) => { s.detailLoading = false; s.selected = a.payload; })
            .addCase(fetchKycDetail.rejected,  (s, a) => { s.detailLoading = false; s.error = a.error.message ?? "Failed to load KYC detail"; })

            .addCase(approveKyc.pending,   (s) => { s.actionLoading = true; s.error = null; })
            .addCase(approveKyc.fulfilled, (s, a) => {
                s.actionLoading = false; s.lastDecisionId = a.payload;
                const i = s.items.find((x) => x.id === a.payload);
                if (i) i.status = "APPROVE" as any;
                if (s.selected?.id === a.payload) s.selected.status = "APPROVE" as any;
            })
            .addCase(approveKyc.rejected,  (s, a) => { s.actionLoading = false; s.error = a.error.message ?? "Approve failed"; })

            .addCase(rejectKyc.pending,   (s) => { s.actionLoading = true; s.error = null; })
            .addCase(rejectKyc.fulfilled, (s, a) => {
                s.actionLoading = false; s.lastDecisionId = a.payload;
                const i = s.items.find((x) => x.id === a.payload);
                if (i) i.status = "REJECTED" as any;
                if (s.selected?.id === a.payload) s.selected.status = "REJECTED" as any;
            })
            .addCase(rejectKyc.rejected,  (s, a) => { s.actionLoading = false; s.error = a.error.message ?? "Reject failed"; })

            .addCase(scheduleVideoAudit.pending,   (s) => { s.actionLoading = true; s.error = null; })
            .addCase(scheduleVideoAudit.fulfilled, (s, a) => {
                s.actionLoading = false; s.lastDecisionId = a.payload;
                const i = s.items.find((x) => x.id === a.payload);
                if (i) i.status = "UNDER_REVIEW" as any;
                if (s.selected?.id === a.payload) s.selected.status = "UNDER_REVIEW" as any;
            })
            .addCase(scheduleVideoAudit.rejected,  (s, a) => { s.actionLoading = false; s.error = a.error.message ?? "Scheduling failed"; });
    },
});

export const { clearSelected, clearError, setLocalStatus } = adminSlice.actions;
export default adminSlice.reducer;
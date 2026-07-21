import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "@/utils/axios";

export type BackendAppointmentStatus =
    | "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface AppointmentSummary {
    id: number;
    providerName: string;
    providerProfilePicture: string | null;
    subServiceName: string;
    appointmentDate: string;          // yyyy-MM-dd
    timeSlot: "MORNING" | "AFTERNOON" | "EVENING";
    estimatedStartTime: string | null; // HH:mm:ss
    status: BackendAppointmentStatus;
    totalPrice: number | null;
    address: string;
    customerName: string;
    customerPhone: string | null;
    customerProfilePictureUrl: string | null;
}

export interface AppointmentDetail extends AppointmentSummary {
    providerId: number;
    providerPhone: string;
    serviceCatalogId: number;
    pricingUnit: string;
    effectiveDuration: string;
    providerCustomPrice: number | null;
    areaSqFt: number | null;
    wallCount: number | null;
    itemCount: number | null;
    scheduledAt: string;
    estimatedEndTime: string | null;
    attachedImgUrl: string | null;
    attachedVideoUrl: string | null;
    attachedAudioUrl: string | null;
    notes: string | null;
    cancellationReason: string | null;
    confirmedAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    cancelledAt: string | null;
    customerEmail: string | null;
}

interface ProviderBookingsState {
    items: AppointmentSummary[];
    listStatus: "idle" | "loading" | "succeeded" | "failed";
    detailsById: Record<number, AppointmentDetail>;
    detailStatus: "idle" | "loading" | "succeeded" | "failed";
    updatingId: number | null;
    error: string | null;
}

const initialState: ProviderBookingsState = {
    items: [],
    listStatus: "idle",
    detailsById: {},
    detailStatus: "idle",
    updatingId: null,
    error: null,
};

export const fetchProviderBookings = createAsyncThunk<
AppointmentSummary[], void, { rejectValue: string }
>("providerBookings/fetchList", async (_, { rejectWithValue }) => {
    try {
        // size=100 is a stopgap; swap for real pagination once the list grows.
        const { data } = await api.get("/appointments/provider", {
            params: { page: 0, size: 100 },
        });
        return data.content as AppointmentSummary[];
    } catch (err: any) {
        return rejectWithValue(err?.response?.data?.message ?? err?.message ?? "Failed to load bookings");
    }
});

export const fetchProviderBookingDetail = createAsyncThunk<
AppointmentDetail, number, { rejectValue: string }
>("providerBookings/fetchDetail", async (id, { rejectWithValue }) => {
    try {
        const { data } = await api.get(`/appointments/provider/${id}`);
        return data as AppointmentDetail;
    } catch (err: any) {
        return rejectWithValue(err?.response?.data?.message ?? err?.message ?? "Failed to load booking detail");
    }
});

export const updateBookingStatus = createAsyncThunk<
AppointmentDetail,
    { id: number; status: BackendAppointmentStatus; reason?: string },
{ rejectValue: string }
>("providerBookings/updateStatus", async ({ id, status, reason }, { rejectWithValue }) => {
    try {
        const { data } = await api.patch(`/appointments/provider/${id}/status`, { status, reason });
        return data as AppointmentDetail;
    } catch (err: any) {
        return rejectWithValue(err?.response?.data?.message ?? err?.message ?? "Failed to update booking status");
    }
});

const providerBookingsSlice = createSlice({
    name: "providerBookings",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchProviderBookings.pending, (state) => {
                state.listStatus = "loading";
                state.error = null;
            })
            .addCase(fetchProviderBookings.fulfilled, (state, action: PayloadAction<AppointmentSummary[]>) => {
                state.listStatus = "succeeded";
                state.items = action.payload;
            })
            .addCase(fetchProviderBookings.rejected, (state, action) => {
                state.listStatus = "failed";
                state.error = action.payload ?? "Unknown error";
            })
            .addCase(fetchProviderBookingDetail.pending, (state) => {
                state.detailStatus = "loading";
            })
            .addCase(fetchProviderBookingDetail.fulfilled, (state, action: PayloadAction<AppointmentDetail>) => {
                state.detailStatus = "succeeded";
                state.detailsById[action.payload.id] = action.payload;
            })
            .addCase(fetchProviderBookingDetail.rejected, (state, action) => {
                state.detailStatus = "failed";
                state.error = action.payload ?? "Unknown error";
            })
            .addCase(updateBookingStatus.pending, (state, action) => {
                state.updatingId = action.meta.arg.id;
            })
            .addCase(updateBookingStatus.fulfilled, (state, action: PayloadAction<AppointmentDetail>) => {
                state.updatingId = null;
                state.detailsById[action.payload.id] = action.payload;
                state.items = state.items.map((b) =>
                    b.id === action.payload.id ? { ...b, status: action.payload.status } : b,
                );
            })
            .addCase(updateBookingStatus.rejected, (state, action) => {
                state.updatingId = null;
                state.error = action.payload ?? "Unknown error";
            });
    },
});

export default providerBookingsSlice.reducer;
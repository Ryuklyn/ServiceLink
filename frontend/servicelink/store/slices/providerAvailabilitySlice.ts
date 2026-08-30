import api, { normalizeError } from "@/utils/axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export type TimeSlotKey = "MORNING" | "AFTERNOON" | "EVENING";

export interface AvailabilitySlot {
    date: string;
    period: TimeSlotKey;
    displayRange: string;
    isAvailable: boolean;
    reason: string | null;
}

export interface ScheduleSettings {
    workingDays: number[];     // 0=Sun ... 6=Sat
    defaultSlots: TimeSlotKey[];
    acceptsProOrders: boolean;
}

interface ProviderAvailabilityState {
    currentMonth: string;
    slotsByDate: Record<string, AvailabilitySlot[]>;
    settings: ScheduleSettings;
    status: "idle" | "loading" | "succeeded" | "failed";
    saveStatus: "idle" | "saving" | "succeeded" | "failed";
    settingsSaveStatus: "idle" | "saving" | "succeeded" | "failed";
    error: string | null;
}

function isoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}
function firstOfMonth(year: number, month: number): Date { return new Date(year, month, 1); }

export function monthGridRange(monthStart: Date): { start: string; end: string } {
    const gridStart = new Date(monthStart);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());
    const gridEnd = new Date(gridStart);
    gridEnd.setDate(gridEnd.getDate() + 41);
    return { start: isoDate(gridStart), end: isoDate(gridEnd) };
}

const today = new Date();
const initialState: ProviderAvailabilityState = {
    currentMonth: isoDate(firstOfMonth(today.getFullYear(), today.getMonth())),
    slotsByDate: {},
    settings: { workingDays: [0, 1, 2, 3, 4, 5, 6], defaultSlots: ["MORNING", "AFTERNOON", "EVENING"], acceptsProOrders: false },
    status: "idle", saveStatus: "idle", settingsSaveStatus: "idle", error: null,
};

export const fetchMonthAvailability = createAsyncThunk(
    "providerAvailability/fetchMonth",
    async (monthStartIso: string, { rejectWithValue }) => {
        const { start, end } = monthGridRange(new Date(monthStartIso));
        try {
            const { data } = await api.get<AvailabilitySlot[]>("/providers/me/availability", { params: { start, end } });
            return data;
        } catch (err) { return rejectWithValue(normalizeError(err).message); }
    }
);

export const saveDayAvailability = createAsyncThunk(
    "providerAvailability/saveDay",
    async (updates: AvailabilitySlot[], { rejectWithValue }) => {
        try {
            await api.patch("/providers/me/availability", {
                updates: updates.map((u) => ({
                    date: u.date, period: u.period, isAvailable: u.isAvailable,
                    reason: u.isAvailable ? null : u.reason,
                })),
            });
            return updates;
        } catch (err) { return rejectWithValue(normalizeError(err).message); }
    }
);

export const fetchScheduleSettings = createAsyncThunk(
    "providerAvailability/fetchSettings",
    async (_, { rejectWithValue }) => {
        try { const { data } = await api.get<ScheduleSettings>("/providers/me/schedule-settings"); return data; }
        catch (err) { return rejectWithValue(normalizeError(err).message); }
    }
);

export const saveScheduleSettings = createAsyncThunk(
    "providerAvailability/saveSettings",
    async (settings: ScheduleSettings, { rejectWithValue }) => {
        try { await api.put("/providers/me/schedule-settings", settings); return settings; }
        catch (err) { return rejectWithValue(normalizeError(err).message); }
    }
);

const providerAvailabilitySlice = createSlice({
    name: "providerAvailability",
    initialState,
    reducers: {
        setCurrentMonth(state, action: PayloadAction<string>) { state.currentMonth = action.payload; },
        goToPrevMonth(state) { const d = new Date(state.currentMonth); state.currentMonth = isoDate(firstOfMonth(d.getFullYear(), d.getMonth() - 1)); },
        goToNextMonth(state) { const d = new Date(state.currentMonth); state.currentMonth = isoDate(firstOfMonth(d.getFullYear(), d.getMonth() + 1)); },
        goToToday(state) { const t = new Date(); state.currentMonth = isoDate(firstOfMonth(t.getFullYear(), t.getMonth())); },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMonthAvailability.pending, (state) => { state.status = "loading"; state.error = null; })
            .addCase(fetchMonthAvailability.fulfilled, (state, action) => {
                state.status = "succeeded";
                for (const row of action.payload) {
                    const existing = (state.slotsByDate[row.date] ?? []).filter((s) => s.period !== row.period);
                    state.slotsByDate[row.date] = [...existing, row];
                }
            })
            .addCase(fetchMonthAvailability.rejected, (state, action) => { state.status = "failed"; state.error = action.payload as string; })
            .addCase(saveDayAvailability.pending, (state) => { state.saveStatus = "saving"; })
            .addCase(saveDayAvailability.fulfilled, (state, action) => {
                state.saveStatus = "succeeded";
                for (const u of action.payload) {
                    const existing = (state.slotsByDate[u.date] ?? []).filter((s) => s.period !== u.period);
                    state.slotsByDate[u.date] = [...existing, u];
                }
            })
            .addCase(saveDayAvailability.rejected, (state, action) => { state.saveStatus = "failed"; state.error = action.payload as string; })
            .addCase(fetchScheduleSettings.fulfilled, (state, action) => { state.settings = action.payload; })
            .addCase(saveScheduleSettings.pending, (state) => { state.settingsSaveStatus = "saving"; })
            .addCase(saveScheduleSettings.fulfilled, (state, action) => { state.settingsSaveStatus = "succeeded"; state.settings = action.payload; })
            .addCase(saveScheduleSettings.rejected, (state, action) => { state.settingsSaveStatus = "failed"; state.error = action.payload as string; });
    },
});

export const { setCurrentMonth, goToPrevMonth, goToNextMonth, goToToday } = providerAvailabilitySlice.actions;
export default providerAvailabilitySlice.reducer;
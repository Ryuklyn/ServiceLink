import api, { normalizeError } from "@/utils/axios";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export type TimeSlotKey = "MORNING" | "AFTERNOON" | "EVENING";

export interface AvailabilitySlot {
    date: string;            // ISO yyyy-MM-dd
    period: TimeSlotKey;
    displayRange: string;    // e.g. "08:00-12:00", from backend TimeSlot.getDisplayRange()
    isAvailable: boolean;
    reason: string | null;
}

interface ProviderAvailabilityState {
    currentMonth: string;                          // ISO first-of-month
    slotsByDate: Record<string, AvailabilitySlot[]>;
    status: "idle" | "loading" | "succeeded" | "failed";
    saveStatus: "idle" | "saving" | "succeeded" | "failed";
    error: string | null;
}

// Local, timezone-safe ISO formatter — same fix as AvailabilityTab.tsx.
// toISOString() converts to UTC first, which shifts the date backward for
// UTC+ zones like Nepal (UTC+5:45) during local midnight–5:45AM, causing
// currentMonth / monthGridRange to land on the wrong day/month.
function isoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

function firstOfMonth(year: number, month: number): Date {
    return new Date(year, month, 1);
}

/** 6-week (42-cell) grid range, so the fetch always covers every visible cell including overflow days. */
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
    status: "idle",
    saveStatus: "idle",
    error: null,
};


export const fetchMonthAvailability = createAsyncThunk(
    "providerAvailability/fetchMonth",
    async (monthStartIso: string, { rejectWithValue }) => {
        const { start, end } = monthGridRange(new Date(monthStartIso));
        try {
            const { data } = await api.get<AvailabilitySlot[]>("/providers/me/availability", {
                params: { start, end },
            });
            return data;
        } catch (err) {
            return rejectWithValue(normalizeError(err).message);
        }
    }
);

export const saveDayAvailability = createAsyncThunk(
    "providerAvailability/saveDay",
    async (updates: AvailabilitySlot[], { rejectWithValue }) => {
        try {
            await api.patch("/providers/me/availability", {
                updates: updates.map((u) => ({
                    date: u.date,
                    period: u.period,
                    isAvailable: u.isAvailable,
                    reason: u.isAvailable ? null : u.reason,
                })),
            });
            return updates;
        } catch (err) {
            return rejectWithValue(normalizeError(err).message);
        }
    }
);

const providerAvailabilitySlice = createSlice({
    name: "providerAvailability",
    initialState,
    reducers: {
        setCurrentMonth(state, action: PayloadAction<string>) {
            state.currentMonth = action.payload;
        },
        goToPrevMonth(state) {
            const d = new Date(state.currentMonth);
            state.currentMonth = isoDate(firstOfMonth(d.getFullYear(), d.getMonth() - 1));
        },
        goToNextMonth(state) {
            const d = new Date(state.currentMonth);
            state.currentMonth = isoDate(firstOfMonth(d.getFullYear(), d.getMonth() + 1));
        },
        goToToday(state) {
            const t = new Date();
            state.currentMonth = isoDate(firstOfMonth(t.getFullYear(), t.getMonth()));
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchMonthAvailability.pending, (state) => {
                state.status = "loading";
                state.error = null;
            })
            .addCase(fetchMonthAvailability.fulfilled, (state, action) => {
                state.status = "succeeded";
                for (const row of action.payload) {
                    const existing = (state.slotsByDate[row.date] ?? []).filter((s) => s.period !== row.period);
                    state.slotsByDate[row.date] = [...existing, row];
                }
            })
            .addCase(fetchMonthAvailability.rejected, (state, action) => {
                state.status = "failed";
                state.error = (action.payload as string) ?? "Unknown error";
            })
            .addCase(saveDayAvailability.pending, (state) => {
                state.saveStatus = "saving";
            })
            .addCase(saveDayAvailability.fulfilled, (state, action) => {
                state.saveStatus = "succeeded";
                for (const u of action.payload) {
                    const existing = (state.slotsByDate[u.date] ?? []).filter((s) => s.period !== u.period);
                    state.slotsByDate[u.date] = [...existing, u];
                }
            })
            .addCase(saveDayAvailability.rejected, (state, action) => {
                state.saveStatus = "failed";
                state.error = (action.payload as string) ?? "Unknown error";
            });
    },
});

export const { setCurrentMonth, goToPrevMonth, goToNextMonth, goToToday } =
    providerAvailabilitySlice.actions;
export default providerAvailabilitySlice.reducer;
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Calendar,
    FileDown,
    CheckCircle2,
    Ban,
    CalendarRange,
    Copy,
    RotateCcw,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "@/store";
import {
    fetchMonthAvailability,
    saveDayAvailability,
    setCurrentMonth,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
    AvailabilitySlot,
    TimeSlotKey,
} from "@/store/slices/providerAvailabilitySlice";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SLOT_DEFS: { key: TimeSlotKey; label: string; time: string; dot: string }[] = [
    { key: "MORNING", label: "Morning", time: "8AM - 12PM", dot: "bg-emerald-500" },
    { key: "AFTERNOON", label: "Afternoon", time: "12PM - 4PM", dot: "bg-amber-400" },
    { key: "EVENING", label: "Evening", time: "4PM - 8PM", dot: "bg-red-500" },
];

const ALL_PERIODS: TimeSlotKey[] = SLOT_DEFS.map((d) => d.key);

const REASON_OPTIONS = ["Personal Work", "Family Commitment", "Holiday", "Other"];

// Dropped "unknown" — a day with no saved rows is treated as fully available,
// not "not set", matching the backend's "missing row = available" convention.
type DayStatus = "all" | "partial" | "unavailable";

// Local, timezone-safe ISO formatter — d.toISOString() converts to UTC first,
// which can shift the date backward for UTC+ zones like Nepal (UTC+5:45)
// around local midnight. Always derive yyyy-MM-dd from local getters instead.
function isoDate(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

type GridCell = {
    iso: string;
    date: number;
    inMonth: boolean;
    isPast: boolean;
    isToday: boolean;
};

function buildMonthGrid(monthStartIso: string): GridCell[] {
    const monthStart = new Date(`${monthStartIso}T00:00:00`);
    const gridStart = new Date(monthStart);
    gridStart.setDate(gridStart.getDate() - gridStart.getDay());
    const todayIso = isoDate(new Date());

    const cells: GridCell[] = [];
    for (let i = 0; i < 42; i++) {
        const d = new Date(gridStart);
        d.setDate(gridStart.getDate() + i);
        const iso = isoDate(d);
        cells.push({
            iso,
            date: d.getDate(),
            inMonth: d.getMonth() === monthStart.getMonth(),
            isPast: iso < todayIso,
            isToday: iso === todayIso,
        });
    }
    return cells;
}

// A slot with no saved row defaults to available — same rule the backend
// applies (getMyAvailability only returns exceptions to "available by default").
function isSlotAvailable(slots: AvailabilitySlot[] | undefined, period: TimeSlotKey): boolean {
    const found = slots?.find((s) => s.period === period);
    return found ? found.isAvailable : true;
}

function dayStatus(slots: AvailabilitySlot[] | undefined): DayStatus {
    const availableCount = ALL_PERIODS.filter((period) => isSlotAvailable(slots, period)).length;
    if (availableCount === ALL_PERIODS.length) return "all";
    if (availableCount === 0) return "unavailable";
    return "partial";
}

const STATUS_LABEL: Record<DayStatus, { text: string; className: string }> = {
    all: { text: "Fully Available", className: "bg-emerald-50 text-emerald-600" },
    partial: { text: "Partially Available", className: "bg-amber-50 text-amber-600" },
    unavailable: { text: "Unavailable", className: "bg-red-50 text-red-600" },
};

/** Shared toggle switch — consistent across the whole settings module */
function ToggleSwitch({
                          checked,
                          onChange,
                          disabled = false,
                      }: {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onChange}
            disabled={disabled}
            aria-pressed={checked}
            className={`relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/40 disabled:cursor-not-allowed disabled:opacity-50 ${
                checked ? "bg-[#1e3a8a]" : "bg-slate-200"
            }`}
        >
            <span
                className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    checked ? "translate-x-5" : "translate-x-0"
                }`}
            />
        </button>
    );
}

interface DraftSlot {
    key: TimeSlotKey;
    enabled: boolean;
    reason: string;
}

export default function AvailabilityTab() {
    const dispatch = useDispatch<AppDispatch>();
    const { currentMonth, slotsByDate, status, saveStatus, error } = useSelector(
        (s: RootState) => s.providerAvailability,
    );

    const [selectedDay, setSelectedDay] = useState(() => isoDate(new Date()));
    const [draftSlots, setDraftSlots] = useState<DraftSlot[]>([]);
    const dateInputRef = useRef<HTMLInputElement>(null);

    const grid = useMemo(() => buildMonthGrid(currentMonth), [currentMonth]);

    const monthLabel = useMemo(
        () =>
            new Date(`${currentMonth}T00:00:00`).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
            }),
        [currentMonth],
    );

    const selectedDayLabel = useMemo(
        () =>
            new Date(`${selectedDay}T00:00:00`).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
            }),
        [selectedDay],
    );

    // Fetch this month's grid whenever the visible month changes.
    useEffect(() => {
        dispatch(fetchMonthAvailability(currentMonth));
    }, [dispatch, currentMonth]);

    // Rebuild the editable draft whenever the selected day changes, or once
    // fresh data for it arrives from the store. Local edits (toggle/reason)
    // live only in draftSlots until Save Changes is pressed.
    useEffect(() => {
        const existing = slotsByDate[selectedDay] ?? [];
        setDraftSlots(
            SLOT_DEFS.map((def) => {
                const found = existing.find((s) => s.period === def.key);
                return {
                    key: def.key,
                    // No data yet for this slot => assume available by default,
                    // matching a freshly onboarded provider's expected default.
                    enabled: found?.isAvailable ?? true,
                    reason: found?.reason ?? REASON_OPTIONS[0],
                };
            }),
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDay, slotsByDate[selectedDay]]);

    const toggleDraftSlot = (key: TimeSlotKey) => {
        setDraftSlots((prev) =>
            prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s)),
        );
    };

    const setDraftReason = (key: TimeSlotKey, reason: string) => {
        setDraftSlots((prev) => prev.map((s) => (s.key === key ? { ...s, reason } : s)));
    };

    const handleSave = async () => {
        const updates: AvailabilitySlot[] = draftSlots.map((s) => ({
            date: selectedDay,
            period: s.key,
            displayRange: SLOT_DEFS.find((d) => d.key === s.key)!.time,
            isAvailable: s.enabled,
            reason: s.enabled ? null : s.reason,
        }));
        const result = await dispatch(saveDayAvailability(updates));
        if (saveDayAvailability.fulfilled.match(result)) {
            toast.success("Availability updated.");
        } else {
            toast.error((result.payload as string) ?? "Failed to save availability.");
        }
    };

    /**
     * Bulk-sets every in-month, non-past day to fully available/unavailable.
     * The backend PATCH endpoint accepts a flat list of {date, period, ...}
     * updates spanning any dates, so this is a genuine single bulk request —
     * not a loop of per-day calls.
     */
    const handleBulkSetMonth = async (available: boolean) => {
        const updates: AvailabilitySlot[] = [];
        grid
            .filter((c) => c.inMonth && !c.isPast)
            .forEach((c) => {
                SLOT_DEFS.forEach((def) => {
                    updates.push({
                        date: c.iso,
                        period: def.key,
                        displayRange: def.time,
                        isAvailable: available,
                        reason: available ? null : "Other",
                    });
                });
            });
        if (updates.length === 0) return;
        const result = await dispatch(saveDayAvailability(updates));
        if (saveDayAvailability.fulfilled.match(result)) {
            toast.success(
                available
                    ? `All remaining days in ${monthLabel} marked available.`
                    : `All remaining days in ${monthLabel} marked unavailable.`,
            );
        } else {
            toast.error((result.payload as string) ?? "Bulk update failed.");
        }
    };

    const handleSelectDateClick = () => dateInputRef.current?.showPicker?.() ?? dateInputRef.current?.click();

    const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const iso = e.target.value;
        if (!iso) return;
        const monthStart = `${iso.slice(0, 7)}-01`;
        dispatch(setCurrentMonth(monthStart));
        setSelectedDay(iso);
    };

    const selectedStatus = dayStatus(slotsByDate[selectedDay]);

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Availability Calendar
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Manage your daily time slot availability.
                        </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500" /> All Available
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-400" /> Partially Available
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-red-500" /> Unavailable
                        </span>
                    </div>
                    <button
                        disabled
                        title="Bulk update across multiple days is coming soon"
                        className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
                    >
                        <FileDown className="h-4 w-4" />
                        Bulk Update
                    </button>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
                    {/* Calendar */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => dispatch(goToPrevMonth())}
                                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button
                                    onClick={() => dispatch(goToToday())}
                                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    Today
                                </button>
                                <button
                                    onClick={() => dispatch(goToNextMonth())}
                                    className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-sm font-semibold text-slate-800">{monthLabel}</p>
                            <div className="relative">
                                <button
                                    onClick={handleSelectDateClick}
                                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    <Calendar className="h-4 w-4" />
                                    Select Date
                                </button>
                                <input
                                    ref={dateInputRef}
                                    type="date"
                                    onChange={handleDateInputChange}
                                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    aria-hidden
                                    tabIndex={-1}
                                />
                            </div>
                        </div>

                        <div className="relative grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-slate-100">
                            {WEEKDAYS.map((d) => (
                                <div
                                    key={d}
                                    className="bg-slate-50 px-2 py-2 text-center text-xs font-medium text-slate-500"
                                >
                                    {d}
                                </div>
                            ))}

                            {grid.map((cell) => {
                                const isActive = cell.iso === selectedDay;
                                const isClickable = cell.inMonth && !cell.isPast;
                                const cellSlots = slotsByDate[cell.iso];

                                // Dot count == number of available slots for this day, not
                                // a fixed 3 always. A fully unavailable day gets a single
                                // red dot instead of three gray ones.
                                const availableDefs = SLOT_DEFS.filter((def) =>
                                    isSlotAvailable(cellSlots, def.key),
                                );

                                return (
                                    <button
                                        key={cell.iso}
                                        disabled={!isClickable}
                                        onClick={() => isClickable && setSelectedDay(cell.iso)}
                                        className={`flex h-[64px] flex-col items-center justify-center gap-1.5 px-1 py-2 transition-colors ${
                                            isActive
                                                ? "bg-[#1e3a8a] rounded-xl"
                                                : !cell.inMonth
                                                    ? "bg-white opacity-30"
                                                    : cell.isPast
                                                        ? "bg-white opacity-40"
                                                        : "bg-white hover:bg-slate-50"
                                        } ${!isClickable ? "cursor-default" : "cursor-pointer"}`}
                                    >
                                        <span
                                            className={`text-sm ${
                                                isActive
                                                    ? "font-semibold text-white"
                                                    : !cell.inMonth
                                                        ? "text-slate-300"
                                                        : cell.isPast
                                                            ? "font-normal text-slate-400"
                                                            : cell.isToday
                                                                ? "font-bold text-[#e8683f]"
                                                                : "font-medium text-slate-700"
                                            }`}
                                        >
                                            {cell.date}
                                        </span>

                                        {cell.inMonth && !cell.isPast && (
                                            availableDefs.length === 0 ? (
                                                <span className="flex gap-0.5">
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            isActive ? "bg-white/70" : "bg-red-500"
                                                        }`}
                                                    />
                                                </span>
                                            ) : (
                                                <span className="flex gap-0.5">
                                                    {availableDefs.map((def) => (
                                                        <span
                                                            key={def.key}
                                                            className={`h-1.5 w-1.5 rounded-full ${
                                                                isActive ? "bg-white/70" : "bg-emerald-500"
                                                            }`}
                                                        />
                                                    ))}
                                                </span>
                                            )
                                        )}
                                    </button>
                                );
                            })}

                            {status === "loading" && (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/60 text-sm text-slate-400">
                                    Loading availability…
                                </div>
                            )}
                        </div>

                        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                Each day has 3 time slots:
                            </span>
                            {SLOT_DEFS.map((def) => (
                                <span key={def.key} className="flex items-center gap-1">
                                    <span className={`h-2 w-2 rounded-full ${def.dot}`} /> {def.label} (
                                    {def.time})
                                </span>
                            ))}
                        </p>

                        {/* Quick actions */}
                        <div className="mt-5 rounded-xl border border-slate-200 p-4">
                            <p className="mb-3 text-sm font-semibold text-slate-800">Quick Actions</p>
                            <p className="mb-3 text-xs text-slate-400">
                                Applies to every remaining day in {monthLabel}.
                            </p>
                            <div className="flex flex-wrap gap-5 text-sm text-slate-600">
                                <button
                                    onClick={() => handleBulkSetMonth(true)}
                                    disabled={saveStatus === "saving"}
                                    className="flex items-center gap-1.5 hover:text-[#1e3a8a] disabled:opacity-50"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    Make All Available
                                </button>
                                <button
                                    onClick={() => handleBulkSetMonth(false)}
                                    disabled={saveStatus === "saving"}
                                    className="flex items-center gap-1.5 hover:text-[#1e3a8a] disabled:opacity-50"
                                >
                                    <Ban className="h-4 w-4 text-red-500" />
                                    Make All Unavailable
                                </button>
                                <button
                                    disabled
                                    title="Coming soon"
                                    className="flex items-center gap-1.5 text-slate-400 cursor-not-allowed"
                                >
                                    <CalendarRange className="h-4 w-4" />
                                    Custom Time Range
                                </button>
                                <button
                                    disabled
                                    title="Coming soon"
                                    className="flex items-center gap-1.5 text-slate-400 cursor-not-allowed"
                                >
                                    <Copy className="h-4 w-4" />
                                    Copy Availability
                                </button>
                                <button
                                    onClick={() => handleBulkSetMonth(true)}
                                    disabled={saveStatus === "saving"}
                                    title="Resets every remaining day this month back to fully available"
                                    className="flex items-center gap-1.5 hover:text-[#1e3a8a] disabled:opacity-50"
                                >
                                    <RotateCcw className="h-4 w-4 text-[#e8683f]" />
                                    Reset Calendar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Day detail sidebar */}
                    <div className="rounded-xl border border-slate-200 p-5">
                        <p className="text-sm font-semibold text-slate-800">{selectedDayLabel}</p>

                        <p className="mb-1.5 mt-4 text-xs text-slate-500">Overall Status</p>
                        <span
                            className={`mb-5 inline-block rounded-md px-2.5 py-1 text-xs font-medium ${STATUS_LABEL[selectedStatus].className}`}
                        >
                            {STATUS_LABEL[selectedStatus].text}
                        </span>

                        <p className="mb-3 text-sm font-semibold text-slate-800">Time Slots</p>

                        <div className="space-y-4">
                            {draftSlots.map((slot) => {
                                const def = SLOT_DEFS.find((d) => d.key === slot.key)!;
                                return (
                                    <div key={slot.key} className="rounded-lg border border-slate-100 p-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                                <span className={`h-2 w-2 rounded-full ${def.dot}`} />
                                                {def.label} ({def.time})
                                            </span>
                                            <ToggleSwitch
                                                checked={slot.enabled}
                                                onChange={() => toggleDraftSlot(slot.key)}
                                            />
                                        </div>

                                        {slot.enabled ? (
                                            <p className="mt-1.5 text-xs font-medium text-emerald-600">
                                                Available
                                            </p>
                                        ) : (
                                            <div className="mt-2.5">
                                                <p className="mb-1 text-xs text-slate-400">Reason</p>
                                                <select
                                                    value={slot.reason}
                                                    onChange={(e) => setDraftReason(slot.key, e.target.value)}
                                                    className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-600 outline-none focus:border-[#1e3a8a]"
                                                >
                                                    {REASON_OPTIONS.map((r) => (
                                                        <option key={r}>{r}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={saveStatus === "saving"}
                            className="mt-5 w-full rounded-lg bg-[#e8683f] py-2.5 text-sm font-medium text-white hover:bg-[#d95c34] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saveStatus === "saving" ? "Saving…" : "Save Changes"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import type { AppDispatch, RootState } from "@/store";
import { fetchProviderProfile } from "@/store/slices/providerProfileSlice";
import {
    fetchScheduleSettings,
    saveScheduleSettings,
    ScheduleSettings,
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

type DayStatus = "all" | "partial" | "unavailable";

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

type UnlockBlocker =
    | "PROVIDER_INACTIVE"
    | "VERIFICATION_REQUIRED"
    | "ONBOARDING_INCOMPLETE"
    | "SUBSCRIPTION_REQUIRED"
    | null;

const BLOCKER_COPY: Record<Exclude<UnlockBlocker, null>, { title: string; body: string; showPlansLink: boolean }> = {
    PROVIDER_INACTIVE: {
        title: "Your account isn't active.",
        body: "Contact support to reactivate your provider account.",
        showPlansLink: false,
    },
    VERIFICATION_REQUIRED: {
        title: "KYC verification required.",
        body: "Complete your identity verification to accept Business & Pro orders.",
        showPlansLink: false,
    },
    ONBOARDING_INCOMPLETE: {
        title: "Finish setting up your profile.",
        body: "Complete onboarding to accept Business & Pro orders.",
        showPlansLink: false,
    },
    SUBSCRIPTION_REQUIRED: {
        title: "Not available on the Free Trial.",
        body: "Activate a paid subscription to accept Business & Pro orders.",
        showPlansLink: true,
    },
};

export default function AvailabilityTab() {
    const dispatch = useDispatch<AppDispatch>();
    const { currentMonth, slotsByDate, status, saveStatus, error } = useSelector(
        (s: RootState) => s.providerAvailability,
    );

    const { data: subscription } = useSelector((s: RootState) => s.providerSubscription);
    const isPaidPlan = Boolean(subscription?.planType && subscription.planType !== "FREE_TRIAL");
    const hasActivePaidPlan = Boolean(subscription?.isActive && isPaidPlan);

    const providerProfile = useSelector((s: RootState) => s.providerProfile?.data);
    const isAccountActive = Boolean(providerProfile?.isActive);
    const isVerified = Boolean(providerProfile?.isVerified);
    const hasCompletedOnboarding = Boolean(providerProfile?.hasCompletedOnboarding);

    const unlockBlocker: UnlockBlocker = !isAccountActive
        ? "PROVIDER_INACTIVE"
        : !isVerified
            ? "VERIFICATION_REQUIRED"
            : !hasCompletedOnboarding
                ? "ONBOARDING_INCOMPLETE"
                : !hasActivePaidPlan
                    ? "SUBSCRIPTION_REQUIRED"
                    : null;

    const proOrdersUnlocked = unlockBlocker === null;

    const [selectedDay, setSelectedDay] = useState(() => isoDate(new Date()));
    const [draftSlots, setDraftSlots] = useState<DraftSlot[]>([]);

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
    const { settings, settingsSaveStatus } = useSelector((s: RootState) => s.providerAvailability);
    const [draftSettings, setDraftSettings] = useState<ScheduleSettings>({
        workingDays: [0, 1, 2, 3, 4, 5, 6],
        defaultSlots: ["MORNING", "AFTERNOON", "EVENING"],
        acceptsProOrders: false,
    });

    useEffect(() => {
        dispatch(fetchScheduleSettings());
        dispatch(fetchProviderProfile());
    }, [dispatch]);

    useEffect(() => {
        if (settings) {
            setDraftSettings({
                workingDays: settings.workingDays || [],
                defaultSlots: settings.defaultSlots || [],
                acceptsProOrders: !!settings.acceptsProOrders,
            });
        }
    }, [settings]);

    const toggleDay = (dow: number) => {
        setDraftSettings((prev) => {
            const workingDays = prev?.workingDays || [];
            return {
                ...prev,
                workingDays: workingDays.includes(dow)
                    ? workingDays.filter((d) => d !== dow)
                    : [...workingDays, dow],
            };
        });
    };

    const toggleDefaultSlot = (key: TimeSlotKey) => {
        setDraftSettings((prev) => {
            const defaultSlots = prev?.defaultSlots || [];
            return {
                ...prev,
                defaultSlots: defaultSlots.includes(key)
                    ? defaultSlots.filter((s) => s !== key)
                    : [...defaultSlots, key],
            };
        });
    };

    const toggleAcceptsProOrders = async () => {
        if (!proOrdersUnlocked) return;
        const newAccepts = !draftSettings.acceptsProOrders;
        const nextSettings = { ...draftSettings, acceptsProOrders: newAccepts };
        setDraftSettings(nextSettings);

        const result = await dispatch(saveScheduleSettings(nextSettings));
        if (saveScheduleSettings.fulfilled.match(result)) {
            toast.success(newAccepts ? "Accepting Business & Pro orders enabled." : "Accepting Business & Pro orders disabled.");
            dispatch(fetchMonthAvailability(currentMonth));
        } else {
            toast.error((result.payload as string) ?? "Failed to update settings.");
            setDraftSettings(settings);
        }
    };

    const handleSaveSettings = async () => {
        const settingsToSave = {
            ...draftSettings,
            acceptsProOrders: proOrdersUnlocked && draftSettings.acceptsProOrders,
        };
        const result = await dispatch(saveScheduleSettings(settingsToSave));
        if (saveScheduleSettings.fulfilled.match(result)) {
            toast.success("Weekly schedule updated.");
            dispatch(fetchMonthAvailability(currentMonth));
        } else {
            toast.error((result.payload as string) ?? "Failed to save weekly pattern.");
            setDraftSettings(settings);
        }
    };

    useEffect(() => {
        dispatch(fetchMonthAvailability(currentMonth));
    }, [dispatch, currentMonth]);

    useEffect(() => {
        const existing = slotsByDate[selectedDay] ?? [];
        setDraftSlots(
            SLOT_DEFS.map((def) => {
                const found = existing.find((s) => s.period === def.key);
                return {
                    key: def.key,
                    enabled: found?.isAvailable ?? true,
                    reason: found?.reason ?? REASON_OPTIONS[0],
                };
            }),
        );
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

    const selectedStatus = dayStatus(slotsByDate[selectedDay]);
    const displayAcceptsProOrders = proOrdersUnlocked && draftSettings.acceptsProOrders;

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
                            <div className="w-[100px]" />
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
                                <Lock className="h-3.5 w-3.5" />
                                Each day has 3 time slots:
                            </span>
                            {SLOT_DEFS.map((def) => (
                                <span key={def.key} className="flex items-center gap-1">
                                    <span className={`h-2 w-2 rounded-full ${def.dot}`} /> {def.label} (
                                    {def.time})
                                </span>
                            ))}
                        </p>
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

                {/* Weekly working pattern */}
                <div className="mt-6 rounded-xl border border-slate-200 p-4 sm:p-5">
                    <p className="mb-1 text-sm font-semibold text-slate-800">Weekly Working Pattern</p>
                    <p className="mb-4 text-xs text-slate-400">
                        Pick your working days and which slots you generally take. Calendar overrides above always win.
                    </p>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                            <p className="mb-1.5 text-xs font-medium text-slate-500">Working days</p>
                            <div className="flex flex-wrap gap-1.5">
                                {WEEKDAYS.map((label, dow) => {
                                    const workingDays = draftSettings?.workingDays || [];
                                    const isActive = workingDays.includes(dow);
                                    return (
                                        <button
                                            key={label}
                                            onClick={() => toggleDay(dow)}
                                            className={`rounded-full border px-3 py-1 text-xs font-medium ${
                                                isActive
                                                    ? "border-[#1e3a8a] bg-[#1e3a8a] text-white"
                                                    : "border-slate-200 bg-white text-slate-500"
                                            }`}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div>
                            <p className="mb-1.5 text-xs font-medium text-slate-500">Default slots</p>
                            <div className="flex flex-wrap gap-1.5">
                                {SLOT_DEFS.map((def) => {
                                    const defaultSlots = draftSettings?.defaultSlots || [];
                                    const isActive = defaultSlots.includes(def.key);
                                    return (
                                        <button
                                            key={def.key}
                                            onClick={() => toggleDefaultSlot(def.key)}
                                            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${
                                                isActive
                                                    ? "border-[#1e3a8a] bg-[#1e3a8a] text-white"
                                                    : "border-slate-200 bg-white text-slate-500"
                                            }`}
                                        >
                                            <span className={`h-1.5 w-1.5 rounded-full ${def.dot}`} />
                                            {def.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="rounded-lg border border-slate-100 p-3 sm:col-span-2 lg:col-span-1">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-1.5">
                                    <p className="text-sm font-medium text-slate-700">Accept Business &amp; Pro Orders</p>
                                    {!proOrdersUnlocked && <Lock className="h-3.5 w-3.5 text-slate-400" />}
                                </div>
                                <ToggleSwitch
                                    checked={displayAcceptsProOrders}
                                    onChange={toggleAcceptsProOrders}
                                    disabled={!proOrdersUnlocked}
                                />
                            </div>

                            {proOrdersUnlocked ? (
                                <p className="mt-1 text-xs text-slate-400">
                                    Lets ServiceLink assign you to bulk / corporate bookings.
                                </p>
                            ) : (
                                <div className="mt-2 rounded-md bg-amber-50 px-2.5 py-2 text-xs text-amber-700">
                                    <p className="font-medium">
                                        {BLOCKER_COPY[unlockBlocker!].title}
                                    </p>
                                    <p className="mt-0.5 text-amber-600">
                                        {BLOCKER_COPY[unlockBlocker!].body}
                                    </p>
                                    {BLOCKER_COPY[unlockBlocker!].showPlansLink && (
                                        <Link
                                            href="/dashboard/provider/subscription"
                                            className="mt-1.5 inline-block font-semibold text-[#1e3a8a] hover:underline"
                                        >
                                            View plans →
                                        </Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={handleSaveSettings}
                        disabled={settingsSaveStatus === "saving"}
                        className="mt-5 rounded-lg bg-[#1e3a8a] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    >
                        {settingsSaveStatus === "saving" ? "Saving…" : "Save Weekly Pattern"}
                    </button>
                </div>
            </div>
        </div>
    );
}

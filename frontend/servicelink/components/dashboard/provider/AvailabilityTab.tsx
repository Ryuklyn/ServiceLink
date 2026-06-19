"use client";

import { useState } from "react";
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

type DayStatus = "all" | "partial" | "unavailable" | "empty";

type DayCell = {
    date: number;
    bsLabel: string;
    status: DayStatus;
    inMonth: boolean;
    isPast: boolean;
};

// Static reference calendar laid out to match the screenshot (May 2024)
// "Today" is treated as May 17 — everything before it is rendered as past/transparent.
const CALENDAR: DayCell[][] = [
    [
        { date: 28, bsLabel: "15 Baisakh", status: "all", inMonth: false, isPast: true },
        { date: 29, bsLabel: "16 Baisakh", status: "all", inMonth: false, isPast: true },
        { date: 30, bsLabel: "17 Baisakh", status: "partial", inMonth: false, isPast: true },
        { date: 1, bsLabel: "18 Baisakh", status: "all", inMonth: true, isPast: true },
        { date: 2, bsLabel: "19 Baisakh", status: "all", inMonth: true, isPast: true },
        { date: 3, bsLabel: "20 Baisakh", status: "all", inMonth: true, isPast: true },
        { date: 4, bsLabel: "21 Baisakh", status: "all", inMonth: true, isPast: true },
    ],
    [
        { date: 5, bsLabel: "22 Baisakh", status: "partial", inMonth: true, isPast: true },
        { date: 6, bsLabel: "23 Baisakh", status: "all", inMonth: true, isPast: true },
        { date: 7, bsLabel: "24 Baisakh", status: "partial", inMonth: true, isPast: true },
        { date: 8, bsLabel: "25 Baisakh", status: "unavailable", inMonth: true, isPast: true },
        { date: 9, bsLabel: "26 Baisakh", status: "all", inMonth: true, isPast: true },
        { date: 10, bsLabel: "28 Baisakh", status: "all", inMonth: true, isPast: true },
        { date: 11, bsLabel: "28 Baisakh", status: "all", inMonth: true, isPast: true },
    ],
    [
        { date: 12, bsLabel: "29 Baisakh", status: "partial", inMonth: true, isPast: true },
        { date: 13, bsLabel: "30 Baisakh", status: "all", inMonth: true, isPast: true },
        { date: 14, bsLabel: "31 Baisakh", status: "unavailable", inMonth: true, isPast: true },
        { date: 15, bsLabel: "1 Jestha", status: "partial", inMonth: true, isPast: true },
        { date: 16, bsLabel: "2 Jestha", status: "all", inMonth: true, isPast: true },
        { date: 17, bsLabel: "3 Jestha", status: "all", inMonth: true, isPast: false },
        { date: 18, bsLabel: "4 Jestha", status: "all", inMonth: true, isPast: false },
    ],
    [
        { date: 19, bsLabel: "5 Jestha", status: "all", inMonth: true, isPast: false },
        { date: 20, bsLabel: "6 Jestha", status: "all", inMonth: true, isPast: false },
        { date: 21, bsLabel: "7 Jestha", status: "partial", inMonth: true, isPast: false },
        { date: 22, bsLabel: "8 Jestha", status: "all", inMonth: true, isPast: false },
        { date: 23, bsLabel: "9 Jestha", status: "partial", inMonth: true, isPast: false },
        { date: 24, bsLabel: "10 Jestha", status: "all", inMonth: true, isPast: false },
        { date: 25, bsLabel: "11 Jestha", status: "unavailable", inMonth: true, isPast: false },
    ],
    [
        { date: 26, bsLabel: "12 Jestha", status: "all", inMonth: true, isPast: false },
        { date: 27, bsLabel: "13 Jestha", status: "unavailable", inMonth: true, isPast: false },
        { date: 28, bsLabel: "14 Jestha", status: "all", inMonth: true, isPast: false },
        { date: 29, bsLabel: "15 Jestha", status: "all", inMonth: true, isPast: false },
        { date: 30, bsLabel: "16 Jestha", status: "all", inMonth: true, isPast: false },
        { date: 31, bsLabel: "17 Jestha", status: "partial", inMonth: true, isPast: false },
        { date: 1, bsLabel: "18 Jestha", status: "empty", inMonth: false, isPast: false },
    ],
];

const STATUS_DOT: Record<DayStatus, string> = {
    all: "bg-emerald-500",
    partial: "bg-amber-400",
    unavailable: "bg-red-500",
    empty: "bg-slate-200",
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type SlotKey = "morning" | "afternoon" | "evening";

type Slot = {
    key: SlotKey;
    label: string;
    time: string;
    dot: string;
    enabled: boolean;
    reason: string;
};

/** Shared toggle switch — consistent across the whole settings module */
function ToggleSwitch({
                          checked,
                          onChange,
                      }: {
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onChange}
            aria-pressed={checked}
            className={`relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/40 ${
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

export default function AvailabilityTab() {
    const [selectedDay, setSelectedDay] = useState({
        date: 17,
        bsLabel: "3 Jestha",
        bsFull: "3 Jestha 2081",
    });

    const [slots, setSlots] = useState<Slot[]>([
        {
            key: "morning",
            label: "Morning",
            time: "8AM - 12PM",
            dot: "bg-emerald-500",
            enabled: true,
            reason: "",
        },
        {
            key: "afternoon",
            label: "Afternoon",
            time: "12PM - 4PM",
            dot: "bg-amber-400",
            enabled: false,
            reason: "Personal Work",
        },
        {
            key: "evening",
            label: "Evening",
            time: "4PM - 8PM",
            dot: "bg-red-500",
            enabled: false,
            reason: "Family Commitment",
        },
    ]);

    const toggleSlot = (key: SlotKey) => {
        setSlots((prev) =>
            prev.map((s) => (s.key === key ? { ...s, enabled: !s.enabled } : s))
        );
    };

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
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> All
              Available
            </span>
                        <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> Partially
              Available
            </span>
                        <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-red-500" /> Unavailable
            </span>
                    </div>
                    <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-[#1e3a8a] hover:bg-slate-50">
                        <FileDown className="h-4 w-4" />
                        Bulk Update
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
                    {/* Calendar */}
                    <div>
                        <div className="mb-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                                    Today
                                </button>
                                <button className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-50">
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                            <p className="text-sm font-semibold text-slate-800">
                                May 2024 (Baisakh-Jestha 2081)
                            </p>
                            <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">
                                <Calendar className="h-4 w-4" />
                                Select Date
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-slate-100">
                            {WEEKDAYS.map((d) => (
                                <div
                                    key={d}
                                    className="bg-slate-50 px-2 py-2 text-center text-xs font-medium text-slate-500"
                                >
                                    {d}
                                </div>
                            ))}

                            {CALENDAR.flat().map((cell, i) => {
                                const isActive =
                                    cell.inMonth &&
                                    cell.date === selectedDay.date &&
                                    cell.bsLabel === selectedDay.bsLabel;
                                const isClickable = cell.status !== "empty" && !cell.isPast;

                                return (
                                    <button
                                        key={i}
                                        disabled={!isClickable}
                                        onClick={() =>
                                            isClickable &&
                                            setSelectedDay({
                                                date: cell.date,
                                                bsLabel: cell.bsLabel,
                                                bsFull: `${cell.bsLabel} 2081`,
                                            })
                                        }
                                        className={`flex h-[64px] flex-col items-center justify-center gap-1.5 px-1 py-2 transition-colors ${
                                            isActive
                                                ? "bg-[#1e3a8a] rounded-xl"
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
                                        : "font-medium text-slate-700"
                        }`}
                    >
                      {cell.date}
                    </span>
                                        <span
                                            className={`text-[10px] ${
                                                isActive ? "text-white/70" : "text-slate-400"
                                            }`}
                                        >
                      {cell.bsLabel}
                    </span>
                                        {cell.status !== "empty" && (
                                            <span className="flex gap-0.5">
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${
                                isActive ? "bg-white/80" : STATUS_DOT[cell.status]
                            }`}
                        />
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${
                                isActive
                                    ? "bg-white/50"
                                    : cell.status === "all"
                                        ? "bg-emerald-500"
                                        : cell.status === "partial"
                                            ? "bg-amber-400"
                                            : "bg-red-500"
                            }`}
                        />
                        <span
                            className={`h-1.5 w-1.5 rounded-full ${
                                isActive
                                    ? "bg-white/30"
                                    : cell.status === "all"
                                        ? "bg-emerald-500"
                                        : "bg-slate-200"
                            }`}
                        />
                      </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Each day has 3 time slots:
              </span>
                            <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Morning
                (8AM-12PM)
              </span>
                            <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-400" /> Afternoon
                (12PM-4PM)
              </span>
                            <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-red-500" /> Evening
                (4PM-8PM)
              </span>
                        </p>

                        {/* Quick actions */}
                        <div className="mt-5 rounded-xl border border-slate-200 p-4">
                            <p className="mb-3 text-sm font-semibold text-slate-800">
                                Quick Actions
                            </p>
                            <p className="mb-3 text-xs text-slate-400">
                                Manage your availability with one click.
                            </p>
                            <div className="flex flex-wrap gap-5 text-sm text-slate-600">
                                <button className="flex items-center gap-1.5 hover:text-[#1e3a8a]">
                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                    Make All Available
                                </button>
                                <button className="flex items-center gap-1.5 hover:text-[#1e3a8a]">
                                    <Ban className="h-4 w-4 text-red-500" />
                                    Make All Unavailable
                                </button>
                                <button className="flex items-center gap-1.5 hover:text-[#1e3a8a]">
                                    <CalendarRange className="h-4 w-4 text-[#1e3a8a]" />
                                    Custom Time Range
                                </button>
                                <button className="flex items-center gap-1.5 hover:text-[#1e3a8a]">
                                    <Copy className="h-4 w-4 text-[#1e3a8a]" />
                                    Copy Availability
                                </button>
                                <button className="flex items-center gap-1.5 hover:text-[#1e3a8a]">
                                    <RotateCcw className="h-4 w-4 text-[#e8683f]" />
                                    Reset Calendar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Day detail sidebar */}
                    <div className="rounded-xl border border-slate-200 p-5">
                        <p className="text-sm font-semibold text-slate-800">
                            Friday, May {selectedDay.date}, 2024
                        </p>
                        <p className="mb-4 text-xs text-slate-400">{selectedDay.bsFull}</p>

                        <p className="mb-1.5 text-xs text-slate-500">Overall Status</p>
                        <span className="mb-5 inline-block rounded-md bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
              Partially Available
            </span>

                        <p className="mb-3 text-sm font-semibold text-slate-800">
                            Time Slots
                        </p>

                        <div className="space-y-4">
                            {slots.map((slot) => (
                                <div
                                    key={slot.key}
                                    className="rounded-lg border border-slate-100 p-3"
                                >
                                    <div className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-sm font-medium text-slate-700">
                      <span className={`h-2 w-2 rounded-full ${slot.dot}`} />
                        {slot.label} ({slot.time})
                    </span>
                                        <ToggleSwitch
                                            checked={slot.enabled}
                                            onChange={() => toggleSlot(slot.key)}
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
                                                onChange={(e) =>
                                                    setSlots((prev) =>
                                                        prev.map((s) =>
                                                            s.key === slot.key
                                                                ? { ...s, reason: e.target.value }
                                                                : s
                                                        )
                                                    )
                                                }
                                                className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-600 outline-none focus:border-[#1e3a8a]"
                                            >
                                                <option>Personal Work</option>
                                                <option>Family Commitment</option>
                                                <option>Holiday</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button className="mt-5 w-full rounded-lg bg-[#e8683f] py-2.5 text-sm font-medium text-white hover:bg-[#d95c34]">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
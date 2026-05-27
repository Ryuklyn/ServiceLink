"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Sun, Sunset, Moon } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface AvailabilityCalendarProps {
  onDateChange?: (date: number) => void;
  onPeriodChange?: (period: "morning" | "afternoon" | "evening" | null) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// Mock Calendar Data
// ─────────────────────────────────────────────────────────────────────────────

const CALENDAR_DATA: Record<
  number,
  {
    dayName: string;
    hasSlots: boolean;
    slots: {
      id: string;
      period: "morning" | "afternoon" | "evening";
      available: boolean;
    }[];
  }
> = {
  26: {
    dayName: "Mon",
    hasSlots: true,
    slots: [
      { id: "m1", period: "morning", available: true },
      { id: "a1", period: "afternoon", available: true },
      { id: "e1", period: "evening", available: false },
    ],
  },

  27: {
    dayName: "Tue",
    hasSlots: true,
    slots: [
      { id: "m2", period: "morning", available: true },
      { id: "a2", period: "afternoon", available: false },
      { id: "e2", period: "evening", available: false },
    ],
  },

  28: {
    dayName: "Wed",
    hasSlots: false,
    slots: [
      { id: "m3", period: "morning", available: false },
      { id: "a3", period: "afternoon", available: false },
      { id: "e3", period: "evening", available: false },
    ],
  },

  29: {
    dayName: "Thu",
    hasSlots: true,
    slots: [
      { id: "m4", period: "morning", available: true },
      { id: "a4", period: "afternoon", available: true },
      { id: "e4", period: "evening", available: true },
    ],
  },

  30: {
    dayName: "Fri",
    hasSlots: true,
    slots: [
      { id: "m5", period: "morning", available: false },
      { id: "a5", period: "afternoon", available: true },
      { id: "e5", period: "evening", available: false },
    ],
  },

  31: {
    dayName: "Sat",
    hasSlots: true,
    slots: [
      { id: "m6", period: "morning", available: true },
      { id: "a6", period: "afternoon", available: true },
      { id: "e6", period: "evening", available: false },
    ],
  },

  1: {
    dayName: "Sun",
    hasSlots: true,
    slots: [
      { id: "m7", period: "morning", available: true },
      { id: "a7", period: "afternoon", available: false },
      { id: "e7", period: "evening", available: false },
    ],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Slot Config
// ─────────────────────────────────────────────────────────────────────────────

const TIME_SLOT_DESCRIPTORS = {
  morning: {
    label: "Morning",
    time: "8:00 AM - 12:00 PM",
    icon: Sun,
  },

  afternoon: {
    label: "Afternoon",
    time: "12:00 PM - 5:00 PM",
    icon: Sunset,
  },

  evening: {
    label: "Evening",
    time: "5:00 PM - 8:00 PM",
    icon: Moon,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export default function AvailabilityCalendar({
  onDateChange,
  onPeriodChange,
}: AvailabilityCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<number>(26);

  const [selectedSlot, setSelectedSlot] = useState<string | null>("a1");

  const currentDayData = CALENDAR_DATA[selectedDate];

  // ─────────────────────────────────────────────────────────────────────────

  const handleDateChange = (date: number, hasSlots: boolean) => {
    if (!hasSlots) return;

    setSelectedDate(date);

    // Auto-select first available slot
    const firstAvailable = CALENDAR_DATA[date].slots.find((s) => s.available);

    setSelectedSlot(firstAvailable ? firstAvailable.id : null);

    // Lift state up to parent
    onDateChange?.(date);

    onPeriodChange?.(firstAvailable?.period ?? null);
  };

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm max-w-4xl w-full select-none">
      {/* Header */}
      <h2 className="text-xl font-bold text-slate-900 mb-6">Select Schedule</h2>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6 px-1">
        <button className="p-2 text-slate-800 hover:bg-slate-50 rounded-full transition-colors">
          <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
        </button>

        <span className="font-bold text-slate-800 text-base">May 2026</span>

        <button className="p-2 text-slate-800 hover:bg-slate-50 rounded-full transition-colors">
          <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2.5 mb-8">
        {Object.entries(CALENDAR_DATA).map(([dateStr, details]) => {
          const dateNum = Number(dateStr);

          const isSelected = selectedDate === dateNum;

          const hasSlots = details.hasSlots;

          return (
            <button
              key={dateStr}
              disabled={!hasSlots}
              onClick={() => handleDateChange(dateNum, hasSlots)}
              className={`flex flex-col items-center justify-center py-4 px-2 rounded-2xl transition-all duration-200 relative ${
                isSelected
                  ? "bg-[#1e3a8a] text-white shadow-md shadow-blue-900/10 scale-[1.02]"
                  : hasSlots
                    ? "bg-[#f1f3f5] text-slate-700 hover:bg-slate-100"
                    : "bg-[#f1f5f8] text-slate-300 cursor-not-allowed opacity-60"
              }`}
            >
              <span
                className={`text-xs font-semibold mb-1 ${
                  isSelected ? "text-white/80" : "text-slate-500"
                }`}
              >
                {details.dayName}
              </span>

              <span className="text-xl font-bold tracking-tight mb-2">
                {dateNum}
              </span>

              {hasSlots && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Slots */}
      <div>
        <h3 className="text-sm font-semibold text-slate-400 mb-4">
          Available Time Slots
        </h3>

        <div className="flex flex-col gap-3">
          {currentDayData?.slots.map((slot) => {
            const config = TIME_SLOT_DESCRIPTORS[slot.period];

            const IconComponent = config.icon;

            const isSlotSelected = selectedSlot === slot.id;

            return (
              <button
                key={slot.id}
                disabled={!slot.available}
                onClick={() => {
                  setSelectedSlot(slot.id);

                  // Lift selected period up
                  onPeriodChange?.(slot.period);
                }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 border text-left ${
                  isSlotSelected
                    ? "bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-md"
                    : slot.available
                      ? "bg-[#f8fafc] border-slate-100 text-slate-700 hover:bg-slate-100/80"
                      : "bg-[#f1f5f8] border-slate-100 text-slate-300 opacity-40 cursor-not-allowed"
                }`}
              >
                {/* Left */}
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2.5 rounded-xl border ${
                      isSlotSelected
                        ? "bg-white/10 border-white/10 text-white"
                        : slot.available
                          ? "bg-white border-slate-100 text-slate-700"
                          : "bg-slate-50 border-slate-50 text-slate-300"
                    }`}
                  >
                    <IconComponent className="w-5 h-5" strokeWidth={2} />
                  </div>

                  <div className="flex flex-col">
                    <span className="font-bold text-base">{config.label}</span>

                    <span
                      className={`text-xs ${
                        isSlotSelected ? "text-white/70" : "text-slate-400"
                      }`}
                    >
                      {config.time}
                    </span>
                  </div>
                </div>

                {/* Right */}
                <div>
                  {isSlotSelected ? (
                    <div className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white" />
                    </div>
                  ) : slot.available ? (
                    <div className="w-3 h-3 rounded-full bg-[#10b981]" />
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

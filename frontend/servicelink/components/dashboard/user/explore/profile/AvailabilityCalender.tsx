"use client";
import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  CalendarDays,
  X,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AvailabilityCalendarProps {
  onDateChange?: (date: Date) => void;
  onPeriodChange?: (period: "morning" | "afternoon" | "evening" | null) => void;
}

interface DaySlot {
  id: string;
  period: "morning" | "afternoon" | "evening";
  available: boolean;
}

interface DayData {
  slots: DaySlot[];
}

// ─── Nepali BS Calendar Conversion (simplified Vikram Sambat) ─────────────────
// Approximate AD->BS conversion. For production use a full lookup table.
const BS_MONTHS = [
  "Baisakh","Jestha","Ashadh","Shrawan","Bhadra","Ashwin",
  "Kartik","Mangsir","Poush","Magh","Falgun","Chaitra",
];

// Nepali digit names for dates 1–32
const NEPALI_DAY_NAMES = [
  "","Ek","Dui","Teen","Char","Paanch","Chha","Saat","Aath","Nau","Das",
  "Egara","Bahra","Tera","Chaudha","Pandhra","Sora","Satra","Athra","Unnaais","Bees",
  "Ekaais","Baaais","Teis","Chauwis","Pachis","Chhabbis","Sattaais","Athaais","Unantees","Tees",
  "Ikattees","Battees",
];

function adToBS(adDate: Date): { day: number; month: number; year: number; dayName: string } {
  // Simplified offset: BS is roughly AD + 56 years and ~8.5 months
  const adYear = adDate.getFullYear();
  const adMonth = adDate.getMonth(); // 0-indexed
  const adDay = adDate.getDate();

  let bsYear = adYear + 56;
  let bsMonth = adMonth + 9; // rough offset
  let bsDay = adDay + 17;    // rough offset

  // Normalize
  if (bsDay > 32) { bsDay -= 32; bsMonth += 1; }
  if (bsMonth >= 12) { bsMonth -= 12; bsYear += 1; }

  const dayName = NEPALI_DAY_NAMES[bsDay] ?? String(bsDay);
  return { day: bsDay, month: bsMonth, year: bsYear, dayName };
}

// ─── Mock Slot Data Generator ──────────────────────────────────────────────────
// In production, fetch this from your API keyed by ISO date string.
const SLOT_PRESETS: DaySlot[][] = [
  [ // all available
    { id: "m", period: "morning",   available: true  },
    { id: "a", period: "afternoon", available: true  },
    { id: "e", period: "evening",   available: true  },
  ],
  [ // morning + afternoon
    { id: "m", period: "morning",   available: true  },
    { id: "a", period: "afternoon", available: true  },
    { id: "e", period: "evening",   available: false },
  ],
  [ // morning only
    { id: "m", period: "morning",   available: true  },
    { id: "a", period: "afternoon", available: false },
    { id: "e", period: "evening",   available: false },
  ],
  [ // none
    { id: "m", period: "morning",   available: false },
    { id: "a", period: "afternoon", available: false },
    { id: "e", period: "evening",   available: false },
  ],
  [ // afternoon + evening
    { id: "m", period: "morning",   available: false },
    { id: "a", period: "afternoon", available: true  },
    { id: "e", period: "evening",   available: true  },
  ],
];

function getSlotsForDate(date: Date): DaySlot[] {
  // Deterministically assign a preset based on day-of-month so it looks realistic
  const d = date.getDate();
  if (d % 7 === 0) return SLOT_PRESETS[3]; // no slots
  if (d % 5 === 0) return SLOT_PRESETS[2];
  if (d % 3 === 0) return SLOT_PRESETS[4];
  if (d % 2 === 0) return SLOT_PRESETS[1];
  return SLOT_PRESETS[0];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay()); // Sunday start
  d.setHours(0,0,0,0);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function sameDay(a: Date, b: Date): boolean {
  return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
  );
}

function isoKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

// ─── Slot Config ──────────────────────────────────────────────────────────────

const TIME_SLOT_DESCRIPTORS = {
  morning:   { label: "Morning",   time: "8:00 AM - 12:00 PM", icon: Sun    },
  afternoon: { label: "Afternoon", time: "12:00 PM - 5:00 PM", icon: Sunset },
  evening:   { label: "Evening",   time: "5:00 PM - 8:00 PM",  icon: Moon   },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function AvailabilityCalendar({
                                               onDateChange,
                                               onPeriodChange,
                                             }: AvailabilityCalendarProps) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  const [weekStart, setWeekStart]           = useState<Date>(() => startOfWeek(today));
  const [selectedDate, setSelectedDate]     = useState<Date>(today);
  const [selectedSlotPeriod, setSelectedSlotPeriod] = useState<"morning"|"afternoon"|"evening"|null>(null);
  const [showFullCalendar, setShowFullCalendar]     = useState(false);
  const [calNavDate, setCalNavDate]                 = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));

  // Derive the 7-day week
  const weekDays = useMemo(() =>
          Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
      [weekStart]);

  const currentSlots = useMemo(() => getSlotsForDate(selectedDate), [selectedDate]);
  const availableCount = currentSlots.filter((s) => s.available).length;

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const selectDate = (date: Date) => {
    const slots = getSlotsForDate(date);
    const hasAny = slots.some((s) => s.available);
    if (!hasAny) return;
    setSelectedDate(date);
    const first = slots.find((s) => s.available);
    setSelectedSlotPeriod(first?.period ?? null);
    onDateChange?.(date);
    onPeriodChange?.(first?.period ?? null);
  };

  const selectSlot = (slot: DaySlot) => {
    if (!slot.available) return;
    setSelectedSlotPeriod(slot.period);
    onPeriodChange?.(slot.period);
  };

  const prevWeek = () => setWeekStart((w) => addDays(w, -7));
  const nextWeek = () => setWeekStart((w) => addDays(w, 7));

  // Full calendar navigation
  const prevCalMonth = () =>
      setCalNavDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextCalMonth = () =>
      setCalNavDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleFullCalSelect = (date: Date) => {
    setWeekStart(startOfWeek(date));
    selectDate(date);
    setShowFullCalendar(false);
  };

  // Build full calendar grid
  const calendarGrid = useMemo(() => {
    const year  = calNavDate.getFullYear();
    const month = calNavDate.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = first.getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    // Pad to full rows
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [calNavDate]);

  // ─── Render ─────────────────────────────────────────────────────────────────

  const monthLabel = (() => {
    // Show the month(s) represented in the week
    const months = [...new Set(weekDays.map((d) => d.getMonth()))];
    if (months.length === 1) {
      return `${MONTH_NAMES[months[0]]} ${weekDays[0].getFullYear()}`;
    }
    return `${MONTH_NAMES[months[0]]} / ${MONTH_NAMES[months[1]]} ${weekDays[6].getFullYear()}`;
  })();

  return (
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm max-w-4xl w-full select-none relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Select Schedule</h2>
          <button
              onClick={() => setShowFullCalendar(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#1e3a8a] border border-[#1e3a8a]/20 px-3 py-2 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <CalendarDays size={13} />
            Full Calendar
          </button>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-5 px-1">
          <button
              onClick={prevWeek}
              className="p-2 text-slate-800 hover:bg-slate-50 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <span className="font-bold text-slate-800 text-base">{monthLabel}</span>
          <button
              onClick={nextWeek}
              className="p-2 text-slate-800 hover:bg-slate-50 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Week Grid */}
        <div className="grid grid-cols-7 gap-2 mb-8">
          {weekDays.map((date) => {
            const slots        = getSlotsForDate(date);
            const hasAny       = slots.some((s) => s.available);
            const availSlots   = slots.filter((s) => s.available);
            const isSelected   = sameDay(date, selectedDate);
            const isPast       = date < today;
            const bs           = adToBS(date);
            const dotColors    = ["#10b981","#3b82f6","#f59e0b"];

            return (
                <button
                    key={isoKey(date)}
                    disabled={!hasAny || isPast}
                    onClick={() => selectDate(date)}
                    className={`flex flex-col items-center justify-start pt-3 pb-2.5 px-1 rounded-2xl transition-all duration-200 relative gap-0.5 ${
                        isSelected
                            ? "bg-[#1e3a8a] text-white shadow-md shadow-blue-900/10 scale-[1.03]"
                            : hasAny && !isPast
                                ? "bg-[#f1f3f5] text-slate-700 hover:bg-slate-100"
                                : "bg-[#f1f5f8] text-slate-300 cursor-not-allowed opacity-50"
                    }`}
                >
                  {/* Day name */}
                  <span
                      className={`text-[10px] font-semibold ${
                          isSelected ? "text-white/70" : "text-slate-400"
                      }`}
                  >
                {DAYS_SHORT[date.getDay()]}
              </span>

                  {/* AD date */}
                  <span className="text-lg font-bold tracking-tight leading-none">
                {date.getDate()}
              </span>

                  {/* BS date in small text */}
                  <span
                      className={`text-[9px] font-medium leading-none mt-0.5 ${
                          isSelected ? "text-white/60" : "text-slate-400"
                      }`}
                  >
                {bs.day} {BS_MONTHS[bs.month]?.slice(0,3)}
              </span>

                  {/* Dynamic slot dots */}
                  {hasAny && !isPast && (
                      <div className="flex items-center gap-0.5 mt-1.5">
                        {availSlots.map((slot, idx) => (
                            <span
                                key={slot.id}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  backgroundColor: isSelected
                                      ? "rgba(255,255,255,0.7)"
                                      : dotColors[idx % dotColors.length],
                                }}
                            />
                        ))}
                      </div>
                  )}
                </button>
            );
          })}
        </div>

        {/* Time Slots */}
        <div>
          <h3 className="text-sm font-semibold text-slate-400 mb-4">
            Available Time Slots
            {availableCount > 0 && (
                <span className="ml-2 text-[#1e3a8a] font-bold">{availableCount} available</span>
            )}
          </h3>

          <div className="flex flex-col gap-3">
            {currentSlots.map((slot) => {
              const config        = TIME_SLOT_DESCRIPTORS[slot.period];
              const IconComponent = config.icon;
              const isSlotSelected = selectedSlotPeriod === slot.period;

              return (
                  <button
                      key={slot.id + isoKey(selectedDate)}
                      disabled={!slot.available}
                      onClick={() => selectSlot(slot)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-200 border text-left ${
                          isSlotSelected
                              ? "bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-md"
                              : slot.available
                                  ? "bg-[#f8fafc] border-slate-100 text-slate-700 hover:bg-slate-100/80"
                                  : "bg-[#f1f5f8] border-slate-100 text-slate-300 opacity-40 cursor-not-allowed"
                      }`}
                  >
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

        {/* ── Full Calendar Modal ── */}
        {showFullCalendar && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 relative">
                {/* Close */}
                <button
                    onClick={() => setShowFullCalendar(false)}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X size={16} className="text-slate-600" />
                </button>

                {/* Month nav */}
                <div className="flex items-center justify-between mb-5">
                  <button onClick={prevCalMonth} className="p-1.5 rounded-full hover:bg-slate-100">
                    <ChevronLeft size={18} strokeWidth={2.5} />
                  </button>
                  <span className="font-bold text-slate-800">
                {MONTH_NAMES[calNavDate.getMonth()]} {calNavDate.getFullYear()}
              </span>
                  <button onClick={nextCalMonth} className="p-1.5 rounded-full hover:bg-slate-100">
                    <ChevronRight size={18} strokeWidth={2.5} />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 mb-2">
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                      <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">
                        {d}
                      </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarGrid.map((date, idx) => {
                    if (!date) return <div key={idx} />;
                    const slots    = getSlotsForDate(date);
                    const hasAny   = slots.some((s) => s.available);
                    const isPast   = date < today;
                    const isSel    = sameDay(date, selectedDate);
                    const bs       = adToBS(date);

                    return (
                        <button
                            key={isoKey(date)}
                            disabled={!hasAny || isPast}
                            onClick={() => handleFullCalSelect(date)}
                            className={`flex flex-col items-center justify-center py-2 rounded-xl transition-all text-center ${
                                isSel
                                    ? "bg-[#1e3a8a] text-white scale-105 shadow"
                                    : hasAny && !isPast
                                        ? "hover:bg-blue-50 text-slate-700"
                                        : "text-slate-300 cursor-not-allowed opacity-40"
                            }`}
                        >
                          <span className="text-sm font-bold leading-none">{date.getDate()}</span>
                          <span
                              className={`text-[8px] font-medium leading-none mt-0.5 ${
                                  isSel ? "text-white/60" : "text-slate-400"
                              }`}
                          >
                      {bs.day}
                    </span>
                          {hasAny && !isPast && (
                              <div className="flex gap-0.5 mt-1">
                                {slots.filter((s) => s.available).map((s, i) => (
                                    <span
                                        key={s.id}
                                        className="w-1 h-1 rounded-full"
                                        style={{
                                          backgroundColor: isSel
                                              ? "rgba(255,255,255,0.6)"
                                              : ["#10b981","#3b82f6","#f59e0b"][i % 3],
                                        }}
                                    />
                                ))}
                              </div>
                          )}
                        </button>
                    );
                  })}
                </div>

                {/* BS month label at bottom */}
                <p className="text-center text-[10px] text-slate-400 mt-4 font-medium">
                  {BS_MONTHS[adToBS(new Date(calNavDate.getFullYear(), calNavDate.getMonth(), 15)).month]}{" "}
                  {adToBS(new Date(calNavDate.getFullYear(), calNavDate.getMonth(), 15)).year} (BS)
                </p>
              </div>
            </div>
        )}
      </div>
  );
}

"use client";
import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Sunset,
  Moon,
  CalendarDays,
  X,
} from "lucide-react";
import api from "@/utils/axios";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AvailabilityCalendarProps {
  providerId: string | number;
  onDateChange?: (date: Date) => void;
  onPeriodChange?: (period: "morning" | "afternoon" | "evening" | null) => void;
}

interface DaySlot {
  id: string;
  period: "morning" | "afternoon" | "evening";
  available: boolean;
}

// Shape returned by GET /providers/{id}/availability
interface BackendAvailabilitySlot {
  date: string; // yyyy-MM-dd
  period: "MORNING" | "AFTERNOON" | "EVENING";
  isAvailable: boolean;
}

const ALL_PERIODS: DaySlot["period"][] = ["morning", "afternoon", "evening"];
const PERIOD_TO_BACKEND: Record<DaySlot["period"], BackendAvailabilitySlot["period"]> = {
  morning: "MORNING",
  afternoon: "AFTERNOON",
  evening: "EVENING",
};

// ─── Nepali BS Calendar Conversion (simplified Vikram Sambat) ─────────────────
const BS_MONTHS = [
  "Baisakh","Jestha","Ashadh","Shrawan","Bhadra","Ashwin",
  "Kartik","Mangsir","Poush","Magh","Falgun","Chaitra",
];

const NEPALI_DAY_NAMES = [
  "","Ek","Dui","Teen","Char","Paanch","Chha","Saat","Aath","Nau","Das",
  "Egara","Bahra","Tera","Chaudha","Pandhra","Sora","Satra","Athra","Unnaais","Bees",
  "Ekaais","Baaais","Teis","Chauwis","Pachis","Chhabbis","Sattaais","Athaais","Unantees","Tees",
  "Ikattees","Battees",
];

function adToBS(adDate: Date): { day: number; month: number; year: number; dayName: string } {
  const adYear = adDate.getFullYear();
  const adMonth = adDate.getMonth();
  const adDay = adDate.getDate();

  let bsYear = adYear + 56;
  let bsMonth = adMonth + 9;
  let bsDay = adDay + 17;

  if (bsDay > 32) { bsDay -= 32; bsMonth += 1; }
  if (bsMonth >= 12) { bsMonth -= 12; bsYear += 1; }

  const dayName = NEPALI_DAY_NAMES[bsDay] ?? String(bsDay);
  return { day: bsDay, month: bsMonth, year: bsYear, dayName };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
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

// Timezone-safe yyyy-MM-dd — date.toISOString() converts to UTC first, which
// can shift the date backward for UTC+ zones like Nepal (UTC+5:45) around
// local midnight. Always derive from local getters instead.
function isoKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const TIME_SLOT_DESCRIPTORS = {
  morning:   { label: "Morning",   time: "8:00 AM - 12:00 PM", icon: Sun    },
  afternoon: { label: "Afternoon", time: "12:00 PM - 4:00 PM", icon: Sunset },
  evening:   { label: "Evening",   time: "4:00 PM - 8:00 PM",  icon: Moon   },
};

export default function AvailabilityCalendar({
                                               providerId,
                                               onDateChange,
                                               onPeriodChange,
                                             }: AvailabilityCalendarProps) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  const [weekStart, setWeekStart]           = useState<Date>(() => startOfWeek(today));
  const [selectedDate, setSelectedDate]     = useState<Date>(today);
  const [selectedSlotPeriod, setSelectedSlotPeriod] = useState<"morning"|"afternoon"|"evening"|null>(null);
  const [showFullCalendar, setShowFullCalendar]     = useState(false);
  const [calNavDate, setCalNavDate]                 = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [slotsByDate, setSlotsByDate]               = useState<Record<string, BackendAvailabilitySlot[]>>({});

  const fetchRange = async (start: Date, end: Date) => {
    try {
      const { data } = await api.get<BackendAvailabilitySlot[]>(
          `/providers/${providerId}/availability`,
          { params: { start: isoKey(start), end: isoKey(end) } },
      );
      setSlotsByDate((prev) => {
        const next = { ...prev };
        for (const row of data) {
          const existing = (next[row.date] ?? []).filter((s) => s.period !== row.period);
          next[row.date] = [...existing, row];
        }
        return next;
      });
    } catch {
      // Read-only booking view — a fetch failure just falls back to the
      // "available by default" behavior below, no toast needed here.
    }
  };

  // Week view range
  useEffect(() => {
    fetchRange(weekStart, addDays(weekStart, 6));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekStart, providerId]);

  // Full-calendar month range
  useEffect(() => {
    const monthStart = new Date(calNavDate.getFullYear(), calNavDate.getMonth(), 1);
    const monthEnd = new Date(calNavDate.getFullYear(), calNavDate.getMonth() + 1, 0);
    fetchRange(monthStart, monthEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calNavDate, providerId]);

  // Same name/signature as the old mock generator — every existing call site
  // below (weekDays.map, currentSlots, calendarGrid.map) works unchanged.
  // A date/period with no fetched row defaults to available, matching the
  // provider-side "available by default" behavior.
  const getSlotsForDate = (date: Date): DaySlot[] => {
    const rows = slotsByDate[isoKey(date)];
    return ALL_PERIODS.map((period) => {
      const row = rows?.find((r) => r.period === PERIOD_TO_BACKEND[period]);
      return { id: period[0], period, available: row ? row.isAvailable : true };
    });
  };

  const weekDays = useMemo(() =>
          Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
      [weekStart]);

  const currentSlots = useMemo(() => getSlotsForDate(selectedDate), [selectedDate, slotsByDate]);
  const availableCount = currentSlots.filter((s) => s.available).length;

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

  const prevCalMonth = () =>
      setCalNavDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextCalMonth = () =>
      setCalNavDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const handleFullCalSelect = (date: Date) => {
    setWeekStart(startOfWeek(date));
    selectDate(date);
    setShowFullCalendar(false);
  };

  const calendarGrid = useMemo(() => {
    const year  = calNavDate.getFullYear();
    const month = calNavDate.getMonth();
    const first = new Date(year, month, 1);
    const startOffset = first.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < startOffset; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [calNavDate]);

  const monthLabel = (() => {
    const months = [...new Set(weekDays.map((d) => d.getMonth()))];
    if (months.length === 1) {
      return `${MONTH_NAMES[months[0]]} ${weekDays[0].getFullYear()}`;
    }
    return `${MONTH_NAMES[months[0]]} / ${MONTH_NAMES[months[1]]}`;
  })();

  return (
      <div className="bg-white border border-gray-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-sm max-w-4xl w-full select-none relative mx-auto">
        {/* Header Title Stack */}
        <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Select Schedule</h2>
          <button
              onClick={() => setShowFullCalendar(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#1e3a8a] border border-[#1e3a8a]/20 px-2.5 py-2 sm:px-3 sm:py-2 rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            <CalendarDays size={13} />
            Full Calendar
          </button>
        </div>

        {/* Week View Controls */}
        <div className="flex items-center justify-between mb-4 px-1">
          <button
              onClick={prevWeek}
              className="p-1.5 sm:p-2 text-slate-800 hover:bg-slate-50 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
          </button>
          <span className="font-bold text-slate-800 text-sm sm:text-base">{monthLabel}</span>
          <button
              onClick={nextWeek}
              className="p-1.5 sm:p-2 text-slate-800 hover:bg-slate-50 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
          </button>
        </div>

        {/* Swipe-friendly/Responsive Week Grid Track */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 min-w-[340px] sm:min-w-0">
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
                      className={`flex flex-col items-center justify-start pt-2.5 pb-2 px-1 rounded-xl sm:rounded-2xl transition-all duration-200 relative gap-0.5 min-w-[44px] ${
                          isSelected
                              ? "bg-[#1e3a8a] text-white shadow-md shadow-blue-900/10 scale-[1.02]"
                              : hasAny && !isPast
                                  ? "bg-[#f1f3f5] text-slate-700 hover:bg-slate-100"
                                  : "bg-[#f1f5f8] text-slate-300 cursor-not-allowed opacity-50"
                      }`}
                  >
                    <span
                        className={`text-[9px] sm:text-[10px] font-semibold ${
                            isSelected ? "text-white/70" : "text-slate-400"
                        }`}
                    >
                      {DAYS_SHORT[date.getDay()]}
                    </span>

                    <span className="text-base sm:text-lg font-bold tracking-tight leading-none">
                      {date.getDate()}
                    </span>

                    <span
                        className={`text-[8px] sm:text-[9px] font-medium leading-none mt-0.5 ${
                            isSelected ? "text-white/60" : "text-slate-400"
                        }`}
                    >
                      {bs.day}
                    </span>

                    {hasAny && !isPast && (
                        <div className="flex items-center gap-0.5 mt-1">
                          {availSlots.map((slot, idx) => (
                              <span
                                  key={slot.id}
                                  className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full"
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
        </div>

        {/* Time Slots Display Track */}
        <div className="mt-4 sm:mt-6">
          <h3 className="text-xs sm:text-sm font-semibold text-slate-400 mb-3 sm:mb-4">
            Available Time Slots
            {availableCount > 0 && (
                <span className="ml-2 text-[#1e3a8a] font-bold">{availableCount} available</span>
            )}
          </h3>

          <div className="flex flex-col gap-2.5 sm:gap-3">
            {currentSlots.map((slot) => {
              const config        = TIME_SLOT_DESCRIPTORS[slot.period];
              const IconComponent = config.icon;
              const isSlotSelected = selectedSlotPeriod === slot.period;

              return (
                  <button
                      key={slot.id + isoKey(selectedDate)}
                      disabled={!slot.available}
                      onClick={() => selectSlot(slot)}
                      className={`w-full flex items-center justify-between p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-200 border text-left gap-3 ${
                          isSlotSelected
                              ? "bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-md"
                              : slot.available
                                  ? "bg-[#f8fafc] border-slate-100 text-slate-700 hover:bg-slate-100/80"
                                  : "bg-[#f1f5f8] border-slate-100 text-slate-300 opacity-40 cursor-not-allowed"
                      }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                      <div
                          className={`p-2 sm:p-2.5 rounded-lg sm:rounded-xl border shrink-0 ${
                              isSlotSelected
                                  ? "bg-white/10 border-white/10 text-white"
                                  : slot.available
                                      ? "bg-white border-slate-100 text-slate-700"
                                      : "bg-slate-50 border-slate-50 text-slate-300"
                          }`}
                      >
                        <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm sm:text-base truncate">{config.label}</span>
                        <span
                            className={`text-[11px] sm:text-xs truncate ${
                                isSlotSelected ? "text-white/70" : "text-slate-400"
                            }`}
                        >
                          {config.time}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {isSlotSelected ? (
                          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          </div>
                      ) : slot.available ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                      ) : null}
                    </div>
                  </button>
              );
            })}
          </div>
        </div>

        {/* ── Full Calendar Backdrop Overlay Model ── */}
        {showFullCalendar && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-sm p-5 sm:p-6 relative">
                <button
                    onClick={() => setShowFullCalendar(false)}
                    className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                >
                  <X size={16} className="text-slate-600" />
                </button>

                <div className="flex items-center justify-between mb-4">
                  <button onClick={prevCalMonth} className="p-1.5 rounded-full hover:bg-slate-100">
                    <ChevronLeft size={18} strokeWidth={2.5} />
                  </button>
                  <span className="font-bold text-slate-800 text-sm sm:text-base">
                    {MONTH_NAMES[calNavDate.getMonth()]} {calNavDate.getFullYear()}
                  </span>
                  <button onClick={nextCalMonth} className="p-1.5 rounded-full hover:bg-slate-100">
                    <ChevronRight size={18} strokeWidth={2.5} />
                  </button>
                </div>

                <div className="grid grid-cols-7 mb-2">
                  {["Su","Mo","Tu","We","Th","Fr","Sa"].map((d) => (
                      <div key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">
                        {d}
                      </div>
                  ))}
                </div>

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
                            className={`flex flex-col items-center justify-center py-1.5 sm:py-2 rounded-lg transition-all text-center min-h-[40px] ${
                                isSel
                                    ? "bg-[#1e3a8a] text-white scale-105 shadow"
                                    : hasAny && !isPast
                                        ? "hover:bg-blue-50 text-slate-700"
                                        : "text-slate-300 cursor-not-allowed opacity-40"
                            }`}
                        >
                          <span className="text-xs sm:text-sm font-bold leading-none">{date.getDate()}</span>
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
                                        className="w-0.5 sm:w-1 h-0.5 sm:h-1 rounded-full"
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
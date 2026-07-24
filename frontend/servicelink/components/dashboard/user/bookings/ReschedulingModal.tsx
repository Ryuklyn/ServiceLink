"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Sun,
  Cloud,
  Moon,
  CheckCircle2,
  AlertTriangle,
  BellRing,
  Ticket,
  Wallet2,
  ShieldCheck,
  CircleAlert,
  Loader2,
} from "lucide-react";
import api from "@/utils/axios";

type Step =
    | "select"
    | "confirm"
    | "payment_gateways"
    | "confirm_payment"
    | "success";
type DigitalWallet = "esewa" | "khalti" | null;
type PeriodKey = "morning" | "afternoon" | "evening";

interface ReschedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBooking: {
    id: string;
    providerId: number;
    date: string;
    time: string;
    provider: string;
  };
  isLate?: boolean;
  /** Called right after a successful reschedule so the parent list can refetch. */
  onRescheduled?: () => void;
}

// Shape returned by GET /providers/{id}/availability — same as AvailabilityCalendar.tsx
interface BackendAvailabilitySlot {
  date: string; // yyyy-MM-dd
  period: "MORNING" | "AFTERNOON" | "EVENING";
  isAvailable: boolean;
}

interface TokenBalance {
  year: number;
  tokensTotal: number;
  tokensUsed: number;
  tokensRemaining: number;
}

const PERIOD_TO_BACKEND: Record<PeriodKey, BackendAvailabilitySlot["period"]> = {
  morning: "MORNING",
  afternoon: "AFTERNOON",
  evening: "EVENING",
};

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

// Timezone-safe yyyy-MM-dd — same fix as AvailabilityCalendar.tsx / providerAvailabilitySlice.ts
function isoKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function extractErrorMessage(err: any, fallback: string): string {
  return err?.response?.data?.message ?? err?.message ?? fallback;
}

export default function ReschedulingModal({
                                            isOpen,
                                            onClose,
                                            currentBooking = {
                                              id: "SL-2026-1038",
                                              providerId: 0,
                                              date: "Tomorrow",
                                              time: "10:00 AM",
                                              provider: "CleanNest",
                                            },
                                            isLate = false,
                                            onRescheduled,
                                          }: ReschedulingModalProps) {
  const [step, setStep] = useState<Step>("select");
  const [reason, setReason] = useState<string>("");
  const [paymentOption, setPaymentOption] = useState<"token" | "cash" | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<DigitalWallet>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [tokenBalance, setTokenBalance] = useState<TokenBalance | null>(null);

  const today = useMemo(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }, []);

  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth()); // 0-indexed

  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey | null>(null);

  const [slotsByDate, setSlotsByDate] = useState<Record<string, BackendAvailabilitySlot[]>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  // ── Availability fetch — same pattern as AvailabilityCalendar.tsx ──
  const fetchRange = async (start: Date, end: Date) => {
    setLoadingSlots(true);
    try {
      const { data } = await api.get<BackendAvailabilitySlot[]>(
          `/providers/${currentBooking.providerId}/availability`,
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
      // read-only view — fetch failure just leaves dates "available by default" below
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    if (!isOpen || step !== "select" || !currentBooking?.providerId) return;
    const monthStart = new Date(viewYear, viewMonth, 1);
    const monthEnd = new Date(viewYear, viewMonth + 1, 0);
    fetchRange(monthStart, monthEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, step, viewYear, viewMonth, currentBooking?.providerId]);

  // ── Token balance fetch — only matters on the late path ──
  useEffect(() => {
    if (!isOpen || !isLate) return;
    api
        .get<TokenBalance>("/appointments/reschedule-tokens/me")
        .then(({ data }) => setTokenBalance(data))
        .catch(() => setTokenBalance(null));
  }, [isOpen, isLate]);

  const getSlotsForDate = (day: number): { period: PeriodKey; available: boolean }[] => {
    const dateISO = isoKey(new Date(viewYear, viewMonth, day));
    const rows = slotsByDate[dateISO];
    return (["morning", "afternoon", "evening"] as PeriodKey[]).map((period) => {
      const row = rows?.find((r) => r.period === PERIOD_TO_BACKEND[period]);
      return { period, available: row ? row.isAvailable : true };
    });
  };

  useEffect(() => {
    setSelectedPeriod(null);
  }, [selectedDate]);

  useEffect(() => {
    if (!isOpen) {
      setStep("select");
      setPaymentOption(null);
      setSelectedWallet(null);
      setReason("");
      setSelectedDate(null);
      setSelectedPeriod(null);
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, today]);

  useEffect(() => {
    if (!isLate) setPaymentOption(null);
  }, [isLate]);

  if (!isOpen) return null;

  const LATE_FEE = 50;
  const appointmentId = currentBooking.id;

  const daysInMonthCount = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInMonth = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);
  const blankDaysBefore = new Date(viewYear, viewMonth, 1).getDay();

  const isDateInPast = (day: number) => new Date(viewYear, viewMonth, day) < today;
  const isToday = (day: number) =>
      viewYear === today.getFullYear() && viewMonth === today.getMonth() && day === today.getDate();

  const monthLabel = `${MONTH_NAMES[viewMonth]} ${viewYear}`;

  const goPrevMonth = () => {
    setSelectedDate(null);
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  };
  const goNextMonth = () => {
    setSelectedDate(null);
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  };

  const formatSelectedDateLabel = () => {
    if (!selectedDate) return "";
    return `${MONTH_NAMES[viewMonth]} ${selectedDate}, ${viewYear}`;
  };

  const timePeriods = [
    { id: "morning", label: "Morning", hours: "8:00 AM – 12:00 PM", icon: Sun },
    { id: "afternoon", label: "Afternoon", hours: "12:00 PM – 4:00 PM", icon: Cloud },
    { id: "evening", label: "Evening", hours: "4:00 PM – 7:00 PM", icon: Moon },
  ];

  const handleResetAndClose = () => {
    onClose();
    setStep("select");
    setPaymentOption(null);
    setSelectedWallet(null);
    setReason("");
  };

  const getActivePeriodLabel = () =>
      timePeriods.find((p) => p.id === selectedPeriod)?.label || "";

  const isSelectButtonDisabled = () => {
    if (!selectedDate || !selectedPeriod) return true;
    if (isLate && !paymentOption) return true;
    if (isLate && paymentOption === "token" && tokenBalance && tokenBalance.tokensRemaining === 0) return true;
    return false;
  };

  // IMPORTANT: no query string here. eSewa always appends "?data=<base64>" to
  // whatever success_url you give it, regardless of whether that URL already
  // has a "?" — so a query string here becomes a broken second "?" and the
  // callback route 404s. Path segments survive that; the callback page reads
  // appointmentId/gateway from the route params instead.
  const buildCallbackUrl = (gateway: "esewa" | "khalti") => {
    const origin = window.location.origin;
    return `${origin}/dashboard/user/bookings/reschedule-callback/${appointmentId}/${gateway}`;
  };

  // ── Real submit handlers ──────────────────────────────────────────

  const handleFreeSubmit = async () => {
    if (!selectedDate || !selectedPeriod) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await api.patch(`/appointments/${appointmentId}/reschedule`, {
        newDate: isoKey(new Date(viewYear, viewMonth, selectedDate)),
        newTimeSlot: PERIOD_TO_BACKEND[selectedPeriod],
        reason: reason || undefined,
      });
      onRescheduled?.();
      setStep("success");
    } catch (err: any) {
      setSubmitError(extractErrorMessage(err, "Could not reschedule. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTokenSubmit = async () => {
    if (!selectedDate || !selectedPeriod) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await api.patch(`/appointments/${appointmentId}/reschedule/token`, {
        newDate: isoKey(new Date(viewYear, viewMonth, selectedDate)),
        newTimeSlot: PERIOD_TO_BACKEND[selectedPeriod],
        reason: reason || undefined,
      });
      onRescheduled?.();
      setStep("success");
    } catch (err: any) {
      setSubmitError(extractErrorMessage(err, "Could not use token. Please try again."));
      setStep("select");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCashInitiate = async () => {
    if (!selectedDate || !selectedPeriod || !selectedWallet) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const { data } = await api.post(`/appointments/${appointmentId}/reschedule/payment/initiate`, {
        newDate: isoKey(new Date(viewYear, viewMonth, selectedDate)),
        newTimeSlot: PERIOD_TO_BACKEND[selectedPeriod],
        reason: reason || undefined,
        paymentGateway: selectedWallet.toUpperCase(),
        successUrl: buildCallbackUrl(selectedWallet),
        failureUrl: buildCallbackUrl(selectedWallet),
      });

      if (data.gatewayMethod === "POST" && data.gatewayFormFields) {
        // eSewa — real form POST redirect, browser leaves the app here.
        const form = document.createElement("form");
        form.method = "POST";
        form.action = data.gatewayRedirectUrl;
        Object.entries(data.gatewayFormFields as Record<string, string>).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      } else {
        // Khalti — plain GET redirect.
        window.location.href = data.gatewayRedirectUrl;
      }
      // No finally-reset here on purpose — the browser is navigating away.
    } catch (err: any) {
      setSubmitError(extractErrorMessage(err, "Could not start payment. Please try again."));
      setIsSubmitting(false);
    }
  };

  const headerTitle = () => {
    if (step === "select") return "Reschedule booking";
    if (step === "confirm") return "Confirm Token Use";
    if (step === "payment_gateways") return "Select Payment Method";
    if (step === "confirm_payment") return "Confirm Payment";
    if (step === "success") return "Reschedule Successful";
    return "";
  };

  const showHeader = step !== "success";

  const renderTokenDots = (dotSize = "w-2 h-2") => {
    const total = tokenBalance?.tokensTotal ?? 3;
    const remaining = tokenBalance?.tokensRemaining ?? total;
    return Array.from({ length: total }).map((_, i) => (
        <div
            key={i}
            className={`${dotSize} rounded-full ${i < remaining ? "bg-[#1e3a8a]" : "bg-gray-200"}`}
        />
    ));
  };

  const renderErrorBanner = () =>
      submitError ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-2.5 flex items-start gap-2 text-[11px] text-red-700 font-medium">
            <CircleAlert size={13} className="shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
      ) : null;

  const renderCalendar = (compact: boolean) => (
      <div className={`border border-gray-200 rounded-xl bg-white ${compact ? "p-2" : "p-2.5"}`}>
        <div className="flex items-center justify-between mb-2 px-1">
          <button type="button" onClick={goPrevMonth} className="p-1 rounded-md text-gray-400 hover:bg-gray-50">
            <ChevronLeft size={compact ? 13 : 14} />
          </button>
          <span className={`font-bold text-gray-800 flex items-center gap-1.5 ${compact ? "text-[10px]" : "text-[11px]"}`}>
          {monthLabel}
            {loadingSlots && <Loader2 size={10} className="animate-spin text-gray-400" />}
        </span>
          <button type="button" onClick={goNextMonth} className="p-1 rounded-md text-gray-400 hover:bg-gray-50">
            <ChevronRight size={compact ? 13 : 14} />
          </button>
        </div>
        <div className={`grid grid-cols-7 text-center font-bold text-gray-400 mb-1 ${compact ? "text-[8px]" : "text-[9px]"}`}>
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <span key={d}>{d}</span>)}
        </div>
        <div className={`grid grid-cols-7 text-center gap-y-0.5 ${compact ? "text-[10px]" : "text-[11px]"}`}>
          {Array.from({ length: blankDaysBefore }).map((_, i) => <div key={`b-${i}`} />)}
          {daysInMonth.map((day) => {
            const past = isDateInPast(day);
            const todayFlag = isToday(day);
            const selected = selectedDate === day;
            const daySlots = getSlotsForDate(day);
            const hasOpenSlot = daySlots.some((s) => s.available);
            const disabled = past || !hasOpenSlot;

            return (
                <button
                    key={day}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSelectedDate(day)}
                    className="flex flex-col items-center gap-0.5"
                >
              <span
                  className={`h-5 w-5 mx-auto rounded-full font-bold flex items-center justify-center transition-all ${
                      disabled
                          ? "text-gray-300 cursor-not-allowed"
                          : selected
                              ? "bg-[#1e3a8a] text-white"
                              : todayFlag
                                  ? "border border-[#1e3a8a] text-[#1e3a8a]"
                                  : "text-gray-700 hover:bg-gray-100"
                  }`}
              >
                {day}
              </span>
                  {!past && (
                      <span className={`w-1 h-1 rounded-full ${hasOpenSlot ? "bg-emerald-500" : "bg-red-300"}`} />
                  )}
                </button>
            );
          })}
        </div>
      </div>
  );

  const renderTimeSegments = () => (
      <div className="space-y-1.5">
        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
          Select Time Segment
        </label>
        {!selectedDate ? (
            <p className="text-[10px] text-gray-400 italic py-2">Pick a date first to see open slots.</p>
        ) : (
            <div className="grid grid-cols-3 gap-1">
              {timePeriods.map((period) => {
                const PeriodIcon = period.icon;
                const isActive = selectedPeriod === period.id;
                const slot = getSlotsForDate(selectedDate).find((s) => s.period === period.id);
                const slotOpen = slot?.available ?? true;

                return (
                    <button
                        key={period.id}
                        type="button"
                        disabled={!slotOpen}
                        onClick={() => setSelectedPeriod(period.id as PeriodKey)}
                        className={`p-1.5 rounded-xl border text-center flex flex-col items-center justify-center gap-0.5 transition-all relative ${
                            !slotOpen
                                ? "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                                : isActive
                                    ? "border-[#1e3a8a] bg-blue-50/30 font-bold"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                        }`}
                    >
                      <PeriodIcon size={12} className={!slotOpen ? "text-gray-300" : isActive ? "text-[#1e3a8a]" : "text-gray-400"} />
                      <span className="text-[10px] block">{period.label}</span>
                      <span className="text-[7px] text-gray-400 block leading-tight">{period.hours}</span>
                      {!slotOpen && (
                          <span className="absolute top-1 right-1 text-[7px] font-bold text-red-400">Full</span>
                      )}
                    </button>
                );
              })}
            </div>
        )}
      </div>
  );

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-100 shadow-xl overflow-hidden flex flex-col transition-all duration-150 max-h-[95vh]">
          {showHeader && (
              <div className="p-4 pb-3 border-b border-gray-100 flex items-start justify-between shrink-0">
                <div className="flex items-center gap-2">
                  {step === "select" && <CalendarIcon size={16} className="text-[#1e3a8a]" />}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900 text-sm">{headerTitle()}</h3>
                      {step === "select" && isLate && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-700 text-[9px] font-bold px-2 py-0.5 rounded-full">
                      <Clock size={9} /> Late (≤ 24 hrs)
                    </span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                      {currentBooking.id} • {currentBooking.provider} Services
                    </p>
                  </div>
                </div>
                <button onClick={handleResetAndClose} className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors">
                  <X size={15} />
                </button>
              </div>
          )}

          {/* STEP 1 — SELECT */}
          {step === "select" && (
              <>
                <div className="overflow-y-auto flex-1">
                  <div className="p-4 space-y-4">
                    {isLate ? (
                        <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2">
                          <Clock size={15} className="text-amber-600 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                            You are within 24 hours of your booking. This is a late reschedule.
                          </p>
                        </div>
                    ) : (
                        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-start gap-2">
                          <CheckCircle2 size={15} className="text-emerald-600 shrink-0 mt-0.5" />
                          <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                            No rescheduling fee — you are in the free adjustment window (&gt; 24 hrs before service).
                          </p>
                        </div>
                    )}

                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-gray-50/80 p-3 grid grid-cols-3 gap-2 text-[11px]">
                        <div>
                          <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Date</span>
                          <span className="text-gray-900 font-bold flex items-center gap-1">
                        <CalendarIcon size={11} className="text-gray-400" /> {currentBooking.date}
                      </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Time</span>
                          <span className="text-gray-900 font-bold flex items-center gap-1">
                        <Clock size={11} className="text-gray-400" /> {currentBooking.time}
                      </span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Provider</span>
                          <span className="text-gray-900 font-bold flex items-center gap-1">
                        <User size={11} className="text-gray-400" /> {currentBooking.provider}
                      </span>
                        </div>
                      </div>
                    </div>

                    {isLate ? (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Select New Date</label>
                              {renderCalendar(true)}
                            </div>
                            {renderTimeSegments()}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Choose How to Proceed</label>

                            <div
                                onClick={() => {
                                  if (!tokenBalance || tokenBalance.tokensRemaining > 0) setPaymentOption("token");
                                }}
                                className={`relative border-2 p-3 rounded-xl transition-all ${
                                    tokenBalance && tokenBalance.tokensRemaining === 0
                                        ? "opacity-40 cursor-not-allowed border-gray-200 bg-white"
                                        : "cursor-pointer"
                                } ${
                                    paymentOption === "token"
                                        ? "border-[#1e3a8a] bg-blue-50/40"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                }`}
                            >
                              <div className="flex items-start justify-between mb-3">
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            SAVE Rs. {LATE_FEE}
                          </span>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentOption === "token" ? "border-[#1e3a8a] bg-[#1e3a8a]" : "border-gray-300"}`}>
                                  {paymentOption === "token" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
                                  <Ticket size={18} className="text-[#1e3a8a]" />
                                </div>
                                <p className="font-bold text-gray-900 text-[11px] text-center leading-tight mt-0.5">Use 1 Reschedule Token</p>
                                <p className="text-[9px] text-gray-500 text-center">
                                  {tokenBalance && tokenBalance.tokensRemaining === 0 ? "No tokens remaining" : "No fee will be charged"}
                                </p>
                                <div className="mt-1 bg-blue-50 border border-blue-100 rounded-lg p-1.5 w-full">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[8px] text-gray-500">Your tokens:</span>
                                    <div className="flex items-center gap-1">
                                <span className="text-[9px] font-bold text-[#1e3a8a]">
                                  {tokenBalance ? `${tokenBalance.tokensRemaining} of ${tokenBalance.tokensTotal}` : "…"}
                                </span>
                                      <div className="flex gap-0.5">{renderTokenDots()}</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div
                                onClick={() => setPaymentOption("cash")}
                                className={`relative border-2 p-3 rounded-xl cursor-pointer transition-all ${
                                    paymentOption === "cash" ? "border-red-400 bg-red-50/20" : "border-gray-200 bg-white hover:border-gray-300"
                                }`}
                            >
                              <div className="flex items-start justify-between mb-3">
                          <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            PAY Rs. {LATE_FEE}
                          </span>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentOption === "cash" ? "border-red-500 bg-red-500" : "border-gray-300"}`}>
                                  {paymentOption === "cash" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                              </div>
                              <div className="flex flex-col items-center gap-1">
                                <div className="w-9 h-9 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center">
                                  <Wallet2 size={18} className="text-red-400" />
                                </div>
                                <p className="font-bold text-gray-900 text-[11px] text-center mt-0.5">Pay Rs. {LATE_FEE}</p>
                                <p className="text-[9px] text-gray-500 text-center">Late reschedule fee</p>
                                <div className="mt-1 bg-red-50/60 border border-red-100 rounded-lg p-1.5 flex items-center gap-1 w-full">
                                  <CircleAlert size={9} className="text-red-400 shrink-0" />
                                  <p className="text-[8px] text-red-600 font-medium">
                                    Goes directly to <span className="font-bold">{currentBooking.provider}</span>
                                  </p>
                                </div>
                              </div>
                            </div>

                            {paymentOption === "cash" && (
                                <div className="space-y-1">
                                  <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">Payment Options Available</p>
                                  <div className="flex gap-2">
                                    <div className="flex-1 flex items-center justify-center py-1.5 px-2 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:border-gray-300 transition-all duration-200 cursor-pointer">
                                      <img src="/images/esewa.png" alt="eSewa" className="h-10 w-auto object-contain" />
                                    </div>
                                    <div className="flex-1 flex items-center justify-center py-1.5 px-2 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:border-gray-300 transition-all duration-200 cursor-pointer">
                                      <img src="/images/khalti.png" alt="Khalti" className="h-10 w-auto object-contain" />
                                    </div>
                                  </div>
                                </div>
                            )}
                          </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Select New Date</label>
                            {renderCalendar(false)}
                          </div>
                          {renderTimeSegments()}
                        </div>
                    )}

                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">Reason (Optional)</label>
                      <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Tell us why you're rescheduling (optional)..."
                          className="w-full text-[11px] p-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] bg-white placeholder-gray-400 h-14 resize-none font-medium"
                      />
                    </div>

                    {renderErrorBanner()}

                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-start gap-2 text-xs text-gray-500">
                      <ShieldCheck size={13} className="text-gray-400 shrink-0 mt-0.5" strokeWidth={2.5} />
                      <span>
                    {isLate
                        ? "Late reschedule may affect the provider's schedule. The fee compensates the provider for the inconvenience."
                        : "This is a free reschedule. No token or fee will be used."}
                  </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2 shrink-0">
                  <button
                      onClick={handleResetAndClose}
                      className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    {isLate ? "Keep current booking" : "Keep current"}
                  </button>
                  <button
                      disabled={isSelectButtonDisabled() || isSubmitting}
                      onClick={() => {
                        if (!isLate) {
                          handleFreeSubmit();
                        } else if (paymentOption === "token") {
                          setStep("confirm");
                        } else if (paymentOption === "cash") {
                          setStep("payment_gateways");
                        }
                      }}
                      className={`flex-1 py-2.5 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
                          isSelectButtonDisabled() || isSubmitting
                              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : isLate && paymentOption === "cash"
                                  ? "text-white"
                                  : "bg-[#1e3a8a] hover:bg-blue-900 text-white"
                      }`}
                      style={!isSelectButtonDisabled() && !isSubmitting && isLate && paymentOption === "cash" ? { backgroundColor: "#e8683f" } : {}}
                  >
                    {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                    {!isSubmitting && isLate && paymentOption === "token" && <Ticket size={13} />}
                    {!isSubmitting && isLate && paymentOption === "cash" && <Wallet2 size={13} />}
                    {isSubmitting
                        ? "Sending..."
                        : !isLate
                            ? "Send request"
                            : paymentOption === "token"
                                ? "Pay 1 Token"
                                : paymentOption === "cash"
                                    ? `Pay Rs. ${LATE_FEE}`
                                    : "Confirm reschedule"}
                  </button>
                </div>
              </>
          )}

          {/* STEP 2 — CONFIRM (Token path) */}
          {step === "confirm" && (
              <>
                <div className="p-6 flex flex-col items-center text-center space-y-5 flex-1">
                  <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                    <Ticket size={28} className="text-[#1e3a8a]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">Use 1 reschedule token?</h4>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-xs">
                      This will use 1 of your{" "}
                      <span className="font-bold text-gray-700">{tokenBalance?.tokensRemaining ?? "—"} remaining</span>{" "}
                      reschedule tokens to waive the Rs. {LATE_FEE} late fee.
                    </p>
                  </div>

                  <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between max-w-xs">
                    <span className="text-xs font-medium text-gray-600">Tokens after this action</span>
                    <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1e3a8a] text-sm">
                    {tokenBalance ? `${Math.max(tokenBalance.tokensRemaining - 1, 0)} of ${tokenBalance.tokensTotal}` : "…"}
                  </span>
                      <div className="flex gap-1">{renderTokenDots("w-3.5 h-3.5")}</div>
                    </div>
                  </div>

                  <div className="w-full bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800 max-w-xs">
                    <CircleAlert size={13} className="shrink-0 mt-0.5 text-amber-600" />
                    <span>Tokens are non-refundable and reset annually. Proceed only if you're sure about rescheduling.</span>
                  </div>

                  <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-left space-y-1.5 max-w-xs text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">New Date:</span>
                      <span className="font-bold text-gray-800">{formatSelectedDateLabel()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time Segment:</span>
                      <span className="font-bold text-[#1e3a8a]">{getActivePeriodLabel()} Block</span>
                    </div>
                    <div className="flex justify-between pt-1.5 border-t border-gray-200 text-amber-700 font-semibold">
                      <span>Payment:</span>
                      <span>1 Reschedule Token</span>
                    </div>
                  </div>

                  {renderErrorBanner()}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
                  <button
                      onClick={() => setStep("select")}
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                  >
                    Go back
                  </button>
                  <button
                      onClick={handleTokenSubmit}
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                  >
                    {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Ticket size={13} />}
                    {isSubmitting ? "Using token..." : "Yes, use token"}
                  </button>
                </div>
              </>
          )}

          {/* STEP 3 — PAYMENT GATEWAYS */}
          {step === "payment_gateways" && (
              <>
                <div className="p-6 space-y-5 flex-1">
                  <div className="text-center space-y-1">
                    <p className="text-xs text-gray-500 font-medium">Amount to pay</p>
                    <p className="text-3xl font-black text-gray-900">Rs. {LATE_FEE}</p>
                    <p className="text-[11px] text-gray-400">Late reschedule fee → {currentBooking.provider}</p>
                  </div>

                  <div className="space-y-2">
                    <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Select payment method</span>
                    <div className="space-y-2">
                      {(["esewa", "khalti"] as DigitalWallet[]).map((wallet) => {
                        const isEsewa = wallet === "esewa";
                        const selected = selectedWallet === wallet;
                        return (
                            <button
                                key={wallet}
                                onClick={() => setSelectedWallet(wallet)}
                                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                                    selected
                                        ? isEsewa ? "border-green-500 bg-green-50" : "border-purple-500 bg-purple-50"
                                        : "border-gray-200 bg-white hover:border-gray-300"
                                }`}
                            >
                              <div className="w-14 h-14 flex items-center justify-center flex-shrink-0">
                                <img src={isEsewa ? "/images/esewa.png" : "/images/khalti.png"} alt={isEsewa ? "eSewa" : "Khalti"} className="h-14 w-auto object-contain" />
                              </div>
                              <div className="flex-1">
                                <p className={`font-bold text-sm ${selected ? (isEsewa ? "text-green-700" : "text-purple-700") : "text-gray-800"}`}>
                                  {isEsewa ? "eSewa" : "Khalti"}
                                </p>
                                <p className="text-[11px] text-gray-400 font-medium">{isEsewa ? "Digital wallet" : "Mobile payment"}</p>
                              </div>
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  selected ? (isEsewa ? "border-green-500 bg-green-500" : "border-purple-500 bg-purple-500") : "border-gray-300"
                              }`}>
                                {selected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </button>
                        );
                      })}
                    </div>
                  </div>

                  {renderErrorBanner()}

                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-start gap-2 text-xs text-gray-500">
                    <ShieldCheck size={13} className="text-gray-400 shrink-0 mt-0.5" />
                    <span>
                  Payment goes directly to <span className="font-semibold text-gray-700">{currentBooking.provider}</span> as compensation for the late reschedule.
                </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
                  <button onClick={() => setStep("select")} className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors">
                    Go back
                  </button>
                  <button
                      disabled={!selectedWallet}
                      onClick={() => setStep("confirm_payment")}
                      className={`flex-1 py-2.5 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                          !selectedWallet ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                              : selectedWallet === "esewa" ? "bg-green-500 hover:bg-green-600 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"
                      }`}
                  >
                    <Wallet2 size={13} />
                    Confirm payment
                  </button>
                </div>
              </>
          )}

          {/* STEP 3b — CONFIRM PAYMENT */}
          {step === "confirm_payment" && (
              <>
                <div className="p-6 flex flex-col items-center text-center space-y-5 flex-1">
                  <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                    <AlertTriangle size={28} className="text-[#e8683f]" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-base">Confirm payment of Rs. {LATE_FEE}?</h4>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-xs">
                      You'll be redirected to{" "}
                      <span className="font-bold" style={{ color: selectedWallet === "esewa" ? "#16a34a" : "#7c3aed" }}>
                    {selectedWallet === "esewa" ? "eSewa" : "Khalti"}
                  </span>{" "}
                      to pay <span className="font-bold text-gray-700">Rs. {LATE_FEE}</span> as a late reschedule fee. Your
                      booking is only updated after payment is confirmed.
                    </p>
                  </div>

                  <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-left space-y-2 max-w-xs text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-400">New Date:</span>
                      <span className="font-bold text-gray-800">{formatSelectedDateLabel()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Time Segment:</span>
                      <span className="font-bold text-[#1e3a8a]">{getActivePeriodLabel()} Block</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="text-gray-400">Payment via:</span>
                      <span className={`font-bold ${selectedWallet === "esewa" ? "text-green-700" : "text-purple-700"}`}>
                    {selectedWallet === "esewa" ? "eSewa" : "Khalti"}
                  </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount:</span>
                      <span className="font-bold text-gray-800">Rs. {LATE_FEE}</span>
                    </div>
                  </div>

                  {renderErrorBanner()}

                  <div className="w-full bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800 max-w-xs">
                    <CircleAlert size={13} className="shrink-0 mt-0.5 text-amber-600" />
                    <span>This payment is non-refundable and goes directly to the provider as compensation.</span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
                  <button
                      onClick={() => setStep("payment_gateways")}
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                  >
                    Go back
                  </button>
                  <button
                      onClick={handleCashInitiate}
                      disabled={isSubmitting}
                      className={`flex-1 py-2.5 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-60 ${
                          selectedWallet === "esewa" ? "bg-green-500 hover:bg-green-600 text-white" : "bg-purple-600 hover:bg-purple-700 text-white"
                      }`}
                  >
                    {isSubmitting ? <Loader2 size={13} className="animate-spin" /> : <Wallet2 size={13} />}
                    {isSubmitting ? "Redirecting..." : `Yes, pay Rs. ${LATE_FEE}`}
                  </button>
                </div>
              </>
          )}

          {/* STEP 4 — SUCCESS (free & token paths only; cash path resolves on the callback page) */}
          {step === "success" && (
              <>
                <div className="p-8 flex flex-col items-center text-center space-y-5 flex-1">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center relative">
                    <CheckCircle2 size={36} className="text-emerald-600" strokeWidth={1.5} />
                    <div className="absolute -top-1 -right-1 bg-[#1e3a8a] text-white p-0.5 rounded-full border-2 border-white animate-bounce">
                      <BellRing size={10} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">Reschedule Confirmed!</h4>
                    <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-xs">
                      Your booking has been successfully rescheduled.{" "}
                      <span className="font-bold text-gray-700">{currentBooking.provider}</span> has been notified.
                    </p>
                  </div>

                  <div className="w-full space-y-2.5 max-w-xs">
                    {!isLate && (
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800">
                          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" strokeWidth={2} />
                          <span className="font-semibold">Free reschedule — no charge applied.</span>
                        </div>
                    )}
                    {isLate && paymentOption === "token" && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 space-y-1 text-xs text-[#1e3a8a]">
                          <div className="flex items-center gap-2">
                            <Ticket size={14} className="shrink-0" />
                            <span className="font-bold">1 reschedule token used</span>
                          </div>
                          <p className="text-gray-500 font-medium pl-5">Your token balance has been updated. Tokens reset annually.</p>
                        </div>
                    )}

                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-left space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-400">New Date:</span>
                        <span className="font-bold text-gray-800">{formatSelectedDateLabel()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Time Segment:</span>
                        <span className="font-bold text-[#1e3a8a]">{getActivePeriodLabel()} Block</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Provider:</span>
                        <span className="font-bold text-gray-800">{currentBooking.provider}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0">
                  <button onClick={handleResetAndClose} className="w-full py-2.5 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-colors">
                    Done
                  </button>
                </div>
              </>
          )}
        </div>
      </div>
  );
}
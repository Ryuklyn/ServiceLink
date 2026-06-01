"use client";

import React, { useState, useEffect } from "react";
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
  Info,
  Shield,
  ShieldCheck,
  CircleAlert,
  Coins,
} from "lucide-react";

type Step =
  | "select"
  | "confirm"
  | "payment_gateways"
  | "confirm_payment"
  | "success";
type DigitalWallet = "esewa" | "khalti" | null;

interface ReschedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBooking: {
    id: string;
    date: string;
    time: string;
    provider: string;
  };
  isLate?: boolean;
}

export default function ReschedulingModal({
  isOpen,
  onClose,
  currentBooking = {
    id: "SL-2026-1038",
    date: "Tomorrow",
    time: "10:00 AM",
    provider: "CleanNest",
  },
  isLate = false,
}: ReschedulingModalProps) {
  const [step, setStep] = useState<Step>("select");
  const [selectedDate, setSelectedDate] = useState<number | null>(9);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("morning");
  const [reason, setReason] = useState<string>("");
  const [paymentOption, setPaymentOption] = useState<"token" | "cash" | null>(
    null,
  );
  const [selectedWallet, setSelectedWallet] = useState<DigitalWallet>(null);

  useEffect(() => {
    if (!isOpen) {
      setStep("select");
      setPaymentOption(null);
      setSelectedWallet(null);
      setReason("");
      setSelectedDate(9);
      setSelectedPeriod("morning");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isLate) setPaymentOption(null);
  }, [isLate]);

  if (!isOpen) return null;

  const LATE_FEE = 50;
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
  const blankDaysBefore = 1;

  const timePeriods = [
    { id: "morning", label: "Morning", hours: "8:00 AM – 12:00 PM", icon: Sun },
    {
      id: "afternoon",
      label: "Afternoon",
      hours: "12:00 PM – 4:00 PM",
      icon: Cloud,
    },
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
    if (!selectedDate) return true;
    if (isLate && !paymentOption) return true;
    return false;
  };

  // Header title per step
  const headerTitle = () => {
    if (step === "select") return "Reschedule booking";
    if (step === "confirm") return "Confirm Token Use";
    if (step === "payment_gateways") return "Select Payment Method";
    if (step === "confirm_payment") return "Confirm Payment";
    if (step === "success") return "Reschedule Successful";
    return "";
  };

  const showHeader = step !== "success";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-100 shadow-xl overflow-hidden flex flex-col transition-all duration-150 max-h-[95vh]">
        {/* ── Header ── */}
        {showHeader && (
          <div className="p-4 pb-3 border-b border-gray-100 flex items-start justify-between shrink-0">
            <div className="flex items-center gap-2">
              {step === "select" && (
                <CalendarIcon size={16} className="text-[#1e3a8a]" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-gray-900 text-sm">
                    {headerTitle()}
                  </h3>
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
            <button
              onClick={handleResetAndClose}
              className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 1 — SELECT
        ══════════════════════════════════════════ */}
        {step === "select" && (
          <>
            <div className="overflow-y-auto flex-1">
              <div className="p-4 space-y-4">
                {/* Context Banner */}
                {isLate ? (
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2">
                    <Clock
                      size={15}
                      className="text-amber-600 shrink-0 mt-0.5"
                    />
                    <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                      You are within 24 hours of your booking. This is a late
                      reschedule.
                    </p>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-start gap-2">
                    <CheckCircle2
                      size={15}
                      className="text-emerald-600 shrink-0 mt-0.5"
                    />
                    <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">
                      No rescheduling fee — you are in the free adjustment
                      window (&gt; 24 hrs before service).
                    </p>
                  </div>
                )}

                {/* Current Booking Info */}
                <div className="border border-gray-200 rounded-xl overflow-hidden">
                  <div className="bg-gray-50/80 p-3 grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                        Date
                      </span>
                      <span className="text-gray-900 font-bold flex items-center gap-1">
                        <CalendarIcon size={11} className="text-gray-400" />{" "}
                        {currentBooking.date}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                        Time
                      </span>
                      <span className="text-gray-900 font-bold flex items-center gap-1">
                        <Clock size={11} className="text-gray-400" />{" "}
                        {currentBooking.time}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                        Provider
                      </span>
                      <span className="text-gray-900 font-bold flex items-center gap-1">
                        <User size={11} className="text-gray-400" />{" "}
                        {currentBooking.provider}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main content — late: 2-col, free: 1-col */}
                {isLate ? (
                  <div className="grid grid-cols-2 gap-4">
                    {/* Left: Calendar + Time */}
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                          Select New Date
                        </label>
                        <div className="border border-gray-200 rounded-xl p-2 bg-white">
                          <div className="flex items-center justify-between mb-2 px-1">
                            <button className="p-1 rounded-md text-gray-400 hover:bg-gray-50">
                              <ChevronLeft size={13} />
                            </button>
                            <span className="text-[10px] font-bold text-gray-800">
                              June 2026
                            </span>
                            <button className="p-1 rounded-md text-gray-400 hover:bg-gray-50">
                              <ChevronRight size={13} />
                            </button>
                          </div>
                          <div className="grid grid-cols-7 text-center text-[8px] font-bold text-gray-400 mb-1">
                            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                              (d) => (
                                <span key={d}>{d}</span>
                              ),
                            )}
                          </div>
                          <div className="grid grid-cols-7 text-center gap-y-0.5 text-[10px]">
                            {Array.from({ length: blankDaysBefore }).map(
                              (_, i) => (
                                <div key={`b-${i}`} />
                              ),
                            )}
                            {daysInMonth.map((day) => {
                              const isToday = day === 1;
                              const isSelected = selectedDate === day;
                              return (
                                <button
                                  key={day}
                                  type="button"
                                  onClick={() => setSelectedDate(day)}
                                  className={`h-5 w-5 mx-auto rounded-full font-bold flex items-center justify-center transition-all ${
                                    isSelected
                                      ? "bg-[#1e3a8a] text-white"
                                      : isToday
                                        ? "border border-[#1e3a8a] text-[#1e3a8a]"
                                        : "text-gray-700 hover:bg-gray-100"
                                  }`}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                          Select Time Segment
                        </label>
                        <div className="grid grid-cols-3 gap-1">
                          {timePeriods.map((period) => {
                            const PeriodIcon = period.icon;
                            const isActive = selectedPeriod === period.id;
                            return (
                              <button
                                key={period.id}
                                type="button"
                                onClick={() => setSelectedPeriod(period.id)}
                                className={`p-1.5 rounded-xl border text-center flex flex-col items-center justify-center gap-0.5 transition-all ${
                                  isActive
                                    ? "border-[#1e3a8a] bg-blue-50/30 font-bold"
                                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                                }`}
                              >
                                <PeriodIcon
                                  size={12}
                                  className={
                                    isActive
                                      ? "text-[#1e3a8a]"
                                      : "text-gray-400"
                                  }
                                />
                                <span className="text-[10px] block">
                                  {period.label}
                                </span>
                                <span className="text-[7px] text-gray-400 block leading-tight">
                                  {period.hours}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Right: Payment option cards */}
                    <div className="space-y-2">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        Choose How to Proceed
                      </label>

                      {/* Token Card */}
                      <div
                        onClick={() => setPaymentOption("token")}
                        className={`relative border-2 p-3 rounded-xl cursor-pointer transition-all ${
                          paymentOption === "token"
                            ? "border-[#1e3a8a] bg-blue-50/40"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            SAVE Rs. {LATE_FEE}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentOption === "token" ? "border-[#1e3a8a] bg-[#1e3a8a]" : "border-gray-300"}`}
                          >
                            {paymentOption === "token" && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center">
                            <Ticket size={18} className="text-[#1e3a8a]" />
                          </div>
                          <p className="font-bold text-gray-900 text-[11px] text-center leading-tight mt-0.5">
                            Use 1 Reschedule Token
                          </p>
                          <p className="text-[9px] text-gray-500 text-center">
                            No fee will be charged
                          </p>
                          <div className="mt-1 bg-blue-50 border border-blue-100 rounded-lg p-1.5 w-full">
                            <div className="flex items-center justify-between">
                              <span className="text-[8px] text-gray-500">
                                Your tokens:
                              </span>
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] font-bold text-[#1e3a8a]">
                                  2 of 3
                                </span>
                                <div className="flex gap-0.5">
                                  <div className="w-2 h-2 rounded-full bg-[#1e3a8a]" />
                                  <div className="w-2 h-2 rounded-full bg-[#1e3a8a]" />
                                  <div className="w-2 h-2 rounded-full bg-gray-200" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cash Card */}
                      <div
                        onClick={() => setPaymentOption("cash")}
                        className={`relative border-2 p-3 rounded-xl cursor-pointer transition-all ${
                          paymentOption === "cash"
                            ? "border-red-400 bg-red-50/20"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                            PAY Rs. {LATE_FEE}
                          </span>
                          <div
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${paymentOption === "cash" ? "border-red-500 bg-red-500" : "border-gray-300"}`}
                          >
                            {paymentOption === "cash" && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white" />
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                          <div className="w-9 h-9 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center">
                            <Wallet2 size={18} className="text-red-400" />
                          </div>
                          <p className="font-bold text-gray-900 text-[11px] text-center mt-0.5">
                            Pay Rs. {LATE_FEE}
                          </p>
                          <p className="text-[9px] text-gray-500 text-center">
                            Late reschedule fee
                          </p>
                          <div className="mt-1 bg-red-50/60 border border-red-100 rounded-lg p-1.5 flex items-center gap-1 w-full">
                            <CircleAlert
                              size={9}
                              className="text-red-400 shrink-0"
                            />
                            <p className="text-[8px] text-red-600 font-medium">
                              Goes directly to{" "}
                              <span className="font-bold">
                                {currentBooking.provider}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Informational wallet pills — shown when cash selected */}
                      {paymentOption === "cash" && (
                        <div className="space-y-1">
                          <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">
                            Payment Options Available
                          </p>
                          <div className="flex gap-2">
                            <div className="flex-1 flex items-center justify-center gap-1.5 p-2 border border-gray-200 rounded-lg bg-gray-50">
                              <div className="w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[7px] flex items-center justify-center">
                                e
                              </div>
                              <span className="text-[10px] font-bold text-gray-600">
                                eSewa
                              </span>
                            </div>
                            <div className="flex-1 flex items-center justify-center gap-1.5 p-2 border border-gray-200 rounded-lg bg-gray-50">
                              <div className="w-4 h-4 rounded-full bg-purple-700 text-white font-bold text-[7px] flex items-center justify-center">
                                K
                              </div>
                              <span className="text-[10px] font-bold text-gray-600">
                                Khalti
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* FREE TIER — single column */
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        Select New Date
                      </label>
                      <div className="border border-gray-200 rounded-xl p-2.5 bg-white">
                        <div className="flex items-center justify-between mb-2 px-1">
                          <button className="p-1 rounded-md text-gray-400 hover:bg-gray-50">
                            <ChevronLeft size={14} />
                          </button>
                          <span className="text-[11px] font-bold text-gray-800">
                            June 2026
                          </span>
                          <button className="p-1 rounded-md text-gray-400 hover:bg-gray-50">
                            <ChevronRight size={14} />
                          </button>
                        </div>
                        <div className="grid grid-cols-7 text-center text-[9px] font-bold text-gray-400 mb-1">
                          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(
                            (d) => (
                              <span key={d}>{d}</span>
                            ),
                          )}
                        </div>
                        <div className="grid grid-cols-7 text-center gap-y-0.5 text-[11px]">
                          {Array.from({ length: blankDaysBefore }).map(
                            (_, i) => (
                              <div key={`b-${i}`} />
                            ),
                          )}
                          {daysInMonth.map((day) => {
                            const isToday = day === 1;
                            const isSelected = selectedDate === day;
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => setSelectedDate(day)}
                                className={`h-6 w-6 mx-auto rounded-full font-bold flex items-center justify-center transition-all ${
                                  isSelected
                                    ? "bg-[#1e3a8a] text-white shadow-sm"
                                    : isToday
                                      ? "border border-[#1e3a8a] text-[#1e3a8a] bg-blue-50/20"
                                      : "text-gray-700 hover:bg-gray-100"
                                }`}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        Select Time Segment
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {timePeriods.map((period) => {
                          const PeriodIcon = period.icon;
                          const isActive = selectedPeriod === period.id;
                          return (
                            <button
                              key={period.id}
                              type="button"
                              onClick={() => setSelectedPeriod(period.id)}
                              className={`p-2 rounded-xl border text-center flex flex-col items-center justify-center gap-0.5 transition-all ${
                                isActive
                                  ? "border-[#1e3a8a] bg-blue-50/30 font-bold"
                                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                              }`}
                            >
                              <PeriodIcon
                                size={14}
                                className={
                                  isActive ? "text-[#1e3a8a]" : "text-gray-400"
                                }
                              />
                              <span className="text-[11px] block">
                                {period.label}
                              </span>
                              <span className="text-[8px] text-gray-400 block leading-tight">
                                {period.hours}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div className="space-y-1.5">
                  <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                    Reason (Optional)
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Tell us why you're rescheduling (optional)..."
                    className="w-full text-[11px] p-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] bg-white placeholder-gray-400 h-14 resize-none font-medium"
                  />
                </div>

                {/* Bottom note */}
                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-start gap-2 text-xs text-gray-500">
                  <ShieldCheck
                    size={13}
                    className="text-gray-400 shrink-0 mt-0.5"
                    strokeWidth={2.5}
                  />
                  <span>
                    {isLate
                      ? "Late reschedule may affect the provider's schedule. The fee compensates the provider for the inconvenience."
                      : "This is a free reschedule. No token or fee will be used."}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2 shrink-0">
              <button
                onClick={handleResetAndClose}
                className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors"
              >
                {isLate ? "Keep current booking" : "Keep current"}
              </button>
              <button
                disabled={isSelectButtonDisabled()}
                onClick={() => {
                  if (!isLate) {
                    setStep("success");
                  } else if (paymentOption === "token") {
                    setStep("confirm");
                  } else if (paymentOption === "cash") {
                    setStep("payment_gateways");
                  }
                }}
                className={`flex-1 py-2.5 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
                  isSelectButtonDisabled()
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : isLate && paymentOption === "cash"
                      ? "text-white"
                      : "bg-[#1e3a8a] hover:bg-blue-900 text-white"
                }`}
                style={
                  !isSelectButtonDisabled() &&
                  isLate &&
                  paymentOption === "cash"
                    ? { backgroundColor: "#e8683f" }
                    : {}
                }
              >
                {isLate && paymentOption === "token" && <Ticket size={13} />}
                {isLate && paymentOption === "cash" && <Wallet2 size={13} />}
                {!isLate
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

        {/* ══════════════════════════════════════════
            STEP 2 — CONFIRM (Token path warning)
        ══════════════════════════════════════════ */}
        {step === "confirm" && (
          <>
            <div className="p-6 flex flex-col items-center text-center space-y-5 flex-1">
              <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                <Ticket size={28} className="text-[#1e3a8a]" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base">
                  Use 1 reschedule token?
                </h4>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-xs">
                  This will use 1 of your{" "}
                  <span className="font-bold text-gray-700">2 remaining</span>{" "}
                  reschedule tokens to waive the Rs. {LATE_FEE} late fee. You
                  will have <span className="font-bold text-[#1e3a8a]">1</span>{" "}
                  token remaining this year.
                </p>
              </div>

              <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between max-w-xs">
                <span className="text-xs font-medium text-gray-600">
                  Tokens after this action
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1e3a8a] text-sm">
                    1 of 3
                  </span>
                  <div className="flex gap-1">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#1e3a8a]" />
                    <div className="w-3.5 h-3.5 rounded-full bg-gray-200" />
                    <div className="w-3.5 h-3.5 rounded-full bg-gray-200" />
                  </div>
                </div>
              </div>

              <div className="w-full bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800 max-w-xs">
                <CircleAlert
                  size={13}
                  className="shrink-0 mt-0.5 text-amber-600"
                />
                <span>
                  Tokens are non-refundable and reset annually. Proceed only if
                  you're sure about rescheduling.
                </span>
              </div>

              <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-left space-y-1.5 max-w-xs text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">New Date:</span>
                  <span className="font-bold text-gray-800">
                    June {selectedDate}, 2026
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time Segment:</span>
                  <span className="font-bold text-[#1e3a8a]">
                    {getActivePeriodLabel()} Block
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-gray-200 text-amber-700 font-semibold">
                  <span>Payment:</span>
                  <span>1 Reschedule Token</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
              <button
                onClick={() => setStep("select")}
                className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors"
              >
                Go back
              </button>
              <button
                onClick={() => setStep("success")}
                className="flex-1 py-2.5 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Ticket size={13} /> Yes, use token
              </button>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════
            STEP 3 — PAYMENT GATEWAYS (Cash path)
        ══════════════════════════════════════════ */}
        {step === "payment_gateways" && (
          <>
            <div className="p-6 space-y-5 flex-1">
              <div className="text-center space-y-1">
                <p className="text-xs text-gray-500 font-medium">
                  Amount to pay
                </p>
                <p className="text-3xl font-black text-gray-900">
                  Rs. {LATE_FEE}
                </p>
                <p className="text-[11px] text-gray-400">
                  Late reschedule fee → {currentBooking.provider}
                </p>
              </div>

              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Select payment method
                </span>
                <div className="space-y-2">
                  {(["esewa", "khalti"] as DigitalWallet[]).map((wallet) => {
                    const isEsewa = wallet === "esewa";
                    const selected = selectedWallet === wallet;
                    return (
                      <button
                        key={wallet!}
                        onClick={() => setSelectedWallet(wallet)}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                          selected
                            ? isEsewa
                              ? "border-green-500 bg-green-50"
                              : "border-purple-500 bg-purple-50"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0 ${isEsewa ? "bg-green-500" : "bg-purple-600"}`}
                        >
                          {isEsewa ? "e" : "K"}
                        </div>
                        <div className="flex-1">
                          <p
                            className={`font-bold text-sm ${selected ? (isEsewa ? "text-green-700" : "text-purple-700") : "text-gray-800"}`}
                          >
                            {isEsewa ? "eSewa" : "Khalti"}
                          </p>
                          <p className="text-[11px] text-gray-400 font-medium">
                            {isEsewa ? "Digital wallet" : "Mobile payment"}
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selected ? (isEsewa ? "border-green-500 bg-green-500" : "border-purple-500 bg-purple-500") : "border-gray-300"}`}
                        >
                          {selected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-start gap-2 text-xs text-gray-500">
                <ShieldCheck
                  size={13}
                  className="text-gray-400 shrink-0 mt-0.5"
                />
                <span>
                  Payment goes directly to{" "}
                  <span className="font-semibold text-gray-700">
                    {currentBooking.provider}
                  </span>{" "}
                  as compensation for the late reschedule.
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
              <button
                onClick={() => setStep("select")}
                className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors"
              >
                Go back
              </button>
              <button
                disabled={!selectedWallet}
                onClick={() => setStep("confirm_payment")}
                className={`flex-1 py-2.5 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  !selectedWallet
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : selectedWallet === "esewa"
                      ? "bg-green-500 hover:bg-green-600 text-white"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              >
                <Wallet2 size={13} />
                Confirm payment
              </button>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════
            STEP 3b — CONFIRM PAYMENT (Cash path warning)
        ══════════════════════════════════════════ */}
        {step === "confirm_payment" && (
          <>
            <div className="p-6 flex flex-col items-center text-center space-y-5 flex-1">
              <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
                <AlertTriangle size={28} className="text-[#e8683f]" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-base">
                  Confirm payment of Rs. {LATE_FEE}?
                </h4>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-xs">
                  You are about to pay{" "}
                  <span className="font-bold text-gray-700">
                    Rs. {LATE_FEE}
                  </span>{" "}
                  via{" "}
                  <span
                    className="font-bold"
                    style={{
                      color: selectedWallet === "esewa" ? "#16a34a" : "#7c3aed",
                    }}
                  >
                    {selectedWallet === "esewa" ? "eSewa" : "Khalti"}
                  </span>{" "}
                  as a late reschedule fee directly to{" "}
                  <span className="font-bold text-gray-700">
                    {currentBooking.provider}
                  </span>
                  .
                </p>
              </div>

              <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-left space-y-2 max-w-xs text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">New Date:</span>
                  <span className="font-bold text-gray-800">
                    June {selectedDate}, 2026
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time Segment:</span>
                  <span className="font-bold text-[#1e3a8a]">
                    {getActivePeriodLabel()} Block
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-400">Payment via:</span>
                  <span
                    className={`font-bold ${selectedWallet === "esewa" ? "text-green-700" : "text-purple-700"}`}
                  >
                    {selectedWallet === "esewa" ? "eSewa" : "Khalti"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Amount:</span>
                  <span className="font-bold text-gray-800">
                    Rs. {LATE_FEE}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Recipient:</span>
                  <span className="font-bold text-gray-800">
                    {currentBooking.provider}
                  </span>
                </div>
              </div>

              <div className="w-full bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800 max-w-xs">
                <CircleAlert
                  size={13}
                  className="shrink-0 mt-0.5 text-amber-600"
                />
                <span>
                  This payment is non-refundable and goes directly to the
                  provider as compensation.
                </span>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 shrink-0">
              <button
                onClick={() => setStep("payment_gateways")}
                className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors"
              >
                Go back
              </button>
              <button
                onClick={() => setStep("success")}
                className={`flex-1 py-2.5 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  selectedWallet === "esewa"
                    ? "bg-green-500 hover:bg-green-600 text-white"
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                }`}
              >
                <Wallet2 size={13} />
                Yes, pay Rs. {LATE_FEE}
              </button>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════
            STEP 4 — SUCCESS
        ══════════════════════════════════════════ */}
        {step === "success" && (
          <>
            <div className="p-8 flex flex-col items-center text-center space-y-5 flex-1">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center relative">
                <CheckCircle2
                  size={36}
                  className="text-emerald-600"
                  strokeWidth={1.5}
                />
                <div className="absolute -top-1 -right-1 bg-[#1e3a8a] text-white p-0.5 rounded-full border-2 border-white animate-bounce">
                  <BellRing size={10} />
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 text-lg">
                  Reschedule Confirmed!
                </h4>
                <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-xs">
                  Your booking has been successfully rescheduled.{" "}
                  <span className="font-bold text-gray-700">
                    {currentBooking.provider}
                  </span>{" "}
                  has been notified.
                </p>
              </div>

              <div className="w-full space-y-2.5 max-w-xs">
                {/* Free cancel */}
                {!isLate && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800">
                    <CheckCircle2
                      size={16}
                      className="text-emerald-600 shrink-0"
                      strokeWidth={2}
                    />
                    <span className="font-semibold">
                      Free reschedule — no charge applied.
                    </span>
                  </div>
                )}
                {/* Token used */}
                {isLate && paymentOption === "token" && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 space-y-1 text-xs text-[#1e3a8a]">
                    <div className="flex items-center gap-2">
                      <Ticket size={14} className="shrink-0" />
                      <span className="font-bold">1 reschedule token used</span>
                    </div>
                    <p className="text-gray-500 font-medium pl-5">
                      Your token balance has been updated. Tokens reset
                      annually.
                    </p>
                  </div>
                )}
                {/* Cash paid */}
                {isLate && paymentOption === "cash" && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-gray-800">
                      <Wallet2 size={14} className="shrink-0 text-gray-500" />
                      <span className="font-bold">
                        Rs. {LATE_FEE} paid via{" "}
                        {selectedWallet === "esewa" ? "eSewa" : "Khalti"}
                      </span>
                    </div>
                    <p className="text-gray-500 font-medium pl-5">
                      Fee transferred to {currentBooking.provider} as
                      compensation.
                    </p>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-left space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-400">New Date:</span>
                    <span className="font-bold text-gray-800">
                      June {selectedDate}, 2026
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Time Segment:</span>
                    <span className="font-bold text-[#1e3a8a]">
                      {getActivePeriodLabel()} Block
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Provider:</span>
                    <span className="font-bold text-gray-800">
                      {currentBooking.provider}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 shrink-0">
              <button
                onClick={handleResetAndClose}
                className="w-full py-2.5 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-colors"
              >
                Done
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

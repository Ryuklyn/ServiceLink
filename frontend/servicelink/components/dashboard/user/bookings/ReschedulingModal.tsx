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
} from "lucide-react";

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
  const [step, setStep] = useState<
    "select" | "confirm" | "payment_gateways" | "success"
  >("select");

  const [selectedDate, setSelectedDate] = useState<number | null>(9);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("morning");
  const [reason, setReason] = useState<string>("");
  const [paymentOption, setPaymentOption] = useState<"token" | "cash" | null>(
    null,
  );

  useEffect(() => {
    if (!isOpen) {
      setStep("select");
      setPaymentOption(null);
      setReason("");
      setSelectedDate(9);
      setSelectedPeriod("morning");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isLate) setPaymentOption(null);
  }, [isLate]);

  if (!isOpen) return null;

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
    setReason("");
  };

  const handlePrimaryAction = () => {
    if (step === "select") {
      setStep("confirm");
    } else if (step === "confirm") {
      if (isLate && paymentOption === "cash") {
        setStep("payment_gateways");
      } else {
        setStep("success");
      }
    } else if (step === "payment_gateways") {
      setStep("success");
    }
  };

  const getActivePeriodLabel = () =>
    timePeriods.find((p) => p.id === selectedPeriod)?.label || "";

  const getButtonLabel = () => {
    if (step === "confirm") return "Yes, Confirm Reschedule";
    if (step === "payment_gateways") return "Proceed to Pay";
    if (!isLate) return "Send request";
    if (paymentOption === "token") return "Pay 1 Token";
    if (paymentOption === "cash") return "Pay Rs. 50";
    return "Confirm reschedule";
  };

  const isButtonDisabled = () => {
    if (step === "select") {
      if (!selectedDate) return true;
      if (isLate && !paymentOption) return true;
    }
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-100 shadow-xl overflow-hidden flex flex-col transition-all duration-150 max-h-[95vh]">
        {/* ── Header ── */}
        <div className="p-4 pb-3 border-b border-gray-100 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-2">
            {/* Late badge in header — matches image 2 */}
            {step === "select" && (
              <CalendarIcon size={16} className="text-[#1e3a8a]" />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-sm">
                  {step === "select" && "Reschedule booking"}
                  {step === "confirm" && "Confirm Reschedule"}
                  {step === "payment_gateways" && "Select Payment Gateway"}
                  {step === "success" && "Reschedule Successful"}
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

        {/* ══════════════════════════════════════════
            STEP 1 — SELECT
        ══════════════════════════════════════════ */}
        {step === "select" && (
          <div className="overflow-y-auto flex-1">
            <div className="p-4 space-y-4">
              {/* ── Context Banner ── */}
              {isLate ? (
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2">
                  <Clock size={15} className="text-amber-600 shrink-0 mt-0.5" />
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
                    No rescheduling fee — you are in the free adjustment window
                    (&gt; 24 hrs before service).
                  </p>
                </div>
              )}

              {/* ── Current Booking Info ── */}
              <div className="border border-gray-150 rounded-xl overflow-hidden">
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

              {/* ── Main Content: Calendar + (Late: Payment Options side by side) ── */}
              {isLate ? (
                <div className="grid grid-cols-2 gap-4">
                  {/* Left col — Calendar + Time */}
                  <div className="space-y-4">
                    {/* Date Picker */}
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
                          <span>Su</span>
                          <span>Mo</span>
                          <span>Tu</span>
                          <span>We</span>
                          <span>Th</span>
                          <span>Fr</span>
                          <span>Sa</span>
                        </div>
                        <div className="grid grid-cols-7 text-center gap-y-0.5 text-[10px]">
                          {Array.from({ length: blankDaysBefore }).map(
                            (_, i) => (
                              <div key={`blank-${i}`} />
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

                    {/* Time Segments */}
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
                                  isActive ? "text-[#1e3a8a]" : "text-gray-400"
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

                  {/* Right col — Payment Options */}
                  <div className="space-y-2">
                    <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                      Choose How to Proceed
                    </label>

                    {/* Token Card */}
                    <div
                      onClick={() => setPaymentOption("token")}
                      className={`relative border p-3 rounded-xl cursor-pointer transition-all ${
                        paymentOption === "token"
                          ? "border-[#1e3a8a] bg-blue-50/40"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="absolute top-2 left-2 bg-[#1e3a8a] text-white font-bold text-[7px] px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                        Save Rs. 50
                      </div>
                      <div className="flex items-start justify-between mt-4">
                        <div className="flex flex-col items-center flex-1 gap-1">
                          <div className="p-2 bg-blue-50 rounded-lg text-[#1e3a8a] border border-blue-100">
                            <Ticket size={20} />
                          </div>
                          <h4 className="text-[11px] font-bold text-gray-900 text-center leading-tight">
                            Use 1 Reschedule Token
                          </h4>
                          <p className="text-[9px] text-gray-500 text-center">
                            No fee will be charged
                          </p>
                          <div className="mt-1 bg-gray-50 rounded-md p-1 flex items-center justify-between border border-gray-100 w-full">
                            <span className="text-[8px] text-gray-500">
                              Your tokens:
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-bold text-gray-800">
                                2 of 3
                              </span>
                              <span className="flex gap-0.5">
                                <span className="w-2 h-2 rounded-full bg-[#1e3a8a]" />
                                <span className="w-2 h-2 rounded-full bg-[#1e3a8a]" />
                                <span className="w-2 h-2 rounded-full bg-gray-300" />
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-1 ${
                            paymentOption === "token"
                              ? "border-[#1e3a8a] bg-[#1e3a8a]"
                              : "border-gray-300"
                          }`}
                        >
                          {paymentOption === "token" && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Cash Card */}
                    <div
                      onClick={() => setPaymentOption("cash")}
                      className={`relative border p-3 rounded-xl cursor-pointer transition-all ${
                        paymentOption === "cash"
                          ? "border-red-500 bg-red-50/20"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="absolute top-2 left-2 bg-red-400 text-white font-bold text-[7px] px-1.5 py-0.5 rounded-sm uppercase tracking-wide">
                        Pay Rs. 50
                      </div>
                      <div className="flex items-start justify-between mt-4">
                        <div className="flex flex-col items-center flex-1 gap-1">
                          <div className="p-2 bg-red-50 rounded-lg text-red-500 border border-red-100">
                            <Wallet2 size={20} />
                          </div>
                          <h4 className="text-[11px] font-bold text-gray-900 text-center">
                            Pay Rs. 50
                          </h4>
                          <p className="text-[9px] text-gray-500 text-center">
                            Late reschedule fee
                          </p>
                          <div className="mt-1 text-[8px] text-red-700/80 bg-red-50/50 p-1 rounded-md flex items-start gap-1 w-full">
                            <Info
                              size={9}
                              className="mt-0.5 shrink-0 text-red-500"
                            />
                            <span>
                              Goes directly to provider{" "}
                              {currentBooking.provider}
                            </span>
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-1 ${
                            paymentOption === "cash"
                              ? "border-red-500 bg-red-500"
                              : "border-gray-300"
                          }`}
                        >
                          {paymentOption === "cash" && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Payment methods note */}
                    {paymentOption === "cash" && (
                      <div className="space-y-1">
                        <p className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">
                          Payment Methods (if paying fee)
                        </p>
                        <div className="flex gap-2">
                          <div className="flex-1 flex items-center justify-center gap-1.5 p-2 border border-gray-200 rounded-lg bg-white">
                            <div className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[8px] flex items-center justify-center">
                              e
                            </div>
                            <span className="text-[10px] font-bold text-gray-700">
                              eSewa
                            </span>
                          </div>
                          <div className="flex-1 flex items-center justify-center gap-1.5 p-2 border border-gray-200 rounded-lg bg-white">
                            <div className="w-5 h-5 rounded-full bg-purple-700 text-white font-bold text-[8px] flex items-center justify-center">
                              K
                            </div>
                            <span className="text-[10px] font-bold text-gray-700">
                              Khalti
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* FREE TIER — Single column layout */
                <div className="space-y-4">
                  {/* Date Picker */}
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
                        <span>Su</span>
                        <span>Mo</span>
                        <span>Tu</span>
                        <span>We</span>
                        <span>Th</span>
                        <span>Fr</span>
                        <span>Sa</span>
                      </div>
                      <div className="grid grid-cols-7 text-center gap-y-0.5 text-[11px]">
                        {Array.from({ length: blankDaysBefore }).map((_, i) => (
                          <div key={`blank-${i}`} />
                        ))}
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

                  {/* Time Segments */}
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

              {/* ── Reason ── */}
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

              {/* ── Bottom Info Banner ── */}
              {isLate ? (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-start gap-2">
                  <Shield
                    size={13}
                    className="text-emerald-600 shrink-0 mt-0.5"
                  />
                  <p className="text-[10px] text-emerald-800 font-medium leading-relaxed">
                    This late reschedule may affect the provider's other
                    commitments. The fee compensates the provider for the
                    inconvenience.
                  </p>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl flex items-start gap-2">
                  <Shield
                    size={13}
                    className="text-emerald-600 shrink-0 mt-0.5"
                  />
                  <p className="text-[10px] text-emerald-800 font-medium leading-relaxed">
                    This is a free reschedule.{" "}
                    <span className="font-bold">
                      No token or fee will be used.
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 2 — CONFIRM
        ══════════════════════════════════════════ */}
        {step === "confirm" && (
          <div className="p-5 text-center space-y-4 flex-1">
            <div className="w-11 h-11 bg-amber-50 rounded-full flex items-center justify-center mx-auto border border-amber-100">
              <AlertTriangle size={22} className="text-[#e8683f]" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-900">
                Are you sure you want to reschedule?
              </h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                This will submit a scheduling alteration request directly to our
                provider dispatch workflow system.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-left space-y-1.5 max-w-xs mx-auto text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Target Date:</span>
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
              {isLate && (
                <div className="flex justify-between pt-1.5 border-t border-gray-200 text-amber-700 font-semibold">
                  <span>Payment Method:</span>
                  <span className="capitalize">
                    {paymentOption === "token"
                      ? "Reschedule Token"
                      : "Rs. 50 Cash Fee"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 3 — PAYMENT GATEWAYS
        ══════════════════════════════════════════ */}
        {step === "payment_gateways" && (
          <div className="p-5 space-y-4 text-center flex-1">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-900">
                Complete Late Reschedule Fee
              </h4>
              <p className="text-xs text-gray-500">
                Choose your preferred digital payment network provider
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto pt-2">
              <button
                onClick={() => setStep("success")}
                className="p-4 border border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/20 transition-all flex flex-col items-center gap-2 group"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                  e
                </div>
                <span className="text-xs font-bold text-gray-700">eSewa</span>
              </button>
              <button
                onClick={() => setStep("success")}
                className="p-4 border border-gray-200 rounded-xl hover:border-purple-600 hover:bg-purple-50/20 transition-all flex flex-col items-center gap-2 group"
              >
                <div className="w-9 h-9 rounded-full bg-purple-700 text-white font-bold text-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                  K
                </div>
                <span className="text-xs font-bold text-gray-700">Khalti</span>
              </button>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">
              Rs. 50 will go directly to {currentBooking.provider}
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════════
            STEP 4 — SUCCESS
        ══════════════════════════════════════════ */}
        {step === "success" && (
          <div className="p-6 text-center space-y-4 flex-1">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100 relative">
              <CheckCircle2 size={24} className="text-emerald-600" />
              <div className="absolute -top-1 -right-1 bg-[#1e3a8a] text-white p-0.5 rounded-full border border-white animate-bounce">
                <BellRing size={10} />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-gray-900">
                Request Dispatched Successfully!
              </h4>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Your alternative scheduling setup is sent to provider{" "}
                <span className="font-bold text-gray-800">
                  {currentBooking.provider}
                </span>{" "}
                for priority validation.
              </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-left space-y-1.5 max-w-xs mx-auto text-xs">
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
              {isLate && (
                <div className="flex justify-between pt-1.5 border-t border-gray-200">
                  <span className="text-gray-400">Fee Status:</span>
                  <span className="font-bold text-emerald-700">
                    {paymentOption === "token"
                      ? "Token Used ✓"
                      : "Rs. 50 Paid ✓"}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="p-3 bg-gray-50 border-t border-gray-100 flex gap-2 shrink-0">
          {step !== "success" ? (
            <>
              <button
                onClick={
                  step === "confirm" || step === "payment_gateways"
                    ? () => setStep("select")
                    : handleResetAndClose
                }
                className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 font-bold text-xs rounded-xl hover:bg-gray-50 transition-colors"
              >
                {step === "confirm" || step === "payment_gateways"
                  ? "Back to Edit"
                  : isLate
                    ? "Keep current booking"
                    : "Keep current"}
              </button>

              {step !== "payment_gateways" && (
                <button
                  onClick={handlePrimaryAction}
                  disabled={isButtonDisabled()}
                  className={`flex-1 py-2.5 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 ${
                    isButtonDisabled()
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-[#1e3a8a] hover:bg-blue-900 text-white"
                  }`}
                >
                  {step === "select" && isLate && paymentOption === "token" && (
                    <Ticket size={13} />
                  )}
                  {step === "select" && isLate && paymentOption === "cash" && (
                    <Wallet2 size={13} />
                  )}
                  {getButtonLabel()}
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleResetAndClose}
              className="w-full py-2.5 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-colors text-center"
            >
              Acknowledge & Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

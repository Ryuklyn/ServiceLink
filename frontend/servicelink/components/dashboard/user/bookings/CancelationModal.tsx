"use client";

import React, { useState } from "react";
import {
  X,
  AlertTriangle,
  CheckCircle,
  Clock,
  Coins,
  Wallet,
  ShieldCheck,
  ChevronRight,
  CircleAlert,
  BadgeCheck,
  Ticket,
} from "lucide-react";

interface BookingData {
  id: string;
  providerName: string;
  serviceName: string;
  dateDisplay: string;
  timeDisplay: string;
  locationDisplay: string;
  price: number;
}

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLate?: boolean;
  cancellationTokensRemaining?: number;
  bookingData?: BookingData;
  onConfirmCancel?: (reason: string) => void;
}

type Step = "select" | "confirm" | "payment" | "confirm-payment" | "success";
type PaymentMethod = "token" | "fee" | null;
type DigitalWallet = "esewa" | "khalti" | null;

const LATE_FEE = 100;
const REASONS = [
  "No longer needed",
  "Schedule conflict",
  "Found another provider",
  "Emergency (family/medical)",
  "Festival / Bhoj conflict",
  "Other",
];

function ModalHeader({
                       isLate,
                       bookingData,
                       onClose,
                     }: {
  isLate: boolean;
  bookingData: BookingData;
  onClose: () => void;
}) {
  return (
      <div className="p-5 pb-4 border-b border-gray-100 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div
              className={`p-2 rounded-xl ${isLate ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600"}`}
          >
            {isLate ? <AlertTriangle size={18} /> : <CheckCircle size={18} />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-gray-900 text-base">
                Cancel booking?
              </h3>
              {isLate && (
                  <span className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                <Clock size={10} /> Late (24 hrs)
              </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-gray-400 mt-0.5">
              BK-{bookingData.id} · {bookingData.providerName}
            </p>
          </div>
        </div>
        <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
  );
}

function BookingSummaryCard({ data }: { data: BookingData }) {
  return (
      <div className="bg-gray-50/70 border border-gray-200 rounded-xl p-3.5 space-y-2 text-xs">
      <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
        Booking Summary
      </span>
        {[
          ["Service", data.serviceName],
          ["Provider", data.providerName],
          ["Date & Time", `${data.dateDisplay} - ${data.timeDisplay}`],
          ["Location", data.locationDisplay],
        ].map(([label, value]) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">{label}</span>
              <span className="text-gray-900 font-semibold max-w-[200px] truncate text-right">
            {value}
          </span>
            </div>
        ))}
      </div>
  );
}

function FreeCancelStep({
                          bookingData,
                          onClose,
                          onConfirm,
                          onReasonChange,
                        }: {
  bookingData: BookingData;
  onClose: () => void;
  onConfirm: () => void;
  onReasonChange: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  const handleReasonChange = (r: string) => {
    setReason(r);
    onReasonChange(r);
  };

  return (
      <>
        <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-180px)]">
          <BookingSummaryCard data={bookingData} />
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex gap-2.5 text-xs text-emerald-800">
            <CheckCircle
                size={16}
                className="text-emerald-600 shrink-0 mt-0.5"
                strokeWidth={2.5}
            />
            <div>
              <p className="font-bold">
                No cancellation fee - free window active
              </p>
              <p className="text-emerald-700 leading-normal font-medium mt-0.5">
                You are more than 24 hours before your service. No token or fee
                will be used.
              </p>
            </div>
          </div>
          <div className="space-y-2">
          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Why are you cancelling?{" "}
            <span className="font-normal normal-case">(optional)</span>
          </span>
            <div className="space-y-1.5">
              {REASONS.map((r) => (
                  <label
                      key={r}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          reason === r
                              ? "border-[#1e3a8a] bg-blue-50/30 text-gray-900"
                              : "border-gray-200 hover:border-gray-300 bg-white text-gray-600"
                      }`}
                  >
                    <input
                        type="radio"
                        name="freeReason"
                        value={r}
                        checked={reason === r}
                        onChange={() => handleReasonChange(r)}
                        className="w-4 h-4 text-[#1e3a8a] border-gray-300 focus:ring-[#1e3a8a]"
                    />
                    {r}
                  </label>
              ))}
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-800">
            <ShieldCheck
                size={14}
                className="text-emerald-600 shrink-0"
                strokeWidth={2.5}
            />
            <span className="font-medium">
            This cancellation is free. No token or fee will be used.
          </span>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors"
          >
            Keep booking
          </button>
          <button
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Confirm cancel
          </button>
        </div>
      </>
  );
}

function OptionCard({
                      selected,
                      disabled = false,
                      onClick,
                      badge,
                      badgeColor,
                      icon,
                      iconBg,
                      title,
                      subtitle,
                      footer,
                    }: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
}) {
  return (
      <div
          onClick={disabled ? undefined : onClick}
          className={`relative rounded-2xl border-2 p-4 transition-all select-none
        ${disabled ? "opacity-40 cursor-not-allowed border-gray-200 bg-white" : "cursor-pointer"}
        ${!disabled && selected ? "border-[#1e3a8a] bg-white shadow-sm" : ""}
        ${!disabled && !selected ? "border-gray-200 bg-white hover:border-gray-300" : ""}
      `}
      >
        <div className="flex items-center justify-between mb-4">
        <span
            className={`text-[10px] font-black px-2.5 py-1 rounded-lg tracking-wide ${badgeColor}`}
        >
          {badge}
        </span>
          <div
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors
            ${selected ? "border-[#1e3a8a] bg-[#1e3a8a]" : "border-gray-300 bg-white"}
          `}
          >
            {selected && <div className="w-2 h-2 rounded-full bg-white" />}
          </div>
        </div>
        <div className="flex flex-col items-center text-center gap-2 py-1 mb-4">
          <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${iconBg}`}
          >
            {icon}
          </div>
          <p className="font-bold text-gray-900 text-sm leading-tight mt-1">
            {title}
          </p>
          <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
        </div>
        {footer}
      </div>
  );
}

function LateCancelStep({
                          bookingData,
                          tokensRemaining,
                          paymentMethod,
                          setPaymentMethod,
                          onClose,
                          onProceed,
                          onReasonChange,
                        }: {
  bookingData: BookingData;
  tokensRemaining: number;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  onClose: () => void;
  onProceed: () => void;
  onReasonChange: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const hasTokens = tokensRemaining > 0;
  const canProceed = paymentMethod !== null;

  const handleReasonChange = (r: string) => {
    setReason(r);
    onReasonChange(r);
  };

  const ctaLabel = () => {
    if (!paymentMethod) return "Select an option";
    if (paymentMethod === "token")
      return (
          <span className="flex items-center justify-center gap-1.5">
          <Coins size={13} /> Pay 1 Token
        </span>
      );
    return (
        <span className="flex items-center justify-center gap-1.5">
        <Wallet size={13} /> Pay Rs. {LATE_FEE}
      </span>
    );
  };

  const ctaBg = !canProceed
      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
      : paymentMethod === "token"
          ? "bg-[#1e3a8a] hover:bg-blue-900 text-white"
          : "text-white";

  return (
      <>
        <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(100vh-180px)]">
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3.5 flex gap-2.5 text-xs text-orange-800">
            <Clock
                size={16}
                className="text-orange-500 shrink-0 mt-0.5"
                strokeWidth={2.5}
            />
            <p className="font-semibold leading-normal">
              You are within 24 hours of your booking. This is a late
              cancellation.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-4">
              <BookingSummaryCard data={bookingData} />
              <div className="space-y-2">
              <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Reason{" "}
                <span className="font-normal normal-case">(optional)</span>
              </span>
                <div className="space-y-1.5">
                  {REASONS.map((r) => (
                      <label
                          key={r}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                              reason === r
                                  ? "border-[#1e3a8a] bg-blue-50/30 text-gray-900"
                                  : "border-gray-200 hover:border-gray-300 bg-white text-gray-600"
                          }`}
                      >
                        <input
                            type="radio"
                            name="lateReason"
                            value={r}
                            checked={reason === r}
                            onChange={() => handleReasonChange(r)}
                            className="w-4 h-4 text-[#1e3a8a] border-gray-300 focus:ring-[#1e3a8a]"
                        />
                        {r}
                      </label>
                  ))}
                </div>
                <textarea
                    placeholder="Tell us more (optional)..."
                    className="w-full mt-1 p-2.5 border border-gray-200 rounded-xl text-xs resize-none text-gray-600 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1e3a8a] focus:border-[#1e3a8a]"
                    rows={2}
                />
              </div>
            </div>

            <div className="space-y-3">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Choose how to proceed
            </span>

              <OptionCard
                  selected={paymentMethod === "token"}
                  disabled={!hasTokens}
                  onClick={() => setPaymentMethod("token")}
                  badge={`SAVE RS. ${LATE_FEE}`}
                  badgeColor="bg-[#1e3a8a] text-white"
                  iconBg="bg-blue-50"
                  icon={
                    <Ticket size={26} className="text-[#1e3a8a]" strokeWidth={1.6} />
                  }
                  title="Use 1 Cancellation Token"
                  subtitle="No fee will be charged"
                  footer={
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 font-medium">
                    Your tokens:
                  </span>
                      <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-[#1e3a8a]">
                      {tokensRemaining} of 2
                    </span>
                        <div className="flex gap-1">
                          {[0, 1].map((i) => (
                              <div
                                  key={i}
                                  className={`w-3.5 h-3.5 rounded-full ${
                                      i < tokensRemaining ? "bg-[#1e3a8a]" : "bg-gray-300"
                                  }`}
                              />
                          ))}
                        </div>
                      </div>
                    </div>
                  }
              />

              <OptionCard
                  selected={paymentMethod === "fee"}
                  onClick={() => setPaymentMethod("fee")}
                  badge={`PAY RS. ${LATE_FEE}`}
                  badgeColor="bg-red-500 text-white"
                  iconBg="bg-red-50"
                  icon={
                    <Wallet size={26} className="text-red-400" strokeWidth={1.6} />
                  }
                  title={`Pay Rs. ${LATE_FEE}`}
                  subtitle="Late cancellation fee"
                  footer={
                    <div className="bg-red-50 border border-red-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
                      <CircleAlert size={13} className="text-red-400 shrink-0 mt-0.5" />
                      <p className="text-[11px] text-red-600 font-medium leading-tight">
                        Goes directly to provider{" "}
                        <span className="font-bold">{bookingData.providerName}</span>
                      </p>
                    </div>
                  }
              />

              <div className="flex items-center gap-2 px-1">
              <span className="text-[10px] text-gray-400 font-medium">
                Accepted:
              </span>
                <div className="flex gap-1.5">
                  {[
                    { id: "esewa",  label: "e", bg: "bg-green-500",  text: "eSewa"  },
                    { id: "khalti", label: "K", bg: "bg-purple-600", text: "Khalti" },
                  ].map((w) => (
                      <div
                          key={w.id}
                          className="flex items-center gap-1 bg-gray-100 rounded-full pl-0.5 pr-2 py-0.5"
                      >
                        <div
                            className={`w-4 h-4 rounded-full ${w.bg} flex items-center justify-center text-[9px] font-black text-white`}
                        >
                          {w.label}
                        </div>
                        <span className="text-[10px] text-gray-600 font-semibold">
                      {w.text}
                    </span>
                      </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex items-start gap-2 text-xs text-gray-500">
            <ShieldCheck
                size={13}
                className="text-gray-400 shrink-0 mt-0.5"
                strokeWidth={2.5}
            />
            <span>
            Late cancellation may affect the provider's schedule. The fee
            compensates the provider for the inconvenience.
          </span>
          </div>
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors"
          >
            Keep booking
          </button>
          <button
              disabled={!canProceed}
              onClick={onProceed}
              style={
                canProceed && paymentMethod === "fee"
                    ? { backgroundColor: "#e8683f" }
                    : {}
              }
              className={`flex-1 py-2.5 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 ${ctaBg}`}
          >
            {ctaLabel()}
          </button>
        </div>
      </>
  );
}

function ConfirmTokenStep({
                            tokensRemaining,
                            onBack,
                            onConfirm,
                          }: {
  tokensRemaining: number;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
      <>
        <div className="p-6 flex flex-col items-center text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
            <Coins size={28} className="text-[#1e3a8a]" />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-base">
              Use 1 cancellation token?
            </h4>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-xs">
              This will use 1 of your {tokensRemaining} remaining cancellation
              tokens to waive the Rs. {LATE_FEE} late fee. You will have{" "}
              <span className="font-bold text-[#1e3a8a]">
              {tokensRemaining - 1}
            </span>{" "}
              token{tokensRemaining - 1 !== 1 ? "s" : ""} remaining this year.
            </p>
          </div>
          <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-600">
            Tokens after this action
          </span>
            <div className="flex items-center gap-2">
            <span className="font-bold text-[#1e3a8a] text-sm">
              {tokensRemaining - 1} of 2
            </span>
              <div className="flex gap-1">
                {[0, 1].map((i) => (
                    <div
                        key={i}
                        className={`w-4 h-4 rounded-full transition-colors ${
                            i < tokensRemaining - 1 ? "bg-[#1e3a8a]" : "bg-gray-200"
                        }`}
                    />
                ))}
              </div>
            </div>
          </div>
          <div className="w-full bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800">
            <CircleAlert size={13} className="shrink-0 mt-0.5 text-amber-600" />
            <span>
            Tokens are non-refundable and reset annually. Proceed only if you
            are sure about cancelling.
          </span>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
              onClick={onBack}
              className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors"
          >
            Go back
          </button>
          <button
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
          >
            <Coins size={13} /> Yes, use token
          </button>
        </div>
      </>
  );
}

function PaymentStep({
                       selectedWallet,
                       setSelectedWallet,
                       providerName,
                       onBack,
                       onConfirm,
                     }: {
  selectedWallet: DigitalWallet;
  setSelectedWallet: (w: DigitalWallet) => void;
  providerName: string;
  onBack: () => void;
  onConfirm: () => void;
}) {
  return (
      <>
        <div className="p-6 space-y-5">
          <div className="text-center space-y-1">
            <p className="text-xs text-gray-500 font-medium">Amount to pay</p>
            <p className="text-3xl font-black text-gray-900">Rs. {LATE_FEE}</p>
            <p className="text-[11px] text-gray-400">
              Late cancellation fee - {providerName}
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
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white flex-shrink-0 ${
                              isEsewa ? "bg-green-500" : "bg-purple-600"
                          }`}
                      >
                        {isEsewa ? "e" : "K"}
                      </div>
                      <div className="flex-1">
                        <p
                            className={`font-bold text-sm ${
                                selected
                                    ? isEsewa
                                        ? "text-green-700"
                                        : "text-purple-700"
                                    : "text-gray-800"
                            }`}
                        >
                          {isEsewa ? "eSewa" : "Khalti"}
                        </p>
                        <p className="text-[11px] text-gray-400 font-medium">
                          {isEsewa ? "Digital wallet" : "Mobile payment"}
                        </p>
                      </div>
                      <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              selected
                                  ? isEsewa
                                      ? "border-green-500 bg-green-500"
                                      : "border-purple-500 bg-purple-500"
                                  : "border-gray-300"
                          }`}
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
            <ShieldCheck size={13} className="text-gray-400 shrink-0 mt-0.5" />
            <span>
            Payment goes directly to{" "}
              <span className="font-semibold text-gray-700">{providerName}</span>{" "}
              as compensation.
          </span>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
              onClick={onBack}
              className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors"
          >
            Go back
          </button>
          <button
              disabled={!selectedWallet}
              onClick={onConfirm}
              className={`flex-1 py-2.5 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  !selectedWallet
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : selectedWallet === "esewa"
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-purple-600 hover:bg-purple-700 text-white"
              }`}
          >
            <Wallet size={13} /> Confirm payment
          </button>
        </div>
      </>
  );
}

function ConfirmPaymentStep({
                              selectedWallet,
                              onBack,
                              onConfirm,
                            }: {
  selectedWallet: DigitalWallet;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const isEsewa = selectedWallet === "esewa";
  const walletName = isEsewa ? "eSewa" : "Khalti";
  const walletColor = isEsewa ? "text-green-700" : "text-purple-700";
  const walletBg = isEsewa ? "bg-green-500" : "bg-purple-600";
  const walletBorder = isEsewa
      ? "border-green-200 bg-green-50"
      : "border-purple-200 bg-purple-50";

  return (
      <>
        <div className="p-6 flex flex-col items-center text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center">
            <AlertTriangle size={28} className="text-[#e8683f]" strokeWidth={1.8} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-base">Confirm payment?</h4>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed max-w-xs">
              You are about to pay{" "}
              <span className="font-bold text-gray-800">Rs. {LATE_FEE}</span> as a
              late cancellation fee via{" "}
              <span className={`font-bold ${walletColor}`}>{walletName}</span>.
              This action cannot be undone.
            </p>
          </div>
          <div className={`w-full border rounded-xl p-4 space-y-3 ${walletBorder}`}>
            <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              Payment method
            </span>
              <div className="flex items-center gap-1.5">
                <div
                    className={`w-5 h-5 rounded-full ${walletBg} flex items-center justify-center text-[10px] font-black text-white`}
                >
                  {isEsewa ? "e" : "K"}
                </div>
                <span className={`text-xs font-bold ${walletColor}`}>
                {walletName}
              </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Amount</span>
              <span className="text-xs font-bold text-gray-900">
              Rs. {LATE_FEE}
            </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Reason</span>
              <span className="text-xs font-bold text-gray-900">
              Late cancellation fee
            </span>
            </div>
          </div>
          <div className="w-full bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2 text-xs text-amber-800">
            <CircleAlert size={13} className="shrink-0 mt-0.5 text-amber-600" />
            <span>
            This payment will be sent directly to the provider. It is
            non-refundable once confirmed.
          </span>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
              onClick={onBack}
              className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors"
          >
            Go back
          </button>
          <button
              onClick={onConfirm}
              style={{ backgroundColor: "#e8683f" }}
              className="flex-1 py-2.5 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 hover:opacity-90"
          >
            <Wallet size={13} /> Yes, pay Rs. {LATE_FEE}
          </button>
        </div>
      </>
  );
}

function SuccessStep({
                       paymentMethod,
                       selectedWallet,
                       onClose,
                     }: {
  paymentMethod: PaymentMethod;
  selectedWallet: DigitalWallet;
  onClose: () => void;
}) {
  const usedToken = paymentMethod === "token";
  const isFree = paymentMethod === null;
  return (
      <>
        <div className="p-8 flex flex-col items-center text-center space-y-5">
          <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center">
            <BadgeCheck size={36} className="text-emerald-600" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900 text-lg">Booking cancelled</h4>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              Your booking has been successfully cancelled.
            </p>
          </div>
          <div className="w-full space-y-2.5">
            {isFree && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-emerald-800">
                  <CheckCircle
                      size={16}
                      className="text-emerald-600 shrink-0"
                      strokeWidth={2}
                  />
                  <span className="font-semibold">
                Free cancellation - no charge applied.
              </span>
                </div>
            )}
            {usedToken && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 space-y-1 text-xs text-[#1e3a8a]">
                  <div className="flex items-center gap-2">
                    <Coins size={14} className="shrink-0" />
                    <span className="font-bold">1 cancellation token used</span>
                  </div>
                  <p className="text-gray-500 font-medium pl-5">
                    Your token balance has been updated. Tokens reset annually.
                  </p>
                </div>
            )}
            {!usedToken && !isFree && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-1 text-xs">
                  <div className="flex items-center gap-2 text-gray-800">
                    <Wallet size={14} className="shrink-0 text-gray-500" />
                    <span className="font-bold">
                  Rs. {LATE_FEE} paid via{" "}
                      {selectedWallet === "esewa" ? "eSewa" : "Khalti"}
                </span>
                  </div>
                  <p className="text-gray-500 font-medium pl-5">
                    Fee transferred to provider as compensation.
                  </p>
                </div>
            )}
            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-500 text-left">
              <p className="font-semibold text-gray-700 mb-1.5">
                What happens next?
              </p>
              <ul className="space-y-1 list-none">
                {[
                  "Provider has been notified of the cancellation",
                  "Their slot has been freed automatically",
                  "You can rebook any service from the home screen",
                ].map((item) => (
                    <li key={item} className="flex items-start gap-1.5">
                      <ChevronRight
                          size={12}
                          className="text-gray-400 shrink-0 mt-0.5"
                      />
                      {item}
                    </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <button
              onClick={onClose}
              className="w-full py-2.5 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </>
  );
}

export default function CancellationModal({
                                            isOpen,
                                            onClose,
                                            isLate = false,
                                            cancellationTokensRemaining = 2,
                                            bookingData = {
                                              id: "0",
                                              providerName: "Service Provider",
                                              serviceName: "Service",
                                              dateDisplay: "Tomorrow",
                                              timeDisplay: "10:00 AM",
                                              locationDisplay: "Kathmandu",
                                              price: 0,
                                            },
                                            onConfirmCancel,
                                          }: CancellationModalProps) {
  const [step, setStep] = useState<Step>("select");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [selectedWallet, setSelectedWallet] = useState<DigitalWallet>(null);
  const [selectedReason, setSelectedReason] = useState<string>("");

  if (!isOpen) return null;

  const handleClose = () => {
    setStep("select");
    setPaymentMethod(null);
    setSelectedWallet(null);
    setSelectedReason("");
    onClose();
  };

  const handleFreeConfirm = () => {
    onConfirmCancel?.(selectedReason);
    setStep("success");
  };

  const handleLateProceed = () => {
    if (paymentMethod === "token") {
      setStep("confirm");
    } else {
      setStep("payment");
    }
  };

  const handleTokenConfirm = () => {
    onConfirmCancel?.(selectedReason);
    setStep("success");
  };

  const handlePaymentNext = () => setStep("confirm-payment");

  const handlePaymentConfirm = () => {
    onConfirmCancel?.(selectedReason);
    setStep("success");
  };

  const showHeader = step !== "success";

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-white w-full max-w-lg rounded-2xl border border-gray-100 shadow-xl overflow-hidden flex flex-col max-h-[95vh]">
          {showHeader && (
              <ModalHeader
                  isLate={isLate}
                  bookingData={bookingData}
                  onClose={handleClose}
              />
          )}

          {step === "select" && !isLate && (
              <FreeCancelStep
                  bookingData={bookingData}
                  onClose={handleClose}
                  onConfirm={handleFreeConfirm}
                  onReasonChange={setSelectedReason}
              />
          )}

          {step === "select" && isLate && (
              <LateCancelStep
                  bookingData={bookingData}
                  tokensRemaining={cancellationTokensRemaining}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  onClose={handleClose}
                  onProceed={handleLateProceed}
                  onReasonChange={setSelectedReason}
              />
          )}

          {step === "confirm" && (
              <ConfirmTokenStep
                  tokensRemaining={cancellationTokensRemaining}
                  onBack={() => setStep("select")}
                  onConfirm={handleTokenConfirm}
              />
          )}

          {step === "payment" && (
              <PaymentStep
                  selectedWallet={selectedWallet}
                  setSelectedWallet={setSelectedWallet}
                  providerName={bookingData.providerName}
                  onBack={() => setStep("select")}
                  onConfirm={handlePaymentNext}
              />
          )}

          {step === "confirm-payment" && (
              <ConfirmPaymentStep
                  selectedWallet={selectedWallet}
                  onBack={() => setStep("payment")}
                  onConfirm={handlePaymentConfirm}
              />
          )}

          {step === "success" && (
              <SuccessStep
                  paymentMethod={isLate ? paymentMethod : null}
                  selectedWallet={selectedWallet}
                  onClose={handleClose}
              />
          )}
        </div>
      </div>
  );
}
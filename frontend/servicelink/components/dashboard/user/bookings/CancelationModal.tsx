"use client";

import React, { useState } from "react";
import { X, AlertTriangle, Info, Clock, CheckCircle } from "lucide-react";

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Set this to true to render Version 2 (Free), false for Version 1 (Late fine)
  isFreeCancellation?: boolean;
  bookingData?: {
    id: string;
    providerName: string;
    serviceName: string;
    dateDisplay: string;
    timeDisplay: string;
    locationDisplay: string;
    price: number;
  };
}

export default function CancellationModal({
  isOpen,
  onClose,
  isFreeCancellation = false, // Toggle this to change variants dynamically
  bookingData = {
    id: "BK-2024-78542",
    providerName: "CleanNest Services",
    serviceName: "Regular Cleaning",
    dateDisplay: "Tomorrow",
    timeDisplay: "10:00 AM",
    locationDisplay: "New Baneshwor, Kathmandu",
    price: 1600,
  },
}: CancellationModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");

  if (!isOpen) return null;

  // Fee calculation logic based on user prototype inputs
  const cancellationFee = isFreeCancellation ? 0 : 400;

  const cancellationReasons = [
    "No longer needed",
    "Schedule conflict",
    "Found another provider",
    "Emergency (family/medical)",
    "Festival / Bhoj conflict",
    "Other",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      {/* Main Modal Card Wrapper */}
      <div className="bg-white w-full max-w-md rounded-2xl border border-gray-100 shadow-xl overflow-hidden flex flex-col transition-all duration-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header Block */}
        <div className="p-5 pb-4 border-b border-gray-100 flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${isFreeCancellation ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}
            >
              {isFreeCancellation ? (
                <CheckCircle size={18} />
              ) : (
                <AlertTriangle size={18} />
              )}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base">
                Cancel booking?
              </h3>
              <p className="text-[11px] font-mono text-gray-400 mt-0.5">
                {bookingData.id} • {bookingData.providerName}
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

        {/* Scrollable Content Container */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-160px)]">
          {/* Section 1: Booking Summary Card */}
          <div className="bg-gray-50/70 border border-gray-150 rounded-xl p-3.5 space-y-2 text-xs">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">
              Booking Summary
            </span>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Service</span>
              <span className="text-gray-900 font-semibold">
                {bookingData.serviceName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Provider</span>
              <span className="text-gray-900 font-semibold">
                {bookingData.providerName}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Date & Time</span>
              <span className="text-gray-900 font-semibold">
                {bookingData.dateDisplay}, {bookingData.timeDisplay}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500 font-medium">Location</span>
              <span className="text-gray-900 font-semibold max-w-[180px] truncate">
                {bookingData.locationDisplay}
              </span>
            </div>
          </div>

          {/* Section 2: Cancellation Fee Breakdown Pricing Panel */}
          <div className="space-y-2.5">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Cancellation Fee
            </span>
            <div className="border border-gray-200 rounded-xl divide-y divide-gray-100 overflow-hidden text-xs">
              <div className="p-3 flex justify-between bg-white">
                <span className="text-gray-500 font-medium">
                  Service amount
                </span>
                <span className="text-gray-800 font-semibold">
                  Rs. {bookingData.price.toLocaleString()}
                </span>
              </div>
              <div className="p-3 flex justify-between bg-white">
                <span className="text-gray-500 font-medium">
                  Late cancellation fee
                </span>
                <span
                  className={`font-semibold ${cancellationFee > 0 ? "text-red-500" : "text-emerald-600"}`}
                >
                  Rs. {cancellationFee}
                </span>
              </div>
              <div className="p-3 flex justify-between bg-gray-50/60 font-bold">
                <span className="text-gray-900">You owe provider</span>
                <span
                  className={`text-sm ${cancellationFee > 0 ? "text-red-600" : "text-gray-900"}`}
                >
                  Rs. {cancellationFee}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Dynamic Context Banner Box (Mirrors layout from image_0d6fba.png) */}
          {isFreeCancellation ? (
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 flex gap-2.5 text-xs text-emerald-800">
              <Clock
                size={16}
                className="text-emerald-600 shrink-0 mt-0.5"
                strokeWidth={2.5}
              />
              <div className="space-y-1">
                <p className="font-bold">Free Cancellation Period Active</p>
                <p className="text-emerald-700/90 leading-normal font-medium">
                  You are within the free window. No cancellation fee will be
                  charged to your account or owed to the provider.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/60 border border-amber-300 rounded-xl p-3.5 flex gap-2.5 text-xs text-amber-900">
              <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold">Pay after service booking context</p>
                <p className="text-amber-800/90 leading-normal font-medium">
                  You haven't paid anything yet — no refund applies. However, a{" "}
                  <span className="font-bold">Rs. 400 cancellation fee</span> is
                  owed to {bookingData.providerName} for late notice. This must
                  be cleared before booking your next service.
                </p>
              </div>
            </div>
          )}

          {/* Section 4: Why are you cancelling interactive Radio List */}
          <div className="space-y-2.5">
            <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Why are you cancelling?
            </span>
            <div className="space-y-1.5">
              {cancellationReasons.map((reason) => {
                const isSelected = selectedReason === reason;
                return (
                  <label
                    key={reason}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                      isSelected
                        ? "border-[#1e3a8a] bg-blue-50/30 text-gray-900"
                        : "border-gray-200 hover:border-gray-300 bg-white text-gray-600"
                    }`}
                  >
                    <input
                      type="radio"
                      name="cancellationReason"
                      value={reason}
                      checked={isSelected}
                      onChange={() => setSelectedReason(reason)}
                      className="w-4 h-4 text-[#1e3a8a] border-gray-300 focus:ring-[#1e3a8a] focus:ring-1"
                    />
                    <span>{reason}</span>
                  </label>
                );
              })}
            </div>
            <p className="text-[10px] text-gray-400 font-medium text-center pt-1 leading-normal">
              Emergency cancellations may be eligible for fee waiver — support
              will review your context.
            </p>
          </div>
        </div>

        {/* Footer Actions Row */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors shadow-xs"
          >
            Keep booking
          </button>
          <button
            disabled={!selectedReason}
            onClick={() => {
              alert(`Booking cancelled. Fee applied: Rs. ${cancellationFee}`);
              onClose();
            }}
            className={`flex-1 py-2.5 font-bold text-xs rounded-xl transition-all shadow-xs ${
              !selectedReason
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : isFreeCancellation
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                  : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            Confirm cancel
          </button>
        </div>
      </div>
    </div>
  );
}

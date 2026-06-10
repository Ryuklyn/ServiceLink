"use client";

import React, { useEffect } from "react";
import {
  X,
  MapPin,
  Mic,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  Calendar,
} from "lucide-react";
import { ProviderData } from "./types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider: ProviderData;
  bookingDetails: {
    services: { name: string; priceMin: number; priceMax: number }[];
    taskSummary: string;
    dateDisplay: string;
    timeDisplay: string;
    estimatedMin: number;
    estimatedMax: number;
    address: string;
    photos: File[];
    // New fields from real backend response
    appointmentIds?: number[];
    appointmentStatus?: string;
    totalPrice?: number;
  };
}

export default function BookingDetailsModal({
                                              isOpen,
                                              onClose,
                                              provider,
                                              bookingDetails,
                                            }: BookingModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Destructured fields supporting real backend data fallbacks
  const {
    services,
    taskSummary,
    dateDisplay,
    timeDisplay,
    estimatedMin,
    estimatedMax,
    address,
    photos,
    appointmentIds = [],
    appointmentStatus = "PENDING",
    totalPrice,
  } = bookingDetails;

  const serviceNames =
      services.map((s) => s.name).join(", ") || "General Service";

  // Dynamic price resolving logic using actual total price if it exists
  const estimatedPrice = totalPrice
      ? `NPR ${totalPrice.toLocaleString()}`
      : estimatedMin === estimatedMax
          ? `NPR ${estimatedMin.toLocaleString()}`
          : `NPR ${estimatedMin.toLocaleString()} – ${estimatedMax.toLocaleString()}`;

  // Helper function to safely style badges based on backend status keys
  const getStatusBadgeStyles = (status: string) => {
    const s = status.toUpperCase();
    if (s === "ACCEPTED" || s === "COMPLETED") {
      return "bg-emerald-500/20 border-emerald-500/30 text-emerald-300 dot-bg-emerald-400";
    }
    if (s === "CANCELLED" || s === "REJECTED") {
      return "bg-red-500/20 border-red-500/30 text-red-300 dot-bg-red-400";
    }
    // Default PENDING / REVIEWING styles
    return "bg-yellow-500/20 border-yellow-500/30 text-yellow-300 dot-bg-yellow-400";
  };

  const statusStyles = getStatusBadgeStyles(appointmentStatus);
  const isCustomColor = statusStyles.includes("dot-bg-");
  const dotColorClass = isCustomColor
      ? statusStyles.split(" ").find(c => c.startsWith("dot-bg-"))?.replace("dot-bg-", "bg-")
      : "bg-yellow-400";

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
        {/* Backdrop */}
        <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
        />

        {/* Modal Container */}
        <div className="relative w-full max-w-6xl h-[95vh] bg-[#f8fafc] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
          {/* ── Top Header Section ── */}
          <div className="bg-[#1e3a8a] text-white px-8 py-6 shrink-0 relative">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white z-10"
            >
              <X size={20} />
            </button>

            <div className="flex items-start justify-between max-w-5xl">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {appointmentStatus === "PENDING" ? "Booking Request Sent" : `Booking ${appointmentStatus.toLowerCase()}`}
                </h2>
                <p className="text-blue-200 text-sm mt-1">
                  {appointmentIds.length === 1
                      ? `Booking ID · BK-${appointmentIds[0]}`
                      : "Multiple Bookings Group"}
                </p>
              </div>
              <div className={`flex items-center gap-2 border px-4 py-1.5 rounded-full mr-12 ${statusStyles.replace(/dot-bg-\S+/g, '')}`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${dotColorClass}`} />
                <span className="text-sm font-medium tracking-wide capitalize">
                {appointmentStatus.toLowerCase()}
              </span>
              </div>
            </div>

            {/* Provider Card within Header */}
            <div className="mt-6 bg-white/10 border border-white/20 rounded-xl p-4 flex items-center gap-4 max-w-2xl backdrop-blur-md">
              <div className="w-14 h-14 bg-blue-900/50 rounded-full flex items-center justify-center text-xl font-bold border-2 border-white/30 shrink-0">
                {provider.initials}
              </div>
              <div>
                <h3 className="font-semibold text-lg leading-tight">
                  {provider.name}
                </h3>
                <p className="text-blue-200 text-sm mt-0.5 mb-1.5">
                  {provider.specialty}
                </p>
                <div className="flex gap-2">
                  {(provider.categories ?? []).map((cat, i) => (
                      <span
                          key={i}
                          className="text-[10px] uppercase tracking-wider font-semibold bg-white/20 px-2 py-0.5 rounded-md text-blue-50"
                      >
                    {cat}
                  </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Split Columns Container ── */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row gap-6 p-6 lg:p-8 pb-24 relative">
            {/* LEFT SIDE (Scrollable Layout Details) */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-6 custom-scrollbar">
              {/* Booking Summary Box */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4 uppercase">
                  Booking Summary
                </h4>

                <div className="divide-y divide-gray-100">
                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-gray-500">Booking ID</span>
                    <span className="text-sm font-medium text-gray-900">
                    {appointmentIds.length > 0
                        ? appointmentIds.map((id) => `BK-${id}`).join(", ")
                        : "Processing..."}
                  </span>
                  </div>

                  <div className="py-3.5 space-y-1">
                  <span className="text-xs font-medium text-gray-400 block">
                    Task
                  </span>
                    <p className="text-sm font-bold text-gray-900 leading-snug">
                      {taskSummary || "General home service task"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <span className="text-sm text-gray-500">Service</span>
                    <span className="text-sm font-semibold text-gray-900">
                    {serviceNames}
                  </span>
                  </div>

                  <div className="py-3.5 space-y-1">
                  <span className="text-xs font-medium text-gray-400 flex items-center gap-1.5">
                    <Calendar size={13} className="text-gray-400" /> Date & Time
                  </span>
                    <p className="text-sm font-bold text-gray-900 pl-4">
                      {dateDisplay || "Scheduled Date"},{" "}
                      {timeDisplay || "Flexible Hours"}
                    </p>
                  </div>

                  <div className="pt-4 pb-1">
                    <div className="flex justify-between items-baseline">
                    <span className="text-xs font-medium text-gray-400 flex items-center gap-1">
                      <span className="font-semibold text-sm text-gray-400">
                        $
                      </span>{" "}
                      {totalPrice ? "Final Price" : "Est. Price"}
                    </span>
                      <span className="text-lg font-black text-[#1e3a8a]">
                      {estimatedPrice}
                    </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 font-normal">
                      {totalPrice
                          ? "* Calculated final price for this session."
                          : "* Final price may vary based on actual work required"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Location Box */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-3 uppercase">
                  Service Location
                </h4>

                <div className="space-y-3">
                  <div className="flex gap-2.5 items-start">
                    <MapPin
                        className="text-[#e8683f] shrink-0 mt-0.5"
                        size={18}
                    />
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {address || "Address not specified"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">
                        Landmark: Near NIMS College
                      </p>
                      <p className="text-xs text-gray-500 font-medium">
                        Ward 5, Madhyapur Thimi
                      </p>
                      <p className="text-xs text-emerald-500 font-semibold mt-1 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        Auto-detected location
                      </p>
                    </div>
                  </div>

                  {/* Map Graphics Placeholder Layer */}
                  <div className="mt-3 w-full h-36 bg-blue-50/40 border border-blue-100 rounded-xl relative overflow-hidden group z-0">
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(30,58,138,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(30,58,138,0.03)_1px,transparent_1px)] bg-[size:12px_12px] flex items-center justify-center">
                      <div className="w-8 h-8 bg-[#e8683f] rounded-full flex items-center justify-center shadow-md border-2 border-white relative animate-bounce">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <button className="text-xs font-bold text-[#1e3a8a] hover:underline flex items-center gap-1 pt-0.5">
                    <MapPin size={12} /> View on map
                  </button>
                </div>
              </div>

              {/* Task Details Info Panel */}
              <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
                <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-3 uppercase">
                  Task Details
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed font-normal mb-4">
                  {taskSummary || "No detailed textual summary provided."}
                </p>

                {/* Audio voice attachment item */}
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-lg mb-4 w-fit">
                  <Mic size={14} className="text-amber-600" />
                  <span className="text-xs font-semibold text-amber-700">
                  Voice note attached
                </span>
                </div>

                {/* User Attachments Images Grid */}
                <div className="flex gap-2.5 flex-wrap">
                  {photos && photos.length > 0 ? (
                      photos.map((photo, idx) => (
                          <img
                              key={idx}
                              src={URL.createObjectURL(photo)}
                              alt={`Upload ${idx}`}
                              className="w-16 h-16 rounded-xl object-cover border border-gray-200 shadow-xs"
                          />
                      ))
                  ) : (
                      <>
                        <div className="w-16 h-16 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                          <img
                              src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=150"
                              alt="mock thumbnail"
                              className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-16 h-16 bg-gray-100 rounded-xl border border-gray-200 overflow-hidden">
                          <img
                              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
                              alt="mock thumbnail"
                              className="w-full h-full object-cover"
                          />
                        </div>
                      </>
                  )}
                </div>
              </div>

              {/* Helpful Checklist & Policy Info Notes */}
              <div className="space-y-3">
                <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-medium text-blue-900 flex items-start gap-2">
                    <ChevronRight
                        size={14}
                        className="text-blue-500 shrink-0 mt-0.5"
                    />
                    You'll be notified when the provider confirms.
                  </p>
                  <p className="text-xs font-medium text-blue-900 flex items-start gap-2">
                    <ChevronRight
                        size={14}
                        className="text-blue-500 shrink-0 mt-0.5"
                    />
                    Keep your phone available for updates.
                  </p>
                  <p className="text-xs font-medium text-blue-900 flex items-start gap-2">
                    <ChevronRight
                        size={14}
                        className="text-blue-500 shrink-0 mt-0.5"
                    />
                    Cash payment will be handled after service completion.
                  </p>
                </div>

                <div className="bg-slate-50 mb-12 border border-slate-200 rounded-xl p-5 text-[11px] text-gray-500 select-none">
                  <div className="flex items-center gap-1.5 font-bold mb-3 text-[#1e3a8a] text-[12px]">
                    <ShieldCheck
                        className="w-4 h-4 text-[#1e3a8a]"
                        strokeWidth={2.5}
                    />
                    <span>Cancellation & Reschedule Policy</span>
                  </div>

                  <div className="border border-slate-200 rounded-lg overflow-hidden bg-white text-center mb-3 divide-y divide-slate-100">
                    <div className="flex items-center justify-between px-4 py-3 bg-emerald-50/20">
                      <div className="text-left">
                        <div className="text-gray-700 font-bold text-xs">
                          Before 24 hours
                        </div>
                        <div className="text-gray-400 text-[10px] mt-0.5">
                          Applies to both cancellations & reschedules
                        </div>
                      </div>
                      <div className="text-[13px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100">
                        Free
                      </div>
                    </div>

                    <div className="grid grid-cols-2 divide-x divide-slate-100 bg-white">
                      <div className="p-3 text-center">
                        <div className="text-gray-400 font-medium mb-2 text-xs whitespace-nowrap">
                          Under 24 hrs{" "}
                          <span className="text-slate-500 font-semibold ml-0.5">
                          Reschedule
                        </span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-[14px] font-bold text-[#e8683f]">
                          Rs. 50
                        </span>
                          <span className="text-[9px] font-medium text-gray-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-150">
                          or 1 Token
                        </span>
                        </div>
                      </div>

                      <div className="p-3 text-center">
                        <div className="text-gray-400 font-medium mb-2 text-xs whitespace-nowrap">
                          Under 24 hrs{" "}
                          <span className="text-slate-500 font-semibold ml-0.5">
                          Cancel
                        </span>
                        </div>
                        <div className="flex flex-col items-center justify-center gap-1">
                        <span className="text-[14px] font-bold text-red-500">
                          Rs. 100
                        </span>
                          <span className="text-[9px] font-medium text-gray-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-150">
                          or 1 Token
                        </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg py-2 px-3 flex items-center gap-1.5 font-medium">
                    <Clock
                        className="w-3.5 h-3.5 text-emerald-600"
                        strokeWidth={2.5}
                    />
                    <span>
                    Current Status:{" "}
                      <span className="font-bold">
                      Free to modify until June 4, 10:00 AM
                    </span>
                  </span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE (Fixed Side Progress Container) */}
            <div className="w-full lg:w-96 shrink-0 bg-white rounded-2xl border border-gray-200 shadow-xs p-6 h-fit hidden lg:block">
              <h3 className="font-bold text-gray-900 text-sm tracking-wider flex items-center gap-2 mb-6 uppercase">
                <Clock size={16} className="text-[#1e3a8a]" />
                Progress
              </h3>

              <div className="relative pl-4 space-y-6 before:absolute before:bottom-2 before:top-2 before:left-4 before:w-0.5 before:bg-gray-200">
                <div className="relative flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#1e3a8a] text-white shrink-0 -translate-x-4 z-10 ring-4 ring-white">
                    <CheckCircle2 size={16} />
                  </div>
                  <div className="mt-1">
                    <h4 className="text-xs font-bold text-[#1e3a8a] uppercase tracking-wider">
                      Request Sent
                    </h4>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#e8683f] text-white shrink-0 -translate-x-4 z-10 ring-4 ring-white">
                    <Clock size={16} />
                  </div>
                  <div className="mt-0.5">
                    <h4 className="text-xs font-bold text-[#e8683f] uppercase tracking-wider">
                      Provider Reviewing
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      In progress...
                    </p>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white shrink-0 -translate-x-4 z-10 ring-4 ring-white">
                    <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="mt-1">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Accepted
                    </h4>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white shrink-0 -translate-x-4 z-10 ring-4 ring-white">
                    <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="mt-1">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      On the Way
                    </h4>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-200 bg-white shrink-0 -translate-x-4 z-10 ring-4 ring-white">
                    <div className="w-1.5 h-1.5 bg-gray-200 rounded-full"></div>
                  </div>
                  <div className="mt-1">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Job Completed
                    </h4>
                  </div>
                </div>
              </div>
            </div>

            {/* ── FIXED NON-SCROLLABLE FOOTER CONTROL BAR ── */}
            <div className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between gap-3 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
              <div className="flex items-center gap-3 flex-1 lg:flex-initial">
                <button className="flex-1 lg:flex-none px-6 py-2.5 bg-[#e8683f] hover:bg-[#d6572e] text-white font-bold rounded-xl text-xs transition-colors shadow-xs whitespace-nowrap">
                  Edit Request
                </button>
                <button className="flex-1 lg:flex-none px-6 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold rounded-xl text-xs transition-colors shadow-xs whitespace-nowrap">
                  Reschedule
                </button>
                <button className="flex-1 lg:flex-none px-6 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold rounded-xl text-xs transition-colors shadow-xs whitespace-nowrap">
                  Cancel Booking
                </button>
              </div>
              <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-gray-100 text-gray-600 hover:bg-gray-200 font-bold rounded-xl text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>

        <style
            dangerouslySetInnerHTML={{
              __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `,
            }}
        />
      </div>
  );
}
"use client";

import { useState } from "react";
import {
  Clock,
  MapPin,
  Calendar,
  Eye,
  MessageSquare,
  Star,
  Info,
} from "lucide-react";
import Link from "next/link";
import ReschedulingModal from "@/components/dashboard/user/bookings/ReschedulingModal";
import CancellationModal from "@/components/dashboard/user/bookings/CancelationModal";

interface BookingItem {
  id: string;
  providerName: string;
  specialty: string;
  serviceName: string;
  initials: string;
  status: "Active" | "Upcoming" | "Completed";
  statusText: string;
  dateDisplay: string;
  timeDisplay: string;
  hoursRemaining?: number;
  address: string;
  landmark?: string;
  ward?: string;
  price: number;
  taskSummary: string;
  modificationsLocked?: boolean;
  isPaid?: boolean;
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<"Active" | "Upcoming" | "History">(
    "Active",
  );
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(
    null,
  );

  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] =
    useState<boolean>(false);

  const mockBookings: BookingItem[] = [
    {
      id: "SL-2026-1042",
      providerName: "Ram Electrical Services",
      specialty: "Electrician",
      serviceName: "Fan Installation",
      initials: "RE",
      status: "Active",
      statusText: "On the way",
      dateDisplay: "Today",
      timeDisplay: "2:00 PM",
      address: "Baneshwor, Kathmandu",
      landmark: "Near Apex College",
      ward: "Ward 10",
      price: 650,
      taskSummary:
        "Ceiling fan installation and regulator configuration in the living room.",
      modificationsLocked: true,
      isPaid: false,
    },
    {
      id: "SL-2026-1038",
      providerName: "CleanNest Services",
      specialty: "Cleaning Specialist",
      serviceName: "Regular Cleaning",
      initials: "CS",
      status: "Upcoming",
      statusText: "Upcoming",
      dateDisplay: "June 3, 2026",
      timeDisplay: "10:00 AM",
      hoursRemaining: 36, // > 24 hrs — FREE tier
      address: "New Baneshwor, Kathmandu",
      landmark: "Behind Eyeplex Mall",
      ward: "Ward 10",
      price: 1600,
      taskSummary:
        "Full deep cleaning of 2BHK apartment including kitchen scrubbing and window wiping.",
      modificationsLocked: false,
      isPaid: false,
    },
    {
      id: "SL-2026-1040",
      providerName: "Kaji Carpenter Services",
      specialty: "Furniture Builder",
      serviceName: "Door Shaving & Repair",
      initials: "KS",
      status: "Upcoming",
      statusText: "Upcoming",
      dateDisplay: "Today",
      timeDisplay: "9:00 AM",
      hoursRemaining: 14, // < 24 hrs — LATE tier
      address: "Koteshwor, Kathmandu",
      landmark: "Near Mahadevsthan Temple",
      ward: "Ward 32",
      price: 750,
      taskSummary:
        "Fixing the master bathroom wooden door frame friction due to structural expansion.",
      modificationsLocked: false,
      isPaid: false,
    },
    {
      id: "SL-2026-1021",
      providerName: "CoolTech AC Services",
      specialty: "HVAC Technician",
      serviceName: "AC Service",
      initials: "CA",
      status: "Completed",
      statusText: "Completed",
      dateDisplay: "May 18, 2026",
      timeDisplay: "11:00 AM",
      address: "Baneshwor, Kathmandu",
      price: 1400,
      taskSummary:
        "AC filter cleaning, gas pressure inspection, and cooling performance restoration.",
      isPaid: true,
    },
    {
      id: "SL-2026-1009",
      providerName: "Sita Plumbing Solutions",
      specialty: "Plumbing Master",
      serviceName: "Pipe Repair",
      initials: "SP",
      status: "Completed",
      statusText: "Completed",
      dateDisplay: "May 10, 2026",
      timeDisplay: "3:00 PM",
      address: "Baneshwor, Kathmandu",
      price: 900,
      taskSummary:
        "Need to fix faulty structural leaking pipes underneath the primary bathroom basin mirror framework.",
      isPaid: true,
    },
  ];

  const activeCount = mockBookings.filter((b) => b.status === "Active").length;
  const upcomingCount = mockBookings.filter(
    (b) => b.status === "Upcoming",
  ).length;
  const historyCount = mockBookings.filter(
    (b) => b.status === "Completed",
  ).length;

  const filteredBookings = mockBookings.filter((b) => {
    if (activeTab === "Active") return b.status === "Active";
    if (activeTab === "Upcoming") return b.status === "Upcoming";
    return b.status === "Completed";
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      {/* ── Tabs ── */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
        {(["Active", "Upcoming", "History"] as const).map((tab) => {
          const count =
            tab === "Active"
              ? activeCount
              : tab === "Upcoming"
                ? upcomingCount
                : historyCount;
          const isSelected = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 ${
                isSelected
                  ? "bg-[#1e3a8a] text-white shadow-sm"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Cards ── */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-150 p-16 text-center shadow-sm">
            <p className="text-gray-400 text-sm font-medium">
              No bookings found in this section.
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            const borderColors = {
              Active: "border-l-[#e8683f]",
              Upcoming: "border-l-[#1e3a8a]",
              Completed: "border-l-emerald-600",
            };

            const hoursRemaining = booking.hoursRemaining ?? 48;
            const isLateWindow = hoursRemaining < 24;

            return (
              <div
                key={booking.id}
                className={`bg-white rounded-2xl border-l-4 border-y border-r border-gray-200 shadow-sm p-6 transition-all duration-200 ${borderColors[booking.status]}`}
              >
                {/* Top */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-[#1e3a8a] rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border border-blue-100">
                      {booking.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base tracking-tight">
                        {booking.providerName}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5 font-medium">
                        {booking.serviceName}
                      </p>
                      <div className="mt-2">
                        {booking.status === "Active" && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200 uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                            {booking.statusText}
                          </span>
                        )}
                        {booking.status === "Upcoming" && (
                          <span className="inline-flex items-center gap-1 bg-blue-50 text-[#1e3a8a] text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200 uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 bg-[#1e3a8a] rounded-full" />
                            {booking.statusText}
                          </span>
                        )}
                        {booking.status === "Completed" && (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200 uppercase tracking-wide">
                            ✓ {booking.statusText}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right self-start sm:self-auto shrink-0 bg-gray-50/60 p-2.5 rounded-xl border border-gray-100 min-w-[120px]">
                    <p className="text-base font-black text-[#1e3a8a]">
                      Rs. {booking.price.toLocaleString()}
                    </p>
                    <span className="block text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-wider">
                      {booking.isPaid ? "Paid" : "Pay after service"}
                    </span>
                  </div>
                </div>

                {/* Meta */}
                <div className="py-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-600 font-medium border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-gray-400 shrink-0" />
                    <span>{booking.dateDisplay}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-gray-400 shrink-0" />
                    <span>{booking.timeDisplay}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={15} className="text-gray-400 shrink-0" />
                    <span className="truncate">{booking.address}</span>
                  </div>
                </div>

                {/* Bottom */}
                <div className="pt-4 grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                  {/* Left */}
                  <div className="md:col-span-8 space-y-3">
                    <p className="text-[10px] text-gray-400 font-mono tracking-tight">
                      Booking Reference: {booking.id}
                    </p>

                    {booking.modificationsLocked && (
                      <p className="text-xs text-amber-600 font-semibold flex items-center gap-1 bg-amber-50/50 p-2 rounded-lg border border-amber-100 w-fit">
                        ✕ Modifications locked — provider is on the way
                      </p>
                    )}

                    {booking.status === "Upcoming" && (
                      <div className="space-y-2 max-w-2xl">
                        {isLateWindow ? (
                          <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2 text-xs font-medium">
                            <Clock
                              size={14}
                              className="text-amber-600 shrink-0"
                              strokeWidth={2.5}
                            />
                            <span>
                              Emergency Zone: Changes incur a late fee or
                              require an exception token.
                            </span>
                          </div>
                        ) : (
                          <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl p-2.5 flex items-center gap-2 text-xs font-medium">
                            <Clock
                              size={14}
                              className="text-emerald-600 shrink-0"
                              strokeWidth={2.5}
                            />
                            <span>
                              Free window active. You can cancel or reschedule
                              without tokens or fees.
                            </span>
                          </div>
                        )}
                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 flex flex-wrap items-center gap-2 text-xs">
                          {/* Header Section */}
                          <div className="flex items-center gap-1 font-bold text-[#1e3a8a] text-[11px] uppercase tracking-wider mr-1">
                            <Info
                              size={13}
                              className="text-[#1e3a8a] shrink-0"
                              strokeWidth={2.5}
                            />
                            <span>Tiers:</span>
                          </div>

                          {/* Tier 1: Safe Modification Window */}
                          <span className="px-2 py-0.5 rounded-md bg-white text-emerald-800 border border-emerald-200 text-[10px] font-medium shadow-sm">
                            24h+:{" "}
                            <span className="font-bold text-emerald-600">
                              Free
                            </span>
                          </span>

                          {/* Tier 2: Late Reschedule Rule */}
                          <span className="px-2 py-0.5 rounded-md bg-white text-orange-800 border border-orange-200 text-[10px] font-medium shadow-sm">
                            &lt; 24h Reschedule:{" "}
                            <span className="font-bold text-[#e8683f]">
                              Rs. 50{" "}
                              <span className="text-[9px] text-gray-400 font-normal">
                                or 1 Token
                              </span>
                            </span>
                          </span>

                          {/* Tier 3: Late Cancellation Rule */}
                          <span className="px-2 py-0.5 rounded-md bg-white text-red-800 border border-red-200 text-[10px] font-medium shadow-sm">
                            &lt; 24h Cancel:{" "}
                            <span className="font-bold text-red-600">
                              Rs. 100{" "}
                              <span className="text-[9px] text-gray-400 font-normal">
                                or 1 Token
                              </span>
                            </span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right — Actions */}
                  <div className="md:col-span-4 flex flex-row sm:flex-row md:flex-col justify-end gap-2 w-full">
                    {booking.status === "Active" && (
                      <>
                        <Link
                          href="/dashboard/user/bookings/track"
                          className="px-4 py-2.5 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm w-full text-center"
                        >
                          <MapPin size={13} /> Track Order
                        </Link>
                        <button className="px-4 py-2.5 bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm w-full">
                          <MessageSquare size={13} fill="white" /> WhatsApp
                          Support
                        </button>
                      </>
                    )}

                    {booking.status === "Upcoming" && (
                      <>
                        <div className="flex gap-2 w-full">
                          {isLateWindow ? (
                            <>
                              {/* LATE TIER button */}
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setIsRescheduleModalOpen(true);
                                }}
                                className="flex-1 px-3 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-xs rounded-xl transition-colors text-center"
                              >
                                Late Reschedule
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setIsCancelModalOpen(true);
                                }}
                                className="flex-1 px-3 py-2.5 bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 font-bold text-xs rounded-xl transition-colors text-center"
                              >
                                Late Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              {/* FREE TIER button */}
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setIsRescheduleModalOpen(true);
                                }}
                                className="flex-1 px-3 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors text-center"
                              >
                                Reschedule
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setIsCancelModalOpen(true);
                                }}
                                className="flex-1 px-3 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs rounded-xl transition-colors text-center"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                        </div>
                        <button className="px-4 py-2.5 bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm w-full">
                          <MessageSquare size={13} fill="white" /> WhatsApp
                          Support
                        </button>
                      </>
                    )}

                    {booking.status === "Completed" && (
                      <>
                        {booking.providerName.includes("CoolTech") ? (
                          <Link
                            href="/dashboard/user/bookings/review"
                            className="px-4 py-2.5 bg-[#e8683f] hover:bg-[#d45b34] text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm w-full text-center"
                          >
                            <Star size={13} fill="white" /> Leave Review
                          </Link>
                        ) : (
                          <button className="px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 w-full">
                            <Eye size={13} /> View Details
                          </button>
                        )}
                        <button className="px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors w-full">
                          Book Again
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Rescheduling Modal ── */}
      {selectedBooking && isRescheduleModalOpen && (
        <ReschedulingModal
          isOpen={isRescheduleModalOpen}
          onClose={() => {
            setIsRescheduleModalOpen(false);
            setSelectedBooking(null);
          }}
          currentBooking={{
            id: selectedBooking.id,
            date: selectedBooking.dateDisplay,
            time: selectedBooking.timeDisplay,
            provider: selectedBooking.providerName,
          }}
          isLate={(selectedBooking.hoursRemaining ?? 48) < 24}
        />
      )}

      {selectedBooking && isCancelModalOpen && (
        <CancellationModal
          isOpen={isCancelModalOpen}
          onClose={() => {
            setIsCancelModalOpen(false);
            setSelectedBooking(null);
          }}
          isLate={(selectedBooking.hoursRemaining ?? 48) < 24}
          bookingData={{
            id: selectedBooking.id,
            providerName: selectedBooking.providerName,
            serviceName: selectedBooking.serviceName,
            dateDisplay: selectedBooking.dateDisplay,
            timeDisplay: selectedBooking.timeDisplay,
            locationDisplay: selectedBooking.address,
            price: selectedBooking.price,
          }}
        />
      )}
    </div>
  );
}

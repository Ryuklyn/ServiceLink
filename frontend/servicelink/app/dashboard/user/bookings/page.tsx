"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock, MapPin, Calendar, Eye, MessageSquare, Star, Info, Loader2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import ReschedulingModal from "@/components/dashboard/user/bookings/ReschedulingModal";
import CancellationModal from "@/components/dashboard/user/bookings/CancelationModal";
import { appointmentService, AppointmentSummary } from "@/services/appointmentService";

// Map backend status to frontend tab
type FrontendTab = "Active" | "Upcoming" | "History";

function getTab(status: string): FrontendTab {
  if (status === "IN_PROGRESS") return "Active";
  if (status === "PENDING" || status === "CONFIRMED") return "Upcoming";
  return "History"; // COMPLETED, CANCELLED
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PENDING:     "Awaiting Confirmation",
    CONFIRMED:   "Confirmed",
    IN_PROGRESS: "On the Way",
    COMPLETED:   "Completed",
    CANCELLED:   "Cancelled",
  };
  return map[status] ?? status;
}

function getTimeDisplay(timeSlot: string): string {
  const map: Record<string, string> = {
    MORNING:   "8:00 AM – 12:00 PM",
    AFTERNOON: "12:00 PM – 4:00 PM",
    EVENING:   "4:00 PM – 8:00 PM",
  };
  return map[timeSlot] ?? timeSlot;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

interface SelectedBooking {
  id: string;
  providerId: number;
  providerName: string;
  serviceName: string;
  dateDisplay: string;
  timeDisplay: string;
  address: string;
  price: number;
  hoursRemaining: number;
  status: string;
}

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState<FrontendTab>("Upcoming");
  const [allAppointments, setAllAppointments] = useState<AppointmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<SelectedBooking | null>(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false);

  const fetchAllAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all statuses in parallel
      const [pending, confirmed, inProgress, completed, cancelled] = await Promise.all([
        appointmentService.getMyAppointments("PENDING",     0, 50),
        appointmentService.getMyAppointments("CONFIRMED",   0, 50),
        appointmentService.getMyAppointments("IN_PROGRESS", 0, 50),
        appointmentService.getMyAppointments("COMPLETED",   0, 50),
        appointmentService.getMyAppointments("CANCELLED",   0, 50),
      ]);

      const all = [
        ...pending.content,
        ...confirmed.content,
        ...inProgress.content,
        ...completed.content,
        ...cancelled.content,
      ];

      setAllAppointments(all);
    } catch (err: any) {
      console.error("Failed to fetch appointments:", err);
      setError("Failed to load bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllAppointments();
  }, [fetchAllAppointments]);

  const handleCancelConfirm = async (reason: string) => {
    if (!selectedBooking) return;
    try {
      await appointmentService.cancelAppointment(Number(selectedBooking.id), reason);
      toast.success("Appointment cancelled successfully.");
      setIsCancelModalOpen(false);
      setSelectedBooking(null);
      fetchAllAppointments(); // refresh
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to cancel appointment.");
    }
  };

  const activeList    = allAppointments.filter((a) => getTab(a.status) === "Active");
  const upcomingList  = allAppointments.filter((a) => getTab(a.status) === "Upcoming");
  const historyList   = allAppointments.filter((a) => getTab(a.status) === "History");

  const filteredList =
      activeTab === "Active"   ? activeList :
          activeTab === "Upcoming" ? upcomingList : historyList;

  if (loading) {
    return (
        <div className="flex items-center justify-center py-20 text-gray-400">
          <Loader2 className="animate-spin mr-2" size={20} />
          <span>Loading your bookings...</span>
        </div>
    );
  }

  if (error) {
    return (
        <div className="text-center py-20 text-red-400">
          <p>{error}</p>
          <button onClick={fetchAllAppointments} className="mt-4 text-sm text-blue-600 underline">
            Try again
          </button>
        </div>
    );
  }

  const borderColors: Record<FrontendTab, string> = {
    Active:   "border-l-[#e8683f]",
    Upcoming: "border-l-[#1e3a8a]",
    History:  "border-l-emerald-600",
  };

  return (
      <div className="space-y-6 mx-auto p-2 sm:p-4 max-w-7xl">
        {/* Tabs - Horizontal scrolling enabled for small mobile viewports */}
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 overflow-x-auto no-scrollbar scroll-smooth -mx-2 px-2 sm:mx-0 sm:px-0">
          {(["Active", "Upcoming", "History"] as const).map((tab) => {
            const count =
                tab === "Active"   ? activeList.length :
                    tab === "Upcoming" ? upcomingList.length : historyList.length;
            const isSelected = activeTab === tab;
            return (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 shrink-0 ${
                        isSelected
                            ? "bg-[#1e3a8a] text-white shadow-sm"
                            : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                >
                  {tab}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isSelected ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
                  }`}>
                {count}
              </span>
                </button>
            );
          })}
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {filteredList.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-150 p-12 sm:p-16 text-center shadow-sm">
                <p className="text-gray-400 text-sm font-medium">
                  No bookings found in this section.
                </p>
              </div>
          ) : (
              filteredList.map((appt) => {
                const tab = getTab(appt.status);
                const dateDisplay  = formatDate(appt.appointmentDate);
                const timeDisplay  = getTimeDisplay(appt.timeSlot);
                const statusLabel  = getStatusLabel(appt.status);

                // Calculate hours remaining from appointment date
                const apptDate     = new Date(appt.appointmentDate);
                const now          = new Date();
                const hoursRemaining = Math.max(
                    0,
                    (apptDate.getTime() - now.getTime()) / (1000 * 60 * 60)
                );
                const isLateWindow = hoursRemaining < 24;
                const isLocked     = appt.status === "IN_PROGRESS";

                return (
                    <div
                        key={appt.id}
                        className={`bg-white rounded-2xl border-l-4 border-y border-r border-gray-200 shadow-sm p-4 sm:p-6 transition-all duration-200 ${borderColors[tab]}`}
                    >
                      {/* Top section */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-gray-100">
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="w-12 h-12 bg-blue-50 text-[#1e3a8a] rounded-xl flex items-center justify-center text-sm font-bold shrink-0 border border-blue-100 overflow-hidden relative">
                            {appt.providerProfilePicture ? (
                                <img
                                    src={appt.providerProfilePicture}
                                    alt={appt.providerName}
                                    className="w-full h-full object-cover rounded-xl absolute inset-0"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).style.display = "none";
                                    }}
                                />
                            ) : (
                                (appt.providerName ?? "?").slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-gray-900 text-base tracking-tight truncate">
                              {appt.providerName}
                            </h3>
                            <p className="text-xs text-gray-500 mt-0.5 font-medium truncate">
                              {appt.subServiceName}
                            </p>
                            <div className="mt-2">
                              {tab === "Active" && (
                                  <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200 uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                                    {statusLabel}
                          </span>
                              )}
                              {tab === "Upcoming" && (
                                  <span className="inline-flex items-center gap-1 bg-blue-50 text-[#1e3a8a] text-[10px] font-bold px-2 py-0.5 rounded-md border border-blue-200 uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 bg-[#1e3a8a] rounded-full" />
                                    {statusLabel}
                          </span>
                              )}
                              {tab === "History" && (
                                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200 uppercase tracking-wide">
                            ✓ {statusLabel}
                          </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Price Display */}
                        <div className="sm:text-right w-full sm:w-auto shrink-0 bg-gray-50/60 p-2.5 rounded-xl border border-gray-100 sm:min-w-[120px] flex sm:flex-col justify-between items-center sm:items-end gap-1">
                          <p className="text-base font-black text-[#1e3a8a]">
                            Rs. {(appt.totalPrice ?? 0).toLocaleString()}
                          </p>
                          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block">
                      {appt.status === "COMPLETED" ? "Paid" : "Pay after service"}
                    </span>
                        </div>
                      </div>

                      {/* Meta Details Row */}
                      <div className="py-4 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-xs text-gray-600 font-medium border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <Calendar size={15} className="text-gray-400 shrink-0" />
                          <span>{dateDisplay}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={15} className="text-gray-400 shrink-0" />
                          <span>{timeDisplay}</span>
                        </div>
                        <div className="flex items-center gap-2 min-w-0 max-w-full">
                          <MapPin size={15} className="text-gray-400 shrink-0" />
                          <span className="truncate">{appt.address}</span>
                        </div>
                      </div>

                      {/* Bottom / Actions Section */}
                      <div className="pt-4 flex flex-col lg:flex-row lg:items-end justify-between gap-5">
                        <div className="space-y-3 w-full lg:max-w-2xl">
                          <p className="text-[10px] text-gray-400 font-mono tracking-tight">
                            Booking Reference: BK-{appt.id}
                          </p>

                          {isLocked && (
                              <p className="text-xs text-amber-600 font-semibold flex items-center gap-1 bg-amber-50/50 p-2 rounded-lg border border-amber-100 w-fit">
                                ✕ Modifications locked — provider is on the way
                              </p>
                          )}

                          {tab === "Upcoming" && (
                              <div className="space-y-2">
                                {isLateWindow ? (
                                    <div className="bg-amber-50 text-amber-900 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2 text-xs font-medium">
                                      <Clock size={14} className="text-amber-600 shrink-0" strokeWidth={2.5} />
                                      <span>Emergency Zone: Changes incur a late fee or require an exception token.</span>
                                    </div>
                                ) : (
                                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl p-2.5 flex items-center gap-2 text-xs font-medium">
                                      <Clock size={14} className="text-emerald-600 shrink-0" strokeWidth={2.5} />
                                      <span>Free window active. You can cancel or reschedule without fees.</span>
                                    </div>
                                )}
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                                  <div className="flex items-center gap-1 font-bold text-[#1e3a8a] text-[11px] uppercase tracking-wider mr-1">
                                    <Info size={13} className="text-[#1e3a8a] shrink-0" strokeWidth={2.5} />
                                    <span>Tiers:</span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-md bg-white text-emerald-800 border border-emerald-200 text-[10px] font-medium shadow-sm">
                            24h+: <span className="font-bold text-emerald-600">Free</span>
                          </span>
                                  <span className="px-2 py-0.5 rounded-md bg-white text-orange-800 border border-orange-200 text-[10px] font-medium shadow-sm">
                            &lt; 24h Reschedule: <span className="font-bold text-[#e8683f]">Rs. 50</span>
                          </span>
                                  <span className="px-2 py-0.5 rounded-md bg-white text-red-800 border border-red-200 text-[10px] font-medium shadow-sm">
                            &lt; 24h Cancel: <span className="font-bold text-red-600">Rs. 100</span>
                          </span>
                                </div>
                              </div>
                          )}
                        </div>

                        {/* Actions block — Stacked on mobile, side by side on tablets, packed nicely on larger layouts */}
                        <div className="flex flex-col sm:flex-row lg:flex-col justify-end gap-2 w-full lg:w-72 shrink-0">
                          {tab === "Active" && (
                              <>
                                <Link
                                    href="/dashboard/user/bookings/track"
                                    className="px-4 py-2.5 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm w-full text-center"
                                >
                                  <MapPin size={13} /> Track Order
                                </Link>
                                <button className="px-4 py-2.5 bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm w-full">
                                  <MessageSquare size={13} fill="white" /> WhatsApp Support
                                </button>
                              </>
                          )}

                          {tab === "Upcoming" && (
                              <>
                                <div className="flex gap-2 w-full">
                                  {isLateWindow ? (
                                      <>
                                        <button
                                            onClick={() => {
                                              setSelectedBooking({
                                                id: String(appt.id),
                                                providerId: appt.providerId,
                                                providerName: appt.providerName,
                                                serviceName: appt.subServiceName,
                                                dateDisplay, timeDisplay,
                                                address: appt.address,
                                                price: appt.totalPrice,
                                                hoursRemaining,
                                                status: appt.status,
                                              });
                                              setIsRescheduleModalOpen(true);
                                            }}
                                            className="flex-1 px-2 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 font-bold text-[11px] sm:text-xs rounded-xl transition-colors text-center whitespace-nowrap"
                                        >
                                          Late Reschedule
                                        </button>
                                        <button
                                            onClick={() => {
                                              setSelectedBooking({
                                                id: String(appt.id),
                                                providerId: appt.providerId,
                                                providerName: appt.providerName,
                                                serviceName: appt.subServiceName,
                                                dateDisplay, timeDisplay,
                                                address: appt.address,
                                                price: appt.totalPrice,
                                                hoursRemaining,
                                                status: appt.status,
                                              });
                                              setIsCancelModalOpen(true);
                                            }}
                                            className="flex-1 px-2 py-2.5 bg-red-50 hover:bg-red-100 border border-red-300 text-red-700 font-bold text-[11px] sm:text-xs rounded-xl transition-colors text-center whitespace-nowrap"
                                        >
                                          Late Cancel
                                        </button>
                                      </>
                                  ) : (
                                      <>
                                        <button
                                            onClick={() => {
                                              setSelectedBooking({
                                                id: String(appt.id),
                                                providerId: appt.providerId,
                                                providerName: appt.providerName,
                                                serviceName: appt.subServiceName,
                                                dateDisplay, timeDisplay,
                                                address: appt.address,
                                                price: appt.totalPrice,
                                                hoursRemaining,
                                                status: appt.status,
                                              });
                                              setIsRescheduleModalOpen(true);
                                            }}
                                            className="flex-1 px-2 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-[11px] sm:text-xs rounded-xl transition-colors text-center"
                                        >
                                          Reschedule
                                        </button>
                                        <button
                                            onClick={() => {
                                              setSelectedBooking({
                                                id: String(appt.id),
                                                providerId: appt.providerId,
                                                providerName: appt.providerName,
                                                serviceName: appt.subServiceName,
                                                dateDisplay, timeDisplay,
                                                address: appt.address,
                                                price: appt.totalPrice,
                                                hoursRemaining,
                                                status: appt.status,
                                              });
                                              setIsCancelModalOpen(true);
                                            }}
                                            className="flex-1 px-2 py-2.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 font-bold text-[11px] sm:text-xs rounded-xl transition-colors text-center"
                                        >
                                          Cancel
                                        </button>
                                      </>
                                  )}
                                </div>
                                <button className="px-4 py-2.5 bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm w-full">
                                  <MessageSquare size={13} fill="white" /> WhatsApp Support
                                </button>
                              </>
                          )}

                          {tab === "History" && (
                              <>
                                {appt.status === "COMPLETED" ? (
                                    <Link
                                        href="/dashboard/user/bookings/review"
                                        className="px-4 py-2.5 bg-[#e8683f] hover:bg-[#d45b34] text-white font-bold text-xs rounded-xl transition-colors inline-flex items-center justify-center gap-1.5 shadow-sm w-full text-center"
                                    >
                                      <Star size={13} fill="white" /> Leave Review
                                    </Link>
                                ) : (
                                    <button className="px-4 py-2.5 border border-gray-200 text-gray-400 font-bold text-xs rounded-xl w-full cursor-default text-center">
                                      Cancelled
                                    </button>
                                )}
                                <Link
                                    href={`/dashboard/user/explore/profile?id=${appt.id}`}
                                    className="px-4 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 w-full text-center"
                                >
                                  <Eye size={13} /> Book Again
                                </Link>
                              </>
                          )}
                        </div>
                      </div>
                    </div>
                );
              })
          )}
        </div>

        {/* Modals */}
        {selectedBooking && isRescheduleModalOpen && (
            <ReschedulingModal
                isOpen={isRescheduleModalOpen}
                onClose={() => { setIsRescheduleModalOpen(false); setSelectedBooking(null); }}
                currentBooking={{
                  id: selectedBooking.id,
                  providerId: selectedBooking.providerId,
                  date: selectedBooking.dateDisplay,
                  time: selectedBooking.timeDisplay,
                  provider: selectedBooking.providerName,
                }}
                isLate={selectedBooking.hoursRemaining < 24}
                onRescheduled={fetchAllAppointments}
            />
        )}

        {selectedBooking && isCancelModalOpen && (
            <CancellationModal
                isOpen={isCancelModalOpen}
                onClose={() => { setIsCancelModalOpen(false); setSelectedBooking(null); }}
                isLate={selectedBooking.hoursRemaining < 24}
                bookingData={{
                  id: selectedBooking.id,
                  providerName: selectedBooking.providerName,
                  serviceName: selectedBooking.serviceName,
                  dateDisplay: selectedBooking.dateDisplay,
                  timeDisplay: selectedBooking.timeDisplay,
                  locationDisplay: selectedBooking.address,
                  price: selectedBooking.price,
                }}
                onConfirmCancel={handleCancelConfirm}
            />
        )}
      </div>
  );
}
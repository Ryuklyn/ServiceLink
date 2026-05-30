"use client";

import { useState } from "react";
import {
  Clock,
  MapPin,
  Calendar,
  Eye,
  MessageSquare,
  Star,
} from "lucide-react";
import BookingDetailsModal from "@/components/dashboard/user/explore/profile/BookingDetailsModal"; // Adjust relative route based on your structure

// Define structure for our local bookings state management
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock data mimicking matching values from your provided images
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
      dateDisplay: "Tomorrow",
      timeDisplay: "10:00 AM",
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

  // Filtering counts for the tab pill badges
  const activeCount = mockBookings.filter((b) => b.status === "Active").length;
  const upcomingCount = mockBookings.filter(
    (b) => b.status === "Upcoming",
  ).length;
  const historyCount = mockBookings.filter(
    (b) => b.status === "Completed",
  ).length;

  // Filter listings rendered based on selected layout status tab
  const filteredBookings = mockBookings.filter((b) => {
    if (activeTab === "Active") return b.status === "Active";
    if (activeTab === "Upcoming") return b.status === "Upcoming";
    return b.status === "Completed";
  });

  const handleOpenDetails = (booking: BookingItem) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* ── Tabs Navigation Header ── */}
      <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
        <button
          onClick={() => setActiveTab("Active")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-150 ${
            activeTab === "Active"
              ? "bg-[#1e3a8a] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Active{" "}
          <span
            className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === "Active" ? "bg-[#3a57b5] text-white" : "bg-gray-200 text-gray-700"}`}
          >
            {activeCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("Upcoming")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-150 ${
            activeTab === "Upcoming"
              ? "bg-[#1e3a8a] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Upcoming{" "}
          <span
            className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === "Upcoming" ? "bg-[#3a57b5] text-white" : "bg-gray-200 text-gray-700"}`}
          >
            {upcomingCount}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("History")}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-150 ${
            activeTab === "History"
              ? "bg-[#1e3a8a] text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          History{" "}
          <span
            className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === "History" ? "bg-[#3a57b5] text-white" : "bg-gray-200 text-gray-700"}`}
          >
            {historyCount}
          </span>
        </button>
      </div>

      {/* ── Bookings Cards Stack List Container ── */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <p className="text-gray-400 text-sm font-medium">
              No bookings found in this section.
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => {
            // Define the status-specific border color mapping cleanly inside the map scope
            const borderColors = {
              Active: "border-t-[#e8683f] md:border-l-[#e8683f]",
              Upcoming: "border-t-[#1e3a8a] md:border-l-[#1e3a8a]", // matches tracking status color theme
              Completed: "border-t-emerald-600 md:border-l-emerald-600",
            };

            const statusBorderClass =
              borderColors[booking.status] ||
              "border-t-[#e8683f] md:border-l-[#e8683f]";

            return (
              <div
                key={booking.id}
                className={`bg-white rounded-xl border-t-4 md:border-t-0 md:border-l-4 border border-gray-200 shadow-xs p-5 transition-all duration-200 relative overflow-hidden group ${statusBorderClass}`}
              >
                {/* Header Meta Line Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Left Provider Initials Circle Badge */}
                    <div className="w-11 h-11 bg-blue-900/10 text-[#1e3a8a] rounded-full flex items-center justify-center text-sm font-bold shrink-0 border border-blue-900/5">
                      {booking.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base leading-tight">
                        {booking.providerName}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5 font-medium">
                        {booking.serviceName}
                      </p>

                      {/* Colored Status Tag Indicators */}
                      <div className="mt-2 flex items-center gap-2">
                        {booking.status === "Active" && (
                          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200 uppercase tracking-wide">
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
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200 uppercase tracking-wide">
                            ✓ {booking.statusText}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Top Price Container Alignment Block */}
                  <div className="text-left sm:text-right self-start sm:self-center">
                    <p className="text-base font-black text-[#1e3a8a]">
                      Rs. {booking.price.toLocaleString()}
                    </p>
                    <span className="inline-block text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md mt-1 uppercase tracking-wider">
                      {booking.isPaid ? "Paid" : "Pay after service"}
                    </span>
                  </div>
                </div>

                {/* Middle Core Details Layout (Date / Location Coordinates) */}
                <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs text-gray-600 font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar size={15} className="text-gray-400 shrink-0" />
                    <span>{booking.dateDisplay}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={15} className="text-gray-400 shrink-0" />
                    <span>{booking.timeDisplay}</span>
                  </div>
                  <div className="flex items-center gap-2 lg:col-span-1">
                    <MapPin size={15} className="text-gray-400 shrink-0" />
                    <span className="truncate">{booking.address}</span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 mt-2 font-mono">
                  Booking Reference: {booking.id}
                </p>

                {/* Bottom Control Actions Panel Row Footer Block */}
                <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Modifications State Warn message if locked */}
                  <div>
                    {booking.modificationsLocked && (
                      <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                        ✕ Modifications locked — provider is on the way
                      </p>
                    )}
                    {booking.status === "Upcoming" && (
                      <p className="text-xs text-gray-400 font-normal">
                        * Changes allowed up to 2 hours before the schedule.
                      </p>
                    )}
                  </div>

                  {/* Action Buttons context aware based on dynamic state logic */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {booking.status === "Active" && (
                      <>
                        <button
                          onClick={() => handleOpenDetails(booking)}
                          className="px-4 py-2 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          Track
                        </button>
                        <button className="px-4 py-2 bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs">
                          <MessageSquare size={13} fill="white" /> WhatsApp
                        </button>
                      </>
                    )}

                    {booking.status === "Upcoming" && (
                      <>
                        <button
                          onClick={() => handleOpenDetails(booking)}
                          className="px-3.5 py-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-xs rounded-lg transition-colors"
                        >
                          Reschedule
                        </button>
                        <button className="px-3.5 py-2 border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-xs rounded-lg transition-colors">
                          Cancel
                        </button>
                        <button className="px-4 py-2 bg-[#25d366] hover:bg-[#20ba5a] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs">
                          <MessageSquare size={13} fill="white" /> WhatsApp
                        </button>
                      </>
                    )}

                    {booking.status === "Completed" && (
                      <>
                        {booking.providerName.includes("CoolTech") ? (
                          <button className="px-3.5 py-2 bg-[#e8683f] hover:bg-[#d45b34] text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-xs">
                            <Star size={13} fill="white" /> Leave Review
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenDetails(booking)}
                            className="px-3.5 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5"
                          >
                            <Eye size={13} /> View Details
                          </button>
                        )}
                        <button className="px-3.5 py-2 border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold text-xs rounded-lg transition-colors">
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

      {/* ── Dynamic Structural Modal Mounting Injection Tree ── */}
      {selectedBooking && (
        <BookingDetailsModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBooking(null);
          }}
          provider={{
            name: selectedBooking.providerName,
            initials: selectedBooking.initials,
            specialty: selectedBooking.specialty,
            categories: [selectedBooking.serviceName, "Verified"],
          }}
          bookingDetails={{
            services: [
              {
                name: selectedBooking.serviceName,
                priceMin: selectedBooking.price,
                priceMax: selectedBooking.price,
              },
            ],
            taskSummary: selectedBooking.taskSummary,
            dateDisplay: selectedBooking.dateDisplay,
            timeDisplay: selectedBooking.timeDisplay,
            estimatedMin: selectedBooking.price,
            estimatedMax: selectedBooking.price,
            address: selectedBooking.address,
            photos: [], // Defaults fallback arrays mapping structure parameters
          }}
        />
      )}
    </div>
  );
}

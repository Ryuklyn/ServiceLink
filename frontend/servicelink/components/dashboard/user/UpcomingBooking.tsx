"use client";

import { Calendar } from "lucide-react";

interface UpcomingBookingProps {
  title?: string;
  time?: string;
  location?: string;
  rescheduleInfo?: string;
}

export default function UpcomingBooking({
  title = "Tomorrow: Regular Cleaning",
  time = "10:00 AM",
  location = "New Baneshwor, Kathmandu",
  rescheduleInfo = "Free reschedule available — more than 24 hours away",
}: UpcomingBookingProps) {
  return (
    <div className="mb-8 flex items-center justify-between rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 to-slate-50 px-8 py-6 shadow-sm">
      {/* Left Content */}
      <div className="flex flex-col">
        <div className="flex items-center flex-wrap gap-2">
          <h3 className="text-xl font-bold text-[#1e3a8a]">{title}</h3>

          <span className="text-[#1e3a8a]">•</span>

          <p className="text-sm font-medium text-[#1e3a8a]">{time}</p>

          <span className="text-[#1e3a8a]">•</span>

          <p className="text-sm font-medium text-[#1e3a8a]">{location}</p>
        </div>

        {/* Reschedule Info */}
        <p className="mt-2 text-sm text-green-600">{rescheduleInfo}</p>
      </div>

      {/* Button */}
      <button className="flex-shrink-0 rounded-lg bg-[#1e3a8a] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#152a6b]">
        Manage Booking
      </button>
    </div>
  );
}

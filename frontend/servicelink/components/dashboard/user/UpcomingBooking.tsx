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
    <div className="bg-white rounded-2xl p-6 mb-8 flex items-center justify-between">
      <div className="flex items-start gap-4 flex-1">
        <Calendar className="w-6 h-6 text-[#1e3a8a] mt-1 flex-shrink-0" />
        <div>
          <h3 className="font-bold text-gray-900 text-lg">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            {time} • {location}
          </p>
          <p className="text-xs text-gray-500 mt-2">{rescheduleInfo}</p>
        </div>
      </div>
      <button className="bg-[#1e3a8a] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-[#152a6b] transition-colors flex-shrink-0">
        Manage Booking
      </button>
    </div>
  );
}

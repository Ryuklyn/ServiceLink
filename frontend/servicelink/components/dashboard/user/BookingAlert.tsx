"use client";

import { AlertCircle } from "lucide-react";

interface BookingAlertProps {
  status?: string;
  providerName?: string;
  service?: string;
  eta?: string;
}

export default function BookingAlert({
  status = "Provider is on the way",
  providerName = "Ram Electrical Services",
  service = "Fan Installation",
  eta = "~15 min",
}: BookingAlertProps) {
  return (
    <div className="bg-gradient-to-r from-[#ff9500] to-[#ff7b00] rounded-xl px-6 py-4 mb-8 flex items-center gap-4">
      {/* Pulse dot */}
      <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shrink-0" />

      {/* Status */}
      <span className="text-white font-bold text-sm shrink-0">{status}</span>

      {/* Divider */}
      <span className="text-white/40 text-lg shrink-0">|</span>

      {/* Provider info */}
      <span className="text-white/90 text-sm flex-1 truncate">
        {providerName} · {service} · ETA {eta}
      </span>

      {/* Buttons */}
      <button className="bg-[#1e3a8a] text-white px-5 py-1.5 rounded-lg font-semibold text-sm hover:bg-[#152a6b] transition-colors shrink-0">
        Track Booking
      </button>
      <button className="bg-green-500 text-white px-5 py-1.5 rounded-lg font-semibold text-sm hover:bg-green-600 transition-colors shrink-0">
        WhatsApp
      </button>
    </div>
  );
}

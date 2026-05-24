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
    <div className="bg-gradient-to-r from-[#ff9500] to-[#ff7b00] rounded-2xl p-6 mb-8 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
        <div className="text-white">
          <h3 className="font-bold text-lg">{status}</h3>
          <p className="text-sm opacity-90">
            {providerName} • {service} • ETA {eta}
          </p>
        </div>
      </div>
      <div className="flex gap-3">
        <button className="bg-[#1e3a8a] text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-[#152a6b] transition-colors">
          Track Booking
        </button>
        <button className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-green-600 transition-colors">
          WhatsApp
        </button>
      </div>
    </div>
  );
}

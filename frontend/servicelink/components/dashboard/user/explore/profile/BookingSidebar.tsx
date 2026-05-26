"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Phone,
  Info,
} from "lucide-react";
import { ProviderData } from "./types";

interface BookingSidebarProps {
  provider: ProviderData;
}

const WEEK_DAYS = [
  { day: "Tue", date: 26 },
  { day: "Wed", date: 27 },
  { day: "Thu", date: 28 },
  { day: "Fri", date: 29 },
  { day: "Sat", date: 30 },
  { day: "Sun", date: 31 },
  { day: "Mon", date: 1 },
];

const TIME_SLOTS = [
  { label: "Morning 8-12", value: "morning" },
  { label: "Afternoon 12-5", value: "afternoon" },
  { label: "Evening 5-8", value: "evening" },
];

export default function BookingSidebar({ provider }: BookingSidebarProps) {
  const [selectedService, setSelectedService] = useState(0);
  const [selectedDate, setSelectedDate] = useState(26);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);

  const currentService = provider.services[selectedService];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 flex flex-col gap-4">
      <h2 className="font-bold text-gray-900 text-base">Book a Service</h2>

      {/* Service dropdown */}
      <div>
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(Number(e.target.value))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 bg-white"
        >
          {provider.services.map((s, i) => (
            <option key={s.name} value={i}>
              {s.name} — Rs. {s.priceMin}–{s.priceMax}
            </option>
          ))}
        </select>
      </div>

      {/* Mini week calendar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            disabled={weekOffset === 0}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div className="flex gap-1 flex-1 mx-1">
            {WEEK_DAYS.map(({ day, date }) => {
              const isSelected = date === selectedDate;
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`flex-1 flex flex-col items-center py-1.5 rounded-lg text-xs transition-all ${
                    isSelected
                      ? "bg-[#1e3a8a] text-white"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="font-medium opacity-80">{day}</span>
                  <span className="font-bold text-sm mt-0.5">{date}</span>
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Slider progress indicator */}
        <div className="w-full h-1 bg-gray-100 rounded-full mt-1">
          <div
            className="h-full rounded-full transition-all"
            style={{
              backgroundColor: "#1e3a8a",
              width: `${((WEEK_DAYS.findIndex((d) => d.date === selectedDate) + 1) / WEEK_DAYS.length) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Time slots */}
      <div className="flex gap-2">
        {TIME_SLOTS.map((slot) => (
          <button
            key={slot.value}
            onClick={() =>
              setSelectedTime(selectedTime === slot.value ? null : slot.value)
            }
            className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
              selectedTime === slot.value
                ? "bg-[#1e3a8a] text-white border-[#1e3a8a]"
                : "border-gray-200 text-gray-600 hover:border-[#1e3a8a]/40 hover:bg-gray-50"
            }`}
          >
            {slot.label}
          </button>
        ))}
      </div>

      {/* Price estimate */}
      {currentService && (
        <p className="text-[#1e3a8a] font-bold text-sm">
          Rs. {currentService.priceMin.toLocaleString()} –{" "}
          {currentService.priceMax.toLocaleString()} estimated
        </p>
      )}

      {/* Cancellation notice */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 flex gap-2">
        <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 leading-relaxed">
          Free cancellation up to 4 hrs before. Rescheduling free if done 24+
          hrs in advance.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2">
        <button className="w-full bg-[#e8683f] hover:bg-[#d75930] text-white font-bold py-3 rounded-xl text-sm transition-colors">
          Book Now
        </button>
        <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4" />
          WhatsApp
        </button>
        <button className="w-full border border-gray-200 text-gray-700 font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
          <Phone className="w-4 h-4" />
          Call Provider
        </button>
      </div>
    </div>
  );
}

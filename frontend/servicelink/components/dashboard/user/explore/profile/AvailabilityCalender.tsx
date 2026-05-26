"use client";

import { useState } from "react";

const DAYS = [
  { day: "Tue", date: 26 },
  { day: "Wed", date: 27 },
  { day: "Thu", date: 28 },
  { day: "Fri", date: 29 },
  { day: "Sat", date: 30 },
  { day: "Sun", date: 31 },
  { day: "Mon", date: 1 },
];

export default function AvailabilityCalendar() {
  const [selected, setSelected] = useState(26);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex gap-2">
        {DAYS.map(({ day, date }) => {
          const isSelected = date === selected;
          return (
            <button
              key={date}
              onClick={() => setSelected(date)}
              className={`flex-1 flex flex-col items-center gap-2 py-3 px-2 rounded-xl transition-all duration-150 ${
                isSelected
                  ? "bg-[#1e3a8a] text-white"
                  : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              <span className="text-xs font-medium opacity-80">{day}</span>
              <span className="text-base font-bold">{date}</span>
              {/* Availability dots */}
              <div className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-green-300" : "bg-green-400"
                    }`}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

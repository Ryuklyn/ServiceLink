"use client";

import { Star } from "lucide-react";

interface BookAgainProvider {
  id: string;
  initials: string;
  name: string;
  service: string;
  date: string;
  rating: number;
  bgColor: string;
}

interface BookAgainSectionProps {
  providers?: BookAgainProvider[];
}

export default function BookAgainSection({ providers }: BookAgainSectionProps) {
  const defaultProviders: BookAgainProvider[] = [
    {
      id: "1",
      initials: "MH",
      name: "Meena Home Care",
      service: "Deep Cleaning",
      date: "May 2026",
      rating: 4.9,
      bgColor: "bg-[#1e3a8a]",
    },
    {
      id: "2",
      initials: "SC",
      name: "Sita Cleaning Services",
      service: "Deep Cleaning",
      date: "May 2026",
      rating: 4.9,
      bgColor: "bg-[#2d5aa8]",
    },
  ];

  const displayProviders = providers || defaultProviders;

  const renderStars = (rating: number) => {
    const rounded = Math.round(rating);
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-3.5 h-3.5 ${
          i < rounded ? "fill-[#e8683f] text-[#e8683f]" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <section className="mb-12">
      <h2 className="text-xl font-semibold text-gray-900">Book Again</h2>
      <p className="text-sm text-gray-500 mt-1 mb-6">
        Based on your recent bookings
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {displayProviders.map((provider) => (
          <div
            key={provider.id}
            className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
          >
            <div className="p-6 flex flex-col items-center">
              <div
                className={`${provider.bgColor} w-14 h-14 rounded-full flex items-center justify-center text-white text-lg font-bold mb-4`}
              >
                {provider.initials}
              </div>

              <h3 className="font-semibold text-gray-900 text-center">
                {provider.name}
              </h3>

              <p className="text-xs text-gray-500 mt-1">{provider.service}</p>

              <p className="text-xs text-gray-400">{provider.date}</p>

              <div className="flex items-center gap-1 mt-3">
                {renderStars(provider.rating)}
                <span className="ml-1 text-sm font-semibold text-gray-900">
                  {provider.rating}
                </span>
              </div>
            </div>

            <button className="w-full bg-[#e8683f] text-white py-3 font-semibold text-sm hover:bg-[#d75930] transition-colors">
              Book Again
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

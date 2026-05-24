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

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Book Again</h2>
      <p className="text-gray-600 mb-6">Based on your recent bookings</p>
      <div className="grid grid-cols-4 gap-6">
        {displayProviders.map((provider) => (
          <div
            key={provider.id}
            className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col"
          >
            <div className="p-6 flex-1 flex flex-col">
              <div
                className={`${provider.bgColor} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-lg font-bold`}
              >
                {provider.initials}
              </div>
              <h3 className="font-bold text-gray-900 text-center mb-1">
                {provider.name}
              </h3>
              <p className="text-xs text-gray-600 text-center mb-1">
                {provider.service}
              </p>
              <p className="text-xs text-gray-500 text-center mb-3">
                {provider.date}
              </p>
              <div className="flex items-center justify-center gap-1 mb-4">
                <Star className="w-4 h-4 fill-[#e8683f] text-[#e8683f]" />
                <span className="font-semibold text-gray-900 text-sm">
                  {provider.rating}
                </span>
              </div>
            </div>
            <button className="bg-[#e8683f] text-white py-3 font-bold text-sm hover:bg-[#d75930] transition-colors">
              Book Again
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { Star, ChevronRight } from "lucide-react";

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
      initials: "CA",
      name: "CoolBreeze AC Service",
      service: "AC Service",
      date: "May 18, 2026",
      rating: 4.5,
      bgColor: "bg-[#1e3a8a]",
    },
    {
      id: "2",
      initials: "SP",
      name: "Sita Plumbing Solutions",
      service: "Pipe Repair",
      date: "May 10, 2026",
      rating: 4.6,
      bgColor: "bg-[#1e3a8a]",
    },
  ];

  const displayProviders = providers || defaultProviders;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "fill-[#e8683f] text-[#e8683f]"
            : i < rating
              ? "fill-[#e8683f]/50 text-[#e8683f]/50"
              : "fill-gray-200 text-gray-200"
        }`}
      />
    ));
  };

  return (
    <section className="mb-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Book Again</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Based on your recent bookings
          </p>
        </div>
        <button className="flex items-center gap-1 text-[#e8683f] text-sm font-semibold hover:underline shrink-0 mt-1">
          See All
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Cards */}
      <div className="flex gap-5">
        {displayProviders.map((provider) => (
          <div
            key={provider.id}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            style={{ width: "260px" }}
          >
            {/* Card Body */}
            <div className="p-5">
              {/* Top row: avatar + info */}
              <div className="flex items-center gap-4 mb-5">
                <div
                  className={`${provider.bgColor} w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0`}
                >
                  {provider.initials}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm leading-tight">
                    {provider.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {provider.service}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {provider.date}
                  </p>
                </div>
              </div>

              {/* Stars + rating */}
              <div className="flex items-center gap-1.5 mb-5">
                <div className="flex items-center gap-0.5">
                  {renderStars(provider.rating)}
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {provider.rating}
                </span>
              </div>

              {/* Book Again button inside card */}
              <button className="w-full bg-[#e8683f] hover:bg-[#d75930] text-white py-2.5 rounded-xl font-bold text-sm transition-colors">
                Book Again
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

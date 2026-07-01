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
      <section className="mb-8 sm:mb-12">
        {/* Header */}
        <div className="flex items-start justify-between mb-4 sm:mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Book Again</h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Based on your recent bookings
            </p>
          </div>
          <button className="flex items-center gap-1 text-[#e8683f] text-xs sm:text-sm font-semibold hover:underline shrink-0 mt-1">
            See All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Cards — horizontal scroll on mobile instead of squeezing */}
        <div className="flex gap-4 sm:gap-5 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {displayProviders.map((provider) => (
              <div
                  key={provider.id}
                  className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden shrink-0 w-[240px] sm:w-[260px]"
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                    <div
                        className={`${provider.bgColor} w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0`}
                    >
                      {provider.initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm leading-tight truncate">
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

                  <div className="flex items-center gap-1.5 mb-4 sm:mb-5">
                    <div className="flex items-center gap-0.5">
                      {renderStars(provider.rating)}
                    </div>
                    <span className="text-sm font-semibold text-gray-800">
                  {provider.rating}
                </span>
                  </div>

                  <button className="w-full bg-[#e8683f] hover:bg-[#d75930] text-white py-2.5 rounded-xl font-bold text-sm transition-colors">
                    Book Again
                  </button>
                </div>
              </div>
          ))}
        </div>

        <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      </section>
  );
}
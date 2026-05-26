"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { ProviderData } from "./types";

interface ReviewsSectionProps {
  provider: ProviderData;
}

const renderStars = (r: number) =>
  Array.from({ length: 5 }).map((_, i) => (
    <Star
      key={i}
      className={`w-3.5 h-3.5 ${
        i < Math.floor(r)
          ? "fill-[#e8683f] text-[#e8683f]"
          : i < r
            ? "fill-[#e8683f]/50 text-[#e8683f]/50"
            : "fill-gray-200 text-gray-200"
      }`}
    />
  ));

export default function ReviewsSection({ provider }: ReviewsSectionProps) {
  const [activeFilter, setActiveFilter] = useState("All");

  const allServices = [
    "All",
    ...Array.from(new Set(provider.providerReviews.map((r) => r.service))),
  ];

  const filtered =
    activeFilter === "All"
      ? provider.providerReviews
      : provider.providerReviews.filter((r) => r.service === activeFilter);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h2 className="font-bold text-gray-900 text-lg mb-4">Reviews</h2>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {allServices.map((service) => (
          <button
            key={service}
            onClick={() => setActiveFilter(service)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              activeFilter === service
                ? "bg-[#1e3a8a] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {service}
          </button>
        ))}
      </div>

      {/* Review cards */}
      <div className="space-y-5">
        {filtered.map((review) => (
          <div key={review.id} className="flex gap-4">
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ backgroundColor: "#1e3a8a" }}
            >
              {review.initials}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm text-gray-900">
                  {review.name}
                </span>
                <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full">
                  {review.service}
                </span>
              </div>
              <div className="flex gap-0.5 mb-1.5">
                {renderStars(review.rating)}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-1">
                {review.text}
              </p>
              <p className="text-xs text-gray-400">{review.date}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { ProviderData } from "./types";

interface RatingsBreakdownProps {
  provider: ProviderData;
}

const RATING_LABELS: Record<keyof ProviderData["ratingsBreakdown"], string> = {
  punctuality: "Punctuality",
  quality: "Quality",
  communication: "Communication",
  value: "Value",
};

export default function RatingsBreakdown({ provider }: RatingsBreakdownProps) {
  const breakdown = provider.ratingsBreakdown;

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm select-none">
      <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-5">
        Ratings Breakdown
      </h2>

      {/* Structured 2x2 Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
        {(
          Object.keys(breakdown) as Array<
            keyof ProviderData["ratingsBreakdown"]
          >
        ).map((key) => {
          const score = breakdown[key];
          const pct = Math.min(100, Math.max(0, Math.round(score <= 5 ? score * 20 : score)));

          return (
            <div key={key} className="flex flex-col gap-2">
              {/* Upper Text Metrics Row */}
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-gray-500">
                  {RATING_LABELS[key]}
                </span>
                <span className="font-bold text-slate-900">{pct}%</span>
              </div>

              {/* Enhanced Progress Container Track with Dual Brand Gradient Mask */}
              <div className="w-full bg-slate-50 border border-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${pct}%`,
                    // Perfectly blends from deep blue into brand orange (#e8683f) horizontally
                    backgroundImage:
                      "linear-gradient(to right, #1e3a8a, #d9562b, #e8683f)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h2 className="font-bold text-gray-900 text-lg mb-5">
        Ratings Breakdown
      </h2>

      {/* 2x2 Grid */}
      <div className="grid grid-cols-2 gap-6">
        {(
          Object.keys(breakdown) as Array<
            keyof ProviderData["ratingsBreakdown"]
          >
        ).map((key) => {
          const score = breakdown[key];
          const pct = (score / 5) * 100;

          return (
            <div key={key} className="flex flex-col gap-2">
              {/* Label + Score */}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {RATING_LABELS[key]}
                </span>
                <span className="text-sm font-semibold text-gray-700">
                  {score}/5
                </span>
              </div>

              {/* Bar */}
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: "#e8683f",
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

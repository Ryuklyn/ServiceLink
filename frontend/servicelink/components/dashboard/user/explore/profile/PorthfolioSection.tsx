"use client";

import { ProviderData } from "./types";

interface PortfolioSectionProps {
  provider: ProviderData;
}

export default function PortfolioSection({ provider }: PortfolioSectionProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h2 className="font-bold text-gray-900 text-lg mb-4">Portfolio</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {provider.portfolio.map((item) => (
          <div
            key={item.label}
            className="relative h-36 rounded-xl overflow-hidden cursor-pointer group"
            style={{ background: item.gradient }}
          >
            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-200" />
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white text-sm font-semibold drop-shadow">
                {item.label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

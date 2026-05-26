"use client";

import { ProviderData } from "./types";

interface AboutSectionProps {
  provider: ProviderData;
}

export default function AboutSection({ provider }: AboutSectionProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h2 className="font-bold text-gray-900 text-lg mb-3">About</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">
        {provider.about}
      </p>
      <div className="flex flex-wrap gap-2">
        {provider.areas.map((area) => (
          <span
            key={area}
            className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-full"
          >
            {area}
          </span>
        ))}
      </div>
    </div>
  );
}

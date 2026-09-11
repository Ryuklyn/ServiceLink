"use client";

import dynamic from "next/dynamic";

const CoverageMapClient = dynamic(() => import("./CoverageMapClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 rounded-xl bg-gray-100 flex items-center justify-center">
      <div className="text-sm text-gray-400">Loading map…</div>
    </div>
  ),
});

interface CoverageMapProps {
  center: { lat: number; lng: number };
  radiusKm: number;
  areas?: string[];
}

export default function CoverageMap({ center, radiusKm, areas = [] }: CoverageMapProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h2 className="font-bold text-gray-900 text-lg mb-4">
        Service Coverage Area — {radiusKm} km radius
      </h2>
      <div className="overflow-hidden rounded-xl border border-gray-100">
        <CoverageMapClient center={center} radiusKm={radiusKm} />
      </div>
      {areas.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {areas.map((area) => (
            <span key={area} className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-800">
              {area}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

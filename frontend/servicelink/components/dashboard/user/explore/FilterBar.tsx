"use client";

import { X } from "lucide-react";

interface FilterBarProps {
  category: string;
  setCategory: (v: string) => void;
  distance: string;
  setDistance: (v: string) => void;
  rating: string;
  setRating: (v: string) => void;
  verifiedOnly: boolean;
  setVerifiedOnly: (v: boolean) => void;
  availableOnly: boolean;
  setAvailableOnly: (v: boolean) => void;
  sort: string;
  setSort: (v: string) => void;
  resultCount: number;
  hasFilters: boolean;
  onClearAll: () => void;
}

const CATEGORIES = [
  "All Categories",
  "Electrician",
  "Plumbing",
  "Cleaning",
  "Painting",
  "AC Repair",
  "Carpentry",
  "Internet Repair",
  "Appliance Repair",
];
const DISTANCES = ["Any Distance", "2 km", "5 km", "10 km", "20 km"];
const RATINGS = ["Any Rating", "4.5+", "4.0+", "3.5+"];
const SORTS = [
  "Relevance",
  "Rating",
  "Distance",
  "Price: Low to High",
  "Price: High to Low",
];

const selectClass =
  "border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#1e3a8a] cursor-pointer appearance-none pr-8";

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none ${
          checked ? "bg-[#1e3a8a]" : "bg-gray-300"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
      <span className="text-sm text-gray-600">{label}</span>
    </label>
  );
}

export default function FilterBar({
  category,
  setCategory,
  distance,
  setDistance,
  rating,
  setRating,
  verifiedOnly,
  setVerifiedOnly,
  availableOnly,
  setAvailableOnly,
  sort,
  setSort,
  resultCount,
  hasFilters,
  onClearAll,
}: FilterBarProps) {
  return (
    <div className="sticky top-0 z-30 pt-1 pb-4">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Category */}
          <div className="relative">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={selectClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-base font-semibold leading-none">
              ▾
            </span>
          </div>

          {/* Distance */}
          <div className="relative">
            <select
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className={selectClass}
            >
              {DISTANCES.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-base font-semibold leading-none">
              ▾
            </span>
          </div>

          {/* Rating */}
          <div className="relative">
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className={selectClass}
            >
              {RATINGS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-base font-semibold leading-none">
              ▾
            </span>
          </div>

          {/* Verified toggle */}
          <Toggle
            checked={verifiedOnly}
            onChange={setVerifiedOnly}
            label="Verified"
          />

          {/* Available toggle */}
          <Toggle
            checked={availableOnly}
            onChange={setAvailableOnly}
            label="Available"
          />

          {/* Sort */}
          <div className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className={selectClass}
            >
              {SORTS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-base font-semibold leading-none">
              ▾
            </span>
          </div>

          {/* Count + Clear */}
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-500 whitespace-nowrap">
              Showing{" "}
              <span className="font-semibold text-gray-800">{resultCount}</span>{" "}
              providers
            </span>
            {hasFilters && (
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 text-sm font-semibold text-[#e8683f] hover:underline whitespace-nowrap"
              >
                <X className="w-3.5 h-3.5" />
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

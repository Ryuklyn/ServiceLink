"use client";

import { useState } from "react";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";

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
    "w-full md:w-auto border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white focus:outline-none focus:border-[#1e3a8a] cursor-pointer appearance-none pr-8";

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
      <label className="flex items-center justify-between md:justify-start gap-2 cursor-pointer select-none w-full md:w-auto bg-gray-50 md:bg-transparent p-2 md:p-0 rounded-lg border border-gray-100 md:border-none">
        <span className="text-sm text-gray-600 font-medium md:font-normal">{label}</span>
        <button
            role="switch"
            aria-checked={checked}
            onClick={() => onChange(!checked)}
            className={`relative w-10 h-5 rounded-full transition-colors duration-200 focus:outline-none shrink-0 ${
                checked ? "bg-[#1e3a8a]" : "bg-gray-300"
            }`}
        >
        <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
                checked ? "translate-x-5" : "translate-x-0"
            }`}
        />
        </button>
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
  const [isOpen, setIsOpen] = useState(false);

  return (
      <div className="sticky top-0 z-30 pt-1 pb-4 bg-transparent">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 md:px-6 py-3 md:py-4">

          {/* Mobile Header Controller */}
          <div className="flex md:hidden items-center justify-between w-full">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 bg-gray-50 active:bg-gray-100 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {hasFilters && (
                  <span className="w-2 h-2 bg-[#e8683f] rounded-full" />
              )}
            </button>

            <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">
            <span className="font-semibold text-gray-800">{resultCount}</span> providers
          </span>
          </div>

          {/* Filters Group (Collapsible wrapper for mobile screens) */}
          <div className={`${isOpen ? "flex" : "hidden"} md:flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 mt-3 md:mt-0 pt-3 md:pt-0 border-t border-gray-100 md:border-none flex-wrap`}>

            {/* Category Selector */}
            <div className="relative w-full md:w-auto">
              <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={selectClass}
              >
                {CATEGORIES.map((c) => (
                    <option key={c}>{c}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 stroke-[2.5]" />
            </div>

            {/* Distance Selector */}
            <div className="relative w-full md:w-auto">
              <select
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className={selectClass}
              >
                {DISTANCES.map((d) => (
                    <option key={d}>{d}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 stroke-[2.5]" />
            </div>

            {/* Rating Selector */}
            <div className="relative w-full md:w-auto">
              <select
                  value={rating}
                  onChange={(e) => setRating(e.target.value)}
                  className={selectClass}
              >
                {RATINGS.map((r) => (
                    <option key={r}>{r}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 stroke-[2.5]" />
            </div>

            {/* Inline Toggles grouped nicely on mobile row splits */}
            <div className="grid grid-cols-2 md:flex items-center gap-3 w-full md:w-auto">
              <Toggle
                  checked={verifiedOnly}
                  onChange={setVerifiedOnly}
                  label="Verified"
              />
              <Toggle
                  checked={availableOnly}
                  onChange={setAvailableOnly}
                  label="Available"
              />
            </div>

            {/* Sorting Controller */}
            <div className="relative w-full md:w-auto md:ml-auto">
              <div className="text-xs text-gray-400 mb-1 md:hidden pl-1">Sort by</div>
              <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className={selectClass}
              >
                {SORTS.map((s) => (
                    <option key={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 stroke-[2.5] md:top-1/2 md:mt-0 mt-2" />
            </div>

            {/* Action Row Footer: Handles clears & displays metadata cleanly inside context */}
            <div className="flex md:hidden items-center justify-between pt-2 border-t border-gray-100 mt-1">
              <span className="text-xs text-gray-400">Active selections apply instantly</span>
              {hasFilters && (
                  <button
                      onClick={() => {
                        onClearAll();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-1 text-sm font-semibold text-[#e8683f] hover:underline whitespace-nowrap"
                  >
                    <X className="w-3.5 h-3.5" />
                    Clear All
                  </button>
              )}
            </div>
          </div>

          {/* Desktop-only Right-aligned Stats Header */}
          <div className="hidden md:flex items-center gap-3 ml-auto justify-end mt-0">
            {!isOpen && (
                <>
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
                </>
            )}
          </div>

        </div>
      </div>
  );
}
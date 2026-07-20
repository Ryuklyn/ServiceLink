"use client";
import { useMemo, useState } from "react";
import {
  Zap,
  Hammer,
  Paintbrush2,
  Wrench,
  Sparkles,
  Wind,
  LayoutGrid,
  Clock,
  Plus,
  Minus,
  Info,
} from "lucide-react";
import { ProviderData } from "./types";

interface ServicesPricingProps {
  provider: ProviderData;
  onBookService?: (serviceName: string) => void;
  selectedServices?: { name: string; priceMin: number; priceMax: number }[];
}

type CategoryMeta = {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  border: string;
};

const CATEGORY_META: Record<string, CategoryMeta> = {
  ELECTRICIAN: {
    label: "Electrician",
    icon: <Zap size={14} strokeWidth={2.4} />,
    color: "#1e3a8a",
    bg: "#eff3fb",
    border: "#c7d4f0",
  },
  PLUMBER: {
    label: "Plumber",
    icon: <Wrench size={14} strokeWidth={2.4} />,
    color: "#0369a1",
    bg: "#eff9ff",
    border: "#bae6fd",
  },
  CARPENTER: {
    label: "Carpenter",
    icon: <Hammer size={14} strokeWidth={2.4} />,
    color: "#92400e",
    bg: "#fef3e2",
    border: "#fcd9a0",
  },
  PAINTER: {
    label: "Painter",
    icon: <Paintbrush2 size={14} strokeWidth={2.4} />,
    color: "#166534",
    bg: "#ecfdf3",
    border: "#a7f3c2",
  },
  CLEANER: {
    label: "Cleaner",
    icon: <Sparkles size={14} strokeWidth={2.4} />,
    color: "#7c3aed",
    bg: "#f5f3ff",
    border: "#ddd6fe",
  },
  AC_REPAIR: {
    label: "AC Repair",
    icon: <Wind size={14} strokeWidth={2.4} />,
    color: "#0e7490",
    bg: "#ecfeff",
    border: "#a5f3fc",
  },
};

const FALLBACK_META: CategoryMeta = {
  label: "Other",
  icon: <LayoutGrid size={14} strokeWidth={2.4} />,
  color: "#374151",
  bg: "#f9fafb",
  border: "#e5e7eb",
};

function groupByCategory(services: ProviderData["services"]) {
  const map: Record<string, ProviderData["services"]> = {};
  for (const svc of services) {
    const cat = svc.category ?? "Other";
    if (!map[cat]) map[cat] = [];
    map[cat].push(svc);
  }
  return map;
}

/**
 * Price displayed as a torn ticket stub — perforated divider on desktop,
 * echoing a service job-order slip. Notches use an inset shadow so they
 * read as "punched" regardless of what's behind the card.
 */
function PriceStub({
                     priceMin,
                     priceMax,
                     accentColor,
                   }: {
  priceMin: number;
  priceMax: number;
  accentColor: string;
}) {
  return (
      <div className="relative flex items-center pl-4 sm:pl-6">
        <div className="hidden sm:block absolute left-0 top-0 bottom-0 border-l border-dashed border-slate-200" />
        <div className="hidden sm:block absolute left-0 -top-[7px] h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-slate-100 shadow-[inset_0_1px_2px_rgba(15,23,42,0.12)]" />
        <div className="hidden sm:block absolute left-0 -bottom-[7px] h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-slate-100 shadow-[inset_0_1px_2px_rgba(15,23,42,0.12)]" />
        <div className="text-right sm:text-left">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Rate
          </p>
          <p
              className="text-base sm:text-lg font-bold tabular-nums whitespace-nowrap leading-tight"
              style={{ color: accentColor }}
          >
            Rs {priceMin.toLocaleString()}
            {priceMax !== priceMin && (
                <span className="text-sm font-medium text-slate-400">
              {" "}
                  – {priceMax.toLocaleString()}
            </span>
            )}
          </p>
        </div>
      </div>
  );
}

export default function ServicesPricing({
                                          provider,
                                          onBookService,
                                          selectedServices = [],
                                        }: ServicesPricingProps) {
  const grouped = useMemo(() => groupByCategory(provider.services), [provider.services]);
  const categories = Object.keys(grouped);
  const [active, setActive] = useState("All");

  const visibleCategories =
      active === "All" ? categories : categories.filter((c) => c === active);

  const isSelected = (name: string) => selectedServices.some((s) => s.name === name);

  return (
      <div
          className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-4xl mx-auto"
          style={{ border: "1px solid #e5e9f2" }}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
              Available Services
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Verified subservices for this provider
            </p>
          </div>

          {/* Category tabs — icon + label + count */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
                onClick={() => setActive("All")}
                className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#1e3a8a]/50 whitespace-nowrap flex-shrink-0"
                style={
                  active === "All"
                      ? { background: "#1e3a8a", color: "#fff", boxShadow: "0 2px 8px rgba(30,58,138,0.18)" }
                      : { background: "#f3f4f8", color: "#6b7280", border: "1px solid #e5e9f2" }
                }
            >
              <LayoutGrid size={13} strokeWidth={2.4} />
              All
              <span
                  className="ml-0.5 rounded-full px-1.5 text-[10px] font-bold"
                  style={{
                    background: active === "All" ? "rgba(255,255,255,0.2)" : "#e5e9f2",
                    color: active === "All" ? "#fff" : "#6b7280",
                  }}
              >
              {provider.services.length}
            </span>
            </button>

            {categories.map((cat) => {
              const meta = CATEGORY_META[cat] ?? FALLBACK_META;
              const isActiveTab = active === cat;
              return (
                  <button
                      key={cat}
                      onClick={() => setActive(cat)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 whitespace-nowrap flex-shrink-0"
                      style={
                        isActiveTab
                            ? { background: meta.color, color: "#fff", boxShadow: `0 2px 8px ${meta.color}30` }
                            : { background: "#f3f4f8", color: "#6b7280", border: "1px solid #e5e9f2" }
                      }
                  >
                    {meta.icon}
                    {meta.label}
                    <span
                        className="ml-0.5 rounded-full px-1.5 text-[10px] font-bold"
                        style={{
                          background: isActiveTab ? "rgba(255,255,255,0.2)" : "#e5e9f2",
                          color: isActiveTab ? "#fff" : "#6b7280",
                        }}
                    >
                  {grouped[cat].length}
                </span>
                  </button>
              );
            })}
          </div>
        </div>

        {provider.services.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
              <p className="text-sm font-medium text-slate-500">No services listed yet</p>
              <p className="text-xs text-slate-400 mt-1">
                This provider hasn't published any pricing.
              </p>
            </div>
        ) : (
            <div className="flex flex-col gap-6 sm:gap-7">
              {visibleCategories.map((cat) => {
                const meta = CATEGORY_META[cat] ?? FALLBACK_META;
                return (
                    <div key={cat}>
                      <div className="flex items-center gap-2 mb-3">
                  <span
                      className="flex h-6 w-6 items-center justify-center rounded-md flex-shrink-0"
                      style={{ background: meta.bg, color: meta.color }}
                  >
                    {meta.icon}
                  </span>
                        <span
                            className="font-bold uppercase tracking-wide text-xs sm:text-sm"
                            style={{ color: meta.color }}
                        >
                    {meta.label}
                  </span>
                        <span className="h-px flex-1 bg-slate-100" />
                      </div>

                      <div className="flex flex-col gap-2.5 sm:gap-3">
                        {grouped[cat].map((service) => {
                          const added = isSelected(service.name);
                          return (
                              <div
                                  key={service.name}
                                  className="relative flex flex-col xs:flex-row xs:items-center justify-between gap-3 overflow-hidden rounded-xl pl-4 pr-3 py-3 sm:pl-5 sm:pr-4 sm:py-4 transition-all duration-200 hover:shadow-sm"
                                  style={{
                                    border: added ? "1.5px solid #10b981" : "1px solid #e5e9f2",
                                    background: added ? "#f0fdf4" : "#fafbff",
                                  }}
                              >
                                {/* category accent bar */}
                                <span
                                    className="absolute left-0 top-0 bottom-0 w-1"
                                    style={{ background: added ? "#10b981" : meta.color }}
                                />

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-slate-900 leading-snug break-words">
                                    {service.name}
                                  </p>
                                  <p className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                    <Clock size={11} strokeWidth={2} />
                                    {service.duration}
                                  </p>
                                </div>

                                {/* Price + action */}
                                <div className="flex items-center justify-between xs:justify-end gap-4 sm:gap-6 flex-shrink-0 pt-2 xs:pt-0 border-t xs:border-t-0 border-slate-100">
                                  <PriceStub
                                      priceMin={service.priceMin}
                                      priceMax={service.priceMax}
                                      accentColor="#e8683f"
                                  />

                                  <button
                                      onClick={() => onBookService?.(service.name)}
                                      className="flex items-center justify-center gap-1 text-xs sm:text-sm font-bold px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all duration-150 flex-shrink-0 hover:opacity-90 active:scale-95 w-24 sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#e8683f]/50"
                                      style={
                                        added
                                            ? {
                                              background: "#f1f5f9",
                                              color: "#64748b",
                                              border: "1px solid #e2e8f0",
                                            }
                                            : {
                                              background: "#e8683f",
                                              color: "#fff",
                                              boxShadow: "0 2px 6px rgba(232,104,63,0.25)",
                                            }
                                      }
                                  >
                                    {added ? (
                                        <>
                                          <Minus size={13} strokeWidth={2.8} />
                                          Remove
                                        </>
                                    ) : (
                                        <>
                                          <Plus size={13} strokeWidth={2.8} />
                                          Add
                                        </>
                                    )}
                                  </button>
                                </div>
                              </div>
                          );
                        })}
                      </div>
                    </div>
                );
              })}
            </div>
        )}

        {/* Footer note */}
        <div
            className="flex items-start gap-2 mt-5 sm:mt-6 rounded-xl p-3 sm:p-4"
            style={{ background: "#f3f6fd", border: "1px solid #dce5f5" }}
        >
          <Info size={14} strokeWidth={2} className="mt-0.5 flex-shrink-0" style={{ color: "#1e3a8a" }} />
          <p className="text-[11px] sm:text-xs text-slate-500 leading-normal">
            Pricing varies by task size, material use, and final inspection.
          </p>
        </div>
      </div>
  );
}
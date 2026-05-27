"use client";
import { useState } from "react";
import {
  Zap,
  Hammer,
  Paintbrush2,
  LayoutGrid,
  Clock,
  Plus,
  Info,
} from "lucide-react";
import { ProviderData } from "./types";

interface ServicesPricingProps {
  provider: ProviderData;
  onBookService?: (serviceName: string) => void;
}

const CATEGORY_META: Record<
  string,
  { icon: React.ReactNode; color: string; bg: string; border: string }
> = {
  Electrician: {
    icon: <Zap size={15} strokeWidth={2.2} />,
    color: "#1e3a8a",
    bg: "#eff3fb",
    border: "#c7d4f0",
  },
  Carpentry: {
    icon: <Hammer size={15} strokeWidth={2.2} />,
    color: "#92400e",
    bg: "#fef3e2",
    border: "#fcd9a0",
  },
  Painting: {
    icon: <Paintbrush2 size={15} strokeWidth={2.2} />,
    color: "#166534",
    bg: "#ecfdf3",
    border: "#a7f3c2",
  },
};

// Group services by category from provider data
function groupByCategory(services: ProviderData["services"]) {
  const map: Record<string, ProviderData["services"]> = {};
  for (const svc of services) {
    const cat = svc.category ?? "Other";
    if (!map[cat]) map[cat] = [];
    map[cat].push(svc);
  }
  return map;
}

export default function ServicesPricing({
  provider,
  onBookService,
}: ServicesPricingProps) {
  const grouped = groupByCategory(provider.services);
  const categories = Object.keys(grouped);
  const tabs = ["All", ...categories];
  const [active, setActive] = useState("All");

  const visibleCategories =
    active === "All" ? categories : categories.filter((c) => c === active);

  return (
    <div
      className="bg-white rounded-2xl p-6"
      style={{ border: "1px solid #e5e9f2" }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-black leading-tight">
            Available Services
          </h2>
          <p className="text-sm text-gray-400 mt-0.5">
            Verified subservices for this provider
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map((tab) => {
            const isActive = active === tab;
            const meta = CATEGORY_META[tab];
            return (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 focus:outline-none"
                style={
                  isActive
                    ? {
                        background:
                          tab === "All"
                            ? "#1e3a8a"
                            : (meta?.color ?? "#1e3a8a"),
                        color: "#fff",
                        boxShadow: "0 2px 8px rgba(30,58,138,0.18)",
                      }
                    : {
                        background: "#f3f4f8",
                        color: "#6b7280",
                        border: "1px solid #e5e9f2",
                      }
                }
              >
                {tab === "All" ? (
                  <LayoutGrid size={14} strokeWidth={2.2} />
                ) : (
                  meta?.icon
                )}
                {tab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Sections */}
      <div className="flex flex-col gap-6">
        {visibleCategories.map((cat) => {
          const meta = CATEGORY_META[cat] ?? {
            icon: <LayoutGrid size={15} />,
            color: "#374151",
            bg: "#f9fafb",
            border: "#e5e7eb",
          };
          return (
            <div key={cat}>
              {/* Category Label */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="flex items-center justify-center w-7 h-7 rounded-full"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  {meta.icon}
                </span>
                <span
                  className="text-base font-bold"
                  style={{ color: meta.color }}
                >
                  {cat}
                </span>
              </div>

              {/* Service Cards */}
              <div className="flex flex-col gap-3">
                {grouped[cat].map((service) => (
                  <div
                    key={service.name}
                    className="flex items-center gap-4 rounded-xl px-4 py-4 transition-shadow duration-150 hover:shadow-sm"
                    style={{
                      border: `1px solid ${meta.border}`,
                      background: "#fafbff",
                    }}
                  >
                    {/* Service Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 leading-snug">
                        {service.name}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                        <Clock size={11} strokeWidth={2} />
                        {service.duration}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0 mr-2">
                      <p
                        className="text-sm font-bold"
                        style={{ color: "#e8683f" }}
                      >
                        Rs. {service.priceMin.toLocaleString()}
                        {service.priceMax !== service.priceMin && (
                          <span className="font-normal text-gray-400">
                            {" "}
                            – {service.priceMax.toLocaleString()}
                          </span>
                        )}
                      </p>
                      {service.priceNote && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {service.priceNote}
                        </p>
                      )}
                    </div>

                    {/* Category badge */}
                    <span
                      className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
                      style={{
                        background: meta.bg,
                        color: meta.color,
                        border: `1px solid ${meta.border}`,
                      }}
                    >
                      {cat}
                    </span>

                    {/* Add Button */}
                    <button
                      onClick={() => onBookService?.(service.name)}
                      className="flex items-center gap-1 text-sm font-bold px-4 py-2 rounded-lg transition-all duration-150 flex-shrink-0 hover:opacity-90 active:scale-95"
                      style={{
                        background: "#e8683f",
                        color: "#fff",
                        boxShadow: "0 2px 6px rgba(232,104,63,0.25)",
                      }}
                    >
                      <Plus size={14} strokeWidth={2.8} />
                      Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div
        className="flex items-start gap-2 mt-6 rounded-xl px-4 py-3"
        style={{ background: "#f3f6fd", border: "1px solid #dce5f5" }}
      >
        <Info
          size={14}
          strokeWidth={2}
          className="mt-0.5 flex-shrink-0"
          style={{ color: "#1e3a8a" }}
        />
        <p className="text-xs text-gray-500">
          Pricing varies by task size, material use, and final inspection.
        </p>
      </div>
    </div>
  );
}

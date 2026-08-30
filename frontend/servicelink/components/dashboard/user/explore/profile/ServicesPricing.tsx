"use client";
import { useMemo, useState, useEffect, useRef } from "react";
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
import { estimatePrice, STATUS_LABEL, EstimateResult } from "@/lib/api/smartEstimatorApi";
import {
  ProviderData,
  ProviderService,
  SelectedService,
  PricingUnit,
  EstimateStatus,
} from "./types";

interface ServicesPricingProps {
  provider: ProviderData;
  selectedServices?: SelectedService[];
  onAddService?: (entry: SelectedService) => void;
  onRemoveService?: (name: string) => void;
  onUpdateService?: (entry: SelectedService) => void;
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

function getCategoryMeta(category: string): CategoryMeta {
  const normalized = category.trim().toUpperCase().replace(/[\s-]+/g, "_");
  const knownKey = Object.keys(CATEGORY_META).find((key) => {
    if (normalized === key) return true;
    if (key === "ELECTRICIAN") return normalized.includes("ELECTR");
    if (key === "PLUMBER") return normalized.includes("PLUMB");
    if (key === "CARPENTER") return normalized.includes("CARPENT");
    if (key === "PAINTER") return normalized.includes("PAINT");
    if (key === "CLEANER") return normalized.includes("CLEAN");
    if (key === "AC_REPAIR") return normalized.includes("AC") && normalized.includes("REPAIR");
    return false;
  });
  const visual = knownKey ? CATEGORY_META[knownKey] : FALLBACK_META;

  // The API category is the source of truth for the tab title. Visual metadata
  // only supplies its icon/colors; it must never turn an unknown category into
  // a generic repeated "Other" label.
  return { ...visual, label: category.trim() || FALLBACK_META.label };
}

// Display label shown next to the price/quantity for each pricing unit.
// Must cover every member of PricingUnit or this fails to typecheck.
const UNIT_LABEL: Record<PricingUnit, string> = {
  PER_JOB: "job",
  PER_ITEM: "items",
  PER_HOUR: "hours",
  PER_SQ_FT: "sq. ft.",
  PER_WALL: "walls",
};

const STATUS_COLOR: Record<EstimateStatus, { text: string; bg: string }> = {
  ESTIMATED: { text: "#166534", bg: "#ecfdf3" },
  STARTING_FROM: { text: "#92400e", bg: "#fef3e2" },
  REQUIRES_INPUT: { text: "#0369a1", bg: "#eff9ff" },
  REQUIRES_ASSESSMENT: { text: "#b91c1c", bg: "#fef2f2" },
  FINALIZED: { text: "#1e3a8a", bg: "#eff3fb" },
};

function groupByCategory(services: ProviderService[]) {
  const map: Record<string, ProviderService[]> = {};
  for (const svc of services) {
    const cat = svc.category ?? "Other";
    if (!map[cat]) map[cat] = [];
    map[cat].push(svc);
  }
  return map;
}

function toSelectedService(
    service: ProviderService,
    estimate: EstimateResult,
    quantity?: number
): SelectedService {
  return {
    name: service.name,
    catalogId: service.catalogId,
    priceMin: service.priceMin,
    priceMax: service.priceMax,
    pricingUnit: service.pricingUnit,
    rate: service.rate,
    estimationMode: service.estimationMode,
    quantity,
    estimateStatus: estimate.status,
    estimatedAmount: estimate.estimatedAmount,
  };
}

// Placeholder text shown inside the quantity input before the user types
// anything, when the backend hasn't supplied its own requiredInputLabel.
function inferInputPlaceholder(unit?: PricingUnit): string {
  switch (unit) {
    case "PER_SQ_FT":
      return "Approximate area";
    case "PER_HOUR":
      return "Estimated duration";
    case "PER_ITEM":
      return "Quantity";
    case "PER_WALL":
      return "Number of walls";
    default:
      return "Value";
  }
}

/**
 * Price displayed as a torn ticket stub — perforated divider on desktop,
 * echoing a service job-order slip. Now status-aware: shows the estimator's
 * verdict (Estimated / Starting from / needs input / needs assessment)
 * instead of assuming every service resolves to a flat number (spec §6).
 */
function PriceStub({
                     service,
                     estimate,
                     accentColor,
                     quantity,
                     onQuantityChange,
                   }: {
  service: ProviderService;
  estimate: EstimateResult;
  accentColor: string;
  quantity?: number;
  onQuantityChange: (quantity: number | undefined) => void;
}) {
  const unitLabel = service.pricingUnit ? UNIT_LABEL[service.pricingUnit] : "job";
  const statusColor = STATUS_COLOR[estimate.status];
  // Input-based services (sq ft, hours, item count, walls) always let the
  // customer type their own value — never a system-predicted number — and
  // keep that field editable even after it resolves to an estimate, so
  // they can correct it any time. Spec §4/§7: the system must not invent
  // a quantity.
  const isInputBased = service.estimationMode === "INPUT_BASED";

  return (
      <div className="relative flex flex-col items-end pl-4 sm:pl-6 gap-1 min-w-[128px]">
        <div className="hidden sm:block absolute left-0 top-0 bottom-0 border-l border-dashed border-slate-200" />
        <div className="hidden sm:block absolute left-0 -top-[7px] h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-slate-100 shadow-[inset_0_1px_2px_rgba(15,23,42,0.12)]" />
        <div className="hidden sm:block absolute left-0 -bottom-[7px] h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-slate-100 shadow-[inset_0_1px_2px_rgba(15,23,42,0.12)]" />

        <span
            className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded whitespace-nowrap"
            style={{ color: statusColor.text, background: statusColor.bg }}
        >
          {STATUS_LABEL[estimate.status]}
        </span>

        {isInputBased && (
            <div className="flex items-center gap-1">
              <input
                  type="number"
                  min={0}
                  inputMode="decimal"
                  value={quantity ?? ""}
                  onChange={(e) =>
                      onQuantityChange(e.target.value ? Number(e.target.value) : undefined)
                  }
                  placeholder={estimate.requiredInputLabel ?? inferInputPlaceholder(service.pricingUnit)}
                  className="w-24 text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-right outline-none focus:border-blue-300 bg-white"
              />
              <span className="text-[10px] text-slate-400 whitespace-nowrap">{unitLabel}</span>
            </div>
        )}

        {isInputBased && quantity !== undefined && quantity > 0 && (
            <p className="text-[10px] text-slate-400 whitespace-nowrap tabular-nums">
              {quantity.toLocaleString()} {unitLabel} × Rs {estimate.displayRate.toLocaleString()}
            </p>
        )}

        <p
            className="text-base sm:text-lg font-bold tabular-nums whitespace-nowrap leading-tight"
            style={{ color: accentColor }}
        >
          {estimate.estimatedAmount !== null
              ? `Rs ${estimate.estimatedAmount.toLocaleString()}`
              : "Rs —"}
        </p>

        {!isInputBased && (
            <p className="text-[10px] text-slate-400 whitespace-nowrap">
              Rs {estimate.displayRate.toLocaleString()} / {unitLabel}
            </p>
        )}
      </div>
  );
}

function ServiceRow({
                      service,
                      meta,
                      added,
                      onAdd,
                      onRemove,
                      onUpdate,
                    }: {
  service: ProviderService;
  meta: CategoryMeta;
  added: boolean;
  onAdd: (entry: SelectedService) => void;
  onRemove: (name: string) => void;
  onUpdate: (entry: SelectedService) => void;
}) {
  const [quantity, setQuantity] = useState<number | undefined>(undefined);
  const estimate = useMemo(
      () => estimatePrice(service, quantity),
      [service, quantity]
  );

  // ── FIX: infinite update-depth loop ──
  // `onUpdate` (and often `service`) are recreated on every render of the
  // parent (ServicesPricing maps over grouped services and builds a fresh
  // inline arrow function each time: `onUpdate={(entry) => onUpdateService?.(entry)}`).
  // If those unstable references sit in this effect's dependency array,
  // the effect re-fires purely because of identity churn — not because
  // anything meaningful changed — which calls onUpdate, which triggers a
  // parent setState, which re-renders the parent, which creates a new
  // onUpdate reference, which re-fires the effect again. Infinite loop.
  //
  // Fix: keep the *latest* onUpdate/service in refs (always fresh, no
  // stale-closure risk) and drive the effect only off the values that
  // should actually cause a re-sync: added, quantity, and the resolved
  // estimate. Identity changes in callback props no longer matter.
  const onUpdateRef = useRef(onUpdate);
  const serviceRef = useRef(service);
  useEffect(() => {
    onUpdateRef.current = onUpdate;
    serviceRef.current = service;
  });

  useEffect(() => {
    if (!added) return;
    onUpdateRef.current(toSelectedService(serviceRef.current, estimate, quantity));
    // Intentionally NOT depending on onUpdate/service — see comment above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [added, quantity, estimate.status, estimate.estimatedAmount]);

  // Spec §7: never let an unresolved estimate (missing required input) enter
  // the cart as if it were a real price.
  const canAdd = estimate.estimatedAmount !== null || estimate.status === "STARTING_FROM";

  const handleToggle = () => {
    if (added) {
      onRemove(service.name);
      return;
    }
    if (!canAdd) return;
    onAdd(toSelectedService(service, estimate, quantity));
  };

  return (
      <div
          className="relative flex flex-col xs:flex-row xs:items-center justify-between gap-3 overflow-hidden rounded-xl pl-4 pr-3 py-3 sm:pl-5 sm:pr-4 sm:py-4 transition-all duration-200 hover:shadow-sm"
          style={{
            border: added ? "1.5px solid #10b981" : "1px solid #e5e9f2",
            background: added ? "#f0fdf4" : "#fafbff",
          }}
      >
        <span
            className="absolute left-0 top-0 bottom-0 w-1"
            style={{ background: added ? "#10b981" : meta.color }}
        />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 leading-snug break-words">
            {service.name}
          </p>
          <p className="flex items-center gap-1 text-xs text-slate-400 mt-1">
            <Clock size={11} strokeWidth={2} />
            {service.duration}
          </p>
        </div>

        <div className="flex items-center justify-between xs:justify-end gap-4 sm:gap-6 flex-shrink-0 pt-2 xs:pt-0 border-t xs:border-t-0 border-slate-100">
          <PriceStub
              service={service}
              estimate={estimate}
              accentColor="#e8683f"
              quantity={quantity}
              onQuantityChange={setQuantity}
          />

          <button
              onClick={handleToggle}
              disabled={!added && !canAdd}
              title={!added && !canAdd ? "Enter the required value to add this service" : undefined}
              className="flex items-center justify-center gap-1 text-xs sm:text-sm font-bold px-3 py-2 sm:px-4 sm:py-2 rounded-lg transition-all duration-150 flex-shrink-0 hover:opacity-90 active:scale-95 w-24 sm:w-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#e8683f]/50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:opacity-40"
              style={
                added
                    ? { background: "#f1f5f9", color: "#64748b", border: "1px solid #e2e8f0" }
                    : { background: "#e8683f", color: "#fff", boxShadow: "0 2px 6px rgba(232,104,63,0.25)" }
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
}

// NOTE: The real fix for the 422 MISSING_QUANTITY bug lives upstream in
// page.tsx's mapBackendToProviderData(), where `estimationMode` should be
// derived via inferEstimationMode(pricingUnit, s.estimationMode) instead of
// being read directly off the backend response (which never sends it).
// See smartEstimatorApi.ts for the inferEstimationMode() helper.

export default function ServicesPricing({
                                          provider,
                                          selectedServices = [],
                                          onAddService,
                                          onRemoveService,
                                          onUpdateService,
                                        }: ServicesPricingProps) {
  const grouped = useMemo(() => groupByCategory(provider.services), [provider.services]);
  const categories = useMemo(() => {
    const primaryCategory = provider.category?.trim().toLocaleLowerCase();
    return Object.keys(grouped).sort((left, right) => {
      const leftIsPrimary = left.trim().toLocaleLowerCase() === primaryCategory;
      const rightIsPrimary = right.trim().toLocaleLowerCase() === primaryCategory;
      if (leftIsPrimary !== rightIsPrimary) return leftIsPrimary ? -1 : 1;
      return left.localeCompare(right);
    });
  }, [grouped, provider.category]);
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
              const meta = getCategoryMeta(cat);
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
                This provider hasn&apos;t published any pricing.
              </p>
            </div>
        ) : (
            <div className="flex flex-col gap-6 sm:gap-7">
              {visibleCategories.map((cat) => {
                const meta = getCategoryMeta(cat);
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
                        {grouped[cat].map((service) => (
                            <ServiceRow
                                key={service.name}
                                service={service}
                                meta={meta}
                                added={isSelected(service.name)}
                                onAdd={(entry) => onAddService?.(entry)}
                                onRemove={(name) => onRemoveService?.(name)}
                                onUpdate={(entry) => onUpdateService?.(entry)}
                            />
                        ))}
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

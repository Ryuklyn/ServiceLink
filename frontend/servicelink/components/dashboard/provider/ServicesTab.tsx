"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Zap,
    Hammer,
    Paintbrush,
    Wrench,
    Sparkles,
    Wind,
    Users,
    Trash2,
    ChevronUp,
    ChevronDown,
    Info,
    FileText,
    Lightbulb,
    HelpCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast } from "react-toastify";
import { fetchProviderProfile } from "@/store/slices/providerProfileSlice";
import {
    fetchCatalog,
    saveServicesBatch,
    ServiceCatalogItem,
    ServiceCategoryKey,
    ServiceSelectionPayload,
} from "@/store/slices/providerServicesSlice";

const CATEGORIES: { key: ServiceCategoryKey; label: string; icon: React.ElementType }[] = [
    { key: "ELECTRICIAN", label: "Electrician", icon: Zap },
    { key: "PLUMBER", label: "Plumber", icon: Wrench },
    { key: "CARPENTER", label: "Carpenter", icon: Hammer },
    { key: "PAINTER", label: "Painter", icon: Paintbrush },
    { key: "CLEANER", label: "Cleaner", icon: Sparkles },
    { key: "AC_REPAIR", label: "AC Repair", icon: Wind },
];

function ToggleSwitch({
                          checked,
                          onChange,
                          disabled = false,
                      }: {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onChange}
            disabled={disabled}
            aria-pressed={checked}
            className={`relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/40 disabled:cursor-not-allowed disabled:opacity-50 ${
                checked ? "bg-[#1e3a8a]" : "bg-slate-200"
            }`}
        >
            <span
                className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    checked ? "translate-x-5" : "translate-x-0"
                }`}
            />
        </button>
    );
}

interface SelectionState {
    enabled: boolean;
    price: string;
}

export default function ServicesTab() {
    const dispatch = useAppDispatch();
    const { data: profile } = useAppSelector((state) => state.providerProfile);
    const { byCategory, loading, saving, error } = useAppSelector(
        (state) => state.providerServices,
    );

    // ── Which categories this provider is actually certified for ──────────────
    // certifiedCategories is a comma-separated list of ServiceCategory values,
    // built server-side from primaryService + KYC additionalServices at
    // approval time. Falls back to primaryService alone for providers approved
    // before this field existed (certifiedCategories will be null for them).
    const certifiedKeys = useMemo<ServiceCategoryKey[]>(() => {
        if (profile?.certifiedCategories) {
            return profile.certifiedCategories
                .split(",")
                .map((c) => c.trim())
                .filter(Boolean) as ServiceCategoryKey[];
        }
        return profile?.primaryService ? [profile.primaryService as ServiceCategoryKey] : [];
    }, [profile]);

    const visibleCategories = useMemo(
        () => CATEGORIES.filter((c) => certifiedKeys.includes(c.key)),
        [certifiedKeys],
    );

    const [expanded, setExpanded] = useState<ServiceCategoryKey | "">("");
    const [selections, setSelections] = useState<Record<number, SelectionState>>({});
    const [priceWarning, setPriceWarning] = useState<string | null>(null);

    useEffect(() => {
        if (!profile) dispatch(fetchProviderProfile());
    }, [dispatch, profile]);

    // Only fetch catalogs for categories the provider is actually certified
    // for — no point loading Plumber's sub-services for an Electrician-only
    // provider who will never see that panel.
    useEffect(() => {
        visibleCategories.forEach((c) => dispatch(fetchCatalog(c.key)));
    }, [dispatch, visibleCategories]);

    // Default the expanded panel to the provider's first certified category
    // once it's known, instead of hardcoding "ELECTRICIAN".
    useEffect(() => {
        if (!expanded && visibleCategories.length > 0) {
            setExpanded(visibleCategories[0].key);
        }
    }, [expanded, visibleCategories]);

    useEffect(() => {
        const next: Record<number, SelectionState> = { ...selections };
        let changed = false;

        Object.values(byCategory).forEach((items) => {
            items?.forEach((item) => {
                if (next[item.id] !== undefined) return;
                const existing = profile?.services?.find((s) => s.catalogId === item.id);
                next[item.id] = {
                    enabled: existing?.isAvailable ?? false,
                    price: existing?.customPrice != null
                        ? String(existing.customPrice)
                        : item.basePrice != null
                            ? String(item.basePrice)
                            : "",
                };
                changed = true;
            });
        });

        if (changed) setSelections(next);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [byCategory, profile?.services]);

    const toggleService = (catalogId: number) => {
        setSelections((prev) => ({
            ...prev,
            [catalogId]: { ...prev[catalogId], enabled: !prev[catalogId]?.enabled },
        }));
    };

    const updatePrice = (catalogId: number, value: string) => {
        setSelections((prev) => ({
            ...prev,
            [catalogId]: { ...prev[catalogId], price: value },
        }));
    };

    const enabledCountFor = (category: ServiceCategoryKey) => {
        const items = byCategory[category] ?? [];
        const enabled = items.filter((i) => selections[i.id]?.enabled).length;
        return { enabled, total: items.length };
    };

    // const handleSave = async () => {
    //     const payload: ServiceSelectionPayload[] = [];
    //     let missingPrice = false;
    //
    //     Object.values(byCategory).forEach((items) => {
    //         items?.forEach((item) => {
    //             const sel = selections[item.id];
    //             if (!sel) return;
    //             if (sel.enabled && (sel.price.trim() === "" || Number.isNaN(Number(sel.price)))) {
    //                 missingPrice = true;
    //             }
    //             payload.push({
    //                 catalogId: item.id,
    //                 isAvailable: sel.enabled,
    //                 customPrice: sel.enabled ? Number(sel.price) || 0 : 0,
    //             });
    //         });
    //     });
    //
    //     console.log("SAVE PAYLOAD:", payload);
    //
    //     if (missingPrice) {
    //         setPriceWarning("Set a price for every enabled service before saving.");
    //         return;
    //     }
    //     setPriceWarning(null);
    //
    //     try {
    //         await dispatch(saveServicesBatch(payload)).unwrap();
    //         const refreshed = await dispatch(fetchProviderProfile()).unwrap();
    //
    //         // Force re-sync local selections from the just-saved server truth.
    //         // The population effect above skips any catalogId already present
    //         // in `selections`, so without this, toggles/prices shown after
    //         // Save would keep reflecting stale local state instead of what
    //         // actually got persisted to the backend.
    //         setSelections((prev) => {
    //             const next = { ...prev };
    //             refreshed?.services?.forEach((s: any) => {
    //                 next[s.catalogId] = {
    //                     enabled: s.isAvailable,
    //                     price: String(s.customPrice),
    //                 };
    //             });
    //             return next;
    //         });
    //     } catch {
    //         // error is already captured in redux state via saveServicesBatch.rejected
    //     }
    // };

    const handleSave = async () => {
        const payload: ServiceSelectionPayload[] = [];
        let missingPrice = false;

        Object.values(byCategory).forEach((items) => {
            items?.forEach((item) => {
                const sel = selections[item.id];
                if (!sel) return;
                if (sel.enabled && (sel.price.trim() === "" || Number.isNaN(Number(sel.price)))) {
                    missingPrice = true;
                }
                payload.push({
                    catalogId: item.id,
                    isAvailable: sel.enabled,
                    customPrice: sel.enabled ? Number(sel.price) || 0 : 0,
                });
            });
        });

        if (missingPrice) {
            setPriceWarning("Set a price for every enabled service before saving.");
            toast.warn("Set a price for every enabled service before saving.");
            return;
        }
        setPriceWarning(null);

        const enabledCount = payload.filter((p) => p.isAvailable).length;

        try {
            await dispatch(saveServicesBatch(payload)).unwrap();
            const refreshed = await dispatch(fetchProviderProfile()).unwrap();

            // Force re-sync local selections from the just-saved server truth.
            setSelections((prev) => {
                const next = { ...prev };
                refreshed?.services?.forEach((s: any) => {
                    next[s.catalogId] = {
                        enabled: s.isAvailable,
                        price: String(s.customPrice),
                    };
                });
                return next;
            });

            toast.success(
                enabledCount > 0
                    ? `Saved — ${enabledCount} service${enabledCount > 1 ? "s" : ""} now enabled.`
                    : "Saved — all services are currently disabled.",
            );
        } catch (err: any) {
            toast.error(err ?? "Failed to save services. Please try again.");
        }
    };

    const activeCatalogItems: ServiceCatalogItem[] = useMemo(
        () => (expanded ? byCategory[expanded] ?? [] : []),
        [expanded, byCategory],
    );

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Services &amp; Pricing
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Manage the services you offer and set your prices. Enable or
                            disable services based on your expertise.
                        </p>
                    </div>
                    <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-[#1e3a8a] hover:bg-slate-50">
                        <Info className="h-4 w-4" />
                        How Pricing Works
                    </button>
                </div>

                <p className="mb-2 text-xs font-medium text-slate-500">
                    Your Service Categories
                </p>
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {visibleCategories.map(({ key, label, icon: Icon }) => {
                        const { enabled, total } = enabledCountFor(key);
                        return (
                            <div
                                key={key}
                                className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                            >
                                <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                    <Icon className="h-4 w-4 text-[#e8683f]" />
                                    {label}
                                </span>
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                                    {total > 0 ? `${enabled}/${total} Enabled` : "—"}
                                </span>
                            </div>
                        );
                    })}

                    <div className="flex items-center gap-3 rounded-lg border border-slate-200 px-4 py-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                            <Users className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-medium text-slate-700">
                                Request New Category
                            </p>
                            <p className="text-[11px] text-slate-400">
                                Not seeing your expertise?
                            </p>
                            <button className="mt-1 text-xs font-medium text-[#1e3a8a] hover:underline">
                                Request Category
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {visibleCategories.length === 0 && !error && (
                    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                        No certified service categories found on your profile yet.
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
                    <div className="space-y-4">
                        {visibleCategories.map(({ key, label, icon: Icon }) => {
                            const { enabled, total } = enabledCountFor(key);
                            const isOpen = expanded === key;
                            return (
                                <div key={key} className="rounded-xl border border-slate-200">
                                    <button
                                        onClick={() => setExpanded(isOpen ? "" : key)}
                                        className="flex w-full items-center justify-between px-5 py-4"
                                    >
                                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                            <Icon className="h-4 w-4 text-[#e8683f]" />
                                            {label}
                                            <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                                                {total > 0 ? `${enabled}/${total} Services Enabled` : "No services yet"}
                                            </span>
                                        </span>
                                        {isOpen ? (
                                            <ChevronUp className="h-4 w-4 text-slate-400" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4 text-slate-400" />
                                        )}
                                    </button>

                                    {isOpen && (
                                        <div className="border-t border-slate-200 px-5 pb-5">
                                            {loading && !byCategory[key] && (
                                                <p className="py-4 text-sm text-slate-400">Loading services…</p>
                                            )}
                                            {byCategory[key] && byCategory[key]!.length === 0 && (
                                                <p className="py-4 text-sm text-slate-400">
                                                    No sub-services defined for this category yet.
                                                </p>
                                            )}
                                            {activeCatalogItems.length > 0 && (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-left text-sm">
                                                        <thead>
                                                        <tr className="text-xs text-slate-500">
                                                            <th className="py-3 font-medium">Service</th>
                                                            <th className="py-3 font-medium">Duration</th>
                                                            <th className="py-3 font-medium">Status</th>
                                                            <th className="py-3 font-medium">Your Price (NPR)</th>
                                                            <th className="py-3 font-medium">Actions</th>
                                                        </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100">
                                                        {activeCatalogItems.map((item) => {
                                                            const sel = selections[item.id] ?? { enabled: false, price: "" };
                                                            return (
                                                                <tr key={item.id}>
                                                                    <td className="py-4 align-middle font-medium text-slate-800">
                                                                        {item.subServiceName}
                                                                    </td>
                                                                    <td className="py-4 align-middle text-slate-500">
                                                                        {item.defaultDuration ?? "—"}
                                                                    </td>
                                                                    <td className="py-4 align-middle">
                                                                        <ToggleSwitch
                                                                            checked={sel.enabled}
                                                                            onChange={() => toggleService(item.id)}
                                                                        />
                                                                    </td>
                                                                    <td className="py-4 align-middle">
                                                                        <input
                                                                            type="text"
                                                                            value={sel.price}
                                                                            placeholder="—"
                                                                            disabled={!sel.enabled}
                                                                            onChange={(e) => updatePrice(item.id, e.target.value)}
                                                                            className="w-24 rounded-md border border-slate-200 px-2 py-1.5 text-sm text-slate-700 outline-none disabled:bg-slate-50 disabled:text-slate-300 focus:border-[#1e3a8a]"
                                                                        />
                                                                    </td>
                                                                    <td className="py-4 align-middle">
                                                                        <div className="flex items-center gap-3 text-slate-400">
                                                                            <button
                                                                                onClick={() => toggleService(item.id)}
                                                                                title="Disable this service"
                                                                                className="hover:text-red-500"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="space-y-5">
                        <div className="rounded-xl border border-slate-200 p-5">
                            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-900">
                                <FileText className="h-4 w-4 text-[#e8683f]" />
                                Pricing Guidelines
                            </h3>
                            <p className="mb-3 text-xs text-slate-500">
                                Set competitive prices to get more bookings.
                            </p>
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex gap-2">
                                    <span className="text-[#e8683f]">+</span>
                                    Research market rates in your area
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#e8683f]">+</span>
                                    Consider your experience and skill level
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#e8683f]">+</span>
                                    Keep prices updated with market trends
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#e8683f]">+</span>
                                    Higher quality often justifies higher price
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-5">
                            <h3 className="mb-3 text-sm font-semibold text-slate-900">
                                Service Tips
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex gap-3">
                                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1e3a8a]/10 text-[#1e3a8a]">
                                        ✎
                                    </span>
                                    <p className="text-slate-600">
                                        Enable only the services you can deliver with high quality.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
                                        <Lightbulb className="h-3.5 w-3.5" />
                                    </span>
                                    <p className="text-slate-600">
                                        Keep your prices competitive and fair.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                                        ✓
                                    </span>
                                    <p className="text-slate-600">
                                        Update your availability to get more bookings.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 p-5">
                            <h3 className="mb-2 text-sm font-semibold text-slate-900">
                                Need Help?
                            </h3>
                            <p className="mb-3 text-sm text-slate-500">
                                If you need help with services or pricing, contact our support.
                            </p>
                            <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                                <HelpCircle className="h-4 w-4" />
                                Contact Support
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {priceWarning && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-700">
                    {priceWarning}
                </div>
            )}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-[#e8683f] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#d95c34] disabled:opacity-50"
                >
                    {saving ? "Saving…" : "Save Changes"}
                </button>
            </div>
        </div>
    );
}
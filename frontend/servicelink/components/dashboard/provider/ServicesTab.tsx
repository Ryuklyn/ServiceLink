"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Zap,
    Hammer,
    Paintbrush,
    Wrench,
    Sparkles,
    Wind,
    Layers,
    Users,
    Trash2,
    ChevronUp,
    ChevronDown,
    Info,
    FileText,
    Loader2,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toast as toastify } from "react-toastify";
import { fetchProviderProfile } from "@/store/slices/providerProfileSlice";
import {
    fetchCategories,
    fetchCatalog,
    saveServicesBatch,
    CategoryDTO,
    ServiceCatalogItem,
    ServiceSelectionPayload,
} from "@/store/slices/providerServicesSlice";

interface ProviderServiceItem {
    catalogId: number;
    isAvailable: boolean;
    customPrice: number;
}

interface SelectionState {
    enabled: boolean;
    price: string;
}

/**
 * Purely cosmetic — picks an icon based on keywords in the category name.
 * This is NOT used for filtering anything; catalog items are already
 * correctly scoped to their category via categoryId on the backend, so
 * there's nothing here that can leak items across categories.
 */
function iconForCategory(name: string) {
    const upper = name.toUpperCase();
    if (upper.includes("ELECTR")) return Zap;
    if (upper.includes("PLUMB")) return Wrench;
    if (upper.includes("CARPENT")) return Hammer;
    if (upper.includes("PAINT")) return Paintbrush;
    if (upper.includes("CLEAN")) return Sparkles;
    if (upper.includes("AC") || upper.includes("HVAC") || upper.includes("COOL")) return Wind;
    return Layers;
}

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

export default function ServicesTab() {
    const dispatch = useAppDispatch();
    const { data: profile } = useAppSelector((state) => state.providerProfile);
    const { categories, categoriesLoading, byCategory, loading, saving, error } = useAppSelector(
        (state) => state.providerServices
    );

    // NOTE: this now shows every ACTIVE category admin has created — the old
    // certifiedCategories/primaryService enum gating is gone, since that
    // field has no real link to the new Category table's ids. If you want
    // providers restricted to specific categories again, that needs a real
    // certifiedCategoryIds field on Provider (a list of Category ids) and a
    // filter here against it — this is the natural place to add that filter
    // once that field exists.
    const certifiedCategoryIds = profile?.certifiedCategoryIds;

    const visibleCategories: CategoryDTO[] = useMemo(
        () => categories.filter((c) => c.isActive && (certifiedCategoryIds ?? []).includes(c.id)),
        [categories, certifiedCategoryIds]
    );

    const [expanded, setExpanded] = useState<number | "">("");
    const [selections, setSelections] = useState<Record<number, SelectionState>>({});
    const [priceWarning, setPriceWarning] = useState<string | null>(null);

    useEffect(() => {
        if (!profile) dispatch(fetchProviderProfile());
    }, [dispatch, profile]);

    useEffect(() => {
        dispatch(fetchCategories());
    }, [dispatch]);

    useEffect(() => {
        visibleCategories.forEach((c) => dispatch(fetchCatalog(c.id)));
    }, [dispatch, visibleCategories]);

    const activeCategoryId = expanded || (visibleCategories[0]?.id ?? "");

    const activeCatalogItems: ServiceCatalogItem[] = useMemo(() => {
        if (!activeCategoryId) return [];
        return byCategory[activeCategoryId] ?? [];
    }, [activeCategoryId, byCategory]);

    const getSelection = (item: ServiceCatalogItem): SelectionState => {
        if (selections[item.id] !== undefined) {
            return selections[item.id];
        }
        const existing = profile?.services?.find((s) => s.catalogId === item.id);
        return {
            enabled: existing?.isAvailable ?? false,
            price:
                existing?.customPrice != null
                    ? String(existing.customPrice)
                    : item.basePrice != null
                        ? String(item.basePrice)
                        : "",
        };
    };

    const toggleService = (catalogId: number) => {
        setSelections((prev) => {
            const current = prev[catalogId] ?? { enabled: false, price: "" };
            return {
                ...prev,
                [catalogId]: { ...current, enabled: !current.enabled },
            };
        });
    };

    const updatePrice = (catalogId: number, value: string) => {
        setSelections((prev) => {
            const current = prev[catalogId] ?? { enabled: false, price: "" };
            return {
                ...prev,
                [catalogId]: { ...current, price: value },
            };
        });
    };

    const enabledCountFor = (categoryId: number) => {
        const items = byCategory[categoryId] ?? [];
        const enabled = items.filter((i) => getSelection(i).enabled).length;
        return { enabled, total: items.length };
    };

    const handleSave = async () => {
        const payload: ServiceSelectionPayload[] = [];
        const processedIds = new Set<number>();
        let missingPrice = false;

        visibleCategories.forEach((category) => {
            const items = byCategory[category.id] ?? [];
            items.forEach((item) => {
                if (processedIds.has(item.id)) return;
                processedIds.add(item.id);

                const sel = getSelection(item);

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
            toastify.warn("Set a price for every enabled service before saving.");
            return;
        }
        setPriceWarning(null);

        const enabledCount = payload.filter((p) => p.isAvailable).length;

        try {
            await dispatch(saveServicesBatch(payload)).unwrap();
            const refreshed = await dispatch(fetchProviderProfile()).unwrap();

            setSelections((prev) => {
                const next = { ...prev };
                refreshed?.services?.forEach((s: ProviderServiceItem) => {
                    next[s.catalogId] = {
                        enabled: s.isAvailable,
                        price: String(s.customPrice),
                    };
                });
                return next;
            });

            toastify.success(
                enabledCount > 0
                    ? `Saved — ${enabledCount} service${enabledCount > 1 ? "s" : ""} now enabled.`
                    : "Saved — all services are currently disabled."
            );
        } catch (err: unknown) {
            const message = typeof err === "string" ? err : "Failed to save services. Please try again.";
            toastify.error(message);
        }
    };

    return (
        <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900">
                            Services &amp; Pricing
                        </h2>
                        <p className="mt-0.5 text-sm text-slate-500">
                            Manage the services you offer and set your prices.
                        </p>
                    </div>
                    <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-[#1e3a8a] hover:bg-slate-50">
                        <Info className="h-4 w-4" />
                        How Pricing Works
                    </button>
                </div>

                <p className="mb-2 text-xs font-medium text-slate-500">Your Service Categories</p>
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {categoriesLoading && (
                        <div className="col-span-full flex items-center gap-2 text-sm text-slate-400 py-2">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading categories…
                        </div>
                    )}

                    {!categoriesLoading &&
                        visibleCategories.map((category) => {
                            const { enabled, total } = enabledCountFor(category.id);
                            const Icon = iconForCategory(category.name);
                            return (
                                <div
                                    key={category.id}
                                    className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
                                >
                                    <span className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                        <Icon className="h-4 w-4 text-[#e8683f]" />
                                        {category.name}
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
                            <p className="text-xs font-medium text-slate-700">Request New Category</p>
                            <p className="text-[11px] text-slate-400">Not seeing your expertise?</p>
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

                {!categoriesLoading && visibleCategories.length === 0 && !error && (
                    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
                        No active service categories exist yet.
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
                    <div className="space-y-4">
                        {visibleCategories.map((category) => {
                            const { enabled, total } = enabledCountFor(category.id);
                            const isOpen = (expanded || visibleCategories[0]?.id) === category.id;
                            const Icon = iconForCategory(category.name);
                            const itemsForThisCategory = byCategory[category.id] ?? [];

                            return (
                                <div key={category.id} className="rounded-xl border border-slate-200">
                                    <button
                                        onClick={() => setExpanded(isOpen ? "" : category.id)}
                                        className="flex w-full items-center justify-between px-5 py-4"
                                    >
                                        <span className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                                            <Icon className="h-4 w-4 text-[#e8683f]" />
                                            {category.name}
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
                                            {loading && !byCategory[category.id] && (
                                                <p className="py-4 text-sm text-slate-400">Loading services…</p>
                                            )}
                                            {byCategory[category.id] && itemsForThisCategory.length === 0 && (
                                                <p className="py-4 text-sm text-slate-400">
                                                    No sub-services defined for this category yet.
                                                </p>
                                            )}
                                            {itemsForThisCategory.length > 0 && (
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
                                                        {itemsForThisCategory.map((item) => {
                                                            const sel = getSelection(item);
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
                                                                        <button
                                                                            onClick={() => toggleService(item.id)}
                                                                            title="Disable this service"
                                                                            className="text-slate-400 hover:text-red-500"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </button>
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
                            <ul className="space-y-2 text-sm text-slate-600">
                                <li className="flex gap-2"><span className="text-[#e8683f]">+</span>Research market rates in your area</li>
                                <li className="flex gap-2"><span className="text-[#e8683f]">+</span>Consider your experience and skill level</li>
                                <li className="flex gap-2"><span className="text-[#e8683f]">+</span>Keep prices updated with market trends</li>
                            </ul>
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
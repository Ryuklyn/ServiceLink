"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Link from "next/link";
import { Search, Star, ShieldCheck, Clock, MapPin, CheckCircle2, Plus, Users } from "lucide-react";
import type { AppDispatch, RootState } from "@/store";
import {
    fetchProviderDirectory,
    addProviderToPool,
    ProviderDirectoryCard,
} from "@/store/slices/features/admin-subscription/directory/providerDirectorySlice";
import api from "@/utils/axios";

const NAVY = "#1e3a8a";
const ORANGE = "#e8683f";

type CategoryFilter = { id: number; name: string };

function initialsOf(name: string): string {
    return name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("");
}

function resolveImageUrl(url?: string | null): string | null {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
    return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function DirectoryPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { items, status, error, addingProviderIds } = useSelector(
        (s: RootState) => s.providerDirectory,
    );

    const [query, setQuery] = useState("");
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [categories, setCategories] = useState<CategoryFilter[]>([]);
    const [categoryError, setCategoryError] = useState<string | null>(null);

    useEffect(() => {
        dispatch(fetchProviderDirectory());
    }, [dispatch]);

    useEffect(() => {
        let active = true;
        api.get<CategoryFilter[]>("/providers/categories")
            .then(({ data }) => {
                if (active) setCategories(data);
            })
            .catch(() => {
                if (active) setCategoryError("Service filters could not be loaded. You can still search providers.");
            });
        return () => { active = false; };
    }, []);

    const toggleFilter = (cat: string) => {
        setActiveFilters((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
    };

    const clearFilters = () => {
        setActiveFilters([]);
        setQuery("");
    };

    const handleAddToPool = async (provider: ProviderDirectoryCard) => {
        const result = await dispatch(addProviderToPool(provider.providerId));
        if (addProviderToPool.fulfilled.match(result)) {
            toast.success(
                `${provider.businessName || provider.fullName} added to your Provider Pool.`,
            );
        } else {
            toast.error((result.payload as string) ?? "Failed to add provider to your pool.");
        }
    };

    const filteredProviders = useMemo(() => {
        return items.filter((p) => {
            const matchesFilter =
                activeFilters.length === 0 ||
                (p.primaryCategoryName != null && activeFilters.includes(p.primaryCategoryName));
            const q = query.trim().toLowerCase();
            const matchesQuery =
                q === "" ||
                p.fullName.toLowerCase().includes(q) ||
                (p.primaryCategoryName ?? "").toLowerCase().includes(q) ||
                (p.specializesIn ?? "").toLowerCase().includes(q);
            return matchesFilter && matchesQuery;
        });
    }, [items, activeFilters, query]);

    const isLoading = status === "loading";

    return (
        <main className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-50/40 min-h-screen">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-slate-900">Provider Directory</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Providers who&apos;ve turned on Pro Orders and are ready to be added. Once added, manage them from{" "}
                    <Link href="/dashboard/business/providerpool" className="font-semibold text-[#1e3a8a] hover:underline">
                        Provider Pool
                    </Link>
                    .
                </p>
            </div>

            {error && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Search + filters card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by provider name, category, or specialization..."
                        className="w-full text-slate-800 placeholder-slate-400 rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-500 mr-1">Filters:</span>
                    {categories.map((category) => {
                        const active = activeFilters.includes(category.name);
                        return (
                            <button
                                key={category.id}
                                onClick={() => toggleFilter(category.name)}
                                className={`px-3.5 py-1.5 rounded-full text-sm font-bold transition-colors border ${
                                    active
                                        ? "text-white border-transparent"
                                        : "bg-white text-slate-600 border-gray-200 hover:border-slate-300"
                                }`}
                                style={active ? { backgroundColor: NAVY } : undefined}
                            >
                                {category.name}
                            </button>
                        );
                    })}
                    {activeFilters.length > 0 && (
                        <button
                            onClick={clearFilters}
                            className="text-sm font-bold ml-1 hover:underline"
                            style={{ color: ORANGE }}
                        >
                            Clear filters
                        </button>
                    )}
                </div>
                {categoryError && <p className="text-xs text-amber-700">{categoryError}</p>}
            </div>

            {/* Result count row */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 font-medium">
                    Only providers currently accepting Pro orders are shown here.
                </p>
                {!isLoading && <p className="text-sm text-slate-400 font-medium">Showing {filteredProviders.length} results</p>}
            </div>

            {/* Loading skeleton */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="w-11 h-11 rounded-full bg-slate-100" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3.5 w-2/3 rounded bg-slate-100" />
                                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                                </div>
                            </div>
                            <div className="h-9 rounded-xl bg-slate-100 mt-5" />
                        </div>
                    ))}
                </div>
            )}

            {/* Provider cards */}
            {!isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProviders.map((p) => (
                        <ProviderCard
                            key={p.providerId}
                            provider={p}
                            isAdding={addingProviderIds.includes(p.providerId)}
                            onAdd={() => handleAddToPool(p)}
                        />
                    ))}

                    {filteredProviders.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                <Users size={22} className="text-slate-400" />
                            </div>
                            <p className="text-sm font-semibold text-slate-800">
                                {items.length === 0
                                    ? "No providers are currently accepting Pro orders."
                                    : "No providers match your search or filters."}
                            </p>
                            <p className="text-xs text-slate-400 max-w-sm">
                                {items.length === 0
                                    ? "Providers appear here once they turn on \u201cAccept Business & Pro Orders\u201d on their own dashboard."
                                    : "Try clearing a filter or adjusting your search."}
                            </p>
                            {items.length > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="mt-1 px-4 py-2 text-sm font-bold border border-slate-900 rounded-lg hover:bg-slate-50 transition-colors text-slate-900"
                                >
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}

// ─── Avatar ─────────────────────────────────────────────────────────────

function ProviderAvatar({ name, url }: { name: string; url?: string | null }) {
    const [failed, setFailed] = useState(false);
    const resolved = resolveImageUrl(url);

    if (resolved && !failed) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={resolved}
                alt={name}
                onError={() => setFailed(true)}
                className="w-11 h-11 rounded-full object-cover shrink-0 border border-slate-100"
            />
        );
    }

    return (
        <div className="w-11 h-11 rounded-full bg-[#1e3a8a]/10 text-[#1e3a8a] flex items-center justify-center font-bold text-sm shrink-0">
            {initialsOf(name)}
        </div>
    );
}

// ─── Card ───────────────────────────────────────────────────────────────

function ProviderCard({
                          provider,
                          isAdding,
                          onAdd,
                      }: {
    provider: ProviderDirectoryCard;
    isAdding: boolean;
    onAdd: () => void;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
            <div>
                <div className="flex items-start gap-3">
                    <ProviderAvatar name={provider.fullName} url={provider.profilePictureUrl} />
                    <div className="min-w-0">
                        <p className="text-base font-bold text-slate-900 truncate">
                            {provider.businessName || provider.fullName}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {provider.primaryCategoryName && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                    {provider.primaryCategoryName}
                                </span>
                            )}
                            {provider.averageRating != null && (
                                <span className="flex items-center gap-1 text-xs font-bold" style={{ color: ORANGE }}>
                                    <Star size={12} className="fill-current" />
                                    {provider.averageRating.toFixed(1)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {provider.specializesIn && (
                    <p className="text-sm text-slate-600 mt-4">
                        <span className="text-slate-400 font-medium">Specializes in: </span>
                        <span className="font-semibold text-slate-800">{provider.specializesIn}</span>
                    </p>
                )}

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <Clock size={12} />
                            Response Time
                        </p>
                        <p className="text-sm font-bold text-slate-800 mt-0.5">
                            {provider.responseTimeLabel ?? "—"}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                            <MapPin size={12} />
                            Location
                        </p>
                        <p className="text-sm font-bold text-slate-800 mt-0.5">{provider.location ?? "—"}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 mt-4 pt-3 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-slate-400" />
                        {provider.totalJobs ?? 0} Jobs Done
                    </span>
                    {provider.isVerified ? (
                        <span className="flex items-center gap-1.5" style={{ color: NAVY }}>
                            <CheckCircle2 size={14} />
                            KYC Verified
                        </span>
                    ) : (
                        <span className="flex items-center gap-1.5 text-slate-400">
                            <ShieldCheck size={14} />
                            KYC Pending
                        </span>
                    )}
                </div>
            </div>

            <button
                onClick={onAdd}
                disabled={isAdding || provider.alreadyInPool}
                className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: NAVY }}
            >
                {isAdding ? (
                    "Adding…"
                ) : provider.alreadyInPool ? (
                    "Already in Pool"
                ) : (
                    <>
                        <Plus size={15} />
                        Add to Pool
                    </>
                )}
            </button>
        </div>
    );
}

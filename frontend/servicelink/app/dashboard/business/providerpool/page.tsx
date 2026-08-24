"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Link from "next/link";
import {
    Search,
    Star,
    CheckCircle2,
    Lock,
    Users,
    Trash2,
    X,
    Briefcase,
    Calendar,
    ShieldCheck,
    ShieldAlert,
} from "lucide-react";
import type { AppDispatch, RootState } from "@/store";
import {
    fetchProviderPool,
    removeFromProviderPool,
    ProviderPoolCard,
    ProviderPoolStatus,
} from "@/store/slices/features/admin-subscription/pool/providerPoolSlice";

const NAVY = "#1e3a8a";
const ORANGE = "#e8683f";

// ─── Tabs ─────────────────────────────────────────────────────────────────
type TabKey = ProviderPoolStatus | "All";

const TABS: { key: TabKey; label: string }[] = [
    { key: "ACTIVE", label: "Active" },
    { key: "PENDING_APPROVAL", label: "Pending Approval" },
    { key: "DECLINED", label: "Declined" },
    { key: "All", label: "All" },
];

const STATUS_LABEL: Record<ProviderPoolStatus, string> = {
    ACTIVE: "Active",
    PENDING_APPROVAL: "Pending Approval",
    DECLINED: "Declined",
};

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

export default function ProviderPoolPage() {
    const dispatch = useDispatch<AppDispatch>();
    const { items, status, error, removingIds } = useSelector(
        (s: RootState) => s.providerPool,
    );

    const [activeTab, setActiveTab] = useState<TabKey>("ACTIVE");
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [pendingRemoveId, setPendingRemoveId] = useState<number | null>(null);
    const [profileProvider, setProfileProvider] = useState<ProviderPoolCard | null>(null);

    // Debounce search so we're not firing a request on every keystroke.
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchInput.trim()), 300);
        return () => clearTimeout(t);
    }, [searchInput]);

    useEffect(() => {
        dispatch(fetchProviderPool({ status: activeTab, search: debouncedSearch || undefined }));
    }, [dispatch, activeTab, debouncedSearch]);

    const isLoading = status === "loading";
    const isEmpty = status === "succeeded" && items.length === 0;

    const handleRemoveConfirmed = async (poolEntryId: number, name: string) => {
        setPendingRemoveId(null);
        const result = await dispatch(removeFromProviderPool(poolEntryId));
        if (removeFromProviderPool.fulfilled.match(result)) {
            toast.success(`${name} removed from your Provider Pool.`);
        } else {
            toast.error((result.payload as string) ?? "Failed to remove provider.");
        }
    };

    return (
        <main className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-50/40 min-h-screen">
            {/* Header */}
            <div>
                <h1 className="text-xl font-bold text-slate-900">Provider Pool</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Your organization&apos;s trusted providers for Pro jobs. Add more from the{" "}
                    <Link href="/dashboard/provider-directory" className="font-semibold text-[#1e3a8a] hover:underline">
                        Provider Directory
                    </Link>
                    .
                </p>
            </div>

            {/* Business Informational Alert Header Banner */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-slate-600 shadow-sm">
                Providers control their own Pro participation from their dashboard. Only providers with an
                active paid plan <em>and</em> Pro Orders turned on can be offered Pro jobs — look for the{" "}
                <span className="font-semibold text-emerald-700">Pro Eligible</span> badge below.
            </div>

            {error && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Toolbar: tabs + search, grouped in one card so they read as one control unit */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-4 sm:px-5 pt-4 sm:pt-0">
                    <div className="flex overflow-x-auto text-sm font-medium gap-6 sm:border-b-0" role="tablist">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                role="tab"
                                aria-selected={activeTab === tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`pb-3 sm:pt-4 relative transition-colors whitespace-nowrap ${
                                    activeTab === tab.key ? "text-[#1e3a8a] font-bold" : "text-gray-500 hover:text-gray-800"
                                }`}
                            >
                                {tab.label}
                                {activeTab === tab.key && (
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[#1e3a8a]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="border-t border-gray-100 px-4 sm:px-5 py-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, business, or category..."
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            className="w-full placeholder-slate-400 pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-slate-50/60 focus:outline-none focus:bg-white focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition-colors"
                        />
                    </div>
                </div>
            </div>

            {/* Result count row */}
            {!isLoading && !isEmpty && (
                <p className="text-sm text-slate-400 font-medium -mt-2">
                    Showing {items.length} provider{items.length === 1 ? "" : "s"}
                </p>
            )}

            {/* Loading skeleton */}
            {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="animate-pulse bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="w-11 h-11 rounded-full bg-slate-100" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3.5 w-2/3 rounded bg-slate-100" />
                                    <div className="h-3 w-1/3 rounded bg-slate-100" />
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-100">
                                {Array.from({ length: 3 }).map((__, j) => (
                                    <div key={j} className="h-8 rounded bg-slate-100" />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Empty state */}
            {!isLoading && isEmpty && (
                <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                        <Users size={22} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800">
                        {debouncedSearch ? "No providers match your search." : "No providers in this list yet."}
                    </p>
                    <p className="text-xs text-slate-400 max-w-sm">
                        Add providers from the Provider Directory to build your Pro pool.
                    </p>
                    <Link
                        href="/dashboard/provider-directory"
                        className="mt-1 px-4 py-2 text-sm font-bold border border-slate-900 rounded-lg hover:bg-slate-50 transition-colors text-slate-900"
                    >
                        Browse Directory
                    </Link>
                </div>
            )}

            {/* Provider cards */}
            {!isLoading && !isEmpty && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((provider) => (
                        <ProviderCard
                            key={provider.poolEntryId}
                            provider={provider}
                            isRemoving={removingIds.includes(provider.poolEntryId)}
                            onRequestRemove={() => setPendingRemoveId(provider.poolEntryId)}
                            onViewProfile={() => setProfileProvider(provider)}
                        />
                    ))}
                </div>
            )}

            {/* Remove confirmation */}
            {pendingRemoveId !== null && (
                <ConfirmRemoveDialog
                    provider={items.find((p) => p.poolEntryId === pendingRemoveId) ?? null}
                    onCancel={() => setPendingRemoveId(null)}
                    onConfirm={(name) => handleRemoveConfirmed(pendingRemoveId, name)}
                />
            )}

            {/* View profile */}
            {profileProvider && (
                <ProfileModal
                    provider={profileProvider}
                    onClose={() => setProfileProvider(null)}
                    onRequestRemove={() => {
                        setPendingRemoveId(profileProvider.poolEntryId);
                        setProfileProvider(null);
                    }}
                />
            )}
        </main>
    );
}

// ─── Avatar ─────────────────────────────────────────────────────────────

function ProviderAvatar({
                            name,
                            url,
                            size = 44,
                        }: {
    name: string;
    url?: string | null;
    size?: number;
}) {
    const [failed, setFailed] = useState(false);
    const resolved = resolveImageUrl(url);
    const dim = `${size}px`;

    if (resolved && !failed) {
        return (
            // eslint-disable-next-line @next/next/no-img-element
            <img
                src={resolved}
                alt={name}
                onError={() => setFailed(true)}
                style={{ width: dim, height: dim }}
                className="rounded-full object-cover shrink-0 border border-slate-100"
            />
        );
    }

    return (
        <div
            style={{ width: dim, height: dim, fontSize: size / 2.6 }}
            className="rounded-full flex items-center justify-center text-[#1e3a8a] bg-[#1e3a8a]/10 font-bold shrink-0"
        >
            {initialsOf(name)}
        </div>
    );
}

// ─── Card ───────────────────────────────────────────────────────────────

function ProviderCard({
                          provider,
                          isRemoving,
                          onRequestRemove,
                          onViewProfile,
                      }: {
    provider: ProviderPoolCard;
    isRemoving: boolean;
    onRequestRemove: () => void;
    onViewProfile: () => void;
}) {
    const hasHistory = (provider.proJobsCompleted ?? 0) > 0;

    return (
        <div
            className={`bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between transition-opacity ${
                isRemoving ? "opacity-40 pointer-events-none" : ""
            }`}
        >
            <div>
                <div className="flex items-start gap-3">
                    <ProviderAvatar name={provider.fullName} url={provider.profilePictureUrl} />
                    <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 text-base truncate">
                            {provider.businessName || provider.fullName}
                        </h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {provider.primaryCategoryName && (
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold text-slate-600">
                                    {provider.primaryCategoryName}
                                </span>
                            )}
                            {provider.averageRating != null && (
                                <span className="flex items-center gap-0.5 text-xs font-bold text-[#e8683f]">
                                    <Star size={13} fill="currentColor" />
                                    {provider.averageRating.toFixed(1)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pro performance metrics — matches prodashboard.md §7 provider card */}
                {hasHistory ? (
                    <div className="grid grid-cols-3 gap-2 border-t border-gray-100 mt-5 pt-4 pb-2">
                        <Metric label="Pro Jobs" value={String(provider.proJobsCompleted)} />
                        <Metric
                            label="Attendance"
                            value={provider.attendanceRate != null ? `${provider.attendanceRate.toFixed(0)}%` : "—"}
                        />
                        <Metric
                            label="On-Time"
                            value={provider.onTimeRate != null ? `${provider.onTimeRate.toFixed(0)}%` : "—"}
                        />
                    </div>
                ) : (
                    <p className="border-t border-gray-100 mt-5 pt-4 pb-2 text-xs text-slate-400">
                        No Pro jobs completed yet — performance history will appear here.
                    </p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    {provider.isVerified && (
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                            <CheckCircle2 size={14} className="text-slate-500" />
                            Verified
                        </span>
                    )}

                    {provider.proOrdersEligible ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold tracking-wide text-emerald-700">
                            <CheckCircle2 size={12} />
                            Pro Eligible
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold tracking-wide text-slate-500">
                            <Lock size={11} />
                            Not accepting Pro orders
                        </span>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-3 mt-6 pt-2">
                <button
                    onClick={onViewProfile}
                    className="flex-1 py-2 text-center text-sm font-bold border border-slate-900 rounded-lg hover:bg-slate-50 transition-colors text-slate-900"
                >
                    View Profile
                </button>
                <button
                    onClick={onRequestRemove}
                    disabled={isRemoving}
                    className="px-4 py-2 text-sm font-semibold border border-red-100 text-[#e8683f] rounded-lg hover:bg-red-50/50 transition-colors disabled:opacity-50"
                >
                    {isRemoving ? "Removing…" : "Remove"}
                </button>
            </div>
        </div>
    );
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <p className="text-[11px] text-gray-400 font-medium leading-tight">{label}</p>
            <p className="text-base font-bold text-slate-800 mt-1">{value}</p>
        </div>
    );
}

// ─── View profile modal ─────────────────────────────────────────────────

function ProfileModal({
                          provider,
                          onClose,
                          onRequestRemove,
                      }: {
    provider: ProviderPoolCard;
    onClose: () => void;
    onRequestRemove: () => void;
}) {
    // Close on Escape.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const hasHistory = (provider.proJobsCompleted ?? 0) > 0;
    const name = provider.businessName || provider.fullName;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header band */}
                <div className="px-6 pt-6 pb-5 border-b border-gray-100 relative">
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-50"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-start gap-4 pr-6">
                        <ProviderAvatar name={provider.fullName} url={provider.profilePictureUrl} size={56} />
                        <div className="min-w-0">
                            <h2 className="text-lg font-bold text-slate-900 truncate">{name}</h2>
                            {provider.businessName && (
                                <p className="text-xs text-slate-400 font-medium truncate">{provider.fullName}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                {provider.primaryCategoryName && (
                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold text-slate-600">
                                        {provider.primaryCategoryName}
                                    </span>
                                )}
                                {provider.averageRating != null && (
                                    <span className="flex items-center gap-0.5 text-xs font-bold" style={{ color: ORANGE }}>
                                        <Star size={13} fill="currentColor" />
                                        {provider.averageRating.toFixed(1)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">
                    {/* Status row */}
                    <div className="flex items-center justify-between rounded-xl bg-slate-50/70 px-4 py-3">
                        <span className="text-xs font-semibold text-slate-500">Pool Status</span>
                        <span
                            className="text-xs font-bold px-2 py-0.5 rounded-md"
                            style={{
                                backgroundColor:
                                    provider.poolStatus === "ACTIVE"
                                        ? "#ecfdf5"
                                        : provider.poolStatus === "DECLINED"
                                            ? "#fef2f2"
                                            : "#fffbeb",
                                color:
                                    provider.poolStatus === "ACTIVE"
                                        ? "#047857"
                                        : provider.poolStatus === "DECLINED"
                                            ? "#b91c1c"
                                            : "#b45309",
                            }}
                        >
                            {STATUS_LABEL[provider.poolStatus]}
                        </span>
                    </div>

                    {/* Pro performance */}
                    <div>
                        <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                            <Briefcase size={13} />
                            Pro performance
                        </p>
                        {hasHistory ? (
                            <div className="grid grid-cols-3 gap-2">
                                <ModalMetric label="Pro Jobs" value={String(provider.proJobsCompleted)} />
                                <ModalMetric
                                    label="Attendance"
                                    value={provider.attendanceRate != null ? `${provider.attendanceRate.toFixed(0)}%` : "—"}
                                />
                                <ModalMetric
                                    label="On-Time"
                                    value={provider.onTimeRate != null ? `${provider.onTimeRate.toFixed(0)}%` : "—"}
                                />
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 bg-slate-50/70 rounded-xl px-4 py-3">
                                No Pro jobs completed yet — performance history will appear here once this provider
                                finishes their first Pro job.
                            </p>
                        )}
                    </div>

                    {/* Verification & eligibility */}
                    <div>
                        <p className="text-xs font-semibold text-slate-500 mb-2 flex items-center gap-1.5">
                            <ShieldCheck size={13} />
                            Verification &amp; eligibility
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            {provider.isVerified ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-md bg-slate-100 px-2.5 py-1 text-slate-700">
                                    <CheckCircle2 size={13} className="text-slate-500" />
                                    KYC Verified
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold rounded-md bg-slate-100 px-2.5 py-1 text-slate-500">
                                    <ShieldAlert size={13} />
                                    KYC Pending
                                </span>
                            )}

                            {provider.proOrdersEligible ? (
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">
                                    <CheckCircle2 size={13} />
                                    Pro Eligible
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500">
                                    <Lock size={13} />
                                    Not accepting Pro orders
                                </span>
                            )}
                        </div>
                        {!provider.proOrdersEligible && (
                            <p className="text-[11px] text-slate-400 mt-2 flex items-start gap-1.5">
                                <Calendar size={12} className="mt-0.5 shrink-0" />
                                This provider hasn&apos;t enabled Pro Orders (or their plan isn&apos;t active) from
                                their own dashboard, so they can&apos;t be offered new Pro jobs right now.
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer actions */}
                <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-slate-50/40">
                    <button
                        onClick={onRequestRemove}
                        className="flex items-center gap-1.5 text-sm font-semibold text-[#e8683f] hover:text-[#d95c34] transition-colors"
                    >
                        <Trash2 size={15} />
                        Remove from pool
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors"
                        style={{ backgroundColor: NAVY }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

function ModalMetric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-xl bg-slate-50/70 px-3 py-2.5 text-center">
            <p className="text-[10px] text-gray-400 font-medium leading-tight">{label}</p>
            <p className="text-sm font-bold text-slate-800 mt-1">{value}</p>
        </div>
    );
}

// ─── Remove confirmation ──────────────────────────────────────────────────

function ConfirmRemoveDialog({
                                 provider,
                                 onCancel,
                                 onConfirm,
                             }: {
    provider: ProviderPoolCard | null;
    onCancel: () => void;
    onConfirm: (name: string) => void;
}) {
    if (!provider) return null;
    const name = provider.businessName || provider.fullName;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <Trash2 size={18} className="text-[#e8683f]" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">Remove {name}?</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            They&apos;ll no longer be offered Pro jobs from this pool. This only removes them from{" "}
                            <span className="font-semibold">your</span> Provider Pool — it does not affect their
                            ServiceLink profile or remove them from the Provider Directory.
                        </p>
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 mt-5">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-xl border border-gray-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(name)}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-[#e8683f] hover:bg-[#d95c34] transition-colors"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
}
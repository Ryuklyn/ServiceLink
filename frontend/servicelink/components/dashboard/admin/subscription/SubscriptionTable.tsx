// src/components/dashboard/admin/subscription/SubscriptionTable.tsx
"use client";

import { useEffect, useState } from "react";
import { Search, Filter, Eye, CalendarPlus, Ban, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscriptionList, setListFilters } from "@/store/slices/features/admin-subscription/adminSubscriptionSlice";
import type {
    ProviderSubscriptionRow,
    SubscriptionStatus,
    PlanType,
} from "@/store/slices/features/admin-subscription/adminSubscriptionTypes";
import {
    PlanBadge,
    StatusBadge,
    DaysRemainingCell,
    formatValidityWindow,
    initialsAvatarColor,
} from "./utils";

interface Props {
    onViewLogs: (row: ProviderSubscriptionRow) => void;
    onExtend: (row: ProviderSubscriptionRow) => void;
    onRevoke: (row: ProviderSubscriptionRow) => void;
}

const STATUS_OPTIONS: { value: SubscriptionStatus | "ALL"; label: string }[] = [
    { value: "ALL", label: "All Statuses" },
    { value: "ACTIVE", label: "Active" },
    { value: "EXPIRED", label: "Expired" },
    { value: "CANCELLED", label: "Cancelled" },
];

const PLAN_OPTIONS: { value: PlanType | "ALL"; label: string }[] = [
    { value: "ALL", label: "All Plans" },
    { value: "FREE_TRIAL", label: "Free Trial" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "QUARTERLY", label: "Quarterly" },
    { value: "YEARLY", label: "Yearly" },
];

export default function SubscriptionTable({ onViewLogs, onExtend, onRevoke }: Props) {
    const dispatch = useAppDispatch();
    const { data: result, filters, status, error } = useAppSelector((s) => s.adminSubscription.list);
    const [searchInput, setSearchInput] = useState(filters.search);
    const [showFilters, setShowFilters] = useState(false);

    // debounce the search box -> committed filter in the store
    useEffect(() => {
        const t = setTimeout(() => {
            if (searchInput !== filters.search) {
                dispatch(setListFilters({ search: searchInput, page: 0 }));
            }
        }, 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    // refetch whenever the committed filters change
    useEffect(() => {
        dispatch(fetchSubscriptionList(filters));
    }, [dispatch, filters]);

    const rows = result?.content ?? [];
    const totalPages = result?.totalPages ?? 0;
    const totalElements = result?.totalElements ?? 0;
    const isLoading = status === "loading" || status === "idle";

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {/* Search + Filters bar */}
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search providers, email, or plan..."
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowFilters((s) => !s)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                        <Filter size={13} />
                        Filters
                    </button>
                    {showFilters && (
                        <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-20 space-y-3">
                            <div>
                                <label className="text-[11px] font-semibold text-slate-500">Status</label>
                                <select
                                    value={filters.status}
                                    onChange={(e) =>
                                        dispatch(
                                            setListFilters({ status: e.target.value as SubscriptionStatus | "ALL", page: 0 })
                                        )
                                    }
                                    className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5"
                                >
                                    {STATUS_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold text-slate-500">Plan</label>
                                <select
                                    value={filters.planType}
                                    onChange={(e) =>
                                        dispatch(setListFilters({ planType: e.target.value as PlanType | "ALL", page: 0 }))
                                    }
                                    className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5"
                                >
                                    {PLAN_OPTIONS.map((o) => (
                                        <option key={o.value} value={o.value}>
                                            {o.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                    <tr className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                        <th className="px-4 py-3">Provider Details</th>
                        <th className="px-4 py-3">Plan</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Validity Window</th>
                        <th className="px-4 py-3">Days Remaining</th>
                        <th className="px-4 py-3">Referral Stats</th>
                        <th className="px-4 py-3">Bonus Total</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading &&
                        Array.from({ length: filters.size }).map((_, i) => (
                            <tr key={i} className="border-b border-slate-50 animate-pulse">
                                <td className="px-4 py-4" colSpan={8}>
                                    <div className="h-4 bg-slate-100 rounded w-full" />
                                </td>
                            </tr>
                        ))}

                    {!isLoading && status === "failed" && (
                        <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-red-500">
                                {error}
                            </td>
                        </tr>
                    )}

                    {!isLoading && status === "succeeded" && rows.length === 0 && (
                        <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                                No providers match these filters.
                            </td>
                        </tr>
                    )}

                    {!isLoading &&
                        status === "succeeded" &&
                        rows.map((row) => {
                            const referralPct = Math.min(
                                100,
                                Math.round((row.verifiedReferrals / Math.max(row.referralGoal, 1)) * 100)
                            );
                            return (
                                <tr key={row.providerId} className="border-b border-slate-50 hover:bg-slate-50/60">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                        <span
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold ${initialsAvatarColor(
                                row.avatarInitials
                            )}`}
                        >
                          {row.avatarInitials}
                        </span>
                                            <div>
                                                <p className="font-semibold text-slate-800">{row.providerName}</p>
                                                <p className="text-slate-400 text-[11px]">{row.email}</p>
                                                <p className="text-slate-400 text-[11px]">{row.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <PlanBadge plan={row.planType} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <StatusBadge status={row.status} />
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                                        {formatValidityWindow(row.startDate, row.endDate)}
                                    </td>
                                    <td className="px-4 py-3">
                                        <DaysRemainingCell days={row.daysRemaining} />
                                    </td>
                                    <td className="px-4 py-3 min-w-[110px]">
                                        <p className="text-slate-600 mb-1">
                                            {row.verifiedReferrals} / {row.referralGoal}
                                        </p>
                                        <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 rounded-full"
                                                style={{ width: `${referralPct}%` }}
                                            />
                                        </div>
                                        <p className="text-slate-400 text-[10px] mt-1">{row.verifiedReferrals} Verified</p>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600">{row.referralBonusDaysTotal} days</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                title="View Log"
                                                onClick={() => onViewLogs(row)}
                                                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-100"
                                            >
                                                <Eye size={13} />
                                            </button>
                                            <button
                                                title="Extend"
                                                onClick={() => onExtend(row)}
                                                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-emerald-600 hover:bg-emerald-50"
                                            >
                                                <CalendarPlus size={13} />
                                            </button>
                                            <button
                                                title="Revoke"
                                                disabled={row.status === "CANCELLED"}
                                                onClick={() => onRevoke(row)}
                                                className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center text-red-500 hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
                                            >
                                                <Ban size={13} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
        <span className="text-[11px] text-slate-400">
          {totalElements === 0
              ? "0 results"
              : `Showing ${filters.page * filters.size + 1} to ${Math.min(
                  (filters.page + 1) * filters.size,
                  totalElements
              )} of ${totalElements} results`}
        </span>
                <div className="flex items-center gap-1">
                    <button
                        disabled={filters.page === 0}
                        onClick={() => dispatch(setListFilters({ page: Math.max(0, filters.page - 1) }))}
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-30"
                    >
                        <ChevronLeft size={13} />
                    </button>
                    {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => dispatch(setListFilters({ page: i }))}
                            className={`w-7 h-7 rounded-lg text-[11px] font-semibold ${
                                filters.page === i ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-600"
                            }`}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        disabled={filters.page >= totalPages - 1}
                        onClick={() =>
                            dispatch(setListFilters({ page: Math.min(totalPages - 1, filters.page + 1) }))
                        }
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-30"
                    >
                        <ChevronRight size={13} />
                    </button>
                </div>
            </div>
        </div>
    );
}
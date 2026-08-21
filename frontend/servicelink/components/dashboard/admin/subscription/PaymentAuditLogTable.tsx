// src/components/dashboard/admin/subscription/PaymentAuditLogTable.tsx
"use client";

import { useEffect, useState } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAuditLog, setAuditFilters } from "@/store/slices/features/admin-subscription/adminSubscriptionSlice";
import type { PaymentGateway, TransactionStatus } from "@/store/slices/features/admin-subscription/adminSubscriptionTypes";
import { GatewayBadge, TransactionStatusBadge, formatCurrency, formatDateTime } from "./utils";

const GATEWAY_OPTIONS: { value: PaymentGateway | "ALL"; label: string }[] = [
    { value: "ALL", label: "All Gateways" },
    { value: "ESEWA", label: "eSewa" },
    { value: "KHALTI", label: "Khalti" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
];

const STATUS_OPTIONS: { value: TransactionStatus | "ALL"; label: string }[] = [
    { value: "ALL", label: "All Statuses" },
    { value: "SUCCESS", label: "Success" },
    { value: "FAILED", label: "Failed" },
    { value: "INITIATED", label: "Initiated" },
];

export default function PaymentAuditLogTable() {
    const dispatch = useAppDispatch();
    const { data: result, filters, status, error } = useAppSelector((s) => s.adminSubscription.auditLog);
    const [searchInput, setSearchInput] = useState(filters.search);

    useEffect(() => {
        const t = setTimeout(() => {
            if (searchInput !== filters.search) {
                dispatch(setAuditFilters({ search: searchInput, page: 0 }));
            }
        }, 350);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchInput]);

    useEffect(() => {
        dispatch(fetchAuditLog(filters));
    }, [dispatch, filters]);

    const rows = result?.content ?? [];
    const totalPages = result?.totalPages ?? 0;
    const totalElements = result?.totalElements ?? 0;
    const isLoading = status === "loading" || status === "idle";

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search by reference ID, provider name or email..."
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={filters.gateway}
                        onChange={(e) =>
                            dispatch(setAuditFilters({ gateway: e.target.value as PaymentGateway | "ALL", page: 0 }))
                        }
                        className="text-xs border border-slate-200 rounded-lg px-2.5 py-2"
                    >
                        {GATEWAY_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                    <select
                        value={filters.status}
                        onChange={(e) =>
                            dispatch(setAuditFilters({ status: e.target.value as TransactionStatus | "ALL", page: 0 }))
                        }
                        className="text-xs border border-slate-200 rounded-lg px-2.5 py-2"
                    >
                        {STATUS_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                    <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50">
                        <Filter size={13} />
                        Filters
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-xs">
                    <thead>
                    <tr className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                        <th className="px-4 py-3">Reference ID</th>
                        <th className="px-4 py-3">Provider Name</th>
                        <th className="px-4 py-3">Gateway</th>
                        <th className="px-4 py-3">Amount</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Timestamp</th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading &&
                        Array.from({ length: filters.size }).map((_, i) => (
                            <tr key={i} className="border-b border-slate-50 animate-pulse">
                                <td className="px-4 py-4" colSpan={6}>
                                    <div className="h-4 bg-slate-100 rounded w-full" />
                                </td>
                            </tr>
                        ))}

                    {!isLoading && status === "failed" && (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-red-500">
                                {error}
                            </td>
                        </tr>
                    )}

                    {!isLoading && status === "succeeded" && rows.length === 0 && (
                        <tr>
                            <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                No transactions match these filters.
                            </td>
                        </tr>
                    )}

                    {!isLoading &&
                        status === "succeeded" &&
                        rows.map((tx) => (
                            <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50/60">
                                <td className="px-4 py-3 font-semibold text-blue-600">{tx.referenceId}</td>
                                <td className="px-4 py-3">
                                    <p className="font-medium text-slate-800">{tx.providerName}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <GatewayBadge gateway={tx.gateway} />
                                </td>
                                <td className="px-4 py-3 text-slate-700 font-medium">{formatCurrency(tx.amount)}</td>
                                <td className="px-4 py-3">
                                    <TransactionStatusBadge status={tx.status} />
                                </td>
                                <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                                    {formatDateTime(tx.createdAt)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
                        onClick={() => dispatch(setAuditFilters({ page: Math.max(0, filters.page - 1) }))}
                        className="w-7 h-7 rounded-lg border border-slate-200 flex items-center justify-center disabled:opacity-30"
                    >
                        <ChevronLeft size={13} />
                    </button>
                    {Array.from({ length: totalPages }).slice(0, 5).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => dispatch(setAuditFilters({ page: i }))}
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
                            dispatch(setAuditFilters({ page: Math.min(totalPages - 1, filters.page + 1) }))
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
// src/components/dashboard/admin/subscription/SubscriptionHistoryModal.tsx
"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscriptionHistory, clearHistory } from "@/store/slices/features/admin-subscription/adminSubscriptionSlice";
import type { ProviderSubscriptionRow } from "@/store/slices/features/admin-subscription/adminSubscriptionTypes";
import {
    StatusBadge,
    PlanBadge,
    GatewayBadge,
    TransactionStatusBadge,
    formatValidityWindow,
    formatDateTime,
    getInitials,
} from "./utils";

interface Props {
    row: ProviderSubscriptionRow;
    onClose: () => void;
}

type Tab = "transactions" | "events";

export default function SubscriptionHistoryModal({ row, onClose }: Props) {
    const dispatch = useAppDispatch();
    const [tab, setTab] = useState<Tab>("transactions");
    const { data: history, status, error } = useAppSelector((s) => s.adminSubscription.history);

    useEffect(() => {
        dispatch(fetchSubscriptionHistory(row.providerId));
        return () => {
            dispatch(clearHistory());
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [row.providerId]);

    const sub = history?.subscription ?? row;
    const isLoading = status === "loading" || status === "idle";

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl border border-slate-200 max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between p-6 pb-4">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Subscription History &amp; Logs</h3>
                        <div className="flex items-center gap-2 mt-2">
              <span className="w-7 h-7 rounded-full bg-slate-700 text-white text-[11px] font-bold flex items-center justify-center">
                {getInitials(row.providerName)}
              </span>
                            <span className="text-sm font-semibold text-slate-800">{row.providerName}</span>
                            <span className="text-xs text-slate-400">
                {row.email} &middot; {row.category}
              </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={sub.status} />
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Summary */}
                <div className="px-6 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                        <p className="text-slate-400 mb-1">Plan</p>
                        <PlanBadge plan={sub.planType} />
                    </div>
                    <div>
                        <p className="text-slate-400 mb-1">Status</p>
                        <p className="font-semibold text-slate-800">{sub.status}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 mb-1">Validity</p>
                        <p className="font-semibold text-slate-800">
                            {formatValidityWindow(sub.startDate, sub.endDate)}
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-400 mb-1">Days Remaining</p>
                        <p className="font-semibold text-slate-800">{sub.daysRemaining} days</p>
                    </div>
                    <div>
                        <p className="text-slate-400 mb-1">Verified Referrals</p>
                        <p className="font-semibold text-slate-800">
                            {sub.verifiedReferrals} / {sub.referralGoal}
                        </p>
                    </div>
                    <div>
                        <p className="text-slate-400 mb-1">Referral Bonus Total</p>
                        <p className="font-semibold text-slate-800">{sub.referralBonusDaysTotal} days</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-6 border-b border-slate-100 flex gap-6">
                    <button
                        onClick={() => setTab("transactions")}
                        className={`pb-2.5 text-xs font-semibold border-b-2 -mb-px ${
                            tab === "transactions"
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-slate-400"
                        }`}
                    >
                        Transaction Log
                    </button>
                    <button
                        onClick={() => setTab("events")}
                        className={`pb-2.5 text-xs font-semibold border-b-2 -mb-px ${
                            tab === "events" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-400"
                        }`}
                    >
                        System Events
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {isLoading && (
                        <div className="space-y-2">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />
                            ))}
                        </div>
                    )}

                    {!isLoading && status === "failed" && (
                        <p className="text-red-500 text-xs text-center py-6">{error}</p>
                    )}

                    {!isLoading && status === "succeeded" && tab === "transactions" && (
                        <table className="w-full text-xs">
                            <thead>
                            <tr className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                                <th className="py-2 pr-3">Date &amp; Time</th>
                                <th className="py-2 pr-3">Reference ID</th>
                                <th className="py-2 pr-3">Gateway</th>
                                <th className="py-2 pr-3">Amount</th>
                                <th className="py-2 pr-3">Status</th>
                                <th className="py-2">Description</th>
                            </tr>
                            </thead>
                            <tbody>
                            {(history?.transactions ?? []).length === 0 && (
                                <tr>
                                    <td colSpan={6} className="py-6 text-center text-slate-400">
                                        No transactions yet.
                                    </td>
                                </tr>
                            )}
                            {history?.transactions.map((tx) => (
                                <tr key={tx.id} className="border-b border-slate-50">
                                    <td className="py-2.5 pr-3 whitespace-nowrap text-slate-500">
                                        {formatDateTime(tx.createdAt)}
                                    </td>
                                    <td className="py-2.5 pr-3 font-semibold text-blue-600">{tx.referenceId}</td>
                                    <td className="py-2.5 pr-3">
                                        <GatewayBadge gateway={tx.gateway} />
                                    </td>
                                    <td className="py-2.5 pr-3 font-medium text-slate-700">Rs. {tx.amount}</td>
                                    <td className="py-2.5 pr-3">
                                        <TransactionStatusBadge status={tx.status} />
                                    </td>
                                    <td className="py-2.5 text-slate-500">{tx.description}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}

                    {!isLoading && status === "succeeded" && tab === "events" && (
                        <table className="w-full text-xs">
                            <thead>
                            <tr className="text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                                <th className="py-2 pr-3">Date &amp; Time</th>
                                <th className="py-2 pr-3">Event</th>
                                <th className="py-2 pr-3">Details</th>
                                <th className="py-2">Source</th>
                            </tr>
                            </thead>
                            <tbody>
                            {(history?.events ?? []).length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-6 text-center text-slate-400">
                                        No events recorded yet.
                                    </td>
                                </tr>
                            )}
                            {history?.events.map((ev) => (
                                <tr key={ev.id} className="border-b border-slate-50">
                                    <td className="py-2.5 pr-3 whitespace-nowrap text-slate-500">
                                        {formatDateTime(ev.createdAt)}
                                    </td>
                                    <td className="py-2.5 pr-3">
                      <span className="inline-flex px-2 py-1 rounded-md text-[10px] font-semibold bg-blue-50 text-blue-700">
                        {ev.type.replaceAll("_", " ")}
                      </span>
                                    </td>
                                    <td className="py-2.5 pr-3 text-slate-600">{ev.description}</td>
                                    <td className="py-2.5">
                                        <span className="text-[10px] font-semibold text-slate-400">{ev.source}</span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
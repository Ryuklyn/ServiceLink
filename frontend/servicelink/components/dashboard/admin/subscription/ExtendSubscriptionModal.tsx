// src/components/dashboard/admin/subscription/ExtendSubscriptionModal.tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { extendSubscription, clearActionError } from "@/store/slices/features/admin-subscription/adminSubscriptionSlice";
import type { ProviderSubscriptionRow } from "@/store/slices/features/admin-subscription/adminSubscriptionTypes";
import { PlanBadge, StatusBadge, formatValidityWindow, ProviderAvatar } from "./utils";

interface Props {
    row: ProviderSubscriptionRow;
    onClose: () => void;
}

export default function ExtendSubscriptionModal({ row, onClose }: Props) {
    const dispatch = useAppDispatch();
    const { status, error } = useAppSelector((s) => s.adminSubscription.action);
    const [days, setDays] = useState("");
    const [reason, setReason] = useState("");

    const isSubmitting = status === "loading";
    const parsedDays = Number(days);
    const isValid = Number.isInteger(parsedDays) && parsedDays > 0 && reason.trim().length >= 5;

    async function handleSubmit() {
        if (!isValid) return;
        dispatch(clearActionError());
        // Backend should route this through the same extend()/upgradePlan-adjacent
        // logic documented in the spec: stacks on remaining time if still active,
        // or starts fresh from now if lapsed, and revives EXPIRED -> ACTIVE.
        const result = await dispatch(
            extendSubscription({ providerId: row.providerId, days: parsedDays, reason: reason.trim() })
        );
        if (extendSubscription.fulfilled.match(result)) {
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
                <div className="flex items-start justify-between p-6 pb-2">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Manual Extension</h3>
                        <p className="text-xs text-slate-500 mt-1">Extend subscription validity for the provider.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-4 space-y-4">
                    <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                        <div className="flex items-center gap-2.5">
                            <ProviderAvatar
                                profilePictureUrl={row.profilePictureUrl}
                                providerName={row.providerName}
                                size={32}
                            />
                            <div>
                                <p className="text-xs font-semibold text-slate-800">{row.providerName}</p>
                                <p className="text-[11px] text-slate-400">
                                    {row.email} &middot; {row.category}
                                </p>
                            </div>
                        </div>
                        <StatusBadge status={row.status} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <p className="text-slate-400 mb-1">Current Plan</p>
                            <PlanBadge plan={row.planType} />
                        </div>
                        <div>
                            <p className="text-slate-400 mb-1">Days Remaining</p>
                            <p className="font-semibold text-slate-800">{row.daysRemaining} days</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-slate-400 mb-1">Current Validity</p>
                            <p className="font-semibold text-slate-800">
                                {formatValidityWindow(row.startDate, row.endDate)}
                            </p>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-700">Days to Add *</label>
                        <input
                            type="number"
                            min={1}
                            value={days}
                            onChange={(e) => setDays(e.target.value)}
                            placeholder="Enter number of days (e.g., 15, 30, 90)"
                            className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-700">Support Ticket / Justification *</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            placeholder="Enter reason or ticket ID for this extension..."
                            className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] resize-none"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">This note will be recorded for audit purposes.</p>
                    </div>

                    {status === "failed" && error && <p className="text-xs text-red-500">{error}</p>}
                </div>

                <div className="flex justify-end gap-2 px-6 pb-6">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || isSubmitting}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#1e3a8a] text-white hover:bg-[#16316f] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Extending..." : "Extend Subscription"}
                    </button>
                </div>
            </div>
        </div>
    );
}
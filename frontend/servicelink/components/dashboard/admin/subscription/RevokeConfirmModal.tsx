// src/components/dashboard/admin/subscription/RevokeConfirmModal.tsx
"use client";

import { useState } from "react";
import { X, TriangleAlert } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { revokeSubscription, clearActionError } from "@/store/slices/features/admin-subscription/adminSubscriptionSlice";
import type { ProviderSubscriptionRow } from "@/store/slices/features/admin-subscription/adminSubscriptionTypes";
import { PlanBadge, getInitials } from "./utils";

interface Props {
    row: ProviderSubscriptionRow;
    onClose: () => void;
}

export default function RevokeConfirmModal({ row, onClose }: Props) {
    const dispatch = useAppDispatch();
    const { status, error } = useAppSelector((s) => s.adminSubscription.action);
    const [reason, setReason] = useState("");

    const isSubmitting = status === "loading";
    const isValid = reason.trim().length >= 5;

    async function handleConfirm() {
        if (!isValid) return;
        dispatch(clearActionError());
        // Backend should set status = CANCELLED, Provider.isActive = false, and
        // flip ProviderScheduleSettings.acceptsProOrders -> false, mirroring the
        // side effects of the daily expiry sweep.
        const result = await dispatch(
            revokeSubscription({ providerId: row.providerId, reason: reason.trim() })
        );
        if (revokeSubscription.fulfilled.match(result)) {
            onClose();
        }
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-xl border border-slate-200">
                <div className="flex items-start justify-between p-6 pb-2">
                    <div className="flex items-start gap-3">
            <span className="w-9 h-9 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0">
              <TriangleAlert size={16} />
            </span>
                        <div>
                            <h3 className="text-base font-bold text-slate-900">Revoke Subscription</h3>
                            <p className="text-xs text-slate-500 mt-1">
                                This immediately cancels the provider&apos;s access to Business &amp; Pro Orders and
                                paid-plan features. This cannot be undone from this dialog.
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-4 space-y-4">
                    <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                        <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-slate-700 text-white text-[11px] font-bold flex items-center justify-center">
                {getInitials(row.providerName)}
              </span>
                            <div>
                                <p className="text-xs font-semibold text-slate-800">{row.providerName}</p>
                                <p className="text-[11px] text-slate-400">
                                    {row.email} &middot; {row.category}
                                </p>
                            </div>
                        </div>
                        <PlanBadge plan={row.planType} />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-slate-700">Reason for Revocation *</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                            placeholder="Enter reason or ticket ID for this revocation..."
                            className="w-full mt-1.5 px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
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
                        onClick={handleConfirm}
                        disabled={!isValid || isSubmitting}
                        className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? "Revoking..." : "Revoke Subscription"}
                    </button>
                </div>
            </div>
        </div>
    );
}
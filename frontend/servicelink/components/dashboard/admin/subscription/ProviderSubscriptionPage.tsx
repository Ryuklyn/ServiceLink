// src/components/dashboard/admin/subscription/ProviderSubscriptionPage.tsx
"use client";

import { useState } from "react";
import SubscriptionKpiCards from "./SubscriptionKpiCards";
import SubscriptionTable from "./SubscriptionTable";
import PaymentAuditLogTable from "./PaymentAuditLogTable";
import SubscriptionHistoryModal from "./SubscriptionHistoryModal";
import ExtendSubscriptionModal from "./ExtendSubscriptionModal";
import RevokeConfirmModal from "./RevokeConfirmModal";
import type { ProviderSubscriptionRow } from "@/store/slices/features/admin-subscription/adminSubscriptionTypes";

type SubTab = "subscriptions" | "audit";
type ModalState =
    | { type: "none" }
    | { type: "history"; row: ProviderSubscriptionRow }
    | { type: "extend"; row: ProviderSubscriptionRow }
    | { type: "revoke"; row: ProviderSubscriptionRow };

export default function ProviderSubscriptionPage() {
    const [tab, setTab] = useState<SubTab>("subscriptions");
    const [modal, setModal] = useState<ModalState>({ type: "none" });

    const closeModal = () => setModal({ type: "none" });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-xl font-bold text-slate-900">Subscription Management</h1>
                <p className="text-xs text-slate-500 mt-1">
                    Overview of provider subscriptions, revenue, and transaction insights.
                </p>
            </div>

            <SubscriptionKpiCards />

            {/* Tab switcher */}
            <div className="inline-flex bg-slate-100 rounded-xl p-1">
                <button
                    onClick={() => setTab("subscriptions")}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                        tab === "subscriptions" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600"
                    }`}
                >
                    Provider Subscriptions
                </button>
                <button
                    onClick={() => setTab("audit")}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg transition ${
                        tab === "audit" ? "bg-blue-600 text-white shadow-sm" : "text-slate-600"
                    }`}
                >
                    Payment Audit Log
                </button>
            </div>

            {tab === "subscriptions" ? (
                <SubscriptionTable
                    onViewLogs={(row) => setModal({ type: "history", row })}
                    onExtend={(row) => setModal({ type: "extend", row })}
                    onRevoke={(row) => setModal({ type: "revoke", row })}
                />
            ) : (
                <PaymentAuditLogTable />
            )}

            {modal.type === "history" && <SubscriptionHistoryModal row={modal.row} onClose={closeModal} />}
            {modal.type === "extend" && <ExtendSubscriptionModal row={modal.row} onClose={closeModal} />}
            {modal.type === "revoke" && <RevokeConfirmModal row={modal.row} onClose={closeModal} />}
        </div>
    );
}
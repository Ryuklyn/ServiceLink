"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, Video, CheckCircle2, XCircle, Clock, UserCheck } from "lucide-react";
import StatusBadge from "@/components/dashboard/admin/StatusBadge";
import KycDetailModal from "@/components/dashboard/admin/KycDetailModal";
import KycDecisionModal from "@/components/dashboard/admin/KycDecisionModal";
import { kycAdminApi, ListKycParams } from "@/store/slices/features/kyc/kycAdminApi";
import type { KycDetail, KycListItem, KycStatusRaw } from "@/store/slices/features/kyc/kycTypes";
import { toBadgeStatus } from "@/store/slices/features/kyc/kycTypes";

type StatusTab = "all" | KycStatusRaw;
type ModalTab = "overview" | "video";
type DecisionAction = "approve" | "reject";

// Map UI Tab labels to backend enum strings
const TAB_LABELS: Record<StatusTab, string> = {
    all: "All",
    PENDING: "PENDING",
    UNDER_REVIEW: "Manual Audit",
    APPROVED: "Verified",
    REJECTED: "REJECTED",
};

export default function KYCManagementPage() {
    const [items, setItems] = useState<KycListItem[]>([]);
    const [selected, setSelected] = useState<KycDetail | null>(null);
    const [listLoading, setListLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<StatusTab>("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [initialTab, setInitialTab] = useState<ModalTab>("overview");

    // Quick approve/reject from the table row actions
    const [quickDecision, setQuickDecision] = useState<{ id: number; name: string; action: DecisionAction } | null>(null);
    const [quickBusy, setQuickBusy] = useState(false);
    const [quickError, setQuickError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        setListLoading(true);
        setError(null);
        try {
            const params: ListKycParams = {
                status: activeTab === "all" ? undefined : activeTab,
                search: searchTerm || undefined,
            };
            setItems(await kycAdminApi.list(params));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load KYC list");
        } finally {
            setListLoading(false);
        }
    }, [activeTab, searchTerm]);

    useEffect(() => { refresh(); }, [refresh]);

    const openDetail = async (id: number, tab: ModalTab = "overview") => {
        setInitialTab(tab);
        setModalOpen(true);
        setDetailLoading(true);
        try {
            setSelected(await kycAdminApi.detail(id));
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load detail");
            setModalOpen(false);
        } finally {
            setDetailLoading(false);
        }
    };

    const closeModal = () => {
        setModalOpen(false);
        setSelected(null);
        refresh();
    };

    const closeQuickDecision = () => {
        if (quickBusy) return;
        setQuickDecision(null);
        setQuickError(null);
    };

    // note is optional for approve, required for reject — stored as reviewNotes when present.
    const confirmQuickDecision = async (note: string) => {
        if (!quickDecision) return;
        setQuickBusy(true);
        setQuickError(null);
        try {
            if (quickDecision.action === "approve") {
                await kycAdminApi.approve(quickDecision.id, note || undefined);
            } else {
                await kycAdminApi.reject(quickDecision.id, note);
            }
            setQuickDecision(null);
            refresh();
        } catch (e) {
            setQuickError(e instanceof Error ? e.message : "Request failed");
        } finally {
            setQuickBusy(false);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">KYC Verification Desk</h1>
                <p className="text-sm text-slate-500">
                    Review identity documents, approve technicians, or trigger video audits.
                </p>
            </div>

            {error && (
                <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Kpi label="Total Requests"     value={items.length}                                            icon={<UserCheck size={20} />}   tone="blue" />
                <Kpi label="Pending Review"     value={items.filter((p) => p.status === "PENDING").length}       icon={<Clock size={20} />}       tone="amber" />
                <Kpi label="Video Audits"       value={items.filter((p) => p.status === "UNDER_REVIEW").length} icon={<Video size={20} />}       tone="indigo" />
                <Kpi label="Verified Providers" value={items.filter((p) => p.status === "APPROVED").length}      icon={<CheckCircle2 size={20} />} tone="emerald" />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto text-xs font-medium">
                        {(["all", "PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"] as StatusTab[]).map((key) => (
                            <button
                                key={key}
                                onClick={() => setActiveTab(key)}
                                className={`px-3 py-1.5 rounded-md transition ${
                                    activeTab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                                }`}
                            >
                                {key === "all" ? `All (${items.length})` : TAB_LABELS[key]}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search name, email, reference..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3">Provider Details</th>
                            <th className="px-6 py-3">Service</th>
                            <th className="px-6 py-3">Reference</th>
                            <th className="px-6 py-3">KYC Status</th>
                            <th className="px-6 py-3">Submitted</th>
                            <th className="px-6 py-3 text-right">Decision Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                        {listLoading ? (
                            <tr><td colSpan={6} className="text-center py-8 text-slate-400">Loading…</td></tr>
                        ) : items.length === 0 ? (
                            <tr><td colSpan={6} className="text-center py-8 text-slate-400">No matching KYC records found.</td></tr>
                        ) : (
                            items.map((provider) => (
                                <tr
                                    key={provider.id}
                                    className="hover:bg-slate-50 transition cursor-pointer"
                                    onClick={() => openDetail(provider.id)}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {/* Profile Avatar / Photo Image */}
                                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs text-blue-700 bg-blue-50">
                                                {provider.photoUrl ? (
                                                    <img
                                                        src={provider.photoUrl}
                                                        alt={provider.fullName}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    provider.fullName?.charAt(0) ?? "?"
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{provider.fullName}</p>
                                                <p className="text-xs text-slate-400">{provider.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-xs">{provider.primaryService}</td>
                                    <td className="px-6 py-4 font-mono text-xs text-slate-700">{provider.referenceNumber}</td>
                                    <td className="px-6 py-4"><StatusBadge status={toBadgeStatus(provider.status)} /></td>
                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {new Date(provider.submittedAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openDetail(provider.id, "video")}
                                                    title="Schedule Manual Video Audit"
                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                                <Video size={18} />
                                            </button>
                                            <button
                                                onClick={() => setQuickDecision({ id: provider.id, name: provider.fullName, action: "approve" })}
                                                title="Instant Verify"
                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                            >
                                                <CheckCircle2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => setQuickDecision({ id: provider.id, name: provider.fullName, action: "reject" })}
                                                title="Reject / Suspend Account"
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                            >
                                                <XCircle size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalOpen && selected && !detailLoading && (
                <KycDetailModal
                    provider={selected}
                    initialTab={initialTab}
                    onClose={closeModal}
                    onChange={refresh}
                />
            )}

            {quickDecision && (
                <KycDecisionModal
                    action={quickDecision.action}
                    targetName={quickDecision.name}
                    busy={quickBusy}
                    error={quickError}
                    onCancel={closeQuickDecision}
                    onConfirm={confirmQuickDecision}
                />
            )}
        </div>
    );
}

function Kpi({ label, value, icon, tone }: {
    label: string; value: number; icon: React.ReactNode;
    tone: "blue" | "amber" | "indigo" | "emerald";
}) {
    const toneMap = {
        blue:    "bg-blue-50 text-blue-600",
        amber:   "bg-amber-50 text-amber-600",
        indigo:  "bg-indigo-50 text-indigo-600",
        emerald: "bg-emerald-50 text-emerald-600",
    } as const;
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${toneMap[tone]}`}>
                {icon}
            </div>
        </div>
    );
}
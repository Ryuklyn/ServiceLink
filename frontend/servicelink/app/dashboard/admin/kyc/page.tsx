"use client";

import { useState } from "react";
import {
    Search,
    Video,
    CheckCircle2,
    XCircle,
    Calendar,
    Clock,
    Send,
    Building2,
    UserCheck,
} from "lucide-react";
import StatusBadge from "@/components/dashboard/admin/StatusBadge";
import type { VerificationStatus } from "@/components/dashboard/admin/types";

interface ProviderKYC {
    id: string;
    name: string;
    email: string;
    phone: string;
    type: "Individual" | "Agency";
    serviceCategory: string;
    submittedDate: string;
    status: VerificationStatus;
    panNumber: string;
}

const MOCK_PROVIDERS: ProviderKYC[] = [
    {
        id: "PROV-101",
        name: "Ram Bahadur Shrestha",
        email: "ram@electricians.np",
        phone: "+977 9841234567",
        type: "Individual",
        serviceCategory: "Electrical",
        submittedDate: "2026-08-01",
        status: "verified",
        panNumber: "601293812",
    },
    {
        id: "PROV-102",
        name: "Himalayan Climate Tech",
        email: "contact@himalayan.com",
        phone: "+977 9801122334",
        type: "Agency",
        serviceCategory: "HVAC & Cooling",
        submittedDate: "2026-08-03",
        status: "manual_audit",
        panNumber: "300492811",
    },
    {
        id: "PROV-103",
        name: "Suman Kumar Gurung",
        email: "suman.plumbing@gmail.com",
        phone: "+977 9812345678",
        type: "Individual",
        serviceCategory: "Plumbing",
        submittedDate: "2026-08-03",
        status: "pending_kyc",
        panNumber: "609912384",
    },
    {
        id: "PROV-104",
        name: "Apex Facility Services",
        email: "info@apexfacility.np",
        phone: "+977 01-4433221",
        type: "Agency",
        serviceCategory: "Deep Cleaning",
        submittedDate: "2026-07-28",
        status: "suspended",
        panNumber: "109283746",
    },
];

export default function KYCManagementPage() {
    const [providers, setProviders] = useState<ProviderKYC[]>(MOCK_PROVIDERS);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | VerificationStatus>("all");
    const [selectedProvider, setSelectedProvider] = useState<ProviderKYC | null>(null);

    // Video Verification Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [meetDate, setMeetDate] = useState("2026-08-05");
    const [meetTime, setMeetTime] = useState("14:00");
    const [sendWhatsApp, setSendWhatsApp] = useState(true);
    const [sendEmail, setSendEmail] = useState(true);

    // Filter Logic
    const filteredProviders = providers.filter((item) => {
        const matchesSearch =
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.panNumber.includes(searchTerm) ||
            item.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTab = activeTab === "all" || item.status === activeTab;
        return matchesSearch && matchesTab;
    });

    const handleStatusChange = (id: string, newStatus: VerificationStatus) => {
        setProviders((prev) =>
            prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
        );
    };

    const handleOpenVideoAuditModal = (provider: ProviderKYC) => {
        setSelectedProvider(provider);
        setIsModalOpen(true);
    };

    const handleConfirmVideoAudit = () => {
        if (selectedProvider) {
            handleStatusChange(selectedProvider.id, "manual_audit");
            setIsModalOpen(false);
            setSelectedProvider(null);
            alert(
                `Google Meet scheduled for ${selectedProvider.name}.\nInvitations sent via ${
                    sendEmail ? "Email " : ""
                }${sendWhatsApp ? "& WhatsApp" : ""}.`
            );
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">KYC Verification Desk</h1>
                    <p className="text-sm text-slate-500">
                        Review identity documents, approve technicians, or trigger video audits.
                    </p>
                </div>
            </div>

            {/* SUMMARY KPI STRIP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500">Total Requests</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{providers.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <UserCheck size={20} />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500">Pending Review</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">
                            {providers.filter((p) => p.status === "pending_kyc").length}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Clock size={20} />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500">Video Audits Slotted</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                            {providers.filter((p) => p.status === "manual_audit").length}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Video size={20} />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500">Verified Providers</p>
                        <p className="text-2xl font-bold text-emerald-600 mt-1">
                            {providers.filter((p) => p.status === "verified").length}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <CheckCircle2 size={20} />
                    </div>
                </div>
            </div>

            {/* SEARCH AND FILTER CONTROLS */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* TAB FILTERS */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto text-xs font-medium">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`px-3 py-1.5 rounded-md transition ${
                                activeTab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            All ({providers.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("pending_kyc")}
                            className={`px-3 py-1.5 rounded-md transition ${
                                activeTab === "pending_kyc" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setActiveTab("manual_audit")}
                            className={`px-3 py-1.5 rounded-md transition ${
                                activeTab === "manual_audit" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Video Audit
                        </button>
                        <button
                            onClick={() => setActiveTab("verified")}
                            className={`px-3 py-1.5 rounded-md transition ${
                                activeTab === "verified" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Verified
                        </button>
                    </div>

                    {/* SEARCH INPUT */}
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search Name, Email, PAN..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* PROVIDER TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3">Provider Details</th>
                            <th className="px-6 py-3">Type & Service</th>
                            <th className="px-6 py-3">PAN Number</th>
                            <th className="px-6 py-3">KYC Status</th>
                            <th className="px-6 py-3">Submitted</th>
                            <th className="px-6 py-3 text-right">Decision Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                        {filteredProviders.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="text-center py-8 text-slate-400">
                                    No matching KYC records found.
                                </td>
                            </tr>
                        ) : (
                            filteredProviders.map((provider) => (
                                <tr key={provider.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                                                {provider.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{provider.name}</p>
                                                <p className="text-xs text-slate-400">{provider.email}</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-slate-800 font-medium text-xs">
                                            {provider.type === "Agency" ? (
                                                <Building2 size={14} className="text-blue-500" />
                                            ) : (
                                                <UserCheck size={14} className="text-slate-400" />
                                            )}
                                            {provider.serviceCategory}
                                        </div>
                                        <span className="text-[10px] text-slate-400">{provider.type}</span>
                                    </td>

                                    <td className="px-6 py-4 font-mono text-xs text-slate-700">
                                        {provider.panNumber}
                                    </td>

                                    <td className="px-6 py-4">
                                        <StatusBadge status={provider.status} />
                                    </td>

                                    <td className="px-6 py-4 text-xs text-slate-500">
                                        {provider.submittedDate}
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {/* Instant Verify Button */}
                                            <button
                                                onClick={() => handleStatusChange(provider.id, "verified")}
                                                title="Instant Verify"
                                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                            >
                                                <CheckCircle2 size={18} />
                                            </button>

                                            {/* Video Verification Trigger */}
                                            <button
                                                onClick={() => handleOpenVideoAuditModal(provider)}
                                                title="Schedule Manual Video Audit"
                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                            >
                                                <Video size={18} />
                                            </button>

                                            {/* Reject / Suspend */}
                                            <button
                                                onClick={() => handleStatusChange(provider.id, "suspended")}
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

            {/* MANUAL VIDEO VERIFICATION MODAL */}
            {isModalOpen && selectedProvider && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                <Video size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">
                                    Schedule Manual Video Audit
                                </h3>
                                <p className="text-xs text-slate-500">
                                    Target: {selectedProvider.name} ({selectedProvider.type})
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">
                                    Select Meeting Date & Time
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2">
                                        <Calendar size={14} className="text-slate-400 mr-2" />
                                        <input
                                            type="date"
                                            value={meetDate}
                                            onChange={(e) => setMeetDate(e.target.value)}
                                            className="w-full focus:outline-none bg-transparent"
                                        />
                                    </div>
                                    <div className="flex items-center border border-slate-200 rounded-lg px-3 py-2">
                                        <Clock size={14} className="text-slate-400 mr-2" />
                                        <input
                                            type="time"
                                            value={meetTime}
                                            onChange={(e) => setMeetTime(e.target.value)}
                                            className="w-full focus:outline-none bg-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 p-3 rounded-lg text-blue-800 space-y-1">
                                <p className="font-medium flex items-center gap-1.5">
                                    <Send size={12} /> Google Calendar & Meet Auto-Integration
                                </p>
                                <p className="text-[11px] text-blue-600">
                                    A unique Google Meet link will be generated automatically and dispatched to the provider&apos;s registered channels.
                                </p>
                            </div>

                            <div className="space-y-2 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={sendEmail}
                                        onChange={(e) => setSendEmail(e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    Send Email Invite ({selectedProvider.email})
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={sendWhatsApp}
                                        onChange={(e) => setSendWhatsApp(e.target.checked)}
                                        className="rounded text-blue-600 focus:ring-blue-500"
                                    />
                                    Send WhatsApp Instant Message ({selectedProvider.phone})
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConfirmVideoAudit}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition flex items-center gap-1.5"
                            >
                                <Video size={14} /> Schedule & Dispatch Link
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
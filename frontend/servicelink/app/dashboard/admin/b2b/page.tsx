"use client";

import { useState } from "react";
import {
    Search,
    Plus,
    Building2,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    Clock,
    Wallet,
    FileText,
    AlertCircle,
    Mail,
    Phone,
} from "lucide-react";

interface B2BOrganization {
    id: string;
    companyName: string;
    vatPanNumber: string;
    contactPerson: string;
    email: string;
    phone: string;
    contractStatus: "active" | "pending_review" | "suspended" | "expired";
    slaLevel: "Premium (24/7)" | "Standard (12h)" | "Basic (48h)";
    creditBalanceNpr: number;
    activeContractsCount: number;
    joinedDate: string;
}

const MOCK_ORGANIZATIONS: B2BOrganization[] = [
    {
        id: "B2B-801",
        companyName: "Chaudhary Group (CG Corp)",
        vatPanNumber: "300128491",
        contactPerson: "Prashant Thapa",
        email: "corporate@chaudharygroup.com",
        phone: "+977 01-5542100",
        contractStatus: "active",
        slaLevel: "Premium (24/7)",
        creditBalanceNpr: 450000,
        activeContractsCount: 12,
        joinedDate: "2025-11-15",
    },
    {
        id: "B2B-802",
        companyName: "Hotel Yak & Yeti",
        vatPanNumber: "100293842",
        contactPerson: "Sujata Shrestha",
        email: "facilities@yakandyeti.com.np",
        phone: "+977 01-4248999",
        contractStatus: "active",
        slaLevel: "Premium (24/7)",
        creditBalanceNpr: 180000,
        activeContractsCount: 5,
        joinedDate: "2026-01-10",
    },
    {
        id: "B2B-803",
        companyName: "Karkhana Asia Tech",
        vatPanNumber: "602938122",
        contactPerson: "Aayush Sharma",
        email: "operations@karkhana.asia",
        phone: "+977 9801928374",
        contractStatus: "pending_review",
        slaLevel: "Standard (12h)",
        creditBalanceNpr: 25000,
        activeContractsCount: 1,
        joinedDate: "2026-07-30",
    },
    {
        id: "B2B-804",
        companyName: "Himalayan Bank Ltd. (Baneshwor Branch)",
        vatPanNumber: "300012938",
        contactPerson: "Ramesh Adhikari",
        email: "baneshwor@himalayanbank.com",
        phone: "+977 01-4782012",
        contractStatus: "suspended",
        slaLevel: "Basic (48h)",
        creditBalanceNpr: 0,
        activeContractsCount: 0,
        joinedDate: "2025-08-01",
    },
];

export default function B2BOrganizationsPage() {
    const [organizations, setOrganizations] = useState<B2BOrganization[]>(MOCK_ORGANIZATIONS);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | B2BOrganization["contractStatus"]>("all");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Organization Form States
    const [companyName, setCompanyName] = useState("");
    const [vatPanNumber, setVatPanNumber] = useState("");
    const [contactPerson, setContactPerson] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [slaLevel, setSlaLevel] = useState<B2BOrganization["slaLevel"]>("Standard (12h)");

    // Filter Logic
    const filteredOrgs = organizations.filter((org) => {
        const matchesSearch =
            org.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.vatPanNumber.includes(searchTerm) ||
            org.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTab = activeTab === "all" || org.contractStatus === activeTab;
        return matchesSearch && matchesTab;
    });

    const handleStatusToggle = (id: string, newStatus: B2BOrganization["contractStatus"]) => {
        setOrganizations((prev) =>
            prev.map((o) => (o.id === id ? { ...o, contractStatus: newStatus } : o))
        );
    };

    const handleCreateOrg = (e: React.FormEvent) => {
        e.preventDefault();
        if (!companyName.trim() || !vatPanNumber.trim()) return;

        const newOrg: B2BOrganization = {
            id: `B2B-80${organizations.length + 1}`,
            companyName,
            vatPanNumber,
            contactPerson,
            email,
            phone,
            contractStatus: "pending_review",
            slaLevel,
            creditBalanceNpr: 0,
            activeContractsCount: 0,
            joinedDate: new Date().toISOString().split("T")[0],
        };

        setOrganizations([newOrg, ...organizations]);
        setIsModalOpen(false);

        // Reset fields
        setCompanyName("");
        setVatPanNumber("");
        setContactPerson("");
        setEmail("");
        setPhone("");
    };

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* HEADER SECTION */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">B2B Corporate Clients</h1>
                    <p className="text-sm text-slate-500">
                        Manage corporate partnerships, facility SLAs, retained credit accounts, and institutional contracts.
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg flex items-center gap-2 shadow-sm transition shrink-0"
                >
                    <Plus size={16} /> Onboard B2B Client
                </button>
            </div>

            {/* KPI METRIC STRIP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500">Total B2B Accounts</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{organizations.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Building2 size={20} />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500">Active Retained Credit</p>
                        <p className="text-xl font-bold text-emerald-600 mt-1">
                            NPR {organizations.reduce((acc, o) => acc + o.creditBalanceNpr, 0).toLocaleString()}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Wallet size={20} />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500">Pending Approvals</p>
                        <p className="text-2xl font-bold text-amber-600 mt-1">
                            {organizations.filter((o) => o.contractStatus === "pending_review").length}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <Clock size={20} />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500">Premium SLA Partners</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                            {organizations.filter((o) => o.slaLevel.includes("Premium")).length}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <ShieldCheck size={20} />
                    </div>
                </div>
            </div>

            {/* SEARCH & TAB FILTERS */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                    {/* TABS */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg w-full md:w-auto overflow-x-auto text-xs font-medium">
                        <button
                            onClick={() => setActiveTab("all")}
                            className={`px-3 py-1.5 rounded-md transition ${
                                activeTab === "all" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            All ({organizations.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("active")}
                            className={`px-3 py-1.5 rounded-md transition ${
                                activeTab === "active" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setActiveTab("pending_review")}
                            className={`px-3 py-1.5 rounded-md transition ${
                                activeTab === "pending_review" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Pending Review
                        </button>
                        <button
                            onClick={() => setActiveTab("suspended")}
                            className={`px-3 py-1.5 rounded-md transition ${
                                activeTab === "suspended" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Suspended
                        </button>
                    </div>

                    {/* SEARCH INPUT */}
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search Company, PAN, Email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3">Organization Name</th>
                            <th className="px-6 py-3">Contact Person</th>
                            <th className="px-6 py-3">VAT / PAN</th>
                            <th className="px-6 py-3">SLA Commitment</th>
                            <th className="px-6 py-3">Credit Balance</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                        {filteredOrgs.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-slate-400">
                                    No B2B corporate organizations match your filter.
                                </td>
                            </tr>
                        ) : (
                            filteredOrgs.map((org) => (
                                <tr key={org.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                                                <Building2 size={18} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{org.companyName}</p>
                                                <p className="text-[10px] font-mono text-slate-400">{org.id}</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4">
                                        <p className="font-medium text-slate-800 text-xs">{org.contactPerson}</p>
                                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                                            <span className="flex items-center gap-1"><Mail size={10} /> {org.email}</span>
                                        </div>
                                    </td>

                                    <td className="px-6 py-4 font-mono text-xs text-slate-700">
                                        {org.vatPanNumber}
                                    </td>

                                    <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium ${
                                                org.slaLevel.includes("Premium")
                                                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                                                    : "bg-blue-50 text-blue-700 border border-blue-200"
                                            }`}>
                                                <ShieldCheck size={12} /> {org.slaLevel}
                                            </span>
                                    </td>

                                    <td className="px-6 py-4 font-mono text-xs font-semibold text-slate-900">
                                        NPR {org.creditBalanceNpr.toLocaleString()}
                                    </td>

                                    <td className="px-6 py-4">
                                        {org.contractStatus === "active" && (
                                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                                                    <CheckCircle2 size={12} /> Active
                                                </span>
                                        )}
                                        {org.contractStatus === "pending_review" && (
                                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
                                                    <Clock size={12} /> Pending Review
                                                </span>
                                        )}
                                        {org.contractStatus === "suspended" && (
                                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-medium">
                                                    <XCircle size={12} /> Suspended
                                                </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {org.contractStatus !== "active" && (
                                                <button
                                                    onClick={() => handleStatusToggle(org.id, "active")}
                                                    title="Approve / Activate Contract"
                                                    className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            )}

                                            {org.contractStatus !== "suspended" && (
                                                <button
                                                    onClick={() => handleStatusToggle(org.id, "suspended")}
                                                    title="Suspend Account"
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                                                >
                                                    <XCircle size={18} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ONBOARD B2B CLIENT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl border border-slate-200">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Building2 className="text-blue-600" size={20} /> Onboard B2B Corporate Partner
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 transition"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrg} className="space-y-4 text-xs">
                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">
                                    Company / Institution Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., Chaudhary Group Corp"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">
                                        VAT / PAN Number *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g., 300128491"
                                        value={vatPanNumber}
                                        onChange={(e) => setVatPanNumber(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                    />
                                </div>

                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">
                                        Service Level Agreement (SLA)
                                    </label>
                                    <select
                                        value={slaLevel}
                                        onChange={(e) => setSlaLevel(e.target.value as B2BOrganization["slaLevel"])}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="Premium (24/7)">Premium (24/7)</option>
                                        <option value="Standard (12h)">Standard (12h)</option>
                                        <option value="Basic (48h)">Basic (48h)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="font-semibold text-slate-700 block mb-1">
                                    Contact Person Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g., Prashant Thapa"
                                    value={contactPerson}
                                    onChange={(e) => setContactPerson(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">
                                        Corporate Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        placeholder="corporate@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="font-semibold text-slate-700 block mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="+977 01-5542100"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg border border-slate-200 font-semibold text-slate-600 hover:bg-slate-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                                >
                                    Submit for Audit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
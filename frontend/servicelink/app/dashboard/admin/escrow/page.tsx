"use client";

import { useState } from "react";
import {
    Search,
    Wallet,
    ArrowUpRight,
    ArrowDownLeft,
    CheckCircle2,
    XCircle,
    Clock,
    AlertTriangle,
    Shield,
    DollarSign,
    RefreshCw,
} from "lucide-react";

interface EscrowTransaction {
    id: string;
    bookingId: string;
    customerName: string;
    providerName: string;
    amountNpr: number;
    gateway: "eSewa" | "Khalti" | "ConnectIPS" | "Bank Transfer";
    escrowStatus: "held" | "released" | "refunded" | "disputed";
    payoutStatus: "pending" | "processed" | "failed";
    createdAt: string;
}

const MOCK_ESCROW_DATA: EscrowTransaction[] = [
    {
        id: "ESC-901",
        bookingId: "BOOK-4012",
        customerName: "Aarav Sharma",
        providerName: "Ram Bahadur Shrestha",
        amountNpr: 2500,
        gateway: "eSewa",
        escrowStatus: "held",
        payoutStatus: "pending",
        createdAt: "2026-08-03 10:30 AM",
    },
    {
        id: "ESC-902",
        bookingId: "BOOK-4008",
        customerName: "Pooja Gurung",
        providerName: "Himalayan Climate Tech",
        amountNpr: 12000,
        gateway: "Khalti",
        escrowStatus: "released",
        payoutStatus: "processed",
        createdAt: "2026-08-02 02:15 PM",
    },
    {
        id: "ESC-903",
        bookingId: "BOOK-3995",
        customerName: "Siddharth Karki",
        providerName: "Suman Kumar Gurung",
        amountNpr: 1800,
        gateway: "ConnectIPS",
        escrowStatus: "disputed",
        payoutStatus: "pending",
        createdAt: "2026-08-01 11:00 AM",
    },
    {
        id: "ESC-904",
        bookingId: "BOOK-3980",
        customerName: "Anjali Thapa",
        providerName: "Apex Facility Services",
        amountNpr: 8500,
        gateway: "eSewa",
        escrowStatus: "refunded",
        payoutStatus: "processed",
        createdAt: "2026-07-29 04:45 PM",
    },
];

export default function EscrowPayoutsPage() {
    const [transactions, setTransactions] = useState<EscrowTransaction[]>(MOCK_ESCROW_DATA);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"all" | EscrowTransaction["escrowStatus"]>("all");

    // Filter logic
    const filteredTransactions = transactions.filter((tx) => {
        const matchesSearch =
            tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.providerName.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesTab = activeTab === "all" || tx.escrowStatus === activeTab;
        return matchesSearch && matchesTab;
    });

    const handleReleaseEscrow = (id: string) => {
        setTransactions((prev) =>
            prev.map((tx) =>
                tx.id === id
                    ? { ...tx, escrowStatus: "released", payoutStatus: "processed" }
                    : tx
            )
        );
        alert(`Escrow funds for transaction ${id} released to technician.`);
    };

    const handleRefundCustomer = (id: string) => {
        setTransactions((prev) =>
            prev.map((tx) =>
                tx.id === id
                    ? { ...tx, escrowStatus: "refunded", payoutStatus: "processed" }
                    : tx
            )
        );
        alert(`Escrow funds for transaction ${id} refunded back to customer.`);
    };

    // Aggregate statistics
    const totalHeldNpr = transactions
        .filter((t) => t.escrowStatus === "held")
        .reduce((sum, t) => sum + t.amountNpr, 0);

    const totalReleasedNpr = transactions
        .filter((t) => t.escrowStatus === "released")
        .reduce((sum, t) => sum + t.amountNpr, 0);

    const totalDisputedNpr = transactions
        .filter((t) => t.escrowStatus === "disputed")
        .reduce((sum, t) => sum + t.amountNpr, 0);

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* PAGE HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Escrow &amp; Payout Desk</h1>
                    <p className="text-sm text-slate-500">
                        Monitor active escrow vaults, approve provider payouts, and settle billing disputes.
                    </p>
                </div>
            </div>

            {/* KPI METRICS STRIP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500">Funds Held in Escrow</p>
                        <p className="text-xl font-bold text-blue-600 mt-1">
                            NPR {totalHeldNpr.toLocaleString()}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Shield size={20} />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500">Released Payouts</p>
                        <p className="text-xl font-bold text-emerald-600 mt-1">
                            NPR {totalReleasedNpr.toLocaleString()}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <ArrowUpRight size={20} />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500">Disputed Vaults</p>
                        <p className="text-xl font-bold text-amber-600 mt-1">
                            NPR {totalDisputedNpr.toLocaleString()}
                        </p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                        <AlertTriangle size={20} />
                    </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-medium text-slate-500">Total Transactions</p>
                        <p className="text-2xl font-bold text-slate-900 mt-1">{transactions.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                        <Wallet size={20} />
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
                            All ({transactions.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("held")}
                            className={`px-3 py-1.5 rounded-md transition ${
                                activeTab === "held" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Held in Escrow
                        </button>
                        <button
                            onClick={() => setActiveTab("released")}
                            className={`px-3 py-1.5 rounded-md transition ${
                                activeTab === "released" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Released
                        </button>
                        <button
                            onClick={() => setActiveTab("disputed")}
                            className={`px-3 py-1.5 rounded-md transition ${
                                activeTab === "disputed" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Disputed
                        </button>
                        <button
                            onClick={() => setActiveTab("refunded")}
                            className={`px-3 py-1.5 rounded-md transition ${
                                activeTab === "refunded" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                            }`}
                        >
                            Refunded
                        </button>
                    </div>

                    {/* SEARCH INPUT */}
                    <div className="relative w-full md:w-72">
                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search Booking ID, Customer, Provider..."
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
                            <th className="px-6 py-3">Escrow ID &amp; Booking</th>
                            <th className="px-6 py-3">Customer (Payer)</th>
                            <th className="px-6 py-3">Provider (Payee)</th>
                            <th className="px-6 py-3">Amount &amp; Gateway</th>
                            <th className="px-6 py-3">Escrow Status</th>
                            <th className="px-6 py-3">Payout Status</th>
                            <th className="px-6 py-3 text-right">Escrow Action</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="text-center py-8 text-slate-400">
                                    No escrow transactions match your query.
                                </td>
                            </tr>
                        ) : (
                            filteredTransactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-slate-50 transition">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-slate-900">{tx.id}</p>
                                        <p className="text-[10px] font-mono text-slate-400">{tx.bookingId}</p>
                                    </td>

                                    <td className="px-6 py-4 font-medium text-slate-800 text-xs">
                                        {tx.customerName}
                                    </td>

                                    <td className="px-6 py-4 font-medium text-slate-800 text-xs">
                                        {tx.providerName}
                                    </td>

                                    <td className="px-6 py-4">
                                        <p className="font-mono text-xs font-bold text-slate-900">
                                            NPR {tx.amountNpr.toLocaleString()}
                                        </p>
                                        <span className="text-[10px] text-slate-400 font-medium">
                                                via {tx.gateway}
                                            </span>
                                    </td>

                                    <td className="px-6 py-4">
                                        {tx.escrowStatus === "held" && (
                                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
                                                    <Clock size={12} /> Held
                                                </span>
                                        )}
                                        {tx.escrowStatus === "released" && (
                                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-medium">
                                                    <CheckCircle2 size={12} /> Released
                                                </span>
                                        )}
                                        {tx.escrowStatus === "disputed" && (
                                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium">
                                                    <AlertTriangle size={12} /> Disputed
                                                </span>
                                        )}
                                        {tx.escrowStatus === "refunded" && (
                                            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                                                    <ArrowDownLeft size={12} /> Refunded
                                                </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4">
                                        {tx.payoutStatus === "processed" && (
                                            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                                                    <CheckCircle2 size={12} /> Processed
                                                </span>
                                        )}
                                        {tx.payoutStatus === "pending" && (
                                            <span className="text-xs font-medium text-amber-600 flex items-center gap-1">
                                                    <Clock size={12} /> Awaiting Release
                                                </span>
                                        )}
                                    </td>

                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {tx.escrowStatus === "held" || tx.escrowStatus === "disputed" ? (
                                                <>
                                                    <button
                                                        onClick={() => handleReleaseEscrow(tx.id)}
                                                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition flex items-center gap-1"
                                                    >
                                                        <ArrowUpRight size={14} /> Release Payout
                                                    </button>
                                                    <button
                                                        onClick={() => handleRefundCustomer(tx.id)}
                                                        className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-medium transition flex items-center gap-1"
                                                    >
                                                        <ArrowDownLeft size={14} /> Refund
                                                    </button>
                                                </>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Settled</span>
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
        </div>
    );
}
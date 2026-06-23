"use client";

import React, { useState } from "react";
import { FileText, Download } from "lucide-react";

const NAVY = "#1e3a8a";
const ORANGE = "#e8683f";

// ---------- Mock data, mirroring the reference screen ----------

const budgetSummary = {
    month: "Jun",
    total: 150000,
    spent: 55700,
    pending: 69500,
    remaining: 24800,
};

const invoices = [
    { id: "INV-2024-001", provider: "Nepal Electricals", service: "Electrical", amount: 15500, status: "PAID", dueDate: "2024-06-11" },
    { id: "INV-2024-002", provider: "Ram Shrestha", service: "HVAC", amount: 8200, status: "PENDING", dueDate: "2024-06-29" },
    { id: "INV-2024-003", provider: "Sparkle Cleaning Co.", service: "Cleaning", amount: 25000, status: "PAID", dueDate: "2024-06-15" },
    { id: "INV-2024-004", provider: "Purna Plumbing", service: "Plumbing", amount: 4500, status: "OVERDUE", dueDate: "2024-05-24" },
    { id: "INV-2024-005", provider: "Gurkha Security Services", service: "Security", amount: 45000, status: "PENDING", dueDate: "2024-07-04" },
    { id: "INV-2024-006", provider: "Eco Cleaners", service: "Cleaning", amount: 12000, status: "PAID", dueDate: "2024-06-08" },
    { id: "INV-2024-007", provider: "Cooling Masters", service: "HVAC", amount: 6800, status: "PENDING", dueDate: "2024-07-02" },
    { id: "INV-2024-008", provider: "Water Works", service: "Plumbing", amount: 3200, status: "PAID", dueDate: "2024-06-19" },
    { id: "INV-2024-009", provider: "SafeGuard Nepal", service: "Security", amount: 55000, status: "OVERDUE", dueDate: "2024-05-15" },
    { id: "INV-2024-010", provider: "Bug Busters", service: "Pest Control", amount: 9500, status: "PENDING", dueDate: "2024-07-06" },
];

const getStatusStyles = (status: string) => {
    if (status === "PAID") return "bg-emerald-50 text-emerald-600";
    if (status === "PENDING") return "bg-amber-50 text-amber-600";
    if (status === "OVERDUE") return "bg-red-50 text-red-500";
    return "bg-slate-100 text-slate-600";
};

const TABS = ["All", "Paid", "Pending", "Overdue"];

export default function BillingPage() {
    const [activeTab, setActiveTab] = useState("All");

    const filteredInvoices = invoices.filter((inv) => {
        if (activeTab === "All") return true;
        return inv.status === activeTab.toUpperCase();
    });

    const tabCount = (tab: string) => {
        if (tab === "All") return invoices.length;
        return invoices.filter((inv) => inv.status === tab.toUpperCase()).length;
    };

    return (
        <main className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-50/40 min-h-screen">

            {/* Page heading */}
            <div className="border-b border-gray-200/60 pb-4">
                <h1 className="text-xl font-bold text-slate-900">Billing</h1>
                <p className="text-sm text-slate-500 mt-0.5">Budget overview and invoice tracking</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-sm text-slate-500 font-medium">Total Budget ({budgetSummary.month})</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-2">Rs. {budgetSummary.total.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-sm text-slate-500 font-medium">Spent</p>
                    <p className="text-3xl font-extrabold text-slate-900 mt-2">Rs. {budgetSummary.spent.toLocaleString()}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-sm text-slate-500 font-medium">Pending</p>
                    <p className="text-3xl font-extrabold mt-2" style={{ color: ORANGE }}>
                        Rs. {budgetSummary.pending.toLocaleString()}
                    </p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <p className="text-sm text-slate-500 font-medium">Remaining</p>
                    <p className="text-3xl font-extrabold mt-2" style={{ color: NAVY }}>
                        Rs. {budgetSummary.remaining.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Invoice table card */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                {/* Filter tabs */}
                <div className="flex items-center gap-6 px-6 pt-4 border-b border-gray-100 text-sm font-semibold">
                    {TABS.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 relative transition-colors ${
                                activeTab === tab ? "font-bold" : "text-gray-400 hover:text-gray-700"
                            }`}
                            style={activeTab === tab ? { color: NAVY } : undefined}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: NAVY }} />
                            )}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-gray-100 text-left">
                            <th className="py-3 pl-6 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Invoice ID</th>
                            <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Provider</th>
                            <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Service</th>
                            <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide text-right">Amount</th>
                            <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Status</th>
                            <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Due Date</th>
                            <th className="py-3 pr-6 font-semibold text-slate-400 text-xs uppercase tracking-wide text-right">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredInvoices.map((inv, idx) => (
                            <tr
                                key={inv.id}
                                className={`border-b border-gray-50 hover:bg-slate-50/60 transition-colors ${
                                    idx === filteredInvoices.length - 1 ? "border-b-0" : ""
                                }`}
                            >
                                <td className="py-3.5 pl-6 pr-4">
                                    <div className="flex items-center gap-2">
                                        <FileText size={14} className="text-slate-400 shrink-0" />
                                        <span className="font-semibold" style={{ color: NAVY }}>
                                                {inv.id}
                                            </span>
                                    </div>
                                </td>
                                <td className="py-3.5 pr-4 font-medium" style={{ color: NAVY }}>
                                    {inv.provider}
                                </td>
                                <td className="py-3.5 pr-4 text-slate-600 font-medium">{inv.service}</td>
                                <td className="py-3.5 pr-4 font-bold text-slate-900 text-right">Rs. {inv.amount.toLocaleString()}</td>
                                <td className="py-3.5 pr-4">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase ${getStatusStyles(inv.status)}`}>
                                            {inv.status}
                                        </span>
                                </td>
                                <td className="py-3.5 pr-4 text-slate-500 font-medium">{inv.dueDate}</td>
                                <td className="py-3.5 pr-6 text-right">
                                    <button
                                        className="inline-flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                        aria-label={`Download ${inv.id}`}
                                    >
                                        <Download size={16} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredInvoices.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-10 text-center text-sm text-slate-400 font-medium italic">
                                    No invoices in this category.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
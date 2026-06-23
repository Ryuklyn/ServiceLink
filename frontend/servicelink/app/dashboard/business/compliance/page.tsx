"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, ShieldX, Download } from "lucide-react";

const NAVY = "#1e3a8a";
const ORANGE = "#e8683f";

// ---------- Mock data, mirroring the reference screens ----------

const kybSummary = {
    approved: 9,
    pending: 2,
    rejected: 1,
};

const providers = [
    { name: "Ram Shrestha", category: "HVAC", status: "APPROVED", joinedDate: "2023-05-12" },
    { name: "Nepal Electricals", category: "Electrical", status: "APPROVED", joinedDate: "2022-11-05" },
    { name: "Sparkle Cleaning Co.", category: "Cleaning", status: "APPROVED", joinedDate: "2024-01-20" },
    { name: "Purna Plumbing", category: "Plumbing", status: "APPROVED", joinedDate: "2023-08-14" },
    { name: "Gurkha Security Services", category: "Security", status: "APPROVED", joinedDate: "2023-02-10" },
    { name: "Kathmandu Pest Control", category: "Pest Control", status: "PENDING", joinedDate: "2024-03-01" },
    { name: "Cooling Masters", category: "HVAC", status: "APPROVED", joinedDate: "2024-02-15" },
    { name: "Bright Light Electric", category: "Electrical", status: "REJECTED", joinedDate: "2024-04-10" },
    { name: "Eco Cleaners", category: "Cleaning", status: "APPROVED", joinedDate: "2023-07-22" },
    { name: "Water Works", category: "Plumbing", status: "PENDING", joinedDate: "2024-05-05" },
    { name: "Bug Busters", category: "Pest Control", status: "APPROVED", joinedDate: "2023-11-30" },
];

const auditLogs = [
    { timestamp: "Jun 23, 2024 16:00:00", action: "Business Verification Approved", subject: "Ram Shrestha", performedBy: "Rajesh Shrestha", status: "VERIFIED" },
    { timestamp: "Jun 22, 2024 20:15:00", action: "Provider Added to Pool", subject: "Sparkle Cleaning Co.", performedBy: "Rajesh Shrestha", status: "VERIFIED" },
    { timestamp: "Jun 21, 2024 15:30:00", action: "Job Cancelled", subject: "JOB-1006", performedBy: "Priya Sharma", status: "FLAGGED" },
    { timestamp: "Jun 20, 2024 16:45:00", action: "SLA Breach Detected", subject: "Purna Plumbing (JOB-1004)", performedBy: "System", status: "FLAGGED" },
    { timestamp: "Jun 15, 2024 22:05:00", action: "Invoice Paid", subject: "INV-2024-003", performedBy: "Arun KC", status: "VERIFIED" },
    { timestamp: "Jun 14, 2024 13:55:00", action: "Provider KYB Pending", subject: "Kathmandu Pest Control", performedBy: "System", status: "PENDING" },
    { timestamp: "Jun 20, 2024 14:45:00", action: "Team Member Invited", subject: "Mohan Thapa", performedBy: "Rajesh Shrestha", status: "VERIFIED" },
    { timestamp: "Jun 10, 2024 19:25:00", action: "Contract Created", subject: "Gurkha Security Services", performedBy: "Rajesh Shrestha", status: "VERIFIED" },
    { timestamp: "Jun 22, 2024 20:45:00", action: "Job Reassigned", subject: "JOB-1013", performedBy: "Rajesh Shrestha", status: "FLAGGED" },
    { timestamp: "Jun 12, 2024 15:50:00", action: "Business Verification Rejected", subject: "Bright Light Electric", performedBy: "Rajesh Shrestha", status: "VERIFIED" },
    { timestamp: "Jun 24, 2024 15:15:00", action: "SLA Deadline Extended", subject: "JOB-1001", performedBy: "Priya Sharma", status: "FLAGGED" },
    { timestamp: "May 25, 2024 13:45:00", action: "Invoice Overdue Alert", subject: "INV-2024-004", performedBy: "System", status: "VERIFIED" },
    { timestamp: "Jun 13, 2024 17:05:00", action: "Provider Removed from Pool", subject: "Bright Light Electric", performedBy: "Rajesh Shrestha", status: "VERIFIED" },
    { timestamp: "Jun 18, 2024 20:00:00", action: "Business Verification Pending", subject: "Water Works", performedBy: "System", status: "PENDING" },
    { timestamp: "Jun 24, 2024 15:45:00", action: "New Job Requested", subject: "JOB-1012", performedBy: "Sunita Paudel", status: "VERIFIED" },
    { timestamp: "Jun 10, 2024 22:30:00", action: "Job Completed", subject: "JOB-1011", performedBy: "SafeGuard Nepal", status: "VERIFIED" },
    { timestamp: "Jun 23, 2024 14:45:00", action: "Invoice Issued", subject: "INV-2024-010", performedBy: "Bug Busters", status: "VERIFIED" },
];

const getKybStyles = (status: string) => {
    if (status === "APPROVED") return "bg-emerald-50 text-emerald-600";
    if (status === "PENDING") return "bg-amber-50 text-amber-600";
    if (status === "REJECTED") return "bg-red-50 text-red-500";
    return "bg-slate-100 text-slate-600";
};

const getLogStatusStyles = (status: string) => {
    if (status === "VERIFIED") return "bg-slate-100 text-slate-600";
    if (status === "PENDING") return "bg-amber-50 text-amber-600";
    if (status === "FLAGGED") return "bg-red-50 text-red-500";
    return "bg-slate-100 text-slate-600";
};

export default function CompliancePage() {
    return (
        <main className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-50/40 min-h-screen">

            {/* Page heading + export action */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/60 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">Compliance</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Provider verification and platform audit trail</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors self-end sm:self-auto">
                    <Download size={15} />
                    Export Logs
                </button>
            </div>

            {/* KYB summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <ShieldCheck size={22} className="text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">KYB Approved</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{kybSummary.approved}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                        <ShieldAlert size={22} className="text-amber-500" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Verification Pending</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{kybSummary.pending}</p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                        <ShieldX size={22} className="text-red-500" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">KYB Rejected</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{kybSummary.rejected}</p>
                    </div>
                </div>
            </div>

            {/* Provider Verification Status table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-6 pt-5 pb-1">
                    <h2 className="text-sm font-bold text-slate-900">Provider Verification Status</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-gray-100 text-left">
                            <th className="py-3 pl-6 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Provider</th>
                            <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Category</th>
                            <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">KYB Status</th>
                            <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Joined Date</th>
                            <th className="py-3 pr-6 font-semibold text-slate-400 text-xs uppercase tracking-wide text-right">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {providers.map((p, idx) => (
                            <tr
                                key={p.name}
                                className={`border-b border-gray-50 hover:bg-slate-50/60 transition-colors ${
                                    idx === providers.length - 1 ? "border-b-0" : ""
                                }`}
                            >
                                <td className="py-3.5 pl-6 pr-4 font-semibold text-slate-800">{p.name}</td>
                                <td className="py-3.5 pr-4 text-slate-600 font-medium">{p.category}</td>
                                <td className="py-3.5 pr-4">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase ${getKybStyles(p.status)}`}>
                                            {p.status}
                                        </span>
                                </td>
                                <td className="py-3.5 pr-4 text-slate-500 font-medium">{p.joinedDate}</td>
                                <td className="py-3.5 pr-6 text-right">
                                    <button className="text-sm font-bold hover:underline" style={{ color: NAVY }}>
                                        View Docs
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Audit Logs table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="px-6 pt-5 pb-1 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900">Audit Logs</h2>
                    <span className="text-xs text-slate-400 font-medium">Showing last {auditLogs.length} events</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-gray-100 text-left">
                            <th className="py-3 pl-6 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Timestamp</th>
                            <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Action</th>
                            <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Subject</th>
                            <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Performed By</th>
                            <th className="py-3 pr-6 font-semibold text-slate-400 text-xs uppercase tracking-wide">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {auditLogs.map((log, idx) => (
                            <tr
                                key={idx}
                                className={`border-b border-gray-50 hover:bg-slate-50/60 transition-colors ${
                                    idx === auditLogs.length - 1 ? "border-b-0" : ""
                                }`}
                            >
                                <td className="py-3.5 pl-6 pr-4 font-medium" style={{ color: NAVY }}>
                                    {log.timestamp}
                                </td>
                                <td className="py-3.5 pr-4 font-semibold text-slate-800">{log.action}</td>
                                <td className="py-3.5 pr-4 text-slate-600 font-medium">{log.subject}</td>
                                <td className="py-3.5 pr-4 text-slate-600 font-medium">{log.performedBy}</td>
                                <td className="py-3.5 pr-6">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase ${getLogStatusStyles(log.status)}`}>
                                            {log.status}
                                        </span>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
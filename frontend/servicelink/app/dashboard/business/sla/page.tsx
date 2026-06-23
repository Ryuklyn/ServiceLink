"use client";

import React from "react";
import {
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Target,
} from "lucide-react";

const NAVY = "#1e3a8a";
const ORANGE = "#e8683f";

// ---------- Mock data, mirroring the reference screens ----------

const kpis = [
    {
        label: "Overall Compliance",
        value: "92.4%",
        delta: "+2.1% from last month",
        deltaDirection: "up",
        valueColor: "text-slate-900",
    },
    {
        label: "Avg Response Time",
        value: "42m",
        delta: "-15m from last month",
        deltaDirection: "up",
        valueColor: "text-slate-900",
    },
    {
        label: "Overdue Jobs",
        value: "3",
        delta: "Needs attention",
        deltaDirection: "warn",
        valueColor: "text-red-600",
    },
    {
        label: "Cancel Rate",
        value: "4.2%",
        delta: "Target < 5%",
        deltaDirection: "neutral",
        valueColor: "",
        valueColorHex: ORANGE,
    },
];

const trendData = [
    { month: "Jan", value: 78 },
    { month: "Feb", value: 81 },
    { month: "Mar", value: 84 },
    { month: "Apr", value: 80 },
    { month: "May", value: 90 },
    { month: "Jun", value: 92 },
];

const categoryPerformance = [
    { label: "Cleaning", value: 98, color: "#22c55e" },
    { label: "Electrical", value: 94, color: "#3b82f6" },
    { label: "Security", value: 92, color: "#6366f1" },
    { label: "Plumbing", value: 85, color: ORANGE },
    { label: "HVAC", value: 78, color: "#ef4444" },
];

const providerSla = [
    { provider: "Ram Shrestha", category: "HVAC", totalJobs: 142, onTime: 98, breaches: 2, status: "Excellent" },
    { provider: "Nepal Electricals", category: "Electrical", totalJobs: 310, onTime: 99, breaches: 3, status: "Excellent" },
    { provider: "Sparkle Cleaning Co.", category: "Cleaning", totalJobs: 85, onTime: 92, breaches: 6, status: "Good" },
    { provider: "Purna Plumbing", category: "Plumbing", totalJobs: 215, onTime: 95, breaches: 10, status: "Excellent" },
    { provider: "Gurkha Security Services", category: "Security", totalJobs: 54, onTime: 100, breaches: 0, status: "Excellent" },
    { provider: "Kathmandu Pest Control", category: "Pest Control", totalJobs: 120, onTime: 90, breaches: 12, status: "Good" },
];

const getStatusStyles = (status: string) => {
    if (status === "Excellent") return "bg-emerald-50 text-emerald-700";
    if (status === "Good") return "bg-blue-50 text-[#1e3a8a]";
    if (status === "Needs Improvement") return "bg-amber-50 text-amber-700";
    return "bg-slate-100 text-slate-600";
};

export default function SlaPage() {
    const maxTrend = 100;
    // Highlight the last two months (most recent), matching the reference chart
    const highlightFromIndex = trendData.length - 2;

    return (
        <main className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-50/40 min-h-screen">

            {/* Page heading */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200/60 pb-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900">SLA & Compliance</h1>
                    <p className="text-sm text-slate-500 mt-0.5">Service level performance across providers and categories</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((kpi) => (
                    <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                        <p className="text-sm text-slate-500 font-medium">{kpi.label}</p>
                        <p
                            className={`text-3xl font-extrabold mt-2 ${kpi.valueColor}`}
                            style={kpi.valueColorHex ? { color: kpi.valueColorHex } : undefined}
                        >
                            {kpi.value}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                            {kpi.deltaDirection === "up" && <TrendingUp size={13} className="text-emerald-500" />}
                            {kpi.deltaDirection === "warn" && <AlertTriangle size={13} className="text-red-500" />}
                            {kpi.deltaDirection === "neutral" && <Target size={13} className="text-slate-400" />}
                            <p
                                className={`text-xs font-medium ${
                                    kpi.deltaDirection === "up"
                                        ? "text-emerald-600"
                                        : kpi.deltaDirection === "warn"
                                            ? "text-red-500"
                                            : "text-slate-400"
                                }`}
                            >
                                {kpi.delta}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Trend chart + Category performance */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* SLA Compliance Trend */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900 mb-6">SLA Compliance Trend</h2>
                    <div className="flex items-stretch gap-2">
                        {/* Y-axis labels */}
                        <div className="flex flex-col justify-between text-xs text-slate-400 font-medium pr-2 pb-6">
                            <span>100%</span>
                            <span>75%</span>
                            <span>50%</span>
                            <span>25%</span>
                            <span>0%</span>
                        </div>
                        {/* Bars */}
                        <div className="flex-1 grid grid-cols-6 gap-3 sm:gap-5 items-end h-64 border-b border-gray-100">
                            {trendData.map((d, idx) => (
                                <div key={d.month} className="flex flex-col items-center justify-end h-full">
                                    <div
                                        className="w-full max-w-[56px] rounded-t-md transition-all"
                                        style={{
                                            height: `${(d.value / maxTrend) * 100}%`,
                                            backgroundColor: idx >= highlightFromIndex ? NAVY : "#64748b",
                                        }}
                                        title={`${d.value}%`}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-6 gap-3 sm:gap-5 mt-2 pl-8">
                        {trendData.map((d) => (
                            <span key={d.month} className="text-xs text-slate-400 font-medium text-center">
                                {d.month}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Category Performance */}
                <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-900 mb-5">Category Performance</h2>
                    <div className="space-y-5">
                        {categoryPerformance.map((cat) => (
                            <div key={cat.label}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-semibold text-slate-700">{cat.label}</span>
                                    <span className="text-sm font-bold text-slate-900">{cat.value}%</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                                    <div
                                        className="h-full rounded-full"
                                        style={{ width: `${cat.value}%`, backgroundColor: cat.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Provider SLA Performance table */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h2 className="text-sm font-bold text-slate-900 mb-4">Provider SLA Performance</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="border-b border-gray-100 text-left">
                            <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Provider</th>
                            <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Category</th>
                            <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Total Jobs</th>
                            <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">On-Time %</th>
                            <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">SLA Breaches</th>
                            <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Status</th>
                        </tr>
                        </thead>
                        <tbody>
                        {providerSla.map((row, idx) => (
                            <tr
                                key={row.provider}
                                className={`border-b border-gray-50 hover:bg-slate-50/60 transition-colors ${
                                    idx === providerSla.length - 1 ? "border-b-0" : ""
                                }`}
                            >
                                <td className="py-3 pr-4 font-semibold" style={{ color: NAVY }}>
                                    {row.provider}
                                </td>
                                <td className="py-3 pr-4 text-slate-600 font-medium">{row.category}</td>
                                <td className="py-3 pr-4 text-slate-600 font-medium">{row.totalJobs}</td>
                                <td className="py-3 pr-4 font-bold text-slate-900">{row.onTime}%</td>
                                <td className="py-3 pr-4 text-slate-600 font-medium">{row.breaches}</td>
                                <td className="py-3 pr-4">
                                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusStyles(row.status)}`}>
                                            {row.status}
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
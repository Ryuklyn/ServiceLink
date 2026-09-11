"use client";

import { useState, useEffect } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import {
    FileText,
    CheckCircle,
    TrendingUp,
    Clock,
    AlertCircle,
} from "lucide-react";
import { insightsApi, ProviderEarningsResponse } from "@/lib/api/insightsApi";

const tabs = ["This Week", "This Month", "Last 3 Months", "This Year"];

const statusStyle = (status: string) => {
    switch (status) {
        case "Paid": return "bg-green-100 text-green-700 border border-green-200";
        case "Unpaid": return "bg-orange-50 text-orange-600 border border-orange-200";
        case "Pending": return "bg-yellow-50 text-yellow-600 border border-yellow-200";
        case "Refunded": return "bg-red-50 text-red-500 border border-red-200";
        default: return "bg-gray-100 text-gray-600";
    }
};

const CustomBar = (props: any) => {
    const { x, y, width, height } = props;
    const radius = 4;
    return (
        <g>
            <path
                d={`M${x},${y + height} L${x},${y + radius} Q${x},${y} ${x + radius},${y} L${x + width - radius},${y} Q${x + width},${y} ${x + width},${y + radius} L${x + width},${y + height} Z`}
                fill="#e8683f"
            />
        </g>
    );
};

export default function EarningsPage() {
    const [activeTab, setActiveTab] = useState("This Month");
    const [data, setData] = useState<ProviderEarningsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        let active = true;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await insightsApi.getEarnings(activeTab);
                if (active) {
                    setData({
                        summary: {
                            totalEarned: Number(res?.summary?.totalEarned ?? 0),
                            completedJobs: Number(res?.summary?.completedJobs ?? 0),
                            averagePerJob: Number(res?.summary?.averagePerJob ?? 0),
                            pendingAmount: Number(res?.summary?.pendingAmount ?? 0),
                        },
                        revenueTrend: Array.isArray(res?.revenueTrend) ? res.revenueTrend : [],
                        topServices: Array.isArray(res?.topServices) ? res.topServices : [],
                        recentPayments: Array.isArray(res?.recentPayments) ? res.recentPayments : [],
                    });
                }
            } catch (err: any) {
                if (active) {
                    setError(err?.response?.data?.message ?? err?.message ?? "Failed to load earnings");
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }
        load();
        return () => {
            active = false;
        };
    }, [activeTab, retryKey]);

    if (loading) {
        return (
            <div className="flex flex-col gap-5 max-w-[1200px] mx-auto p-4 animate-pulse">
                <div className="flex justify-between items-center h-10 bg-slate-100 rounded-lg w-1/3" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-slate-100 rounded-xl border border-slate-200" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2 h-64 bg-slate-100 rounded-xl border border-slate-200" />
                    <div className="h-64 bg-slate-100 rounded-xl border border-slate-200" />
                </div>
                <div className="h-48 bg-slate-100 rounded-xl border border-slate-200" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-center">
                <AlertCircle className="w-10 h-10 text-red-500" />
                <h3 className="text-base font-bold text-slate-800">Something went wrong</h3>
                <p className="text-sm text-slate-500 max-w-sm">{error}</p>
                <button
                    onClick={() => setRetryKey((key) => key + 1)}
                    className="rounded-lg bg-[#1e3a8a] text-white text-sm font-semibold px-4 py-2 hover:bg-[#1e3a8a]/90 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!data) return null;

    // Responsive ticks for YAxis
    const maxVal = Math.max(...data.revenueTrend.map((t) => t.amount), 5000);
    const tickSteps = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

    return (
        <div className="flex flex-col gap-5 max-w-[1200px] mx-auto">
            <div className="space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Earnings</h1>
                </div>

                {/* Tabs */}
                <div className="flex gap-0 border-b border-gray-200">
                    {tabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
                                activeTab === tab
                                    ? "text-orange-500"
                                    : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <span
                                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                                    style={{ backgroundColor: "#e8683f" }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Total Earned */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 font-medium">Total Earned</span>
                            <FileText size={16} className="text-orange-400" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            Rs. {data.summary.totalEarned.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-green-500">
                            <TrendingUp size={12} />
                            Active Settled
                        </div>
                    </div>

                    {/* Jobs Completed */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 font-medium">Jobs Completed</span>
                            <CheckCircle size={16} className="text-teal-400" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            {data.summary.completedJobs}
                        </div>
                        <div className="text-xs text-gray-400">Total finished</div>
                    </div>

                    {/* Avg Per Job */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 font-medium">Avg Per Job</span>
                            <TrendingUp size={16} className="text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            Rs. {data.summary.averagePerJob.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-400">Across all services</div>
                    </div>

                    {/* Pending */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 font-medium">Pending</span>
                            <Clock size={16} className="text-yellow-400" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                            Rs. {data.summary.pendingAmount.toLocaleString()}
                        </div>
                        <div className="text-xs font-medium text-yellow-500">Awaiting payment</div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Monthly Revenue Bar Chart */}
                    <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-800 mb-4">Revenue trend ({activeTab})</h2>
                        {data.revenueTrend.length === 0 ? (
                            <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
                                No revenue recorded in this period
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={data.revenueTrend} barCategoryGap="35%" margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12, fill: "#9ca3af" }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                                        tickFormatter={(v) =>
                                            v === 0 ? "Rs.0" : v >= 1000 ? `Rs.${Math.round(v / 100) / 10}k` : `${v}`
                                        }
                                        width={52}
                                        ticks={tickSteps}
                                        domain={[0, maxVal]}
                                    />
                                    <Tooltip
                                        formatter={(value: any) => [`Rs. ${value.toLocaleString()}`, "Revenue"]}
                                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                                        cursor={{ fill: "rgba(0,0,0,0.04)" }}
                                    />
                                    <Bar dataKey="amount" shape={<CustomBar />} maxBarSize={48} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Top Services Pie Chart */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-800 mb-4">Top Services</h2>
                        {data.topServices.length === 0 ? (
                            <div className="flex h-[220px] items-center justify-center text-sm text-slate-400">
                                No service shares recorded
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-center mb-4">
                                    <PieChart width={160} height={160}>
                                        <Pie
                                            data={data.topServices}
                                            cx={75}
                                            cy={75}
                                            innerRadius={48}
                                            outerRadius={72}
                                            dataKey="value"
                                            strokeWidth={2}
                                            stroke="#fff"
                                        >
                                            {data.topServices.map((entry, index) => (
                                                <Cell key={index} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </div>
                                <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                                    {data.topServices.map((s) => (
                                        <div key={s.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                                                <span className="text-xs text-gray-600 truncate">{s.name}</span>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-700">Rs. {s.value.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Recent Payment History */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-800">Recent Payment History</h2>
                    </div>
                    {data.recentPayments.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-400">
                            No payment history records found in this range.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Booking ID</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Customer</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Service</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Amount</th>
                                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                                </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                {data.recentPayments.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-3.5 text-xs text-gray-400 font-mono">{row.id}</td>
                                        <td className="px-6 py-3.5 text-sm font-semibold text-gray-800">{row.customer}</td>
                                        <td className="px-6 py-3.5 text-sm text-gray-600">{row.service}</td>
                                        <td className="px-6 py-3.5 text-sm text-gray-500">{row.date}</td>
                                        <td className="px-6 py-3.5 text-sm font-bold text-gray-800">{row.amount}</td>
                                        <td className="px-6 py-3.5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${statusStyle(row.status)}`}>
                                                {row.status}{row.paymentMethod ? ` · ${row.paymentMethod === "QR_MOBILE" ? "QR" : "Cash"}` : ""}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

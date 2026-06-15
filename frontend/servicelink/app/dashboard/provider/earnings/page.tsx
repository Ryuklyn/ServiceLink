"use client";

import { useState } from "react";
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
    Download,
    FileText,
    CheckCircle,
    TrendingUp,
    Clock,
} from "lucide-react";

const tabs = ["This Week", "This Month", "Last 3 Months", "This Year"];

const monthlyRevenue = [
    { month: "Jan", amount: 7200 },
    { month: "Feb", amount: 7800 },
    { month: "Mar", amount: 10200 },
    { month: "Apr", amount: 9800 },
    { month: "May", amount: 13600 },
    { month: "Jun", amount: 12450 },
];

const topServices = [
    { name: "Wiring & Rewiring", value: 4800, color: "#e8683f" },
    { name: "Inverter Setup", value: 3600, color: "#1e3a8a" },
    { name: "Electrical Repair", value: 2400, color: "#3b6fd4" },
    { name: "Circuit Breaker", value: 1650, color: "#f4a27a" },
];

const payments = [
    { id: "BK-2026-044", customer: "Priya Thapa", service: "Lighting Installation", date: "2026-06-12", amount: "Rs. 750", status: "Unpaid" },
    { id: "BK-2026-043", customer: "Dinesh Karki", service: "Inverter Setup", date: "2026-06-13", amount: "Rs. 950", status: "Unpaid" },
    { id: "BK-2026-045", customer: "Sunita Pradhan", service: "Wiring & Rewiring", date: "2026-06-14", amount: "Rs. 1200", status: "Unpaid" },
    { id: "BK-2026-041", customer: "Rukesh Shrestha", service: "Electrical Repair", date: "2026-06-12", amount: "Rs. 600", status: "Paid" },
    { id: "BK-2026-042", customer: "Babatunde Okonkwo", service: "Wiring & Rewiring", date: "2026-06-13", amount: "Rs. 800", status: "Pending" },
    { id: "BK-2026-038", customer: "Sita Rai", service: "Inverter Setup", date: "2026-06-10", amount: "Rs. 900", status: "Pending" },
    { id: "BK-2026-033", customer: "Ram Prasad Magar", service: "Circuit Breaker Repair", date: "2026-06-09", amount: "Rs. 450", status: "Paid" },
    { id: "BK-2026-030", customer: "Anita Gurung", service: "Lighting Installation", date: "2026-06-07", amount: "Rs. 700", status: "Refunded" },
];

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

    return (
        <div className="min-h-screen">
            <div className="max-w-5xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Earnings</h1>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                        <Download size={14} />
                        Export as PDF
                    </button>
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
                        <div className="text-2xl font-bold text-gray-900 mb-1">Rs. 12,450</div>
                        <div className="flex items-center gap-1 text-xs font-semibold text-green-500">
                            <TrendingUp size={12} />
                            +12% from last month
                        </div>
                    </div>

                    {/* Jobs Completed */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 font-medium">Jobs Completed</span>
                            <CheckCircle size={16} className="text-teal-400" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">24</div>
                        <div className="text-xs text-gray-400">This month</div>
                    </div>

                    {/* Avg Per Job */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 font-medium">Avg Per Job</span>
                            <TrendingUp size={16} className="text-blue-400" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">Rs. 520</div>
                        <div className="text-xs text-gray-400">Across all services</div>
                    </div>

                    {/* Pending */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-gray-500 font-medium">Pending</span>
                            <Clock size={16} className="text-yellow-400" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-1">Rs. 1,250</div>
                        <div className="text-xs font-medium text-yellow-500">Awaiting payment</div>
                    </div>
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    {/* Monthly Revenue Bar Chart */}
                    <div className="md:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-800 mb-4">Monthly Revenue</h2>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={monthlyRevenue} barCategoryGap="35%" margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
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
                                        v === 0 ? "Rs.0k" : v >= 1000 ? `${v >= 10000 ? "Rs." + v / 1000 : "Rs." + v / 1000}k` : `${v}`
                                    }
                                    width={48}
                                    ticks={[0, 3500, 7000, 10500, 14000]}
                                    tickCount={5}
                                    domain={[0, 14000]}
                                />
                                <Tooltip
                                    formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, "Revenue"]}
                                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                                    cursor={{ fill: "rgba(0,0,0,0.04)" }}
                                />
                                <Bar dataKey="amount" shape={<CustomBar />} maxBarSize={48} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Top Services Pie Chart */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-800 mb-4">Top Services</h2>
                        <div className="flex justify-center mb-4">
                            <PieChart width={160} height={160}>
                                <Pie
                                    data={topServices}
                                    cx={75}
                                    cy={75}
                                    innerRadius={48}
                                    outerRadius={72}
                                    dataKey="value"
                                    strokeWidth={2}
                                    stroke="#fff"
                                >
                                    {topServices.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </div>
                        <div className="space-y-2">
                            {topServices.map((s) => (
                                <div key={s.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                                        <span className="text-xs text-gray-600">{s.name}</span>
                                    </div>
                                    <span className="text-xs font-semibold text-gray-700">Rs. {s.value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Payment History */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-800">Recent Payment History</h2>
                    </div>
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
                            {payments.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-3.5 text-xs text-gray-400 font-mono">{row.id}</td>
                                    <td className="px-6 py-3.5 text-sm font-semibold text-gray-800">{row.customer}</td>
                                    <td className="px-6 py-3.5 text-sm text-gray-600">{row.service}</td>
                                    <td className="px-6 py-3.5 text-sm text-gray-500">{row.date}</td>
                                    <td className="px-6 py-3.5 text-sm font-bold text-gray-800">{row.amount}</td>
                                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold ${statusStyle(row.status)}`}>
                        {row.status}
                      </span>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}
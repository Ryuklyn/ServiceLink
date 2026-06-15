"use client";

import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { MapPin, ChevronDown, Star } from "lucide-react";

const tabs = ["This Week", "This Month", "Last 3 Months", "This Year"];

const bookingsTrend = [
    { day: 1, bookings: 3 },
    { day: 2, bookings: 2 },
    { day: 3, bookings: 4 },
    { day: 4, bookings: 3 },
    { day: 5, bookings: 5 },
    { day: 6, bookings: 4 },
    { day: 7, bookings: 6 },
    { day: 8, bookings: 7 },
    { day: 9, bookings: 6 },
    { day: 10, bookings: 5 },
    { day: 11, bookings: 4 },
    { day: 12, bookings: 3 },
];

const serviceCategories = [
    { name: "Wiring", value: 38, color: "#e8683f" },
    { name: "Inverter", value: 29, color: "#1e3a8a" },
    { name: "Electrical", value: 19, color: "#3b6fd4" },
    { name: "Circuit Breaker", value: 13, color: "#f4a27a" },
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm"];

// Heatmap intensity data: 0-1 scale
const heatmapData: number[][] = [
    [0.7, 0.5, 0.6, 0.4, 0.3, 0.8, 0.9, 0.6, 0.5, 0.4, 0.3], // Mon
    [0.5, 0.3, 0.2, 0.4, 0.6, 0.5, 1.0, 0.7, 0.3, 0.5, 0.2], // Tue
    [0.3, 0.6, 0.4, 0.2, 0.5, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2], // Wed
    [0.6, 0.4, 0.5, 0.3, 0.7, 0.6, 0.5, 0.8, 0.6, 0.4, 0.3], // Thu
    [0.9, 0.3, 0.2, 0.5, 0.4, 0.6, 0.3, 0.4, 0.2, 0.5, 0.4], // Fri
    [0.6, 0.5, 0.7, 0.4, 0.3, 0.5, 0.4, 0.3, 0.2, 0.4, 0.3], // Sat
    [0.8, 0.6, 0.4, 0.3, 0.5, 0.7, 0.3, 0.4, 0.6, 1.0, 0.5], // Sun
];

const getHeatColor = (intensity: number) => {
    if (intensity >= 0.85) return "#c44a20";
    if (intensity >= 0.7) return "#e8683f";
    if (intensity >= 0.5) return "#f09070";
    if (intensity >= 0.3) return "#f8c4b0";
    return "#fde8df";
};

const ratingData = [
    { star: 5, pct: 72 },
    { star: 4, pct: 18 },
    { star: 3, pct: 5 },
    { star: 2, pct: 3 },
    { star: 1, pct: 2 },
];

const ratingBarColor = (star: number) => {
    if (star === 5) return "#1e3a8a";
    if (star === 4) return "#e8683f";
    return "#f4a27a";
};

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState("This Month");
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <div className="min-h-screen">
            <div className="max-w-5xl mx-auto space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
                        >
                            {activeTab}
                            <ChevronDown size={14} />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => { setActiveTab(tab); setDropdownOpen(false); }}
                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${activeTab === tab ? "font-semibold text-orange-500" : "text-gray-700"}`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Bookings", value: "24", sub: null },
                        { label: "Acceptance Rate", value: "96%", sub: null },
                        { label: "Repeat Customer Rate", value: "38%", sub: null },
                        { label: "Avg Response Time", value: "4 min", sub: null },
                    ].map(({ label, value }) => (
                        <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <p className="text-xs text-gray-500 font-medium mb-2">{label}</p>
                            <p className="text-2xl font-bold text-gray-900">{value}</p>
                        </div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Bookings Trend */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-800 mb-4">Bookings Trend (June)</h2>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={bookingsTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                                    ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 11, fill: "#9ca3af" }}
                                    ticks={[0, 2, 4, 6, 8]}
                                    domain={[0, 8]}
                                />
                                <Tooltip
                                    formatter={(v: number) => [v, "Bookings"]}
                                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="bookings"
                                    stroke="#e8683f"
                                    strokeWidth={2}
                                    dot={{ fill: "#e8683f", r: 3, strokeWidth: 0 }}
                                    activeDot={{ r: 5, fill: "#e8683f" }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Service Categories Donut */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-800 mb-4">Service Categories</h2>
                        <div className="flex items-center gap-6">
                            <div className="flex-shrink-0">
                                <PieChart width={160} height={160}>
                                    <Pie
                                        data={serviceCategories}
                                        cx={75}
                                        cy={75}
                                        innerRadius={48}
                                        outerRadius={72}
                                        dataKey="value"
                                        strokeWidth={2}
                                        stroke="#fff"
                                    >
                                        {serviceCategories.map((entry, i) => (
                                            <Cell key={i} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </div>
                            <div className="space-y-2.5 flex-1">
                                {serviceCategories.map((s) => (
                                    <div key={s.name} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                                            <span className="text-xs text-gray-600">{s.name}</span>
                                        </div>
                                        <span className="text-xs font-semibold text-gray-700">{s.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Heatmap + Ratings Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Peak Operating Hours Heatmap */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-800 mb-1">Peak Operating Hours</h2>
                        <p className="text-xs text-gray-400 mb-4">Darker orange indicates higher booking volume.</p>
                        <div className="overflow-x-auto">
                            <div className="min-w-[340px]">
                                {/* Hour labels */}
                                <div className="flex mb-1 ml-8">
                                    {hours.map((h) => (
                                        <div key={h} className="flex-1 text-center text-xs text-gray-400">{h}</div>
                                    ))}
                                </div>
                                {/* Grid */}
                                {days.map((day, di) => (
                                    <div key={day} className="flex items-center mb-1">
                                        <div className="w-8 text-xs text-gray-500 font-medium flex-shrink-0">{day}</div>
                                        <div className="flex gap-1 flex-1">
                                            {heatmapData[di].map((intensity, hi) => (
                                                <div
                                                    key={hi}
                                                    className="flex-1 h-7 rounded-md transition-opacity"
                                                    style={{ backgroundColor: getHeatColor(intensity) }}
                                                    title={`${day} ${hours[hi]}: intensity ${Math.round(intensity * 100)}%`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                                {/* Scroll indicator */}
                                <div className="flex items-center gap-2 mt-3">
                                    <span className="text-gray-400 text-xs">◀</span>
                                    <div className="flex-1 h-1.5 bg-gray-200 rounded-full">
                                        <div className="h-1.5 w-3/4 bg-gray-400 rounded-full" />
                                    </div>
                                    <span className="text-gray-400 text-xs">▶</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Customer Ratings */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-800 mb-4">Customer Ratings</h2>

                        {/* Big rating */}
                        <div className="flex items-center gap-3 mb-5">
                            <span className="text-4xl font-bold text-gray-900">4.8</span>
                            <div>
                                <div className="flex gap-0.5 mb-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={16} fill="#f59e0b" stroke="none" />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400">Based on 124 reviews</p>
                            </div>
                        </div>

                        {/* Rating bars */}
                        <div className="space-y-2.5">
                            {ratingData.map(({ star, pct }) => (
                                <div key={star} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-500 w-5 text-right flex-shrink-0">{star}★</span>
                                    <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                                        <div
                                            className="h-2.5 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${pct}%`,
                                                backgroundColor: ratingBarColor(star),
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Map Coming Soon */}
                <div className="bg-white rounded-xl border border-dashed border-gray-300 shadow-sm p-12 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#fff3ef" }}>
                        <MapPin size={22} style={{ color: "#e8683f" }} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-800 mb-2">Interactive map coming soon</h3>
                    <p className="text-sm text-gray-400 max-w-xs leading-relaxed">
                        Soon you'll be able to visualize where your customers are located to optimize your service area and travel time.
                    </p>
                </div>

            </div>
        </div>
    );
}
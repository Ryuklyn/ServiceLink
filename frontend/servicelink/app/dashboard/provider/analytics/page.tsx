"use client";

import { useState, useEffect } from "react";
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
import dynamic from "next/dynamic";
import { ChevronDown, Star, AlertCircle } from "lucide-react";
import { insightsApi, ProviderAnalyticsResponse } from "@/lib/api/insightsApi";

const MapComponent = dynamic(
    () => import("@/components/dashboard/user/map/MapComponent"),
    {
        ssr: false,
        loading: () => (
            <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Loading map...
            </div>
        ),
    }
);

const tabs = ["This Week", "This Month", "Last 3 Months", "This Year"];
const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const hours = ["8am", "9am", "10am", "11am", "12pm", "1pm", "2pm", "3pm", "4pm", "5pm", "6pm"];

const getHeatColor = (intensity: number) => {
    if (intensity >= 0.85) return "#c44a20";
    if (intensity >= 0.7) return "#e8683f";
    if (intensity >= 0.5) return "#f09070";
    if (intensity >= 0.3) return "#f8c4b0";
    return "#fde8df";
};

const ratingBarColor = (star: number) => {
    if (star === 5) return "#1e3a8a";
    if (star === 4) return "#e8683f";
    return "#f4a27a";
};

export default function AnalyticsPage() {
    const [activeTab, setActiveTab] = useState("This Month");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [data, setData] = useState<ProviderAnalyticsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let active = true;
        async function load() {
            setLoading(true);
            setError(null);
            try {
                const res = await insightsApi.getAnalytics(activeTab);
                if (active) {
                    setData(res);
                }
            } catch (err: any) {
                if (active) {
                    setError(err?.response?.data?.message ?? err?.message ?? "Failed to load analytics");
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
    }, [activeTab]);

    if (loading) {
        return (
            <div className="flex flex-col gap-5 max-w-[1200px] mx-auto p-4 animate-pulse">
                <div className="flex justify-between items-center h-10 bg-slate-100 rounded-lg w-1/3" />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-24 bg-slate-100 rounded-xl border border-slate-200" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-64 bg-slate-100 rounded-xl border border-slate-200" />
                    <div className="h-64 bg-slate-100 rounded-xl border border-slate-200" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-80 bg-slate-100 rounded-xl border border-slate-200" />
                    <div className="h-80 bg-slate-100 rounded-xl border border-slate-200" />
                </div>
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
                    onClick={() => setActiveTab(activeTab)}
                    className="rounded-lg bg-[#1e3a8a] text-white text-sm font-semibold px-4 py-2 hover:bg-[#1e3a8a]/90 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!data) return null;

    // Heatmap scaling
    const maxHeatVal = Math.max(...(data.peakHours?.flatMap(row => row) || [1]));

    // Map markers
    const markers = data.coverage.map((c) => ({
        lat: c.lat,
        lng: c.lng,
        label: c.label,
    }));
    const mapCenter: [number, number] = markers.length > 0 ? [markers[0].lat, markers[0].lng] : [27.7172, 85.324];

    return (
        <div className="flex flex-col gap-5 max-w-[1200px] mx-auto">
            <div className="space-y-5">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">Analytics</h1>
                    <div className="relative">
                        <button
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
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
                        { label: "Total Bookings", value: data.summary.totalBookings.toString() },
                        { label: "Acceptance Rate", value: `${data.summary.acceptanceRate}%` },
                        { label: "Repeat Customer Rate", value: `${data.summary.repeatCustomerRate}%` },
                        { label: "Avg Response Time", value: `${data.summary.averageResponseTime} min` },
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
                        <h2 className="text-sm font-semibold text-gray-800 mb-4">Bookings Trend ({activeTab})</h2>
                        {data.bookingTrend.length === 0 ? (
                            <div className="flex h-[200px] items-center justify-center text-sm text-slate-400">
                                No activity in this period
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={data.bookingTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                                    <XAxis
                                        dataKey="label"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fill: "#9ca3af" }}
                                    />
                                    <Tooltip
                                        formatter={(v: any) => [v, "Bookings"]}
                                        contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#e8683f"
                                        strokeWidth={2}
                                        dot={{ fill: "#e8683f", r: 3, strokeWidth: 0 }}
                                        activeDot={{ r: 5, fill: "#e8683f" }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    {/* Service Categories Donut */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-800 mb-4">Service Categories</h2>
                        {data.serviceCategories.length === 0 ? (
                            <div className="flex h-[200px] items-center justify-center text-sm text-slate-400">
                                No services found
                            </div>
                        ) : (
                            <div className="flex items-center gap-6">
                                <div className="flex-shrink-0">
                                    <PieChart width={160} height={160}>
                                        <Pie
                                            data={data.serviceCategories}
                                            cx={75}
                                            cy={75}
                                            innerRadius={48}
                                            outerRadius={72}
                                            dataKey="value"
                                            strokeWidth={2}
                                            stroke="#fff"
                                        >
                                            {data.serviceCategories.map((entry, i) => (
                                                <Cell key={i} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </div>
                                <div className="space-y-2.5 flex-1 max-h-[160px] overflow-y-auto pr-1">
                                    {data.serviceCategories.map((s) => (
                                        <div key={s.name} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                                                <span className="text-xs text-gray-600 truncate">{s.name}</span>
                                            </div>
                                            <span className="text-xs font-semibold text-gray-700">{s.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
                                        <div key={h} className="flex-1 text-center text-[10px] text-gray-400">{h}</div>
                                    ))}
                                </div>
                                {/* Grid */}
                                {days.map((day, di) => (
                                    <div key={day} className="flex items-center mb-1">
                                        <div className="w-8 text-xs text-gray-500 font-medium flex-shrink-0">{day}</div>
                                        <div className="flex gap-1 flex-1">
                                            {data.peakHours[di]?.map((count, hi) => {
                                                const intensity = maxHeatVal > 0 ? (count / maxHeatVal) : 0;
                                                return (
                                                    <div
                                                        key={hi}
                                                        className="flex-1 h-7 rounded-md transition-opacity"
                                                        style={{ backgroundColor: getHeatColor(intensity) }}
                                                        title={`${day} ${hours[hi]}: ${count} bookings`}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Customer Ratings */}
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-800 mb-4">Customer Ratings</h2>

                        {/* Big rating */}
                        <div className="flex items-center gap-3 mb-5">
                            <span className="text-4xl font-bold text-gray-900">{data.ratings.average}</span>
                            <div>
                                <div className="flex gap-0.5 mb-1">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star 
                                            key={s} 
                                            size={16} 
                                            fill={s <= Math.round(data.ratings.average) ? "#f59e0b" : "none"} 
                                            stroke={s <= Math.round(data.ratings.average) ? "none" : "#cbd5e1"} 
                                        />
                                    ))}
                                </div>
                                <p className="text-xs text-gray-400">Based on {data.ratings.totalReviews} reviews</p>
                            </div>
                        </div>

                        {/* Rating bars */}
                        <div className="space-y-2.5">
                            {data.ratings.distribution.map(({ star, pct }) => (
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
                                    <span className="text-xs text-gray-400 w-8 text-right flex-shrink-0">{pct}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Interactive Customer Map */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h3 className="text-base font-semibold text-gray-800">Customer Coverage Map</h3>
                            <p className="text-xs text-gray-400">Optimizing your service area and travel time.</p>
                        </div>
                        <span className="bg-green-50 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium">
                          {markers.length} Locations
                        </span>
                    </div>

                    <div className="w-full h-[350px] relative z-0">
                        <MapComponent center={mapCenter} markers={markers} interactive={true} />
                    </div>
                </div>

            </div>
        </div>
    );
}
"use client";

import { useState } from "react";
import {
    Clock,
    Navigation,
    MessageCircle,
    MapPin,
    TrendingUp,
    Copy,
    Share2,
} from "lucide-react";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

type PaymentStatus = "Unpaid" | "Pending" | "Paid";
type JobStatus = "PENDING" | "IN PROGRESS" | "COMPLETED";

interface Job {
    time: string;
    title: string;
    customer: string;
    location: string;
    amount: string;
    status: JobStatus;
}

interface Booking {
    customer: string;
    service: string;
    date: string;
    amount: string;
    payment: PaymentStatus;
    rating: number | null;
}

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────

const todayJobs: Job[] = [
    {
        time: "4:00 PM",
        title: "Lighting Installation",
        customer: "Priya Thapa",
        location: "Baluwatar, Kathmandu",
        amount: "Rs. 750",
        status: "PENDING",
    },
    {
        time: "2:00 PM",
        title: "Electrical Repair",
        customer: "Rukesh Maharjan",
        location: "Baneshwor, Kathmandu",
        amount: "Rs. 600",
        status: "IN PROGRESS",
    },
];

const recentBookings: Booking[] = [
    {
        customer: "Sunita Pradhan",
        service: "Wiring & Rewiring",
        date: "2026-06-14",
        amount: "Rs. 1200",
        payment: "Unpaid",
        rating: null,
    },
    {
        customer: "Dinesh Karki",
        service: "Inverter Setup",
        date: "2026-06-13",
        amount: "Rs. 950",
        payment: "Unpaid",
        rating: null,
    },
    {
        customer: "Babatunde Okonkwo",
        service: "Wiring & Rewiring",
        date: "2026-06-13",
        amount: "Rs. 800",
        payment: "Pending",
        rating: null,
    },
];

// ─────────────────────────────────────────────
// STYLE MAPS
// ─────────────────────────────────────────────

const jobStatusStyles: Record<JobStatus, string> = {
    PENDING: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    "IN PROGRESS": "bg-[#E8683F] text-white",
    COMPLETED: "bg-green-100 text-green-700 border border-green-200",
};

const paymentStyles: Record<PaymentStatus, string> = {
    Unpaid: "bg-gray-100 text-gray-500 border border-gray-200",
    Pending: "bg-yellow-100 text-yellow-700 border border-yellow-200",
    Paid: "bg-green-100 text-green-700 border border-green-200",
};

// ─────────────────────────────────────────────
// SUB-SECTIONS
// ─────────────────────────────────────────────

/** Active Job Banner */
function ActiveJobBanner() {
    return (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-start gap-3">
                <span className="mt-1.5 w-2.5 h-2.5 rounded-full bg-[#E8683F] animate-pulse flex-shrink-0" />
                <div>
                    <p className="text-xs font-semibold text-[#E8683F] uppercase tracking-wide mb-0.5">
                        In Progress
                    </p>
                    <h2 className="text-gray-900 font-bold text-lg leading-tight">
                        Electrical Repair
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Rukesh Maharjan &bull; Baneshwor, Kathmandu (1.2 km away)
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                        <Clock size={13} className="text-[#E8683F]" />
                        <span className="text-sm text-[#E8683F] font-semibold">
              ETA: 8 mins
            </span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
                <button className="flex items-center gap-2 px-4 py-2.5 border-2 border-[#1E3A8A] text-[#1E3A8A] rounded-xl text-sm font-semibold hover:bg-[#1E3A8A] hover:text-white transition-all">
                    <Navigation size={15} />
                    Track Customer
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-xl text-sm font-semibold hover:bg-[#1ebe5a] transition-all shadow-sm">
                    <MessageCircle size={15} />
                    WhatsApp
                </button>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────

/** ServiceLink Score Donut */
function ServiceLinkScore() {
    const score = 81;
    const radius = 70;
    const stroke = 10;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    const stats = [
        { label: "Response Rate", value: "94%" },
        { label: "Completion", value: "98%" },
        { label: "Avg Rating", value: "4.8★" },
        { label: "Profile", value: "72%" },
    ];

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-gray-800 font-bold text-base mb-5">
                ServiceLink Score
            </h3>

            <div className="flex justify-center mb-6">
                <div className="relative w-[140px] h-[140px]">
                    <svg height={radius * 2} width={radius * 2} className="-rotate-90">
                        <circle
                            stroke="#F0F0F0"
                            fill="transparent"
                            strokeWidth={stroke}
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                        />
                        <circle
                            stroke="url(#scoreGrad)"
                            fill="transparent"
                            strokeWidth={stroke}
                            strokeLinecap="round"
                            strokeDasharray={`${circumference} ${circumference}`}
                            strokeDashoffset={strokeDashoffset}
                            r={normalizedRadius}
                            cx={radius}
                            cy={radius}
                        />
                        <defs>
                            <linearGradient
                                id="scoreGrad"
                                x1="0%"
                                y1="0%"
                                x2="100%"
                                y2="0%"
                            >
                                <stop offset="0%" stopColor="#00C9A7" />
                                <stop offset="100%" stopColor="#00E5C5" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-gray-900">{score}</span>
                        <span className="text-xs text-gray-400 font-medium">/100</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {stats.map(({ label, value }) => (
                    <div
                        key={label}
                        className="bg-gray-50 rounded-xl px-4 py-3 text-center"
                    >
                        <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                        <p className="text-base font-bold text-gray-800">{value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────

/** Today's Schedule */
function TodaySchedule() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-gray-800 font-bold text-base mb-1">Today, June 14</h3>
            <p className="text-xs text-gray-400 mb-5">
                {todayJobs.length} jobs scheduled
            </p>

            <div className="flex flex-col gap-4">
                {todayJobs.map((job, i) => (
                    <div
                        key={i}
                        className="flex items-start justify-between gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0"
                    >
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 font-medium mb-0.5">
                                {job.time}
                            </p>
                            <p className="text-sm font-bold text-gray-900 truncate">
                                {job.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{job.customer}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <MapPin size={11} className="text-gray-300 flex-shrink-0" />
                                <p className="text-xs text-gray-400 truncate">{job.location}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <p className="text-sm font-bold text-gray-800">{job.amount}</p>
                            <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${
                                    jobStatusStyles[job.status]
                                }`}
                            >
                {job.status}
              </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────

/** Earnings Card */
function EarningsCard() {
    const earned = 12450;
    const goal = 16000;
    const percent = Math.round((earned / goal) * 100);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                {/* Left */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500 font-medium mb-1">
                        This Month's Earnings
                    </p>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                        Rs. {earned.toLocaleString()}
                    </h2>

                    <div className="mt-4">
                        <div className="flex justify-between items-center mb-1.5">
                            <p className="text-xs text-gray-400">
                                Goal: Rs. {goal.toLocaleString()}
                            </p>
                            <p className="text-xs font-bold text-[#E8683F]">{percent}%</p>
                        </div>
                        <div className="h-2.5 bg-orange-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[#E8683F] to-[#FF9A72] rounded-full transition-all"
                                style={{ width: `${percent}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-2">
                            You need 7 more jobs to hit your monthly goal.
                        </p>
                    </div>

                    <div className="flex items-center gap-5 mt-5">
                        <div>
                            <p className="text-xs text-gray-400">Paid</p>
                            <p className="text-base font-bold text-[#E8683F]">Rs. 11,200</p>
                        </div>
                        <div className="w-px h-8 bg-gray-100" />
                        <div>
                            <p className="text-xs text-gray-400">Pending</p>
                            <p className="text-base font-bold text-[#E8683F]">Rs. 1,250</p>
                        </div>
                        <button className="ml-auto text-sm font-semibold text-[#1E3A8A] hover:underline">
                            View Earnings →
                        </button>
                    </div>
                </div>

                {/* Right Stats */}
                <div className="flex flex-row lg:flex-col gap-3 lg:w-44 flex-shrink-0">
                    <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                        <p className="text-xs text-gray-400 font-medium">This Week</p>
                        <div className="flex items-center gap-1 mt-0.5">
                            <TrendingUp size={14} className="text-green-500" />
                            <p className="text-base font-bold text-green-600">+12%</p>
                        </div>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                        <p className="text-xs text-gray-400 font-medium">Today</p>
                        <p className="text-base font-bold text-gray-900 mt-0.5">2 jobs</p>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-xl px-4 py-3">
                        <p className="text-xs text-gray-400 font-medium">Avg/Job</p>
                        <p className="text-base font-bold text-gray-900 mt-0.5">Rs. 520</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────

/** Recent Bookings Table */
function RecentBookings() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-gray-800 font-bold text-base mb-5">
                Recent Bookings
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                    <tr className="border-b border-gray-100">
                        {["Customer", "Service", "Date", "Amount", "Payment", "Rating"].map(
                            (col) => (
                                <th
                                    key={col}
                                    className="pb-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wide pr-4 last:pr-0"
                                >
                                    {col}
                                </th>
                            )
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    {recentBookings.map((b, i) => (
                        <tr
                            key={i}
                            className="border-b border-gray-50 last:border-0 hover:bg-orange-50/30 transition"
                        >
                            <td className="py-3.5 pr-4 font-semibold text-gray-800 whitespace-nowrap">
                                {b.customer}
                            </td>
                            <td className="py-3.5 pr-4 text-gray-500 whitespace-nowrap">
                                {b.service}
                            </td>
                            <td className="py-3.5 pr-4 text-gray-500 whitespace-nowrap">
                                {b.date}
                            </td>
                            <td className="py-3.5 pr-4 font-semibold text-gray-800 whitespace-nowrap">
                                {b.amount}
                            </td>
                            <td className="py-3.5 pr-4">
                  <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                          paymentStyles[b.payment]
                      }`}
                  >
                    {b.payment}
                  </span>
                            </td>
                            <td className="py-3.5 text-gray-300 text-center">—</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <button className="mt-5 text-sm font-semibold text-[#1E3A8A] hover:underline">
                View All Bookings →
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────

/** Referrals Panel */
function ReferralsPanel() {
    const [copied, setCopied] = useState(false);
    const referralCode = "SL-RUKESH-2026";
    const totalSteps = 5;
    const completed = 3;

    const handleCopy = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-gray-800 font-bold text-base mb-1">Referrals</h3>

            <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-gray-800">
                    {completed} referrals completed!
                </p>
                <div className="flex gap-1">
                    {Array.from({ length: totalSteps }).map((_, i) => (
                        <span
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                                i < completed ? "bg-[#E8683F]" : "bg-gray-200"
                            }`}
                        />
                    ))}
                </div>
            </div>

            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-3">
                <div
                    className="h-full bg-gradient-to-r from-[#E8683F] to-[#FF9A72] rounded-full"
                    style={{ width: `${(completed / totalSteps) * 100}%` }}
                />
            </div>

            <p className="text-xs text-gray-400 mb-4">
                42 providers in Kathmandu earned a free month last cycle.
            </p>

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-4">
        <span className="flex-1 text-sm font-mono font-semibold text-gray-700 tracking-wide">
          {referralCode}
        </span>
                <button
                    onClick={handleCopy}
                    className="text-[#1E3A8A] hover:text-[#E8683F] transition"
                >
                    <Copy size={15} />
                </button>
                {copied && (
                    <span className="text-xs text-green-500 font-medium">Copied!</span>
                )}
            </div>

            <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#25D366] text-white text-sm font-semibold rounded-xl hover:bg-[#1ebe5a] transition shadow-sm">
                    <MessageCircle size={15} />
                    WhatsApp
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-2 border-2 border-[#1877F2] text-[#1877F2] text-sm font-semibold rounded-xl hover:bg-[#1877F2] hover:text-white transition">
                    <Share2 size={15} />
                    Share
                </button>
            </div>

            <p className="text-center text-xs text-[#E8683F] font-semibold mt-3">
                2 more referrals = 1 FREE month 🎉
            </p>
        </div>
    );
}

// ─────────────────────────────────────────────

/** Monthly Plan Card */
function MonthlyPlanCard() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-semibold text-gray-800">Monthly Plan</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        18 days left · Expires June 30, 2026
                    </p>
                </div>
                <span className="bg-[#E8683F] text-white text-xs font-semibold px-3 py-1 rounded-full">
          Active
        </span>
            </div>
            <button className="mt-4 text-sm font-semibold text-[#1E3A8A] hover:underline">
                Manage →
            </button>
        </div>
    );
}

// ─────────────────────────────────────────────
// ROOT EXPORT
// ─────────────────────────────────────────────

export default function ProviderDashboard() {
    return (
        <div className="flex flex-col gap-5 max-w-[1400px] mx-auto">
            {/* 1. Active Job Banner */}
            <ActiveJobBanner />

            {/* 2. Score + Schedule */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <ServiceLinkScore />
                <TodaySchedule />
            </div>

            {/* 3. Earnings */}
            <EarningsCard />

            {/* 4. Bookings + Right Column */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
                <RecentBookings />
                <div className="flex flex-col gap-5">
                    <ReferralsPanel />
                    <MonthlyPlanCard />
                </div>
            </div>
        </div>
    );
}
import {
    CheckCircle2,
    Clock,
    Briefcase,
    Users,
    MapPin,
    Star,
    FileText,
    ChevronRight,
    Smile,
    Meh,
    Frown,
} from "lucide-react";
import { FaCrown } from "react-icons/fa";

const skills = ["Wiring & Rewiring", "Circuit Breaker Repair", "Lighting Installation", "Inverter Setup"];

const stats = [
    { icon: Clock, value: "6", label: "Years Experience" },
    { icon: Briefcase, value: "87", label: "Jobs Completed" },
    { icon: CheckCircle2, value: "98%", label: "Response Rate" },
    { icon: Users, value: "42", label: "Repeat Customers" },
    { icon: MapPin, value: "Up to 10 km", label: "Service Radius" },
];

const kycChecklist = ["Personal Information", "ID Verification", "Phone Verified", "Email Verified", "Address Verification"];

const ratingBreakdown = [
    { stars: 5, pct: 82 },
    { stars: 4, pct: 14 },
    { stars: 3, pct: 3 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 0 },
];

const sentiment = [
    { icon: Smile, label: "Positive", pct: 88, bg: "bg-green-50", text: "text-green-700" },
    { icon: Meh, label: "Neutral", pct: 10, bg: "bg-orange-50", text: "text-orange-700" },
    { icon: Frown, label: "Negative", pct: 2, bg: "bg-red-50", text: "text-red-700" },
];

const completeness = [
    { label: "Add profile photo", pct: "+10%" },
    { label: "Add portfolio photos", pct: "+15%" },
    { label: "Add working hours", pct: "+8%" },
    { label: "Add business description", pct: "+5%" },
];

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <Star
                    key={i}
                    size={size}
                    className={i < Math.round(rating) ? "fill-[#e8683f] text-[#e8683f]" : "fill-gray-200 text-gray-200"}
                />
            ))}
        </div>
    );
}

function RatingBar({ stars, pct }: { stars: number; pct: number }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            <span className="w-2.5 text-gray-500">{stars}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-100">
                <div className="h-full rounded-full bg-[#e8683f]" style={{ width: `${pct}%` }} />
            </div>
            <span className="w-7 text-right text-gray-500">{pct}%</span>
        </div>
    );
}

function CircularProgress({ percentage }: { percentage: number }) {
    const radius = 34;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    return (
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r={radius} fill="none" stroke="#f1f1f1" strokeWidth="7" />
                <circle
                    cx="40"
                    cy="40"
                    r={radius}
                    fill="none"
                    stroke="#e8683f"
                    strokeWidth="7"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                />
            </svg>
            <span className="absolute text-base font-bold text-gray-900">{percentage}%</span>
        </div>
    );
}

export default function ProfileOverview() {
    return (
        <div className="space-y-6">
            {/* Profile Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#e8683f] text-xl font-bold text-white">
                        BM
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg font-bold text-gray-900">Bhumika Maharjan</h2>
                            <span className="flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verified Provider
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">Electrician • Baneshwor, Kathmandu</p>

                        <div className="mt-2 flex items-center gap-2">
                            <StarRating rating={4.8} />
                            <span className="text-sm font-bold text-gray-900">4.8</span>
                            <span className="text-sm text-gray-400">(124 reviews)</span>
                        </div>

                        <p className="mt-3 text-sm text-gray-600">
                            Experienced electrician with 6 years of residential and commercial wiring work across Kathmandu valley.
                        </p>

                        <div className="mt-3 flex flex-wrap gap-2">
                            {skills.map((skill) => (
                                <span
                                    key={skill}
                                    className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#1e3a8a]"
                                >
                                  {skill}
                                </span>
                            ))}
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">+2 more</span>
                        </div>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 border-t border-gray-100 pt-5 sm:grid-cols-5">
                    {stats.map((stat) => (
                        <div key={stat.label} className="flex flex-col items-center gap-1.5 text-center">
                            <stat.icon className="h-5 w-5 text-gray-400" />
                            <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                            <span className="text-xs text-gray-500">{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 3 Column Cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* KYC Verification */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900">KYC Verification</h3>
                    <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    KYC Approved
                    </span>
                    <p className="mt-2 text-xs text-gray-500">Approved on June 1, 2026</p>

                    <ul className="mt-4 space-y-2.5">
                        {kycChecklist.map((item) => (
                            <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
                                {item}
                            </li>
                        ))}
                    </ul>

                    <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2 text-sm font-medium text-[#1e3a8a] hover:bg-gray-50">
                        <FileText className="h-4 w-4" />
                        View Documents
                    </button>
                </div>

                {/* Recent Reviews */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900">Recent Reviews</h3>
                        <button className="flex items-center gap-0.5 text-xs font-medium text-[#1e3a8a] hover:underline">
                            View All Reviews
                            <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                        <span className="text-3xl font-bold text-gray-900">4.8</span>
                        <div>
                            <StarRating rating={4.8} />
                            <p className="text-xs text-gray-400">(124 reviews)</p>
                        </div>
                    </div>

                    <div className="mt-4 space-y-1.5">
                        {ratingBreakdown.map((r) => (
                            <RatingBar key={r.stars} stars={r.stars} pct={r.pct} />
                        ))}
                    </div>

                    <div className="mt-4 border-t border-gray-100 pt-4">
                        <p className="mb-2 text-xs font-medium text-gray-500">
                            Customer Sentiment <span className="text-gray-400">· Based on all reviews</span>
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {sentiment.map((s) => (
                                <span
                                    key={s.label}
                                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${s.bg} ${s.text}`}
                                >
                  <s.icon className="h-3.5 w-3.5" />
                                    {s.pct}% {s.label}
                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Profile Completeness */}
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900">Profile Completeness</h3>
                    <p className="mt-1 text-xs text-gray-500">Complete your profile to get more bookings</p>

                    <div className="mt-4 flex items-center gap-4">
                        <CircularProgress percentage={72} />
                        <ul className="flex-1 space-y-2">
                            {completeness.map((item) => (
                                <li key={item.label} className="flex items-center justify-between text-xs text-gray-600">
                                    <span>{item.label}</span>
                                    <span className="font-semibold text-[#e8683f]">{item.pct}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <button className="mt-5 w-full rounded-lg border border-[#e8683f] py-2 text-sm font-semibold text-[#e8683f] hover:bg-[#e8683f]/5">
                        Improve Profile
                    </button>
                </div>
            </div>

            {/* Subscription Banner */}
            <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e8683f]/10">
                        <FaCrown className="h-4 w-4 text-[#e8683f]" />
                    </div>
                    <div>
                        <p className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            Monthly Plan
                            <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Active
              </span>
                        </p>
                        <p className="text-xs text-gray-500">Expires on June 30, 2026 (18 days remaining)</p>
                    </div>
                </div>
                <button className="rounded-lg border border-[#e8683f] px-4 py-2 text-sm font-semibold text-[#e8683f] hover:bg-[#e8683f]/5">
                    Manage Subscription
                </button>
            </div>
        </div>
    );
}
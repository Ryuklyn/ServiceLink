"use client";

import { useMemo, useState } from "react";
import { Star, ChevronDown, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";

type Review = {
    id: number;
    name: string;
    location: string;
    rating: number;
    date: string;
    comment: string;
    service: string;
    wouldBookAgain: boolean;
    initials: string;
    color: string;
    categories: { punctuality: number; quality: number; communication: number; value: number };
};

const reviews: Review[] = [
    {
        id: 1,
        name: "Ram Sharma",
        location: "Kathmandu, Nepal",
        rating: 5,
        date: "2 days ago",
        comment:
            "Completed full house wiring work professionally. Very punctual and explained everything clearly. Highly recommended!",
        service: "House Rewiring",
        wouldBookAgain: true,
        initials: "RS",
        color: "bg-[#e8683f]",
        categories: { punctuality: 5, quality: 5, communication: 5, value: 4 },
    },
    {
        id: 2,
        name: "Sita Thapa",
        location: "Lalitpur, Nepal",
        rating: 5,
        date: "5 days ago",
        comment:
            "Installed LED lights in our office. Work quality is excellent and looks very clean. Will book again for future work.",
        service: "LED Lighting Installation",
        wouldBookAgain: true,
        initials: "ST",
        color: "bg-teal-500",
        categories: { punctuality: 5, quality: 5, communication: 4, value: 5 },
    },
    {
        id: 3,
        name: "Kiran Adhikari",
        location: "Bhaktapur, Nepal",
        rating: 4,
        date: "1 week ago",
        comment: "Solar panel installation was done nicely. Team was supportive and guided us well.",
        service: "Solar Panel Installation",
        wouldBookAgain: true,
        initials: "KA",
        color: "bg-[#1e3a8a]",
        categories: { punctuality: 4, quality: 4, communication: 5, value: 4 },
    },
];

const breakdown = [
    { stars: 5, pct: 82 },
    { stars: 4, pct: 14 },
    { stars: 3, pct: 3 },
    { stars: 2, pct: 1 },
    { stars: 1, pct: 0 },
];

const keywords = [
    { label: "Professional", count: 96 },
    { label: "Punctual", count: 68 },
    { label: "Quality Work", count: 49 },
    { label: "Polite", count: 38 },
    { label: "Clean Work", count: 32 },
    { label: "Reliable", count: 31 },
];

const categoryLabels: Record<string, string> = {
    punctuality: "Punctuality",
    quality: "Quality",
    communication: "Communication",
    value: "Value",
};

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

function Select({
                    value,
                    onChange,
                    options,
                }: {
    value: string;
    onChange: (v: string) => void;
    options: { label: string; value: string }[];
}) {
    return (
        <div className="relative">
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none rounded-lg border border-gray-200 bg-white py-2 pl-3 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20"
            >
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        </div>
    );
}

export default function ProfileReviews() {
    const [ratingFilter, setRatingFilter] = useState("all");
    const [serviceFilter, setServiceFilter] = useState("all");
    const [sortBy, setSortBy] = useState("recent");
    const [page, setPage] = useState(1);

    const services = useMemo(() => Array.from(new Set(reviews.map((r) => r.service))), []);

    const filtered = useMemo(() => {
        let list = reviews.filter(
            (r) =>
                (ratingFilter === "all" || Math.round(r.rating) === Number(ratingFilter)) &&
                (serviceFilter === "all" || r.service === serviceFilter)
        );
        if (sortBy === "highest") list = [...list].sort((a, b) => b.rating - a.rating);
        if (sortBy === "lowest") list = [...list].sort((a, b) => a.rating - b.rating);
        return list;
    }, [ratingFilter, serviceFilter, sortBy]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-gray-900">Customer Reviews</h2>
                <p className="text-sm text-gray-500">See what your customers say about your service.</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-bold text-gray-900">4.8</span>
                        <div>
                            <StarRating rating={4.8} size={16} />
                            <p className="text-xs text-gray-400">124 reviews</p>
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        {breakdown.map((b) => (
                            <div key={b.stars} className="flex items-center gap-2 text-xs">
                                <span className="w-2.5 text-gray-500">{b.stars}</span>
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                                    <div className="h-full rounded-full bg-[#e8683f]" style={{ width: `${b.pct}%` }} />
                                </div>
                                <span className="w-8 text-right text-gray-500">{b.pct}%</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900">Customer Sentiment</h3>
                    <p className="text-xs text-gray-500">Based on all reviews</p>
                    <div className="mt-4 flex items-center justify-center">
                        <div
                            className="relative h-28 w-28 rounded-full"
                            style={{ background: "conic-gradient(#22c55e 0% 88%, #eab308 88% 98%, #ef4444 98% 100%)" }}
                        >
                            <div className="absolute inset-3 flex items-center justify-center rounded-full bg-white text-sm font-bold text-gray-900">
                                88%
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex justify-center gap-4 text-xs">
            <span className="flex items-center gap-1 text-gray-600">
              <span className="h-2 w-2 rounded-full bg-green-500" /> 88% Positive
            </span>
                        <span className="flex items-center gap-1 text-gray-600">
              <span className="h-2 w-2 rounded-full bg-yellow-500" /> 10% Neutral
            </span>
                        <span className="flex items-center gap-1 text-gray-600">
              <span className="h-2 w-2 rounded-full bg-red-500" /> 2% Negative
            </span>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="font-semibold text-gray-900">Most Mentioned</h3>
                    <p className="text-xs text-gray-500">Top keywords from reviews</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                        {keywords.map((k, i) => (
                            <span
                                key={k.label}
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    i % 2 === 0 ? "bg-green-50 text-green-700" : "bg-orange-50 text-[#e8683f]"
                                }`}
                            >
                {k.label} ({k.count})
              </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-3">
                    <Select
                        value={ratingFilter}
                        onChange={setRatingFilter}
                        options={[
                            { label: "All Ratings", value: "all" },
                            { label: "5 Stars", value: "5" },
                            { label: "4 Stars", value: "4" },
                            { label: "3 Stars", value: "3" },
                        ]}
                    />
                    <Select
                        value={serviceFilter}
                        onChange={setServiceFilter}
                        options={[{ label: "All Services", value: "all" }, ...services.map((s) => ({ label: s, value: s }))]}
                    />
                </div>
                <Select
                    value={sortBy}
                    onChange={setSortBy}
                    options={[
                        { label: "Most Recent", value: "recent" },
                        { label: "Highest Rated", value: "highest" },
                        { label: "Lowest Rated", value: "lowest" },
                    ]}
                />
            </div>

            {/* Review List */}
            <div className="space-y-4">
                {filtered.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                                <div
                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${review.color}`}
                                >
                                    {review.initials}
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-sm font-semibold text-gray-900">{review.name}</span>
                                        <CheckCircle2 className="h-3.5 w-3.5 fill-[#1e3a8a] text-white" />
                                    </div>
                                    <span className="text-xs text-gray-500">{review.location}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1.5">
                                    <StarRating rating={review.rating} />
                                    <span className="text-sm font-semibold text-gray-900">{review.rating.toFixed(1)}</span>
                                </div>
                                <span className="text-xs text-gray-400">{review.date}</span>
                            </div>
                        </div>

                        <p className="mt-3 text-sm text-gray-600">{review.comment}</p>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#1e3a8a]">
                Service: {review.service}
              </span>
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                    review.wouldBookAgain ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                }`}
                            >
                Would book again: {review.wouldBookAgain ? "Yes" : "No"}
              </span>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                            {Object.entries(review.categories).map(([key, value]) => (
                                <div
                                    key={key}
                                    className="flex items-center justify-between rounded-lg bg-gray-50 px-2.5 py-1.5 text-xs"
                                >
                                    <span className="text-gray-500">{categoryLabels[key]}</span>
                                    <span className="flex items-center gap-0.5 font-semibold text-gray-700">
                    {value}
                                        <Star className="h-3 w-3 fill-[#e8683f] text-[#e8683f]" />
                  </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-1.5">
                <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                    <ChevronLeft className="h-4 w-4" />
                </button>
                {[1, 2, 3, 4, 5].map((n) => (
                    <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium ${
                            page === n ? "bg-[#1e3a8a] text-white" : "text-gray-600 hover:bg-gray-50"
                        }`}
                    >
                        {n}
                    </button>
                ))}
                <button
                    onClick={() => setPage((p) => Math.min(5, p + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
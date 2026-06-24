"use client";

import React, { useState, useMemo } from "react";
import { Search, Star, ShieldCheck, Clock, MapPin, CheckCircle2, Plus } from "lucide-react";

const NAVY = "#1e3a8a";
const ORANGE = "#e8683f";

// ---------- Mock data, mirroring the reference screens ----------

const CATEGORIES = ["HVAC", "Electrical", "Cleaning", "Plumbing", "Security", "Pest Control"];

const providers = [
    {
        id: "p1",
        name: "Ram Shrestha",
        category: "HVAC",
        rating: 4.8,
        specializesIn: "Commercial AC Systems",
        responseTime: "Under 1 hour",
        location: "Thamel",
        jobsDone: 142,
        kybVerified: true,
        initial: "RS",
    },
    {
        id: "p2",
        name: "Nepal Electricals",
        category: "Electrical",
        rating: 4.9,
        specializesIn: "High Voltage & Generators",
        responseTime: "Under 30 mins",
        location: "Patan",
        jobsDone: 310,
        kybVerified: true,
        initial: "NE",
    },
    {
        id: "p3",
        name: "Sparkle Cleaning Co.",
        category: "Cleaning",
        rating: 4.5,
        specializesIn: "Deep Cleaning",
        responseTime: "Under 2 hours",
        location: "Boudha",
        jobsDone: 85,
        kybVerified: true,
        initial: "SC",
    },
    {
        id: "p4",
        name: "Cooling Masters",
        category: "HVAC",
        rating: 4.2,
        specializesIn: "Refrigerator Repair",
        responseTime: "Under 2 hours",
        location: "Lazimpat",
        jobsDone: 65,
        kybVerified: true,
        initial: "CM",
    },
    {
        id: "p5",
        name: "Bright Light Electric",
        category: "Electrical",
        rating: 4.1,
        specializesIn: "Wiring",
        responseTime: "Over 4 hours",
        location: "Maharajgunj",
        jobsDone: 45,
        kybVerified: false,
        initial: "BL",
    },
    {
        id: "p6",
        name: "Eco Cleaners",
        category: "Cleaning",
        rating: 4.8,
        specializesIn: "Eco-friendly products",
        responseTime: "Under 1 hour",
        location: "Sanepa",
        jobsDone: 150,
        kybVerified: true,
        initial: "EC",
    },
    {
        id: "p7",
        name: "Purna Plumbing",
        category: "Plumbing",
        rating: 4.6,
        specializesIn: "Pipe Fitting & Leak Repair",
        responseTime: "Under 2 hours",
        location: "Baneshwor",
        jobsDone: 215,
        kybVerified: true,
        initial: "PP",
    },
    {
        id: "p8",
        name: "Gurkha Security Services",
        category: "Security",
        rating: 4.9,
        specializesIn: "Premises Guarding",
        responseTime: "Under 1 hour",
        location: "Naxal",
        jobsDone: 54,
        kybVerified: true,
        initial: "GS",
    },
    {
        id: "p9",
        name: "Kathmandu Pest Control",
        category: "Pest Control",
        rating: 4.3,
        specializesIn: "Termite & Rodent Control",
        responseTime: "Under 3 hours",
        location: "Jawalakhel",
        jobsDone: 120,
        kybVerified: false,
        initial: "KP",
    },
];

export default function DirectoryPage() {
    const [query, setQuery] = useState("");
    const [activeFilters, setActiveFilters] = useState<string[]>(["HVAC", "Electrical", "Cleaning"]);
    const [pool, setPool] = useState<string[]>([]);

    const toggleFilter = (cat: string) => {
        setActiveFilters((prev) => (prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]));
    };

    const clearFilters = () => {
        setActiveFilters([]);
        setQuery("");
    };

    const toggleAddToPool = (id: string) => {
        setPool((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]));
    };

    const filteredProviders = useMemo(() => {
        return providers.filter((p) => {
            const matchesFilter = activeFilters.length === 0 || activeFilters.includes(p.category);
            const q = query.trim().toLowerCase();
            const matchesQuery =
                q === "" ||
                p.name.toLowerCase().includes(q) ||
                p.category.toLowerCase().includes(q) ||
                p.specializesIn.toLowerCase().includes(q);
            return matchesFilter && matchesQuery;
        });
    }, [activeFilters, query]);

    return (
        <main className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-50/40 min-h-screen">

            {/* Search + filters card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
                <div className="relative">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by provider name, category, or specialization..."
                        className="w-full text-slate-800 placeholder-text-slate-400 rounded-xl border border-gray-200 pl-11 pr-4 py-3 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-500 mr-1">Filters:</span>
                    {CATEGORIES.map((cat) => {
                        const active = activeFilters.includes(cat);
                        return (
                            <button
                                key={cat}
                                onClick={() => toggleFilter(cat)}
                                className={`px-3.5 py-1.5 rounded-full text-sm font-bold transition-colors border ${
                                    active
                                        ? "text-white border-transparent"
                                        : "bg-white text-slate-600 border-gray-200 hover:border-slate-300"
                                }`}
                                style={active ? { backgroundColor: NAVY } : undefined}
                            >
                                {cat}
                            </button>
                        );
                    })}
                    <button
                        onClick={clearFilters}
                        className="text-sm font-bold ml-1 hover:underline"
                        style={{ color: ORANGE }}
                    >
                        Clear filters
                    </button>
                </div>
            </div>

            {/* Result count row */}
            <div className="flex items-center justify-between">
                <p className="text-sm text-slate-500 font-medium">Pre-filtered based on your workspace preferences.</p>
                <p className="text-sm text-slate-400 font-medium">Showing {filteredProviders.length} results</p>
            </div>

            {/* Provider cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map((p) => {
                    const inPool = pool.includes(p.id);
                    return (
                        <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-start gap-3">
                                    <div className="w-11 h-11 rounded-full bg-[#1e3a8a]/10 text-[#1e3a8a] flex items-center justify-center font-bold text-sm shrink-0">
                                        {p.initial}
                                    </div>
                                    <div>
                                        <p className="text-base font-bold text-slate-900">{p.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                                {p.category}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs font-bold" style={{ color: ORANGE }}>
                                                <Star size={12} className="fill-current" />
                                                {p.rating}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-600 mt-4">
                                    <span className="text-slate-400 font-medium">Specializes in: </span>
                                    <span className="font-semibold text-slate-800">{p.specializesIn}</span>
                                </p>

                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                            <Clock size={12} />
                                            Response Time
                                        </p>
                                        <p className="text-sm font-bold text-slate-800 mt-0.5">{p.responseTime}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                                            <MapPin size={12} />
                                            Location
                                        </p>
                                        <p className="text-sm font-bold text-slate-800 mt-0.5">{p.location}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-gray-100 mt-4 pt-3 text-xs font-semibold text-slate-500">
                                    <span className="flex items-center gap-1.5">
                                        <ShieldCheck size={14} className="text-slate-400" />
                                        {p.jobsDone} Jobs Done
                                    </span>
                                    {p.kybVerified ? (
                                        <span className="flex items-center gap-1.5" style={{ color: NAVY }}>
                                            <CheckCircle2 size={14} />
                                            KYB Verified
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1.5 text-slate-400">
                                            <ShieldCheck size={14} />
                                            KYB Pending
                                        </span>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={() => toggleAddToPool(p.id)}
                                className={`mt-5 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                                    inPool ? "bg-emerald-600 text-white" : "text-white"
                                }`}
                                style={!inPool ? { backgroundColor: NAVY } : undefined}
                            >
                                {inPool ? (
                                    <>
                                        <CheckCircle2 size={15} />
                                        Added to Pool
                                    </>
                                ) : (
                                    <>
                                        <Plus size={15} />
                                        Add to Pool
                                    </>
                                )}
                            </button>
                        </div>
                    );
                })}

                {filteredProviders.length === 0 && (
                    <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center">
                        <p className="text-sm text-slate-400 font-medium italic">No providers match your search or filters.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
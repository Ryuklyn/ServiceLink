"use client";

import React, { useState } from "react";
import { Search, Upload, X, Star, CheckCircle2 } from "lucide-react";

// Initial mock dataset structured directly from image_364223.png and image_364224.png
const initialProviders = [
    { id: 1, name: "Ram Shrestha", category: "HVAC", rating: 4.8, initial: "RS", jobs: 142, onTime: "98%", status: "Active" },
    { id: 2, name: "Nepal Electricals", category: "Electrical", rating: 4.9, initial: "NE", jobs: 310, onTime: "99%", status: "Active" },
    { id: 3, name: "Sparkle Cleaning Co.", category: "Cleaning", rating: 4.5, initial: "SC", jobs: 85, onTime: "92%", status: "Active" },
    { id: 4, name: "Purna Plumbing", category: "Plumbing", rating: 4.7, initial: "PP", jobs: 215, onTime: "95%", status: "Active" },
    { id: 5, name: "Gurkha Security Services", category: "Security", rating: 4.6, initial: "GS", jobs: 54, onTime: "100%", status: "Active" },
    { id: 6, name: "Cooling Masters", category: "HVAC", rating: 4.2, initial: "CM", jobs: 65, onTime: "88%", status: "Active" },
    { id: 7, name: "Eco Cleaners", category: "Cleaning", rating: 4.8, initial: "EC", jobs: 150, onTime: "97%", status: "Active" },
    { id: 8, name: "SafeGuard Nepal", category: "Security", rating: 4.9, initial: "SN", jobs: 200, onTime: "99%", status: "Active" },
    { id: 9, name: "Bug Busters", category: "Pest Control", rating: 4.5, initial: "BB", jobs: 92, onTime: "94%", status: "Active" },
];

export default function ProviderPoolPage() {
    const [activeTab, setActiveTab] = useState("Active");
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // State filtering management pipeline
    const filteredProviders = initialProviders.filter((p) => {
        const matchesTab = activeTab === "All" || p.status === activeTab;
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTab && matchesSearch;
    });

    return (
        <main className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-50/40 min-h-screen">

            {/* Business Informational Alert Header Banner */}
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm text-slate-600 shadow-sm">
                Showing providers who have enabled business visibility. Providers control their own visibility from their dashboard.
            </div>

            {/* Filter Navigation Control Deck Layout */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">

                {/* Custom Segmented Underline Switch Tab bar */}
                <div className="flex border-b border-gray-200 text-sm font-medium gap-6">
                    {["Active", "Pending Approval", "Declined", "All"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 relative transition-colors ${
                                activeTab === tab ? "text-[#1e3a8a] font-bold" : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e3a8a]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Inline Action Controls Area */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search providers..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a]"
                        />
                    </div>

                    {/* Import CSV Trigger Button */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap"
                    >
                        <Upload size={16} />
                        <span>Import CSV</span>
                    </button>
                </div>
            </div>

            {/* Main Responsive Grid Layout containing Provider Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProviders.map((provider) => (
                    <div key={provider.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            {/* Profile Identity Blocks */}
                            <div className="flex items-start gap-3">
                                <div className="w-11 h-11 rounded-full flex items-center justify-center text-[#1e3a8a] bg-[#1e3a8a]/10 text-sm font-bold shrink-0">
                                    {provider.initial}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">{provider.name}</h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-semibold text-slate-600">
                                            {provider.category}
                                        </span>
                                        <span className="flex items-center gap-0.5 text-xs font-bold text-[#e8683f]">
                                            <Star size={13} fill="currentColor" />
                                            {provider.rating}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Core Technical Metric Segment */}
                            <div className="grid grid-cols-2 border-t border-gray-100 mt-5 pt-4 pb-2">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">Jobs Completed</p>
                                    <p className="text-xl font-bold text-slate-800 mt-1">{provider.jobs}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium">On-time %</p>
                                    <p className="text-xl font-bold text-slate-800 mt-1">{provider.onTime}</p>
                                </div>
                            </div>

                            {/* Verification Badge Section */}
                            <div className="space-y-2 mt-2">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                    <CheckCircle2 size={14} className="text-slate-500" />
                                    <span>Business Verified</span>
                                </div>
                                <span className="inline-block rounded-md border border-slate-900 px-2 py-0.5 text-[11px] font-bold tracking-wide text-slate-900">
                                    KYB Approved
                                </span>
                            </div>
                        </div>

                        {/* Interactive Action Control Line */}
                        <div className="flex items-center gap-3 mt-6 pt-2">
                            <button className="flex-1 py-2 text-center text-sm font-bold border border-slate-900 rounded-lg hover:bg-slate-50 transition-colors text-slate-900">
                                View Profile
                            </button>
                            <button className="px-4 py-2 text-sm font-semibold border border-red-100 text-[#e8683f] rounded-lg hover:bg-red-50/50 transition-colors">
                                Remove
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Portal File Drop Backdrop Overlay Modal Layout (Rendered conditionally from image_364225.png) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl relative animate-in fade-in zoom-in-95 duration-200">

                        {/* Modal Top Row Window Header Bar */}
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
                            <h2 className="text-lg font-bold text-slate-900">Import Providers from CSV</h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-50"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Drag and Drop Container Zone */}
                        <div className="border-2 border-dashed border-slate-200 bg-slate-50/40 hover:bg-slate-50 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3 group transition-colors cursor-pointer">
                            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                                <Upload size={22} className="text-slate-500" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">Drag and drop your CSV file here</p>
                                <p className="text-xs text-slate-400 font-medium mt-1">or click to browse from your computer</p>
                            </div>
                        </div>

                        {/* Modal Action Options Footer Row */}
                        <div className="flex items-center justify-end gap-3 mt-6 pt-2">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl border border-gray-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    alert("CSV processing initialized.");
                                    setIsModalOpen(false);
                                }}
                                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#1e3a8a] hover:bg-[#152a66] transition-colors shadow-sm"
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
"use client";

import { useState } from "react";
import { Eye, ArrowRight } from "lucide-react";
import ProfileOverview from "@/components/dashboard/provider/ProfileOverview";
import ProfilePortfolio from "@/components/dashboard/provider/ProfilePortfolio";
import ProfileReviews from "@/components/dashboard/provider/ProfileReviews";
import ProfileKYC from "@/components/dashboard/provider/ProfileKYC";

type TabKey = "overview" | "portfolio" | "reviews" | "kyc";

const TABS: { key: TabKey; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "portfolio", label: "Portfolio" },
    { key: "reviews", label: "Reviews" },
    { key: "kyc", label: "KYC" },
];

export default function ProviderProfilePage() {
    const [activeTab, setActiveTab] = useState<TabKey>("overview");

    return (
        <div className="min-h-screen bg-[#f9f8f6] px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* Page Header */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Your Public Profile</h1>
                        <p className="mt-1 text-sm text-gray-500">How customers see you on ServiceLink</p>
                    </div>
                    <button
                        type="button"
                        className="flex w-fit items-center justify-center gap-2 rounded-lg border border-[#1e3a8a] px-4 py-2.5 text-sm font-semibold text-[#1e3a8a] transition hover:bg-[#1e3a8a]/5"
                    >
                        <Eye className="h-4 w-4" />
                        Preview as Customer
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="mb-6 flex items-center gap-6 overflow-x-auto border-b border-gray-200">
                    {TABS.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`relative whitespace-nowrap pb-3 text-sm font-medium transition ${
                                activeTab === tab.key ? "text-[#e8683f]" : "text-gray-500 hover:text-gray-700"
                            }`}
                        >
                            {tab.label}
                            {activeTab === tab.key && (
                                <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-[#e8683f]" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === "overview" && <ProfileOverview />}
                    {activeTab === "portfolio" && <ProfilePortfolio />}
                    {activeTab === "reviews" && <ProfileReviews />}
                    {activeTab === "kyc" && <ProfileKYC />}
                </div>
            </div>
        </div>
    );
}
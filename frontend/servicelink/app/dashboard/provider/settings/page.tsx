"use client";

import { useState } from "react";
import { User, Wrench, Clock, Bell, Shield } from "lucide-react";
import AccountTab from "@/components/dashboard/provider/AccountTab";
import ServicesTab from "@/components/dashboard/provider/ServicesTab";
import AvailabilityTab from "@/components/dashboard/provider/AvailabilityTab";
import NotificationTab from "@/components/dashboard/provider/NotificationTab";
import SecurityTab from "@/components/dashboard/provider/SecurityTab";

type TabKey = "account" | "services" | "availability" | "notification" | "security";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
    { key: "account", label: "Account", icon: User },
    { key: "services", label: "Services", icon: Wrench },
    { key: "availability", label: "Availability", icon: Clock },
    { key: "notification", label: "Notification", icon: Bell },
    { key: "security", label: "Security", icon: Shield },
];

export default function ProviderSettingsPage() {
    const [activeTab, setActiveTab] = useState<TabKey>("account");

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[1320px]">
                {/* Header */}
                <div className="mb-5">
                    <h1 className="text-2xl font-semibold text-slate-900">Settings</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Manage your account, services and preferences
                    </p>
                </div>

                {/* Tabs */}
                <div className="mb-6 border-b border-slate-200">
                    <nav className="flex flex-wrap gap-1 sm:gap-2">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.key;
                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`flex items-center gap-2 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                                        isActive
                                            ? "border-[#e8683f] text-[#e8683f]"
                                            : "border-transparent text-slate-500 hover:text-slate-700"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Tab content */}
                <div>
                    {activeTab === "account" && <AccountTab />}
                    {activeTab === "services" && <ServicesTab />}
                    {activeTab === "availability" && <AvailabilityTab />}
                    {activeTab === "notification" && <NotificationTab />}
                    {activeTab === "security" && <SecurityTab />}
                </div>
            </div>
        </div>
    );
}
"use client";

import { useState } from "react";
import { Bell, CreditCard, Star, Info, Megaphone } from "lucide-react";

type CategoryRow = {
    key: string;
    label: string;
    description: string;
    icon: typeof Bell;
    enabled: boolean;
};

const INITIAL_CATEGORIES: CategoryRow[] = [
    {
        key: "bookings",
        label: "Bookings",
        description: "New requests, confirmations, reschedules, cancellations & reminders",
        icon: Bell,
        enabled: true,
    },
    {
        key: "payments",
        label: "Payments",
        description: "Late reschedule/cancellation fines, and payments from Business & Pro bookings",
        icon: CreditCard,
        enabled: true,
    },
    {
        key: "reviews",
        label: "Reviews",
        description: "New customer reviews and ratings",
        icon: Star,
        enabled: true,
    },
    {
        key: "general",
        label: "General",
        description: "Platform updates and important announcements",
        icon: Info,
        enabled: true,
    },
    {
        key: "marketing",
        label: "Marketing",
        description: "Offers, tips and promotional updates",
        icon: Megaphone,
        enabled: false,
    },
];

/** Shared toggle switch — consistent across the whole settings module */
function ToggleSwitch({
                          checked,
                          onChange,
                          disabled = false,
                      }: {
    checked: boolean;
    onChange: () => void;
    disabled?: boolean;
}) {
    return (
        <button
            type="button"
            onClick={onChange}
            disabled={disabled}
            aria-pressed={checked}
            className={`relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/40 disabled:cursor-not-allowed disabled:opacity-50 ${
                checked ? "bg-[#1e3a8a]" : "bg-slate-200"
            }`}
        >
            <span
                className={`block h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                    checked ? "translate-x-5" : "translate-x-0"
                }`}
            />
        </button>
    );
}

export default function NotificationTab() {
    const [categories, setCategories] = useState<CategoryRow[]>(INITIAL_CATEGORIES);
    const [quietHours, setQuietHours] = useState(true);
    const [digest, setDigest] = useState(true);
    const [from, setFrom] = useState("22:00");
    const [to, setTo] = useState("07:00");
    const [frequency, setFrequency] = useState("Daily");

    const toggleCategory = (key: string) => {
        setCategories((prev) =>
            prev.map((c) => (c.key === key ? { ...c, enabled: !c.enabled } : c))
        );
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
                {/* Notifications — one toggle per category, no sub-items */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-1 text-sm font-semibold text-slate-900">
                        Notifications
                    </h3>
                    <p className="mb-4 text-xs text-slate-400">
                        Choose which types of notifications you want to receive.
                    </p>

                    <div className="divide-y divide-slate-100">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <div key={cat.key} className="flex items-center justify-between gap-4 py-4">
                                    <div className="flex items-start gap-3">
                                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#1e3a8a]/5 text-[#1e3a8a]">
                                            <Icon className="h-4 w-4" />
                                        </span>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">
                                                {cat.label}
                                            </p>
                                            <p className="mt-0.5 text-xs text-slate-400">
                                                {cat.description}
                                            </p>
                                        </div>
                                    </div>
                                    <ToggleSwitch
                                        checked={cat.enabled}
                                        onChange={() => toggleCategory(cat.key)}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right sidebar: quiet hours + digest */}
                <div className="space-y-5">
                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900">
                                Quiet Hours
                            </h3>
                            <ToggleSwitch
                                checked={quietHours}
                                onChange={() => setQuietHours(!quietHours)}
                            />
                        </div>
                        <p className="mb-4 text-xs text-slate-400">
                            Pause non-urgent notifications during these hours.
                        </p>

                        <div className="space-y-3">
                            <div>
                                <p className="mb-1 text-xs text-slate-500">From</p>
                                <input
                                    type="time"
                                    value={from}
                                    onChange={(e) => setFrom(e.target.value)}
                                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-[#1e3a8a]"
                                />
                            </div>
                            <div>
                                <p className="mb-1 text-xs text-slate-500">To</p>
                                <input
                                    type="time"
                                    value={to}
                                    onChange={(e) => setTo(e.target.value)}
                                    className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-[#1e3a8a]"
                                />
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-slate-400">
                            You will still receive important alerts.
                        </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900">
                                Notification Digest
                            </h3>
                            <ToggleSwitch
                                checked={digest}
                                onChange={() => setDigest(!digest)}
                            />
                        </div>
                        <p className="mb-3 text-xs text-slate-400">
                            Receive a periodic summary instead of individual alerts.
                        </p>
                        <p className="mb-1 text-xs text-slate-500">Frequency</p>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value)}
                            className="w-full rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-[#1e3a8a]"
                        >
                            <option>Daily</option>
                            <option>Weekly</option>
                            <option>Never</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Footer actions */}
            <div className="flex flex-wrap gap-3">
                <button className="rounded-lg bg-[#e8683f] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#d95c34]">
                    Save Changes
                </button>
                <button className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-[#1e3a8a] hover:bg-slate-50">
                    Reset to Default
                </button>
            </div>
        </div>
    );
}
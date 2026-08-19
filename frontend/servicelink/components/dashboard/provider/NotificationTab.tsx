"use client";

import { useState } from "react";
import { Bell, CreditCard, Star, Info, Megaphone } from "lucide-react";

type NotificationRow = {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
};

const CATEGORIES = [
    { key: "bookings", label: "Bookings", desc: "Stay updated on booking activities", icon: Bell, active: true },
    { key: "payments", label: "Payments", desc: "Receive payment and payout alerts", icon: CreditCard, active: false },
    { key: "reviews", label: "Reviews", desc: "Get notified about customer reviews", icon: Star, active: false },
    { key: "general", label: "General", desc: "Important updates and announcements", icon: Info, active: false },
    { key: "marketing", label: "Marketing", desc: "Offers, tips and promotional updates", icon: Megaphone, active: false },
];

const INITIAL_ROWS: NotificationRow[] = [
    {
        id: "new_request",
        title: "New Booking Request",
        description: "When a customer sends a new booking request",
        enabled: true,
    },
    {
        id: "confirmed",
        title: "Booking Confirmed",
        description: "When a booking is confirmed",
        enabled: true,
    },
    {
        id: "rescheduled",
        title: "Booking Rescheduled",
        description: "When a booking is rescheduled",
        enabled: true,
    },
    {
        id: "cancelled",
        title: "Booking Cancelled",
        description: "When a booking is cancelled",
        enabled: true,
    },
    {
        id: "reminder",
        title: "Reminder Before Booking",
        description: "Get reminder before scheduled booking",
        enabled: true,
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
    const [rows, setRows] = useState<NotificationRow[]>(INITIAL_ROWS);
    const [quietHours, setQuietHours] = useState(true);
    const [digest, setDigest] = useState(true);
    const [from, setFrom] = useState("22:00");
    const [to, setTo] = useState("07:00");
    const [frequency, setFrequency] = useState("Daily");

    const toggleRow = (id: string) => {
        setRows((prev) =>
            prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
        );
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr_280px]">
                {/* Categories sidebar */}
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                    <h3 className="mb-3 text-sm font-semibold text-slate-900">
                        Notification Categories
                    </h3>
                    <div className="space-y-1">
                        {CATEGORIES.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.key}
                                    className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                                        cat.active ? "bg-[#1e3a8a]/5" : "hover:bg-slate-50"
                                    }`}
                                >
                                    <span
                                        className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                                            cat.active
                                                ? "bg-[#1e3a8a]/10 text-[#1e3a8a]"
                                                : "bg-slate-100 text-slate-400"
                                        }`}
                                    >
                                        <Icon className="h-3.5 w-3.5" />
                                    </span>
                                    <span>
                                        <p
                                            className={`text-sm font-medium ${
                                                cat.active ? "text-[#1e3a8a]" : "text-slate-700"
                                            }`}
                                        >
                                            {cat.label}
                                        </p>
                                        <p className="text-xs text-slate-400">{cat.desc}</p>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Booking notifications — single on/off toggle per notification */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-slate-900">
                        Booking Notifications
                    </h3>

                    <div className="divide-y divide-slate-100">
                        {rows.map((row) => (
                            <div key={row.id} className="flex items-center justify-between gap-4 py-4">
                                <div>
                                    <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
                                        <Bell className="h-3.5 w-3.5 text-[#1e3a8a]" />
                                        {row.title}
                                    </p>
                                    <p className="mt-0.5 pl-5 text-xs text-slate-400">
                                        {row.description}
                                    </p>
                                </div>
                                <ToggleSwitch
                                    checked={row.enabled}
                                    onChange={() => toggleRow(row.id)}
                                />
                            </div>
                        ))}
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
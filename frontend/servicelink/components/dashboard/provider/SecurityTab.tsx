"use client";

import { useState } from "react";
import {
    Mail,
    Smartphone,
    MoreVertical,
    Monitor,
    Laptop,
    ShieldAlert,
    FileText,
    LogOut,
    ShieldCheck,
    Info,
    ChevronRight,
} from "lucide-react";

type LoginHistoryItem = {
    device: string;
    type: string;
    location: string;
    time: string;
    status: "Success" | "Failed";
};

const LOGIN_HISTORY: LoginHistoryItem[] = [
    {
        device: "Windows",
        type: "Chrome",
        location: "Kathmandu, Nepal",
        time: "Today, 10:24 AM",
        status: "Success",
    },
    {
        device: "Android",
        type: "Mobile App",
        location: "Kathmandu, Nepal",
        time: "Yesterday, 8:15 PM",
        status: "Success",
    },
    {
        device: "Windows",
        type: "Chrome",
        location: "Lalitpur, Nepal",
        time: "May 12, 2024, 11:05 AM",
        status: "Success",
    },
];

type Session = {
    name: string;
    location: string;
    lastActive: string;
    isThisDevice?: boolean;
};

const SESSIONS: Session[] = [
    { name: "Chrome on Windows", location: "Kathmandu, Nepal", lastActive: "", isThisDevice: true },
    { name: "Samsung Galaxy A52", location: "Kathmandu, Nepal", lastActive: "2 days ago" },
    { name: "iPhone 13", location: "Lalitpur, Nepal", lastActive: "5 days ago" },
];

type AlertKey = "newDevice" | "newLocation" | "recovery" | "profileChanges";

/** Shared toggle switch — consistent across the whole settings module */
function ToggleSwitch({
                          checked,
                          onChange,
                      }: {
    checked: boolean;
    onChange: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onChange}
            aria-pressed={checked}
            className={`relative h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a8a]/40 ${
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

export default function SecurityTab() {
    const [alerts, setAlerts] = useState<Record<AlertKey, boolean>>({
        newDevice: true,
        newLocation: true,
        recovery: true,
        profileChanges: true,
    });

    const toggleAlert = (key: AlertKey) => {
        setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Login & Verification */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900">
                        Login &amp; Verification
                    </h3>
                    <p className="mb-4 mt-0.5 text-xs text-slate-400">
                        We use One-Time Passwords (OTP) to keep your account secure.
                    </p>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
                            <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                  <Mail className="h-4 w-4" />
                </span>
                                <div>
                                    <p className="text-sm font-medium text-slate-800">
                                        Email OTP
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Receive OTP on your registered email
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">bhu****@gmail.com</p>
                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                    Verified
                  </span>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600">
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
                            <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-500">
                  <Smartphone className="h-4 w-4" />
                </span>
                                <div>
                                    <p className="text-sm font-medium text-slate-800">
                                        Phone OTP
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        Receive OTP on your registered mobile number
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">+977 98******21</p>
                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                    Verified
                  </span>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600">
                                    <MoreVertical className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <button className="mt-4 text-sm font-medium text-[#1e3a8a] hover:underline">
                        + Add Another Contact
                    </button>
                </div>

                {/* Login History */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900">
                        Login History
                    </h3>
                    <p className="mb-4 mt-0.5 text-xs text-slate-400">
                        Review your recent login activity.
                    </p>

                    <div className="space-y-3">
                        {LOGIN_HISTORY.map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3"
                            >
                                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    {item.device === "Windows" ? (
                        <Monitor className="h-4 w-4" />
                    ) : (
                        <Smartphone className="h-4 w-4" />
                    )}
                  </span>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">
                                            {item.device} • {item.type}
                                        </p>
                                        <p className="text-xs text-slate-400">{item.location}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs text-slate-500">{item.time}</p>
                                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                    {item.status}
                  </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-4 text-sm font-medium text-[#1e3a8a] hover:underline">
                        View All History
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Active Sessions */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900">
                        Active Sessions
                    </h3>
                    <p className="mb-4 mt-0.5 text-xs text-slate-400">
                        Manage devices where you&apos;re currently signed in.
                    </p>

                    <div className="space-y-3">
                        {SESSIONS.map((session, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3"
                            >
                                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    {session.name.includes("Chrome") ? (
                        <Laptop className="h-4 w-4" />
                    ) : (
                        <Smartphone className="h-4 w-4" />
                    )}
                  </span>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">
                                            {session.name}
                                        </p>
                                        <p className="text-xs text-slate-400">{session.location}</p>
                                    </div>
                                </div>
                                {session.isThisDevice ? (
                                    <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                    This Device
                  </span>
                                ) : (
                                    <span className="shrink-0 text-xs text-slate-400">
                    {session.lastActive}
                  </span>
                                )}
                            </div>
                        ))}
                    </div>

                    <button className="mt-4 w-full rounded-lg border border-red-200 py-2 text-sm font-medium text-red-500 hover:bg-red-50">
                        Logout All Devices
                    </button>
                </div>

                {/* Security Alerts */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900">
                        Security Alerts
                    </h3>
                    <p className="mb-4 mt-0.5 text-xs text-slate-400">
                        Get notified about important security events.
                    </p>

                    <div className="space-y-4">
                        {[
                            { key: "newDevice" as AlertKey, label: "New device login", desc: "Notify when a new device logs in" },
                            { key: "newLocation" as AlertKey, label: "New location login", desc: "Notify when login occurs from a new location" },
                            { key: "recovery" as AlertKey, label: "Account recovery", desc: "Notify when account recovery is attempted" },
                            { key: "profileChanges" as AlertKey, label: "Profile changes", desc: "Notify when important profile changes" },
                        ].map((alert) => (
                            <div key={alert.key} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
                    <ShieldAlert className="h-3.5 w-3.5" />
                  </span>
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">
                                            {alert.label}
                                        </p>
                                        <p className="text-xs text-slate-400">{alert.desc}</p>
                                    </div>
                                </div>
                                <ToggleSwitch
                                    checked={alerts[alert.key]}
                                    onChange={() => toggleAlert(alert.key)}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Account Security Tips */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-semibold text-slate-900">
                        Account Security Tips
                    </h3>

                    <div className="space-y-1">
                        <button className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-3 text-left hover:bg-slate-50">
              <span className="flex items-center gap-3">
                <FileText className="h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  <p className="text-sm font-medium text-slate-800">
                    Keep your contact information up to date
                  </p>
                  <p className="text-xs text-slate-400">
                    This helps us reach you if needed.
                  </p>
                </span>
              </span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                        </button>

                        <button className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-3 text-left hover:bg-slate-50">
              <span className="flex items-center gap-3">
                <LogOut className="h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  <p className="text-sm font-medium text-slate-800">
                    Log out from unused devices
                  </p>
                  <p className="text-xs text-slate-400">
                    Review and remove old sessions.
                  </p>
                </span>
              </span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                        </button>

                        <button className="flex w-full items-center justify-between gap-3 rounded-lg px-2 py-3 text-left hover:bg-slate-50">
              <span className="flex items-center gap-3">
                <ShieldCheck className="h-4 w-4 shrink-0 text-slate-400" />
                <span>
                  <p className="text-sm font-medium text-slate-800">
                    Never share your OTP
                  </p>
                  <p className="text-xs text-slate-400">
                    Our team will never ask for your OTP.
                  </p>
                </span>
              </span>
                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                        </button>
                    </div>

                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3">
                        <span className="text-amber-500">💡</span>
                        <p className="text-xs text-amber-700">
                            Tip: Keeping your account secure helps protect your bookings,
                            earnings and personal information.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer notice */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <Info className="h-4 w-4 shrink-0 text-[#1e3a8a]" />
                <p className="text-sm text-slate-500">
                    We&apos;ll always use OTP for login and important actions to keep
                    your account safe and password-free.
                </p>
            </div>
        </div>
    );
}
"use client";

import { useState, useEffect } from "react";
import {
    Mail,
    Smartphone,
    Monitor,
    Laptop,
    ShieldAlert,
    Info,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/authApi";
import { clearUser } from "@/store/slices/userSlice";
import { clearProviderProfile, fetchProviderProfile } from "@/store/slices/providerProfileSlice";
import { resetToOtp } from "@/store/slices/authFlowSlice";

type LoginHistoryItem = {
    device: string;
    type: string;
    location: string;
    time: string;
    status: "Success" | "Failed";
};

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
    const dispatch = useAppDispatch();
    const router = useRouter();
    const profile = useAppSelector((s) => s.providerProfile.data);

    const [alerts, setAlerts] = useState<Record<AlertKey, boolean>>({
        newDevice: true,
        newLocation: true,
        recovery: true,
        profileChanges: true,
    });

    const [sessionInfo, setSessionInfo] = useState({
        name: "Chrome on Windows",
        location: "Kathmandu, Nepal",
        isThisDevice: true
    });

    const [loginHistory, setLoginHistory] = useState<LoginHistoryItem[]>([]);
    const [showHistoryModal, setShowHistoryModal] = useState(false);

    // Load profile on mount if missing
    useEffect(() => {
        if (!profile) {
            dispatch(fetchProviderProfile());
        }
    }, [dispatch, profile]);

    // Load alerts and login history from localStorage
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedAlerts = localStorage.getItem("servicelink:provider:security-alerts");
            if (savedAlerts) {
                try {
                    setAlerts(JSON.parse(savedAlerts));
                } catch (e) {
                    console.error(e);
                }
            }

            const savedHistory = localStorage.getItem("servicelink:provider:login-history");
            let historyList: LoginHistoryItem[] = [];
            if (savedHistory) {
                try {
                    historyList = JSON.parse(savedHistory);
                } catch (e) {
                    console.error(e);
                }
            }
            if (historyList.length === 0) {
                historyList = [
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
                localStorage.setItem("servicelink:provider:login-history", JSON.stringify(historyList));
            }
            setLoginHistory(historyList);
        }
    }, []);

    // Detect browser / OS session info
    useEffect(() => {
        if (typeof window !== "undefined") {
            const ua = navigator.userAgent;
            let browser = "Chrome";
            let os = "Windows";

            if (ua.includes("Firefox")) {
                browser = "Firefox";
            } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
                browser = "Safari";
            } else if (ua.includes("Edg")) {
                browser = "Edge";
            }

            if (ua.includes("Macintosh") || ua.includes("Mac OS")) {
                os = "macOS";
            } else if (ua.includes("Linux")) {
                os = "Linux";
            } else if (ua.includes("Android")) {
                os = "Android";
            } else if (ua.includes("iPhone") || ua.includes("iPad")) {
                os = "iOS";
            }

            setSessionInfo({
                name: `${browser} on ${os}`,
                location: "Kathmandu, Nepal",
                isThisDevice: true
            });
        }
    }, []);

    const toggleAlert = (key: AlertKey) => {
        setAlerts((prev) => {
            const updated = { ...prev, [key]: !prev[key] };
            localStorage.setItem("servicelink:provider:security-alerts", JSON.stringify(updated));
            return updated;
        });
    };

    const handleLogoutAll = async () => {
        try {
            await logout();
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            dispatch(clearUser());
            dispatch(clearProviderProfile());
            dispatch(resetToOtp());
            router.push("/login/provider");
        } catch (e) {
            console.error("Logout failed", e);
        }
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
                        We use One-Time Passwords (OTP) and PINs to keep your account secure.
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
                            <div className="text-right">
                                <p className="text-xs text-slate-500">{profile?.email || "Loading..."}</p>
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                                    Verified
                                </span>
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
                            <div className="text-right">
                                <p className="text-xs text-slate-500">{profile?.phone || "Loading..."}</p>
                                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                                    Verified
                                </span>
                            </div>
                        </div>
                    </div>
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
                        {loginHistory.slice(0, 3).map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                        {item.device === "Windows" || item.device === "macOS" || item.device === "Linux" ? (
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

                    <button 
                        onClick={() => setShowHistoryModal(true)}
                        className="mt-4 text-sm font-medium text-[#1e3a8a] hover:underline"
                    >
                        View All History
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Active Sessions */}
                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900">
                        Active Sessions
                    </h3>
                    <p className="mb-4 mt-0.5 text-xs text-slate-400">
                        Manage devices where you&apos;re currently signed in.
                    </p>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
                            <div className="flex items-center gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                    {sessionInfo.name.includes("Chrome") ? (
                                        <Laptop className="h-4 w-4" />
                                    ) : (
                                        <Smartphone className="h-4 w-4" />
                                    )}
                                </span>
                                <div>
                                    <p className="text-sm font-medium text-slate-800">
                                        {sessionInfo.name}
                                    </p>
                                    <p className="text-xs text-slate-400">{sessionInfo.location}</p>
                                </div>
                            </div>
                            <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                                This Device (Active)
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogoutAll}
                        className="mt-4 w-full rounded-lg border border-red-200 py-2 text-sm font-medium text-red-500 hover:bg-red-50"
                    >
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
            </div>

            {/* Footer notice */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <Info className="h-4 w-4 shrink-0 text-[#1e3a8a]" />
                <p className="text-sm text-slate-500">
                    We&apos;ll always use OTP and PIN verification for login and important actions to keep
                    your account safe and password-free.
                </p>
            </div>

            {/* View History Modal */}
            {showHistoryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="text-base font-bold text-slate-900">Full Login History</h3>
                            <button 
                                onClick={() => setShowHistoryModal(false)} 
                                className="text-slate-400 hover:text-slate-600 text-2xl font-semibold leading-none"
                            >
                                &times;
                            </button>
                        </div>
                        <div className="px-6 py-4 max-h-[400px] overflow-y-auto space-y-3">
                            {loginHistory.map((item, i) => (
                                <div key={i} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                            {item.device === "Windows" || item.device === "macOS" || item.device === "Linux" ? (
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
                        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button 
                                onClick={() => setShowHistoryModal(false)} 
                                className="rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 text-sm font-medium transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

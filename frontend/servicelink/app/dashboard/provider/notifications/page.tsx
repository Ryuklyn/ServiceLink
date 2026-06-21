"use client";

import { useState } from "react";
import {
    Bell,
    CalendarCheck,
    AlertTriangle,
    Star,
    CheckCircle2,
    Info,
} from "lucide-react";

type Tab = "booking" | "platform";

interface Notification {
    id: string;
    type: "booking" | "platform";
    icon: "calendar" | "alert" | "star" | "check" | "info";
    iconBg: string;
    message: string;
    time: string;
    unread: boolean;
}

const notifications: Notification[] = [
    {
        id: "1",
        type: "booking",
        icon: "alert",
        iconBg: "#1e3a8a",
        message: "New job request from Sita Sharma for AC Repair — respond within 30 min.",
        time: "3 min ago",
        unread: true,
    },
    {
        id: "2",
        type: "booking",
        icon: "calendar",
        iconBg: "#e8683f",
        message: "Your quote for booking SL-2026-1042 has been accepted by the customer.",
        time: "12 min ago",
        unread: true,
    },
    {
        id: "3",
        type: "booking",
        icon: "alert",
        iconBg: "#1e3a8a",
        message: "Reminder: Pipe Repair job at Baneshwor starts in 30 minutes.",
        time: "1 hr ago",
        unread: false,
    },
    {
        id: "4",
        type: "booking",
        icon: "check",
        iconBg: "#16a34a",
        message: "Payment of NPR 2,400 received for Electrical Wiring (SL-2026-1036).",
        time: "3 hrs ago",
        unread: false,
    },
    {
        id: "5",
        type: "booking",
        icon: "star",
        iconBg: "#1e3a8a",
        message: "Anish Gurung left you a 5-star review: \"Quick and professional!\"",
        time: "1 day ago",
        unread: false,
    },
    {
        id: "6",
        type: "booking",
        icon: "calendar",
        iconBg: "#e8683f",
        message: "Booking SL-2026-1029 has been marked complete and closed.",
        time: "6 days ago",
        unread: false,
    },
    {
        id: "7",
        type: "platform",
        icon: "info",
        iconBg: "#e8683f",
        message: "ServiceLink now offers instant payouts to eSewa and Khalti for completed jobs.",
        time: "3 days ago",
        unread: false,
    },
    {
        id: "8",
        type: "platform",
        icon: "info",
        iconBg: "#e8683f",
        message: "Provider verification badge updated — your documents have been approved.",
        time: "1 week ago",
        unread: false,
    },
];

const IconComponent = ({
                           icon,
                           bg,
                       }: {
    icon: Notification["icon"];
    bg: string;
}) => {
    const iconMap = {
        calendar: <CalendarCheck className="w-5 h-5 text-white" />,
        alert: <AlertTriangle className="w-5 h-5 text-white" />,
        star: <Star className="w-5 h-5 text-white" />,
        check: <CheckCircle2 className="w-5 h-5 text-white" />,
        info: <Info className="w-5 h-5 text-white" />,
    };

    return (
        <div
            className="w-11 h-11 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: bg }}
        >
            {iconMap[icon]}
        </div>
    );
};

export default function ProviderNotificationsPage() {
    const [activeTab, setActiveTab] = useState<Tab>("booking");
    const [notifs, setNotifs] = useState<Notification[]>(notifications);

    const bookingUnread = notifs.filter(
        (n) => n.type === "booking" && n.unread,
    ).length;

    const platformUnread = notifs.filter(
        (n) => n.type === "platform" && n.unread,
    ).length;

    const filtered = notifs.filter((n) => n.type === activeTab);

    const markAllRead = () => {
        setNotifs((prev) =>
            prev.map((n) => (n.type === activeTab ? { ...n, unread: false } : n)),
        );
    };

    const markOneRead = (id: string) => {
        setNotifs((prev) =>
            prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
        );
    };

    const currentUnread =
        activeTab === "booking" ? bookingUnread : platformUnread;

    return (
        <div>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
                </div>
                {currentUnread > 0 && (
                    <button
                        onClick={markAllRead}
                        className="px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Mark All Read
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab("booking")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === "booking"
                            ? "bg-[#e8683f] text-white"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                >
                    Job Requests
                    {bookingUnread > 0 && (
                        <span className="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center bg-[#1e3a8a] text-white">
              {bookingUnread}
            </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab("platform")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                        activeTab === "platform"
                            ? "bg-[#e8683f] text-white"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                >
                    Platform Updates
                    {platformUnread > 0 && (
                        <span className="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center bg-[#1e3a8a] text-white">
              {platformUnread}
            </span>
                    )}
                </button>
            </div>

            {/* Notification List */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Bell className="w-10 h-10 mb-3 opacity-30" />
                        <p className="text-sm">No notifications here</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-50">
                        {filtered.map((notif) => (
                            <li
                                key={notif.id}
                                onClick={() => markOneRead(notif.id)}
                                className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors ${
                                    notif.unread
                                        ? "bg-[#e8683f]/5 hover:bg-[#e8683f]/10"
                                        : "hover:bg-gray-50"
                                }`}
                            >
                                <IconComponent icon={notif.icon} bg={notif.iconBg} />

                                <div className="flex-1 min-w-0">
                                    <p
                                        className={`text-sm leading-snug ${
                                            notif.unread
                                                ? "font-semibold text-gray-900"
                                                : "font-normal text-gray-600"
                                        }`}
                                    >
                                        {notif.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-0.5">{notif.time}</p>
                                </div>

                                {/* Unread dot */}
                                {notif.unread && (
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a8a] shrink-0" />
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
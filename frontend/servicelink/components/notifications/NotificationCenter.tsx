"use client";

import { Bell, CalendarDays, Megaphone, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type NotificationItem,
} from "@/store/slices/notificationSlice";
import { formatRelativeTime } from "@/utils/notificationDisplay";

type NotificationTab = "booking" | "platform" | "security";

const tabs: Array<{ id: NotificationTab; label: string; icon: typeof Bell }> = [
  { id: "booking", label: "Booking", icon: CalendarDays },
  { id: "platform", label: "Platform", icon: Megaphone },
  { id: "security", label: "Security", icon: ShieldCheck },
];

function getNotificationTab(item: NotificationItem): NotificationTab {
  const searchableText = `${item.title} ${item.message}`.toLowerCase();
  const isSecurityMessage = /security|password|login|sign[ -]?in|session|device|verification|suspicious|account/.test(searchableText);

  if (item.category === "BOOKING") return "booking";
  if (item.category === "SYSTEM" || item.category === "COMPLIANCE" || isSecurityMessage) return "security";
  return "platform";
}

export default function NotificationCenter() {
  const dispatch = useAppDispatch();
  const { items, loading, unreadCount } = useAppSelector((state) => state.notifications);
  const [activeTab, setActiveTab] = useState<NotificationTab>("booking");

  useEffect(() => {
    void dispatch(fetchNotifications({ page: 0, size: 50 }));
  }, [dispatch]);

  const tabCounts = useMemo(() => items.reduce<Record<NotificationTab, number>>((counts, item) => {
    counts[getNotificationTab(item)] += 1;
    return counts;
  }, { booking: 0, platform: 0, security: 0 }), [items]);

  const visibleItems = useMemo(
    () => items.filter((item) => getNotificationTab(item) === activeTab),
    [activeTab, items],
  );

  const openNotification = (item: NotificationItem) => {
    if (!item.isRead) void dispatch(markNotificationAsRead(item.id));
    if (item.actionUrl) window.location.assign(item.actionUrl);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-500">Booking, platform, and security updates for your account.</p>
        </div>
        <button
          type="button"
          onClick={() => void dispatch(markAllNotificationsAsRead())}
          disabled={unreadCount === 0}
          className="self-start px-4 py-2 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:self-auto"
        >
          Mark all as read
        </button>
      </div>

      <div className="mb-4 flex gap-1 overflow-x-auto rounded-xl border border-slate-200 bg-white p-1" role="tablist" aria-label="Notification categories">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={`flex min-w-max flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${activeTab === id ? "bg-[#1e3a8a] text-white shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
          >
            <Icon size={16} />
            {label}
            <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeTab === id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
              {tabCounts[id]}
            </span>
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
        {loading ? (
          <p className="p-8 text-slate-500">Loading notifications…</p>
        ) : visibleItems.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Bell className="mx-auto mb-3" />
            <p>No {activeTab} notifications.</p>
          </div>
        ) : visibleItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openNotification(item)}
            className={`w-full text-left p-4 flex gap-4 hover:bg-slate-50 ${!item.isRead ? "bg-blue-50/50" : ""}`}
          >
            <span className={`mt-2 h-2.5 w-2.5 rounded-full shrink-0 ${item.isRead ? "bg-transparent" : "bg-[#e8683f]"}`} />
            <span className="flex-1 min-w-0">
              <span className="flex justify-between gap-3">
                <b className="text-sm text-slate-800">{item.title}</b>
                <time className="text-xs text-slate-400 whitespace-nowrap">{formatRelativeTime(item.createdAt)}</time>
              </span>
              <span className="block mt-1 text-sm text-slate-600">{item.message}</span>
              <span className="inline-block mt-2 text-[10px] font-bold tracking-wider text-slate-400">{item.category.replace("_", " ")}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

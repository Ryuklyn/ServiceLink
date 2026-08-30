"use client";
import { Bell } from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchNotifications, markAllNotificationsAsRead, markNotificationAsRead } from "@/store/slices/notificationSlice";
import { formatRelativeTime } from "@/utils/notificationDisplay";

export default function NotificationCenter() {
  const dispatch = useAppDispatch();
  const { items, loading, unreadCount } = useAppSelector((state) => state.notifications);
  useEffect(() => { void dispatch(fetchNotifications({ page: 0, size: 50 })); }, [dispatch]);
  return <div className="max-w-4xl mx-auto">
    <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold text-slate-900">Notifications</h1><p className="text-sm text-slate-500">Booking, platform and operational updates for your account.</p></div>
      {unreadCount > 0 && <button onClick={() => void dispatch(markAllNotificationsAsRead())} className="px-4 py-2 rounded-lg border text-sm font-semibold hover:bg-slate-50">Mark all read</button>}</div>
    <div className="bg-white rounded-xl border border-slate-200 divide-y">
      {loading ? <p className="p-8 text-slate-500">Loading notifications…</p> : items.length === 0 ? <div className="p-12 text-center text-slate-400"><Bell className="mx-auto mb-3" /><p>You’re all caught up.</p></div> : items.map((item) => <button key={item.id} onClick={() => { if (!item.isRead) void dispatch(markNotificationAsRead(item.id)); if (item.actionUrl) window.location.assign(item.actionUrl); }} className={`w-full text-left p-4 flex gap-4 hover:bg-slate-50 ${!item.isRead ? "bg-blue-50/50" : ""}`}>
        <span className={`mt-2 h-2.5 w-2.5 rounded-full shrink-0 ${item.isRead ? "bg-transparent" : "bg-[#e8683f]"}`} /><span className="flex-1"><span className="flex justify-between gap-3"><b className="text-sm text-slate-800">{item.title}</b><time className="text-xs text-slate-400 whitespace-nowrap">{formatRelativeTime(item.createdAt)}</time></span><span className="block mt-1 text-sm text-slate-600">{item.message}</span><span className="inline-block mt-2 text-[10px] font-bold tracking-wider text-slate-400">{item.category.replace("_", " ")}</span></span>
      </button>)}</div>
  </div>;
}

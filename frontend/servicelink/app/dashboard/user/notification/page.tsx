"use client";

import {
  Bell,
  CalendarCheck,
  AlertTriangle,
  Star,
  CheckCircle2,
  Info,
} from "lucide-react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/store/slices/notificationSlice";
import { inferTab, inferIcon, formatRelativeTime, type NotifIconKey } from "@/utils/notificationDisplay";
import { useState } from "react";

type Tab = "booking" | "platform";

const IconComponent = ({ icon, bg }: { icon: NotifIconKey; bg: string }) => {
  const iconMap = {
    calendar: <CalendarCheck className="w-5 h-5 text-white" />,
    alert: <AlertTriangle className="w-5 h-5 text-white" />,
    star: <Star className="w-5 h-5 text-white" />,
    check: <CheckCircle2 className="w-5 h-5 text-white" />,
    info: <Info className="w-5 h-5 text-white" />,
  };
  return (
      <div className="w-11 h-11 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: bg }}>
        {iconMap[icon]}
      </div>
  );
};

export default function NotificationsPage() {
  const dispatch = useAppDispatch();
  const { data: user } = useAppSelector((state) => state.user);
  const { items, loading } = useAppSelector((state) => state.notifications);

  const [activeTab, setActiveTab] = useState<Tab>("booking");

  const recipientId = user?.id;
  const role = "CUSTOMER";

  useEffect(() => {
    if (recipientId) {
      dispatch(fetchNotifications({ recipientId, role, page: 0, size: 20 }));
    }
  }, [recipientId, dispatch]);

  const withTab = items.map((n) => ({ ...n, tab: inferTab(n) }));
  const bookingUnread = withTab.filter((n) => n.tab === "booking" && !n.isRead).length;
  const platformUnread = withTab.filter((n) => n.tab === "platform" && !n.isRead).length;
  const filtered = withTab.filter((n) => n.tab === activeTab);
  const currentUnread = activeTab === "booking" ? bookingUnread : platformUnread;

  const markAllRead = () => {
    if (recipientId) dispatch(markAllNotificationsAsRead({ recipientId, role }));
  };

  const markOneRead = (id: number, isRead: boolean) => {
    if (recipientId && !isRead) dispatch(markNotificationAsRead({ id, recipientId }));
  };

  return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          {currentUnread > 0 && (
              <button
                  onClick={markAllRead}
                  className="px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Mark All Read
              </button>
          )}
        </div>

        <div className="flex gap-2 mb-6">
          <button
              onClick={() => setActiveTab("booking")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "booking"
                      ? "bg-[#1e3a8a] text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
          >
            Booking Events
            {bookingUnread > 0 && (
                <span className="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center bg-[#e8683f] text-white">
              {bookingUnread}
            </span>
            )}
          </button>
          <button
              onClick={() => setActiveTab("platform")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === "platform"
                      ? "bg-[#1e3a8a] text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
          >
            Platform Updates
            {platformUnread > 0 && (
                <span className="w-5 h-5 rounded-full text-[11px] font-bold flex items-center justify-center bg-[#e8683f] text-white">
              {platformUnread}
            </span>
            )}
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <p className="text-sm">Loading...</p>
              </div>
          ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <Bell className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No notifications here</p>
              </div>
          ) : (
              <ul className="divide-y divide-gray-50">
                {filtered.map((notif) => {
                  const { icon, bg } = inferIcon(notif);
                  return (
                      <li
                          key={notif.id}
                          onClick={() => markOneRead(notif.id, notif.isRead)}
                          className={`flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors ${
                              !notif.isRead ? "bg-blue-50/60 hover:bg-blue-50" : "hover:bg-gray-50"
                          }`}
                      >
                        <IconComponent icon={icon} bg={bg} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-snug ${!notif.isRead ? "font-semibold text-gray-900" : "font-normal text-gray-600"}`}>
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">{formatRelativeTime(notif.createdAt)}</p>
                        </div>
                        {!notif.isRead && <span className="w-2.5 h-2.5 rounded-full bg-[#e8683f] shrink-0" />}
                      </li>
                  );
                })}
              </ul>
          )}
        </div>
      </div>
  );
}
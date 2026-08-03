"use client";

import { Search, Bell } from "lucide-react";

interface TopHeaderProps {
    userName?: string;
    userEmail?: string;
    userInitials?: string;
    hasNotifications?: boolean;
}

export default function TopHeader({
                                      userName = "Super Admin",
                                      userEmail = "admin@servicelink.com",
                                      userInitials = "SA",
                                      hasNotifications = true,
                                  }: TopHeaderProps) {
    return (
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-10">
            <div className="flex items-center gap-4 w-96">
                <div className="relative w-full">
                    <Search
                        size={16}
                        className="absolute left-3 top-2.5 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search users, jobs, or PAN numbers..."
                        className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    className="relative p-2 text-gray-500 hover:text-gray-700"
                    aria-label="Notifications"
                >
                    <Bell size={20} />
                    {hasNotifications && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    )}
                </button>

                <div className="flex items-center gap-3 border-l pl-4 border-gray-200">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-sm">
                        {userInitials}
                    </div>
                    <div className="text-xs">
                        <p className="font-semibold text-gray-800">{userName}</p>
                        <p className="text-gray-500">{userEmail}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
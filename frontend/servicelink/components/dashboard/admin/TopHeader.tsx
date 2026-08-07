"use client";

import { Search, Bell, Menu } from "lucide-react";

interface TopHeaderProps {
    userName?: string;
    userEmail?: string;
    userInitials?: string;
    hasNotifications?: boolean;
    /** Opens the mobile sidebar drawer */
    onMenuClick?: () => void;
}

export default function TopHeader({
                                      userName = "Super Admin",
                                      userEmail = "admin@servicelink.com",
                                      userInitials = "SA",
                                      hasNotifications = true,
                                      onMenuClick,
                                  }: TopHeaderProps) {
    return (
        <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-10 gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* MOBILE MENU TOGGLE */}
                <button
                    onClick={onMenuClick}
                    className="md:hidden p-2 -ml-2 text-gray-500 hover:text-[#1e3a8a] shrink-0"
                    aria-label="Open menu"
                >
                    <Menu size={22} />
                </button>

                {/* SEARCH */}
                <div className="relative w-full max-w-xs sm:max-w-sm md:w-96">
                    <Search
                        size={16}
                        className="absolute left-3 top-2.5 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search users, jobs, or PAN numbers..."
                        className="w-full pl-9 pr-4 py-1.5 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a] focus:border-transparent"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <button
                    className="relative p-2 text-gray-500 hover:text-[#1e3a8a]"
                    aria-label="Notifications"
                >
                    <Bell size={20} />
                    {hasNotifications && (
                        <span className="absolute top-1 right-1 w-2 h-2 bg-[#e8683f] rounded-full" />
                    )}
                </button>

                <div className="flex items-center gap-3 sm:border-l pl-0 sm:pl-4 border-gray-200">
                    <div className="w-8 h-8 rounded-full bg-[#1e3a8a]/10 text-[#1e3a8a] font-bold flex items-center justify-center text-sm shrink-0">
                        {userInitials}
                    </div>
                    {/* Hide name/email on very small screens to save space */}
                    <div className="text-xs hidden sm:block">
                        <p className="font-semibold text-gray-800">{userName}</p>
                        <p className="text-gray-500">{userEmail}</p>
                    </div>
                </div>
            </div>
        </header>
    );
}
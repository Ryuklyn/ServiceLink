"use client";

import { Menu, Bell, Search } from "lucide-react";

export default function Navbar() {
    return (
        <header className="h-16 flex-shrink-0 bg-gradient-to-r from-[#FFF5F2] to-[#FFE8DC] border-b border-orange-100 flex items-center justify-between px-6 gap-4">
            {/* Left */}
            <div className="flex items-center gap-4">
                <button className="text-[#1E3A8A] hover:bg-white/60 p-1.5 rounded-lg transition">
                    <Menu size={20} />
                </button>

                <div className="relative hidden sm:block">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        type="text"
                        placeholder="Search bookings or customers..."
                        className="pl-9 pr-4 py-2 text-sm bg-white border-2 border-[#1E3A8A]/20 hover:border-[#1E3A8A]/40 focus:border-[#1E3A8A] focus:outline-none rounded-xl text-gray-700 placeholder-gray-400 w-72 shadow-sm transition-all"
                    />
                </div>
            </div>

            {/* Page Title (visible on smaller screens) */}
            <p className="text-[#1E3A8A] font-bold text-base sm:hidden">Dashboard</p>

            {/* Right */}
            <div className="flex items-center gap-3">
                {/* Plan Badge */}
                <div className="hidden sm:flex items-center gap-1.5 bg-[#1E3A8A] text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
                    <span>Monthly</span>
                    <span className="text-[#E8683F]">✓</span>
                </div>

                {/* Notification Bell */}
                <div className="relative">
                    <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white border border-orange-200 text-[#1E3A8A] hover:bg-orange-50 transition shadow-sm">
                        <Bell size={17} />
                    </button>
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#E8683F] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
            2
          </span>
                </div>

                {/* Avatar */}
                <div className="w-9 h-9 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center font-bold text-xs border-2 border-white shadow-md cursor-pointer hover:opacity-90 transition">
                    RM
                </div>
            </div>
        </header>
    );
}
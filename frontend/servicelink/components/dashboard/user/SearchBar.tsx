"use client";

import { Search, Bell } from "lucide-react";
import Image from "next/image";

interface SearchBarProps {
  userProfile?: {
    fullName: string;
    email: string;
    profileImage?: string;
  };
}

export default function SearchBar({ userProfile }: SearchBarProps) {
  return (
    <div className="flex items-center justify-between bg-white px-8 py-4 border-b border-gray-100">
      {/* Logo and Title */}
      <div className="text-2xl font-bold text-[#1e3a8a]">ServiceLink</div>

      {/* Search Bar */}
      <div className="flex-1 mx-12">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search services or providers..."
            className="w-full bg-white border-2 border-gray-200 rounded-full pl-12 pr-4 py-2 focus:outline-none focus:border-[#1e3a8a] transition-colors"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-gray-700" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Avatar */}
        <div className="w-10 h-10 bg-[#e8683f] rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:bg-[#d75930] transition-colors">
          {userProfile?.fullName?.charAt(0) || "U"}
        </div>
      </div>
    </div>
  );
}

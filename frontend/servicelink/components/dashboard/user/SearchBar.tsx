"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Bell, User, BellRing, LogOut } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface SearchBarProps {
  userProfile?: {
    fullName: string;
    email: string;
    profileImage?: string;
  };
}

const pageTitles: Record<string, string> = {
  "/dashboard/user": "Dashboard",
  "/dashboard/user/explore": "Explore Services",
  "/dashboard/user/bookings": "My Bookings",
  "/dashboard/user/map": "Service Map",
  "/dashboard/user/settings": "Account",
};

export default function SearchBar({ userProfile }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const pageTitle = pageTitles[pathname] ?? "Dashboard";

  const initials = userProfile?.fullName
    ? userProfile.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    router.push("/login");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      className="flex items-center justify-between px-8 py-3 shrink-0"
      style={{ background: "#1e3a8a" }}
    >
      {/* Page Title */}
      <h1 className="text-xl font-bold text-white w-44 shrink-0">
        {pageTitle}
      </h1>

      {/* Search Bar */}
      <div className="flex-1 mx-8 max-w-xl">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search services or providers..."
            className="w-full bg-white rounded-full pl-10 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 shrink-0">
        {/* Notifications */}
        <Link
          href="/dashboard/user/notification"
          className="relative p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <Bell className="w-5 h-5 text-white" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#e8683f] rounded-full text-[9px] font-bold text-white flex items-center justify-center">
            2
          </span>
        </Link>

        {/* Avatar + Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="w-9 h-9 bg-[#e8683f] rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-[#d75930] transition-colors focus:outline-none focus:ring-2 focus:ring-white/40"
          >
            {userProfile?.profileImage ? (
              <Image
                src={userProfile.profileImage}
                alt="avatar"
                width={36}
                height={36}
                className="rounded-full object-cover"
              />
            ) : (
              initials
            )}
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
              <Link
                href="/dashboard/user/settings"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User className="w-4 h-4 text-gray-500" />
                Profile
              </Link>
              <Link
                href="/dashboard/user/notifications"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <BellRing className="w-4 h-4 text-gray-500" />
                Notifications
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#e8683f] hover:bg-gray-50 transition-colors border-t border-gray-100"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

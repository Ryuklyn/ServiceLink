"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search, Bell, User, BellRing, LogOut, Menu } from "lucide-react"; // ✅ Menu थप्ने
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearUser } from "@/store/slices/userSlice";

const pageTitles: Record<string, string> = {
  "/dashboard/user": "Dashboard",
  "/dashboard/user/explore": "Explore Services",
  "/dashboard/user/bookings": "My Bookings",
  "/dashboard/user/map": "Service Map",
  "/dashboard/user/settings": "Account",
};

// ✅ Props interface थप्ने
interface SearchBarProps {
  onMenuClick?: () => void;
}

export default function SearchBar({ onMenuClick }: SearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ✅ Redux
  const dispatch = useAppDispatch();
  const { data: user } = useAppSelector((state) => state.user);

  const pageTitle = pageTitles[pathname] ?? "Dashboard";

  const initials = user?.fullName
      ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "U";

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    dispatch(clearUser());
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
          className="flex items-center justify-between px-4 sm:px-8 py-3 shrink-0"
          style={{ background: "#1e3a8a" }}
      >
        {/* ✅ Hamburger — mobile matra देखिने (lg breakpoint भन्दा तल) */}
        <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-1 mr-1 hover:bg-white/10 rounded-full transition-colors shrink-0"
            aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>

        {/* Page Title */}
        <h1 className="text-lg sm:text-xl font-bold text-white w-auto lg:w-44 shrink-0 truncate mr-2">
          {pageTitle}
        </h1>

        {/* Search Bar — mobile मा hide, tablet+ मा देखाउने */}
        <div className="hidden md:flex flex-1 mx-8 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
                type="text"
                placeholder="Search services or providers..."
                className="w-full bg-white rounded-full pl-10 pr-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/40 transition-all"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0 ml-auto">
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
                className="w-9 h-9 bg-[#e8683f] rounded-full flex items-center justify-center text-white text-sm font-bold hover:bg-[#d75930] transition-colors focus:outline-none focus:ring-2 focus:ring-white/40 overflow-hidden relative"
            >
              {user?.profileImage ? (
                  <div className="relative w-full h-full rounded-full overflow-hidden aspect-square">
                    <Image
                        src={user.profileImage}
                        alt="avatar"
                        fill
                        sizes="36px"
                        className="object-cover"
                    />
                  </div>
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
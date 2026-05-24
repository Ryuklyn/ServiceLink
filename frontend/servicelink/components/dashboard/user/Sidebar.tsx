"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Home, Search, Calendar, MapPin, User, LogOut } from "lucide-react";

interface SidebarProps {
  userProfile?: {
    fullName: string;
    email: string;
    profileImage?: string;
  };
}

export default function Sidebar({ userProfile }: SidebarProps) {
  const router = useRouter();
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    router.push("/login");
  };

  const menuItems = [
    { label: "Home", icon: <Home className="w-5 h-5" /> },
    { label: "Explore", icon: <Search className="w-5 h-5" /> },
    { label: "Bookings", icon: <Calendar className="w-5 h-5" /> },
    { label: "Map", icon: <MapPin className="w-5 h-5" /> },
    { label: "Account", icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="w-52 bg-gradient-to-b from-[#1e3a8a] to-[#2d5aa8] text-white h-screen p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-[#e8683f] rounded-lg flex items-center justify-center font-bold">
            S
          </div>
          <span className="text-xl font-bold">ServiceLink</span>
        </div>
        <p className="text-xs text-blue-200">Trusted Local Services</p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href="#"
            className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-blue-400 pt-4">
        <div className="relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors"
          >
            {userProfile?.profileImage ? (
              <Image
                src={userProfile.profileImage}
                alt="profile"
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <div className="w-8 h-8 bg-[#e8683f] rounded-full flex items-center justify-center text-sm font-bold">
                {userProfile?.fullName?.charAt(0) || "U"}
              </div>
            )}
            <div className="text-left">
              <p className="text-xs font-semibold">
                {userProfile?.fullName || "User"}
              </p>
              <p className="text-xs text-blue-200">Verified User</p>
            </div>
          </button>

          {/* Account Menu Dropdown */}
          {showAccountMenu && (
            <div className="absolute bottom-full left-0 right-0 bg-white text-gray-800 rounded-lg shadow-lg mb-2 overflow-hidden">
              <button className="w-full px-4 py-2 text-sm font-medium hover:bg-gray-100 text-left">
                Profile & Account
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium hover:bg-gray-100 text-left">
                My Bookings
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium hover:bg-gray-100 text-left">
                Pair
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-sm font-medium text-[#e8683f] hover:bg-gray-100 text-left border-t border-gray-200 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

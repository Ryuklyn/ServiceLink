"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Search,
  CalendarCheck,
  MapPin,
  CircleUser,
  LogOut,
} from "lucide-react";
// ✅ थप्ने - imports मा
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUser, clearUser } from "@/store/slices/userSlice";

// interface SidebarProps {
//   userProfile?: {
//     fullName: string;
//     email: string;
//     profileImage?: string;
//   };
// }

const menuItems = [
  { label: "Home", icon: Home, href: "/dashboard/user" },
  { label: "Explore Services", icon: Search, href: "/dashboard/user/explore" },
  {
    label: "My Bookings",
    icon: CalendarCheck,
    href: "/dashboard/user/bookings",
  },
  { label: "Service Map", icon: MapPin, href: "/dashboard/user/map" },
  { label: "Account", icon: CircleUser, href: "/dashboard/user/settings" },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [showAccountMenu, setShowAccountMenu] = useState(false);

  const dispatch = useAppDispatch();
  const { data: user } = useAppSelector((state) => state.user);

  useEffect(() => {
    if (!user) {
      dispatch(fetchUser());
    }
  }, [dispatch, user]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("token");
    dispatch(clearUser());
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard/user") {
      return pathname === "/dashboard/user";
    }
    return pathname.startsWith(href);
  };

  // const initials = userProfile?.fullName
  //   ? userProfile.fullName
  //       .split(" ")
  //       .map((n) => n[0])
  //       .join("")
  //       .toUpperCase()
  //       .slice(0, 2)
  //   : "U";

  const initials = user?.fullName
      ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
      : "U";

  return (
    <div
      className="w-56 text-white h-screen flex flex-col shrink-0"
      style={{ background: "#1e3a8a" }}
    >

      {/* Logo */}
      <div className="px-5 pt-6 pb-6">
        <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-2 w-fit shadow-sm">
          <Image
              src="/images/SL.png"
              alt="ServiceLink Logo"
              width={28}
              height={28}
              className="object-contain shrink-0"
              priority
          />
          <div className="flex flex-col justify-center">
            <p className="font-extrabold text-sm text-[#1e3a8a] leading-none mb-0.5">
              Service<span className="text-[#e8683f]">Link</span>
            </p>
            <p className="text-[10px] font-medium text-slate-500 tracking-wide leading-none">
              Trusted Local Services
            </p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 space-y-0.5">
        {menuItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 relative whitespace-nowrap
                ${
                  active
                    ? "bg-[#3a57b5] text-[#e8683f] font-bold"
                    : "text-blue-100 hover:bg-white/10 hover:text-white font-normal"
                }
              `}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 bg-[#e8683f] rounded-r-full" />
              )}
              <Icon
                className={`w-[18px] h-[18px] shrink-0 ${active ? "ml-1.5" : "ml-1.5"}`}
                strokeWidth={active ? 2.2 : 1.8}
              />
              <span className="text-[13.5px] tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile Section */}
      <div className="border-t border-white/10 mx-3 pt-4 pb-5">
        <div className="relative">
          <button
            onClick={() => setShowAccountMenu(!showAccountMenu)}
            className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {/* Avatar */}
            {/* Avatar */}
            <div className="relative shrink-0 w-9 h-9"> {/* यहाँ explicit aspect control थपियो */}
              {user?.profileImage ? (
                  <div className="relative w-full h-full rounded-full overflow-hidden aspect-square">
                    <Image
                        src={user.profileImage}
                        alt="profile"
                        fill // fixed width/height को साटो 'fill' प्रयोग गर्ने
                        sizes="36px"
                        className="object-cover" // यसले image लाई नतन्काई crop गरेर fit गराउँछ
                        priority
                    />
                  </div>
              ) : (
                  <div className="w-full h-full bg-[#e8683f] rounded-full flex items-center justify-center text-sm font-bold text-white">
                    {initials}
                  </div>
              )}
              {/* Online green dot */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-[#2a4499] rounded-full z-10" />
            </div>

            <div className="text-left overflow-hidden">
              <p className="text-sm font-semibold truncate leading-tight">
                {user?.fullName || "User"}
              </p>
              <p className="text-xs text-blue-200 leading-tight">
                Verified User
              </p>
            </div>
          </button>

          {/* Dropdown */}
          {showAccountMenu && (
            <div className="absolute bottom-full left-0 right-0 bg-white text-gray-800 rounded-lg shadow-xl mb-2 overflow-hidden border border-gray-100 z-50">
              <Link
                href="/dashboard/user/settings"
                className="block px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
                onClick={() => setShowAccountMenu(false)}
              >
                Profile & Account
              </Link>
              <Link
                href="/dashboard/user/bookings"
                className="block px-4 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
                onClick={() => setShowAccountMenu(false)}
              >
                My Bookings
              </Link>
              <button className="w-full px-4 py-2.5 text-sm font-medium hover:bg-gray-50 text-left transition-colors">
                Pair Device
              </button>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2.5 text-sm font-medium text-[#e8683f] hover:bg-gray-50 text-left border-t border-gray-100 flex items-center gap-2 transition-colors"
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

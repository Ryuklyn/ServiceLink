"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    CalendarDays,
    Wallet,
    BarChart2,
    Users,
    CreditCard,
    Settings,
    UserCheck,
    LogOut,
    BadgeCheck,
    Zap,
} from "lucide-react";

const navItems = [
    { label: "Dashboard", href: "/dashboard/provider", icon: LayoutDashboard },
    { label: "Bookings", href: "/dashboard/provider/bookings", icon: CalendarDays },
    { label: "Earnings", href: "/dashboard/provider/earnings", icon: Wallet },
    { label: "Analytics", href: "/dashboard/provider/analytics", icon: BarChart2 },
    { label: "Referrals", href: "/dashboard/provider/referrals", icon: Users },
    { label: "Subscription", href: "/dashboard/provider/subscription", icon: CreditCard },
    { label: "Settings", href: "/dashboard/provider/settings", icon: Settings },
    { label: "Profile / KYC", href: "/dashboard/provider/profile", icon: UserCheck },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 h-full flex flex-col bg-gradient-to-b from-[#E8683F] to-[#C8501F] flex-shrink-0">
            {/* Brand Header */}
            <div className="px-6 pt-6 pb-5 flex items-center gap-2.5">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-md">
                    <Zap size={18} className="text-[#E8683F]" fill="#E8683F" />
                </div>
                <div>
                    <h1 className="text-white font-bold text-[17px] leading-tight tracking-tight">
                        ServiceLink
                    </h1>
                    <p className="text-white/60 text-[10px] font-medium tracking-wide uppercase">
                        Trusted Local Services
                    </p>
                </div>
            </div>

            {/* Divider */}
            <div className="mx-6 h-px bg-white/15 mb-4" />

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-0.5 px-3">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`
                flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${
                                isActive
                                    ? "bg-white text-[#1E3A8A] shadow-md shadow-black/10 font-semibold"
                                    : "text-white/70 hover:text-white hover:bg-white/10"
                            }
              `}
                        >
                            <Icon
                                size={18}
                                className={isActive ? "text-[#E8683F]" : "text-white/70"}
                            />
                            {label}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer Profile Card */}
            <div className="m-3 mt-4 bg-[#1E3A8A] rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center text-[#1E3A8A] font-bold text-sm flex-shrink-0 shadow">
                        BM
                    </div>
                    <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                            Bhumika Maharjan
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                            <BadgeCheck size={12} className="text-[#E8683F] flex-shrink-0" />
                            <p className="text-white/60 text-xs">Verified Provider</p>
                        </div>
                    </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
          <span className="bg-[#E8683F] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide">
            MONTHLY PLAN ✓
          </span>
                    <button className="flex items-center gap-1 text-white/50 hover:text-white/80 transition text-xs">
                        <LogOut size={13} />
                        <span>Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
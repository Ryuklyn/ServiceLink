"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
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
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUser, clearUser } from "@/store/slices/userSlice";

const navItems = [
    { label: "Dashboard", href: "/dashboard/provider", icon: LayoutDashboard },
    { label: "Bookings", href: "/dashboard/provider/bookings", icon: CalendarDays },
    { label: "Earnings", href: "/dashboard/provider/earnings", icon: Wallet },
    { label: "Analytics", href: "/dashboard/provider/analytics", icon: BarChart2 },
    { label: "Referrals", href: "/dashboard/provider/referral", icon: Users },
    { label: "Subscription", href: "/dashboard/provider/subscription", icon: CreditCard },
    { label: "Settings", href: "/dashboard/provider/settings", icon: Settings },
    { label: "Profile / KYC", href: "/dashboard/provider/profile", icon: UserCheck },
];

interface SidebarProps {
    onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();

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

    const initials = user?.fullName
        ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "P";

    return (
        <aside className="w-64 h-full flex flex-col bg-gradient-to-b from-[#E8683F] to-[#C8501F] flex-shrink-0">
            {/* Logo (Replicated exactly from UserSidebar) */}
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

            {/* Navigation */}
            <nav className="flex-1 flex flex-col gap-0.5 px-3">
                {navItems.map(({ label, href, icon: Icon }) => {
                    const isActive =
                        href === "/dashboard/provider"
                            ? pathname === href
                            : pathname.startsWith(href);

                    return (
                        <Link
                            key={href}
                            href={href}
                            onClick={onNavigate}
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
                    {/* Dynamic Avatar */}
                    <div className="relative w-11 h-11 flex-shrink-0">
                        {user?.profileImage ? (
                            <div className="relative w-full h-full rounded-full overflow-hidden">
                                <Image
                                    src={user.profileImage}
                                    alt="profile"
                                    fill
                                    sizes="44px"
                                    className="object-cover"
                                    priority
                                />
                            </div>
                        ) : (
                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-[#1E3A8A] font-bold text-sm shadow">
                                {initials}
                            </div>
                        )}
                    </div>

                    <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">
                            {user?.fullName || "Provider"}
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
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-1 text-white/50 hover:text-white/80 transition text-xs"
                    >
                        <LogOut size={13} />
                        <span>Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
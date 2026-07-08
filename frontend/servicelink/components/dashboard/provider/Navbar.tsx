"use client";

import { useEffect } from "react";
import { Bell, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProviderProfile } from "@/store/slices/providerProfileSlice";
import { getActiveNavLabel } from "@/lib/navigation/providerNavItems";

export default function Navbar() {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { data: provider } = useAppSelector((state) => state.providerProfile);

    useEffect(() => {
        if (!provider) {
            dispatch(fetchProviderProfile());
        }
    }, [dispatch, provider]);

    const activeLabel = getActiveNavLabel(pathname);

    const initials = provider?.fullName
        ? provider.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "P";

    return (
        <header className="h-16 flex-shrink-0 bg-gradient-to-r from-[#E8683F] to-[#C8501F] flex items-center justify-between px-6 gap-4 shadow-sm">
            {/* Left — page title reflects whichever sidebar link is active */}
            <div className="flex items-center gap-2 min-w-0">
                <p className="text-white font-bold text-base truncate">{activeLabel}</p>
            </div>

            {/* Right — search shifted here (further right than before), then
                plan badge, notifications, avatar */}
            <div className="flex items-center gap-3">
                <div className="relative hidden sm:block">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60"
                    />
                    <input
                        type="text"
                        placeholder="Search bookings or customers..."
                        className="pl-9 pr-4 py-2 text-sm bg-white/15 border-2 border-white/20 hover:border-white/40
                        focus:border-white focus:bg-white/25 focus:outline-none rounded-xl text-white
                        placeholder-white/60 w-64 transition-all"
                    />
                </div>

                {/* Plan Badge */}
                <div className="hidden sm:flex items-center gap-1.5 bg-[#1E3A8A] text-white text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
                    <span>Monthly</span>
                    <span className="text-[#E8683F]">✓</span>
                </div>

                {/* Notification Bell */}
                <Link href="/dashboard/provider/notifications" className="relative inline-block">
                    <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white/15 border border-white/25 text-white hover:bg-white/25 transition">
                        <Bell size={17} />
                    </button>
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#1E3A8A] text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                        2
                    </span>
                </Link>

                {/* Avatar — same provider profile data as Sidebar's footer card */}
                <div className="relative w-9 h-9 flex-shrink-0">
                    {provider?.profilePictureUrl ? (
                        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white shadow-md">
                            <img
                                src={provider.profilePictureUrl}
                                alt="profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-9 h-9 bg-[#1E3A8A] text-white rounded-full flex items-center justify-center font-bold text-xs border-2 border-white shadow-md cursor-pointer hover:opacity-90 transition">
                            {initials}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
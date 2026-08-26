"use client";

import { useEffect } from "react";
import { Bell, Search, Menu } from "lucide-react"; // Added Menu icon
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProviderProfile } from "@/store/slices/providerProfileSlice";
import { getActiveNavLabel } from "@/lib/navigation/providerNavItems";
import { getPlanBadgeLabel } from "@/utils/subscriptionDisplay";
import { fetchProviderSubscription } from "@/store/slices/providerSubscriptionSlice";
import { useProviderTranslation } from "@/hooks/useProviderTranslation";

interface NavbarProps {
    onMenuClick?: () => void; // Trigger callback to open Mobile Sidebar
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const { data: provider } = useAppSelector((state) => state.providerProfile);
    const { data: subscription } = useAppSelector((state) => state.providerSubscription);
    const { t } = useProviderTranslation();

    useEffect(() => {
        if (!provider) {
            dispatch(fetchProviderProfile());
        }
    }, [dispatch, provider]);

    useEffect(() => {
        if (!subscription) {
            dispatch(fetchProviderSubscription());
        }
    }, [dispatch, subscription]);

    const activeLabel = getActiveNavLabel(pathname);

    const initials = provider?.fullName
        ? provider.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "P";

    return (
        <header className="h-16 flex-shrink-0 navbar-theme-container text-navbar-text border-b border-border flex items-center justify-between px-4 sm:px-6 gap-4 shadow-sm">
            {/* Left — Hamburger + page title */}
            <div className="flex items-center gap-3 min-w-0">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-1.5 text-navbar-text bg-white/10 hover:bg-white/20 rounded-lg transition"
                    aria-label="Open menu"
                >
                    <Menu size={20} />
                </button>
                <p className="font-bold text-base truncate text-navbar-text">{t(activeLabel)}</p>
            </div>

            {/* Right — action elements */}
            <div className="flex items-center gap-3">
                {/* Search shifted layout control */}
                <div className="relative hidden md:block">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                    />
                    <input
                        type="text"
                        placeholder={t("Search bookings or customers...")}
                        className="pl-9 pr-4 py-2 text-sm bg-surface border border-border text-text-primary hover:border-primary/50
                        focus:border-primary focus:outline-none rounded-xl placeholder-text-muted w-48 lg:w-64 transition-all"
                    />
                </div>

                {/* Plan Badge */}
                <div className="hidden sm:flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm">
                    <span>{getPlanBadgeLabel(subscription?.planType)}</span>
                    <span>✓</span>
                </div>

                {/* Notification Bell */}
                <Link href="/dashboard/provider/notifications" className="relative inline-block">
                    <button className="w-9 h-9 flex items-center justify-center rounded-full bg-surface border border-border text-text-primary hover:bg-surface-hover transition">
                        <Bell size={17} />
                    </button>
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                        2
                    </span>
                </Link>

                {/* Avatar */}
                <div className="relative w-9 h-9 flex-shrink-0">
                    {provider?.profilePictureUrl ? (
                        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-primary shadow-md">
                            <img
                                src={provider.profilePictureUrl}
                                alt="profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-9 h-9 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold text-xs border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition">
                            {initials}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
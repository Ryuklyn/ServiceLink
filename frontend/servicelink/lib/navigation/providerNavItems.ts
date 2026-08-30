import {
    LayoutDashboard,
    CalendarDays,
    Wallet,
    BarChart2,
    Users,
    CreditCard,
    Settings,
    UserCheck,
    LucideIcon,
} from "lucide-react";

export interface ProviderNavItem {
    label: string;
    href: string;
    icon: LucideIcon;
}

export const providerNavItems: ProviderNavItem[] = [
    { label: "navigation.home", href: "/dashboard/provider", icon: LayoutDashboard },
    { label: "navigation.bookings", href: "/dashboard/provider/bookings", icon: CalendarDays },
    { label: "navigation.earnings", href: "/dashboard/provider/earnings", icon: Wallet },
    { label: "navigation.analytics", href: "/dashboard/provider/analytics", icon: BarChart2 },
    { label: "navigation.referrals", href: "/dashboard/provider/referral", icon: Users },
    { label: "navigation.subscription", href: "/dashboard/provider/subscription", icon: CreditCard },
    { label: "navigation.settings", href: "/dashboard/provider/settings", icon: Settings },
    { label: "navigation.profileKyc", href: "/dashboard/provider/profile", icon: UserCheck },
];

/** Matches the same startsWith/exact logic Sidebar already uses for active state. */
export function getActiveNavLabel(pathname: string): string {
    const match = providerNavItems.find(({ href }) =>
        href === "/dashboard/provider" ? pathname === href : pathname.startsWith(href),
    );
    return match?.label ?? "navigation.home";
}
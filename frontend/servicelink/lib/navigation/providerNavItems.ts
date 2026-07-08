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
    { label: "Dashboard", href: "/dashboard/provider", icon: LayoutDashboard },
    { label: "Bookings", href: "/dashboard/provider/bookings", icon: CalendarDays },
    { label: "Earnings", href: "/dashboard/provider/earnings", icon: Wallet },
    { label: "Analytics", href: "/dashboard/provider/analytics", icon: BarChart2 },
    { label: "Referrals", href: "/dashboard/provider/referral", icon: Users },
    { label: "Subscription", href: "/dashboard/provider/subscription", icon: CreditCard },
    { label: "Settings", href: "/dashboard/provider/settings", icon: Settings },
    { label: "Profile / KYC", href: "/dashboard/provider/profile", icon: UserCheck },
];

/** Matches the same startsWith/exact logic Sidebar already uses for active state. */
export function getActiveNavLabel(pathname: string): string {
    const match = providerNavItems.find(({ href }) =>
        href === "/dashboard/provider" ? pathname === href : pathname.startsWith(href),
    );
    return match?.label ?? "Dashboard";
}
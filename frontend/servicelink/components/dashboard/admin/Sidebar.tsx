"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Layers,
    Building2,
    Wallet,
    CreditCard,
    X,
    type LucideIcon,
} from "lucide-react";
import type { NavItem } from "./types";

interface SidebarProps {
    /** Optional active state override if needed outside router context */
    activeId?: string;
    /** Brand name displayed at the top of the sidebar */
    brandName?: string;
    /** Optional callback function when a nav item is clicked */
    onItemClick?: () => void;
    /** Controls the mobile slide-in drawer */
    isOpen?: boolean;
    /** Closes the mobile drawer */
    onClose?: () => void;
}

const NAV_ITEMS: NavItem[] = [
    { id: "dashboard", label: "Dashboard", href: "/dashboard/admin", icon: "dashboard" },
    { id: "users", label: "User Management", href: "/dashboard/admin/kyc", icon: "users" },
    {
        id: "categories",
        label: "Categories & Services",
        href: "/dashboard/admin/categories",
        icon: "categories",
    },
    { id: "b2b", label: "B2B Organizations", href: "/dashboard/admin/b2b", icon: "b2b" },
    { id: "escrow", label: "Escrow & Payouts", href: "/dashboard/admin/escrow", icon: "escrow" },
    {
        id: "subscription",
        label: "Provider Subscription",
        href: "/dashboard/admin/provider-subscription",
        icon: "subscription",
    },
];

const ICON_MAP: Record<string, LucideIcon> = {
    dashboard: LayoutDashboard,
    users: Users,
    categories: Layers,
    b2b: Building2,
    escrow: Wallet,
    subscription: CreditCard,
};

export default function Sidebar({
                                    activeId,
                                    brandName = "ServiceLink Pro",
                                    onItemClick,
                                    isOpen = false,
                                    onClose,
                                }: SidebarProps) {
    const pathname = usePathname();

    const handleItemClick = () => {
        onItemClick?.();
        onClose?.();
    };

    return (
        <>
            {/* MOBILE BACKDROP */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`w-64 bg-[#1e3a8a] text-blue-100 flex flex-col shrink-0 border-r border-white/10 h-screen fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out md:static md:z-auto md:translate-x-0 ${
                    isOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                {/* BRAND HEADER */}
                <div className="h-16 flex items-center justify-between px-6 text-white font-bold text-xl border-b border-white/10 shrink-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <Image
                            src="/images/SL.png"
                            alt="ServiceLink"
                            width={28}
                            height={28}
                            className="shrink-0 rounded-md"
                            priority
                        />
                        <span className="truncate">{brandName}</span>
                    </div>

                    {/* MOBILE CLOSE BUTTON */}
                    <button
                        onClick={onClose}
                        className="md:hidden text-blue-200 hover:text-white p-1 shrink-0"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* NAVIGATION LIST */}
                <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const Icon = ICON_MAP[item.icon] || LayoutDashboard;

                        const isActive = activeId
                            ? item.id === activeId
                            : pathname === item.href ||
                            (item.href !== "/dashboard/admin" && pathname?.startsWith(item.href));

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                onClick={handleItemClick}
                                aria-current={isActive ? "page" : undefined}
                                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-colors duration-150 ${
                                    isActive
                                        ? "bg-[#e8683f] text-white shadow-sm"
                                        : "text-blue-200/80 hover:bg-white/10 hover:text-white"
                                }`}
                            >
                                <Icon size={18} className="shrink-0" />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* FOOTER */}
                <div className="p-4 border-t border-white/10 text-xs text-blue-200/60 shrink-0 flex items-center justify-between">
                    <span>ServiceLink Platform</span>
                    <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[10px] text-blue-100/80">
                        v1.0.0
                    </span>
                </div>
            </aside>
        </>
    );
}
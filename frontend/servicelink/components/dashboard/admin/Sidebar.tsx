"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Layers,
    Building2,
    Wallet,
    Settings2,
    type LucideIcon,
} from "lucide-react";
import type { NavItem } from "./types";

interface SidebarProps {
    /** Optional active state override if needed outside router context */
    activeId?: string;
    /** Brand name displayed at the top of the sidebar */
    brandName?: string;
    /** Optional callback function when a nav item is clicked (useful for auto-closing mobile drawers) */
    onItemClick?: () => void;
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
];

const ICON_MAP: Record<string, LucideIcon> = {
    dashboard: LayoutDashboard,
    users: Users,
    categories: Layers,
    b2b: Building2,
    escrow: Wallet,
};

export default function Sidebar({
                                    activeId,
                                    brandName = "ServiceLink Pro",
                                    onItemClick,
                                }: SidebarProps) {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 hidden md:flex border-r border-slate-800 h-screen sticky top-0">
            {/* BRAND HEADER */}
            <div className="h-16 flex items-center px-6 text-white font-bold text-xl border-b border-slate-800 gap-2 shrink-0">
                <Settings2 className="text-blue-500 shrink-0" size={22} />
                <span className="truncate">{brandName}</span>
            </div>

            {/* NAVIGATION LIST */}
            <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                    const Icon = ICON_MAP[item.icon] || LayoutDashboard;

                    // Determine active state: explicitly passed activeId OR matches current path
                    const isActive = activeId
                        ? item.id === activeId
                        : pathname === item.href || (item.href !== "/dashboard/admin" && pathname?.startsWith(item.href));

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            onClick={onItemClick}
                            aria-current={isActive ? "page" : undefined}
                            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-medium text-sm transition-colors duration-150 ${
                                isActive
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
                            }`}
                        >
                            <Icon size={18} className="shrink-0" />
                            <span className="truncate">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* FOOTER */}
            <div className="p-4 border-t border-slate-800 text-xs text-slate-500 shrink-0 flex items-center justify-between">
                <span>ServiceLink Platform</span>
                <span className="font-mono bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-400">
                    v1.0.0
                </span>
            </div>
        </aside>
    );
}
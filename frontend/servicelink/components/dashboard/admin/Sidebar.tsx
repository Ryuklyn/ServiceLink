"use client";

import Link from "next/link";
import {
    LayoutDashboard,
    Users,
    Layers,
    Building2,
    Wallet,
    Settings2,
} from "lucide-react";
import type { NavItem } from "./types";

const NAV_ITEMS: NavItem[] = [
    { id: "dashboard", label: "Dashboard", href: "/dashboard/admin", icon: "dashboard" },
    { id: "users", label: "User Management", href: "/dashboard/admin/users", icon: "users" },
    {
        id: "categories",
        label: "Categories & Services",
        href: "/dashboard/admin/categories",
        icon: "categories",
    },
    { id: "b2b", label: "B2B Organizations", href: "/dashboard/admin/b2b", icon: "b2b" },
    { id: "escrow", label: "Escrow & Payouts", href: "/dashboard/admin/escrow", icon: "escrow" },
];

const ICON_MAP = {
    dashboard: LayoutDashboard,
    users: Users,
    categories: Layers,
    b2b: Building2,
    escrow: Wallet,
} as const;

interface SidebarProps {
    activeId?: string;
}

export default function Sidebar({ activeId = "dashboard" }: SidebarProps) {
    return (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 hidden md:flex">
            <div className="h-16 flex items-center px-6 text-white font-bold text-xl border-b border-slate-800 gap-2">
                <Settings2 className="text-blue-500" size={22} />
                ServiceLink Pro
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const Icon = ICON_MAP[item.icon as keyof typeof ICON_MAP];
                    const isActive = item.id === activeId;

                    return (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition ${
                                isActive
                                    ? "bg-blue-600 text-white"
                                    : "hover:bg-slate-800 hover:text-white"
                            }`}
                        >
                            <Icon size={18} className="w-5" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
                ServiceLink v1.0.0 (MVP)
            </div>
        </aside>
    );
}
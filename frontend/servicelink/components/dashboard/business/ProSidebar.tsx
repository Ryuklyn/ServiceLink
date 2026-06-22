"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Ticket,
    BarChart2,
    CreditCard,
    ShieldCheck,
    BookOpen,
    Settings,
} from "lucide-react";

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/business" },
    { label: "Provider Pool", icon: Users, href: "/dashboard/business/providers" },
    { label: "Job Tickets", icon: Ticket, href: "/dashboard/business/jobs" },
    { label: "SLA Dashboard", icon: BarChart2, href: "/dashboard/business/sla" },
    { label: "Billing", icon: CreditCard, href: "/dashboard/business/billing" },
    { label: "Compliance", icon: ShieldCheck, href: "/dashboard/business/compliance" },
    { label: "Provider Directory", icon: BookOpen, href: "/dashboard/business/directory" },
    { label: "Settings", icon: Settings, href: "/dashboard/business/settings" },
];

export default function ProSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-56 bg-[#1a2340] flex flex-col h-full shrink-0">
            {/* Logo */}
            <div className="flex items-center gap-2 px-4 py-5 border-b border-white/10">
                <Image src="/images/SL.png" alt="ServiceLink" width={32} height={32} className="rounded" />
                <div className="flex items-center gap-1">
                    <span className="text-white font-bold text-lg leading-none">ServiceLink</span>
                    <span className="text-orange-400 font-bold text-lg leading-none">Pro</span>
                    <span className="w-2 h-2 rounded-full bg-orange-400 ml-0.5 mt-0.5"></span>
                </div>
            </div>

            {/* Hotel badge */}
            <div className="mx-4 my-3">
                <div className="flex items-center gap-2 bg-white/10 rounded-md px-3 py-2">
                    <span className="text-orange-300 text-sm">🏨</span>
                    <span className="text-white text-sm font-medium">Hotel Annapurna</span>
                </div>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-2 space-y-0.5 mt-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-blue-600 text-white"
                                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                            }`}
                        >
                            <item.icon size={17} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom user */}
            <div className="px-4 py-4 border-t border-white/10 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    RS
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold truncate">Rajesh Shre...</p>
                    <p className="text-gray-400 text-xs">Admin</p>
                </div>
                <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-semibold">
          Pro Plan
        </span>
            </div>
        </aside>
    );
}
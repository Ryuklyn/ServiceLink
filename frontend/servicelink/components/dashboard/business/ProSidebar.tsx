"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
    LayoutDashboard,
    Users,
    Ticket,
    BarChart2,
    CreditCard,
    ShieldCheck,
    BookOpen,
    Settings,
    X,
} from "lucide-react";
import type { AppDispatch, RootState } from "@/store"; // adjust to your store path
import { fetchProSession } from "@/store/slices/proSessionSlice";
import { closeSidebar } from "@/store/slices/uiSlice";

const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard/business" },
    { label: "Provider Pool", icon: Users, href: "/dashboard/business/providerpool" },
    { label: "Job Tickets", icon: Ticket, href: "/dashboard/business/jobs" },
    { label: "SLA Dashboard", icon: BarChart2, href: "/dashboard/business/sla" },
    { label: "Billing", icon: CreditCard, href: "/dashboard/business/billing" },
    { label: "Compliance", icon: ShieldCheck, href: "/dashboard/business/compliance" },
    { label: "Provider Directory", icon: BookOpen, href: "/dashboard/business/directory" },
    { label: "Settings", icon: Settings, href: "/dashboard/business/settings" },
];

const BUSINESS_TYPE_ICON: Record<string, string> = {
    HOTEL: "🏨",
    RESTAURANT: "🍽️",
    APARTMENT: "🏢",
    HOSPITAL: "🏥",
    SCHOOL: "🎓",
    RETAIL: "🛍️",
    FACILITY_MANAGEMENT: "🛠️",
    PROPERTY_MANAGEMENT: "🏘️",
    CONSTRUCTION: "🏗️",
    FACTORY: "🏭",
    OFFICE: "🏢",
    OTHER: "🏷️",
};

function getInitials(name: string | null): string {
    if (!name) return "..";
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? "")
        .join("");
}

function formatRole(role: string | null): string {
    if (!role) return "...";
    return role.charAt(0) + role.slice(1).toLowerCase();
}

export default function ProSidebar() {
    const pathname = usePathname();
    const dispatch = useDispatch<AppDispatch>();
    const {
        fullName,
        role,
        organizationName,
        businessType,
        planType,
        subscriptionStatus,
        status,
    } = useSelector((state: RootState) => state.proSession);
    const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen);

    // Fetch once on mount — ProNavbar reads the same store slice, so it
    // doesn't need to dispatch this itself.
    useEffect(() => {
        if (status === "idle") {
            dispatch(fetchProSession());
        }
    }, [status, dispatch]);

    // Close the drawer on route change (mobile) so navigating doesn't leave
    // it open over the new page.
    useEffect(() => {
        dispatch(closeSidebar());
    }, [pathname, dispatch]);

    const initials = getInitials(fullName);
    const icon = businessType ? BUSINESS_TYPE_ICON[businessType] ?? "🏢" : "🏢";

    // Everyone starts on TRIAL regardless of which plan they picked — only
    // once the subscription is actually active/paid does the real plan name
    // become meaningful to show.
    const planBadgeText =
        subscriptionStatus === "TRIAL"
            ? "Trial"
            : planType
                ? `${planType.charAt(0)}${planType.slice(1).toLowerCase()} Plan`
                : "...";

    return (
        <>
            {/* Backdrop — mobile only, shown while the drawer is open */}
            {sidebarOpen && (
                <div
                    onClick={() => dispatch(closeSidebar())}
                    className="fixed inset-0 bg-black/40 z-30 md:hidden"
                    aria-hidden="true"
                />
            )}

            <aside
                className={`
                    fixed inset-y-0 left-0 z-40 w-64 sm:w-56
                    bg-[#1a2340] flex flex-col h-full shrink-0
                    transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0 md:static md:z-auto
                `}
            >
                <div className="flex items-center justify-between gap-2 px-4 py-5 border-b border-white/10">
                    <div className="flex items-center gap-2 min-w-0">
                        <Image
                            src="/images/SL.png"
                            alt="ServiceLink"
                            width={32}
                            height={32}
                            className="rounded shrink-0"
                        />
                        <div className="flex items-center gap-1 min-w-0">
              <span className="text-white font-bold text-lg leading-none truncate">
                ServiceLink
              </span>
                            <span className="text-orange-400 font-bold text-lg leading-none shrink-0">
                Pro
              </span>
                            <span className="w-2 h-2 rounded-full bg-orange-400 ml-0.5 mt-0.5 shrink-0" />
                        </div>
                    </div>
                    {/* Close button — mobile only */}
                    <button
                        onClick={() => dispatch(closeSidebar())}
                        className="md:hidden text-white/60 hover:text-white p-1 shrink-0"
                        aria-label="Close menu"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="mx-4 my-3">
                    <div className="flex items-center gap-2 bg-white/10 rounded-md px-3 py-2">
                        <span className="text-orange-300 text-sm">{icon}</span>
                        <span className="text-white text-sm font-medium truncate">
              {organizationName ?? "Loading..."}
            </span>
                    </div>
                </div>

                <nav className="flex-1 px-2 space-y-0.5 mt-2 overflow-y-auto">
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
                                <item.icon size={17} className="shrink-0" />
                                <span className="truncate">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-4 py-4 border-t border-white/10 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-white text-xs font-semibold truncate">
                            {fullName ?? "Loading..."}
                        </p>
                        <p className="text-gray-400 text-xs">{formatRole(role)}</p>
                    </div>
                    <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-semibold shrink-0">
            {planBadgeText}
          </span>
                </div>
            </aside>
        </>
    );
}
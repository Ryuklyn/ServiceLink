"use client";

import { useState } from "react";
import Sidebar from "@/components/dashboard/admin/Sidebar";
import TopHeader from "@/components/dashboard/admin/TopHeader";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-slate-100 text-slate-800 antialiased overflow-hidden">
            {/* 1. PERSISTENT SIDEBAR (In-flow on desktop, overlay on mobile) */}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            {/* 2. MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                {/* TOP HEADER */}
                <TopHeader
                    userName="Super Admin"
                    userEmail="admin@servicelink.com"
                    userInitials="SA"
                    onMenuClick={() => setIsSidebarOpen(true)}
                />

                {/* DYNAMIC PAGE CONTENT */}
                <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
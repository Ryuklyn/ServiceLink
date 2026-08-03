import type { Metadata } from "next";
import AdminAuthGuard from "@/components/dashboard/admin/AdminAuthGuard";
import Sidebar from "@/components/dashboard/admin/Sidebar";
import TopHeader from "@/components/dashboard/admin/TopHeader";

export const metadata: Metadata = {
    title: "ServiceLink Admin",
    description: "ServiceLink marketplace admin dashboard",
};

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <AdminAuthGuard>
            <div className="flex h-screen w-full bg-slate-100 text-slate-800 antialiased overflow-hidden">
                {/* 1. PERSISTENT SIDEBAR */}
                <Sidebar />

                {/* 2. MAIN CONTENT AREA */}
                <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
                    {/* TOP HEADER */}
                    <TopHeader
                        userName="Super Admin"
                        userEmail="admin@servicelink.com"
                        userInitials="SA"
                    />

                    {/* DYNAMIC PAGE CONTENT */}
                    <main className="flex-1 p-6 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        </AdminAuthGuard>
    );
}
import type { Metadata } from "next";
import ProSidebar from "@/components/dashboard/business/ProSidebar";
import ProNavbar from "@/components/dashboard/business/ProNavbar";

export const metadata: Metadata = {
    title: "ServiceLink Pro - Dashboard",
    description: "Hotel service management dashboard",
};

export default function BusinessDashboardLayout({
                                                    children,
                                                }: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <ProSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <ProNavbar />
                <main className="flex-1 overflow-y-auto p-6 bg-gray-100">
                    {children}
                </main>
            </div>
        </div>
    );
}
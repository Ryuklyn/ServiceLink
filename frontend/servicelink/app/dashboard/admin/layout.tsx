import type { Metadata } from "next";
import AdminAuthGuard from "@/components/dashboard/admin/AdminAuthGuard";

export const metadata: Metadata = {
    title: "ServiceLink Admin",
    description: "ServiceLink marketplace admin dashboard",
};

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return <AdminAuthGuard>{children}</AdminAuthGuard>;
}
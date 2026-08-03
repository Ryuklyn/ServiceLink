"use client";

import Sidebar from "./Sidebar";
import TopHeader from "./TopHeader";
import KpiCards from "./KpiCards";
import UserTable from "./UserTable";
import type { UserRow } from "./types";

export default function AdminDashboard() {
    const handleAddProvider = () => {
        // TODO: wire up to your "Invite Provider" modal / route
        console.log("Add new provider clicked");
    };

    const handleRowAction = (row: UserRow) => {
        // TODO: wire up to a dropdown menu / KYC review drawer
        console.log("Row action clicked for", row.name);
    };

    return (
        <div className="bg-gray-50 text-gray-800 font-sans flex antialiased min-h-screen">
            <Sidebar activeId="dashboard" />

            <div className="flex-1 flex flex-col min-w-0">
                <TopHeader
                    userName="Super Admin"
                    userEmail="admin@servicelink.com"
                    userInitials="SA"
                />

                <main className="p-6 space-y-6 flex-1 overflow-y-auto">
                    <KpiCards />
                    <UserTable
                        onAddProvider={handleAddProvider}
                        onRowAction={handleRowAction}
                    />
                </main>
            </div>
        </div>
    );
}
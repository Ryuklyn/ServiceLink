"use client";

import { useState, useCallback } from "react";
import KpiCards from "./KpiCards";
import UserTable from "./UserTable";
import type { UserRow } from "./types";

export default function AdminDashboard() {
    const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

    const handleAddProvider = useCallback(() => {
        setIsInviteModalOpen(true);
    }, []);

    const handleRowAction = useCallback((row: UserRow) => {
        setSelectedUser(row);
        console.log("Row action clicked for", row.name);
    }, []);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* PAGE CONTENT */}
            <KpiCards />
            <UserTable
                onAddProvider={handleAddProvider}
                onRowAction={handleRowAction}
            />

            {/* INVITE PROVIDER MODAL */}
            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900">Invite New Service Provider</h3>
                        <p className="text-xs text-slate-500">
                            Send an onboarding invitation link directly to the technician or enterprise contractor.
                        </p>
                        <input
                            type="email"
                            placeholder="provider@example.com"
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setIsInviteModalOpen(false)}
                                className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    alert("Invitation sent!");
                                    setIsInviteModalOpen(false);
                                }}
                                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            >
                                Send Invite
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
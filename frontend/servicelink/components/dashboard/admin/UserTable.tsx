"use client";

import { MoreVertical, Filter, Plus } from "lucide-react";
import StatusBadge from "./StatusBadge";
import type { UserRow } from "./types";

const DEFAULT_ROWS: UserRow[] = [
    {
        id: "1",
        name: "Ram Bahadur Shrestha",
        email: "ram@electricians.np",
        initials: "RB",
        roleOrService: "Technician (Electrical)",
        status: "verified",
        joinedDate: "Aug 01, 2026",
        avatarTone: "slate",
    },
    {
        id: "2",
        name: "Himalayan Climate Tech",
        email: "contact@himalayan.com",
        initials: "HT",
        roleOrService: "Agency (HVAC & Cooling)",
        status: "manual_audit",
        joinedDate: "Aug 03, 2026",
        avatarTone: "amber",
    },
];

const AVATAR_TONE_CLASSES: Record<UserRow["avatarTone"], string> = {
    slate: "bg-slate-200 text-slate-700",
    amber: "bg-amber-100 text-amber-700",
};

interface UserTableProps {
    rows?: UserRow[];
    onAddProvider?: () => void;
    onRowAction?: (row: UserRow) => void;
}

export default function UserTable({
                                      rows = DEFAULT_ROWS,
                                      onAddProvider,
                                      onRowAction,
                                  }: UserTableProps) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-base font-bold text-gray-900">
                        User & Provider Management
                    </h2>
                    <p className="text-xs text-gray-500">
                        Review KYC approvals, individual technicians, and corporate users.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50">
                        <Filter size={14} />
                        Filter
                    </button>
                    <button
                        onClick={onAddProvider}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={14} />
                        Add New Provider
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3">User / Provider</th>
                        <th className="px-6 py-3">Role / Service</th>
                        <th className="px-6 py-3">KYC Status</th>
                        <th className="px-6 py-3">Joined Date</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {rows.map((row) => (
                        <tr key={row.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 flex items-center gap-3">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                                        AVATAR_TONE_CLASSES[row.avatarTone]
                                    }`}
                                >
                                    {row.initials}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900">{row.name}</p>
                                    <p className="text-xs text-gray-400">{row.email}</p>
                                </div>
                            </td>
                            <td className="px-6 py-4">{row.roleOrService}</td>
                            <td className="px-6 py-4">
                                <StatusBadge status={row.status} />
                            </td>
                            <td className="px-6 py-4 text-xs text-gray-500">
                                {row.joinedDate}
                            </td>
                            <td className="px-6 py-4 text-right">
                                {row.status === "manual_audit" ? (
                                    <button
                                        onClick={() => onRowAction?.(row)}
                                        className="px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded hover:bg-amber-100"
                                    >
                                        Review KYC
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => onRowAction?.(row)}
                                        className="text-gray-400 hover:text-gray-600"
                                        aria-label="More actions"
                                    >
                                        <MoreVertical size={16} />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
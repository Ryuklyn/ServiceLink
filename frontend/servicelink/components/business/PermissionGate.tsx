"use client";

import React from "react";
import { useSelector } from "react-redux";
import { ShieldAlert } from "lucide-react";
import type { RootState } from "@/store";
import type { WorkspaceRole } from "@/store/slices/proSessionSlice";

interface PermissionGateProps {
    allowedRoles: WorkspaceRole[];
    children: React.ReactNode;
}

export default function PermissionGate({ allowedRoles, children }: PermissionGateProps) {
    const { role, status } = useSelector((state: RootState) => state.proSession);

    if (status === "loading" || status === "idle") {
        return (
            <div className="p-8 text-center text-sm text-slate-400 font-medium animate-pulse">
                Checking permissions...
            </div>
        );
    }

    const hasAccess = role && allowedRoles.includes(role);

    if (!hasAccess) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center mx-auto text-red-500">
                    <ShieldAlert size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-900">403 — Access Denied</h2>
                <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                    You do not have the required permissions to view this module. If you believe this is an error, contact your organization administrator.
                </p>
            </div>
        );
    }

    return <>{children}</>;
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import { kycAdminApi } from "@/store/slices/features/kyc/kycAdminApi";
import { toBadgeStatus } from "@/store/slices/features/kyc/kycTypes";
import KpiCards from "./KpiCards";
import UserTable from "./UserTable";
import type { UserRow, KpiCard } from "./types";

interface DashboardStats {
    totalRevenue: number;
    activeProSubscriptions: number;
    verifiedProviders: number;
    pendingKycCount: number;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [rows, setRows] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        
        async function loadData() {
            try {
                // Fetch dashboard statistics
                const statsRes = await api.get<DashboardStats>("/admin/dashboard/stats");
                
                // Fetch KYC submissions
                const kycList = await kycAdminApi.list();

                if (!active) return;

                setStats(statsRes.data);

                // Map KYC submissions to UserRow format
                const mapped: UserRow[] = kycList.map((item) => {
                    const initials = item.fullName 
                        ? item.fullName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) 
                        : "?";
                    const status = toBadgeStatus(item.status);
                    return {
                        id: String(item.id),
                        name: item.fullName,
                        email: item.email || item.applicantIdentifier,
                        initials: initials,
                        avatarUrl: item.photoUrl ?? null,
                        roleOrService: `Technician (${item.primaryService || "—"})`,
                        status: status,
                        joinedDate: new Date(item.submittedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "2-digit",
                            year: "numeric",
                        }),
                        avatarTone: status === "manual_audit" || status === "pending_kyc" ? "amber" : "slate",
                    };
                });

                setRows(mapped);
            } catch (err) {
                console.error("Failed to load dashboard data:", err);
            } finally {
                if (active) setLoading(false);
            }
        }

        loadData();

        return () => {
            active = false;
        };
    }, []);

    const handleRowAction = useCallback((row: UserRow) => {
        router.push(`/dashboard/admin/kyc?id=${row.id}`);
    }, [router]);

    const kpis: KpiCard[] = [
        {
            id: "revenue",
            label: "Total Revenue (Gross)",
            value: stats ? `NPR ${stats.totalRevenue.toLocaleString()}` : "NPR 0",
            deltaTone: "positive",
        },
        {
            id: "pro-subscription",
            label: "Active Pro Subscriptions",
            value: stats ? `${stats.activeProSubscriptions} Active` : "0 Active",
            sublabel: "Starter & Growth",
            deltaTone: "neutral",
        },
        {
            id: "providers",
            label: "Verified Providers",
            value: stats ? `${stats.verifiedProviders} Techs` : "0 Techs",
            sublabel: "Active on Platform",
            deltaTone: "neutral",
        },
        {
            id: "action",
            label: "Action Needed (KYC/Disputes)",
            value: stats ? `${stats.pendingKycCount} Pending` : "0 Pending",
            sublabel: "Requires Review",
            deltaTone: "warning",
        },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* PAGE CONTENT */}
            <KpiCards kpis={kpis} />
            <UserTable
                rows={rows}
                onRowAction={handleRowAction}
            />
        </div>
    );
}

// src/components/dashboard/admin/subscription/SubscriptionKpiCards.tsx
"use client";

import { useEffect } from "react";
import { BarChart3, Users, PieChart, CalendarClock, TrendingUp } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSubscriptionStats } from "@/store/slices/features/admin-subscription/adminSubscriptionSlice";
import { formatCurrency } from "./utils";

function CardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
            <div className="h-3 w-24 bg-slate-200 rounded mb-4" />
            <div className="h-6 w-16 bg-slate-200 rounded mb-3" />
            <div className="h-3 w-20 bg-slate-100 rounded" />
        </div>
    );
}

export default function SubscriptionKpiCards() {
    const dispatch = useAppDispatch();
    const { data: stats, status, error } = useAppSelector((s) => s.adminSubscription.stats);

    useEffect(() => {
        if (status === "idle") dispatch(fetchSubscriptionStats());
    }, [status, dispatch]);

    const isLoading = status === "loading" || status === "idle";

    if (isLoading || !stats) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <CardSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (status === "failed") {
        return (
            <div className="bg-white rounded-2xl border border-red-100 p-4 text-xs text-red-500">
                {error ?? "Failed to load subscription stats."}
            </div>
        );
    }

    const cards = [
        {
            label: "Total Revenue",
            value: formatCurrency(stats.totalRevenue),
            growth: stats.revenueGrowthPct,
            icon: BarChart3,
        },
        {
            label: "Active Paid Subscriptions",
            value: stats.activePaidSubscriptions.toLocaleString(),
            growth: stats.activePaidGrowthPct,
            icon: Users,
        },
        {
            label: "Trial Conversions",
            value: `${stats.trialConversionPct.toFixed(1)}%`,
            growth: stats.trialConversionGrowthPct,
            icon: PieChart,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => {
                const Icon = card.icon;
                const positive = card.growth >= 0;
                return (
                    <div key={card.label} className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col">
                        <div className="flex items-start justify-between">
                            <span className="text-xs font-medium text-slate-500">{card.label}</span>
                            <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
                <Icon size={16} />
              </span>
                        </div>
                        <span className="text-2xl font-bold text-slate-900 mt-3">{card.value}</span>
                        <span
                            className={`flex items-center gap-1 text-[11px] font-medium mt-2 ${
                                positive ? "text-emerald-600" : "text-red-500"
                            }`}
                        >
              <TrendingUp size={12} className={positive ? "" : "rotate-180"} />
                            {positive ? "+" : ""}
                            {card.growth.toFixed(1)}% from last month
            </span>
                    </div>
                );
            })}

            <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col">
                <div className="flex items-start justify-between">
                    <span className="text-xs font-medium text-slate-500">Expiring Soon</span>
                    <span className="w-9 h-9 rounded-lg flex items-center justify-center bg-orange-50 text-orange-600">
            <CalendarClock size={16} />
          </span>
                </div>
                <span className="text-2xl font-bold text-slate-900 mt-3">{stats.expiringSoonCount}</span>
                <span className="text-[11px] font-medium text-red-500 mt-2">
          Within {stats.expiringSoonWindowDays} days
        </span>
            </div>
        </div>
    );
}
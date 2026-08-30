"use client";

import { ShieldCheck, CircleCheckBig, Star } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface StatItem {
  icon: React.ReactNode;
  labelKey: string;
}

export default function StatsSection() {
  const { t } = useTranslation();

  const displayStats: StatItem[] = [
    { icon: <ShieldCheck className="w-5 h-5" strokeWidth={1.8} />, labelKey: "dashboard.verifiedProvidersStat" },
    { icon: <CircleCheckBig className="w-5 h-5" strokeWidth={1.8} />, labelKey: "dashboard.servicesCompletedStat" },
    { icon: <Star className="w-5 h-5" strokeWidth={1.8} />, labelKey: "dashboard.averageRatingStat" },
  ];

  return (
      <section className="mb-6 sm:mb-8">
        <div
            className="rounded-2xl px-5 sm:px-10 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0 navbar-theme-container border border-border"
        >
          {displayStats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3 w-full sm:w-auto text-navbar-text">
                <span className="text-primary shrink-0">{stat.icon}</span>
                <span className="font-semibold text-sm">
              {t(stat.labelKey)}
            </span>

                {/* Divider — desktop only, between items */}
                {index < displayStats.length - 1 && (
                    <div className="hidden sm:block w-px h-5 bg-navbar-text/20 ml-8" />
                )}
              </div>
          ))}
        </div>
      </section>
  );
}
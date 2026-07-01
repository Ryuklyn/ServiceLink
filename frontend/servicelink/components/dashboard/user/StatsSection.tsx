"use client";

import { ShieldCheck, CircleCheckBig, Star } from "lucide-react";

interface StatItem {
  icon: React.ReactNode;
  label: string;
}

interface StatsSectionProps {
  stats?: StatItem[];
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const defaultStats: StatItem[] = [
    { icon: <ShieldCheck className="w-5 h-5" strokeWidth={1.8} />, label: "500+ Verified Providers" },
    { icon: <CircleCheckBig className="w-5 h-5" strokeWidth={1.8} />, label: "10,000+ Services Completed" },
    { icon: <Star className="w-5 h-5" strokeWidth={1.8} />, label: "4.8 Average Rating" },
  ];

  const displayStats = stats || defaultStats;

  return (
      <section className="mb-6 sm:mb-8">
        <div
            className="rounded-2xl px-5 sm:px-10 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0"
            style={{ background: "#1e3a8a" }}
        >
          {displayStats.map((stat, index) => (
              <div key={index} className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-[#e8683f] shrink-0">{stat.icon}</span>
                <span className="text-white font-semibold text-sm">
              {stat.label}
            </span>

                {/* Divider — desktop only, between items */}
                {index < displayStats.length - 1 && (
                    <div className="hidden sm:block w-px h-5 bg-white/20 ml-8" />
                )}
              </div>
          ))}
        </div>
      </section>
  );
}
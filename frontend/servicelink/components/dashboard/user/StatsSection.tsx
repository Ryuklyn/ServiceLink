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
    {
      icon: <ShieldCheck className="w-5 h-5" strokeWidth={1.8} />,
      label: "500+ Verified Providers",
    },
    {
      icon: <CircleCheckBig className="w-5 h-5" strokeWidth={1.8} />,
      label: "10,000+ Services Completed",
    },
    {
      icon: <Star className="w-5 h-5" strokeWidth={1.8} />,
      label: "4.8 Average Rating",
    },
  ];

  const displayStats = stats || defaultStats;

  return (
    <section className="mb-8">
      <div
        className="rounded-2xl px-10 py-5 flex items-center justify-between"
        style={{ background: "#1e3a8a" }}
      >
        {displayStats.map((stat, index) => (
          <div key={index} className="flex items-center gap-3">
            {/* Orange icon */}
            <span className="text-[#e8683f]">{stat.icon}</span>
            {/* Label */}
            <span className="text-white font-semibold text-sm">
              {stat.label}
            </span>

            {/* Divider — not after last item */}
            {index < displayStats.length - 1 && (
              <div className="w-px h-5 bg-white/20 ml-8" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

"use client";

import { CheckCircle2, Award, Star } from "lucide-react";

interface StatItem {
  icon: React.ReactNode;
  label: string;
  value: string;
}

interface StatsSectionProps {
  stats?: StatItem[];
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const defaultStats: StatItem[] = [
    {
      icon: <CheckCircle2 className="w-8 h-8" />,
      label: "500+ Verified Providers",
      value: "500+",
    },
    {
      icon: <Award className="w-8 h-8" />,
      label: "10,000+ Services Completed",
      value: "10,000+",
    },
    {
      icon: <Star className="w-8 h-8" />,
      label: "4.8 Average Rating",
      value: "4.8",
    },
  ];

  const displayStats = stats || defaultStats;

  return (
    <section className="bg-gradient-to-r from-[#1e3a8a] to-[#2d5aa8] rounded-2xl p-12 text-white">
      <div className="grid grid-cols-3 gap-8 text-center">
        {displayStats.map((stat, index) => (
          <div key={index}>
            <div className="mb-3 flex justify-center">{stat.icon}</div>
            <p className="text-lg font-semibold">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

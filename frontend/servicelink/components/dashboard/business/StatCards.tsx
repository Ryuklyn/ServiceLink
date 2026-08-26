import { Users, ClipboardList, TrendingUp, CreditCard } from "lucide-react";
import { ProKpiDashboardResponse } from "@/services/proJobService";

interface StatCardsProps {
  kpi: ProKpiDashboardResponse | null;
  loading: boolean;
}

export default function StatCards({ kpi, loading }: StatCardsProps) {
  const stats = [
    {
      label: "Active Providers",
      value: loading ? "..." : (kpi?.activeProviders ?? 0).toString(),
      sub: loading ? "Loading..." : `${kpi?.pendingApprovals ?? 0} pending approval`,
      icon: Users,
      iconBg: "bg-[#1e3a8a]/10",
      iconColor: "text-[#1e3a8a]",
    },
    {
      label: "Jobs This Month",
      value: loading ? "..." : (kpi?.jobsThisMonth ?? 0).toString(),
      sub: loading ? "Loading..." : `${kpi?.jobsInProgress ?? 0} in progress`,
      icon: ClipboardList,
      iconBg: "bg-[#e8683f]/10",
      iconColor: "text-[#e8683f]",
    },
    {
      label: "SLA Compliance",
      value: loading ? "..." : `${(kpi?.slaComplianceRate ?? 100).toFixed(1)}%`,
      sub: "Target: 95.0%",
      icon: TrendingUp,
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
    },
    {
      label: "Monthly Spend",
      value: loading ? "..." : `Rs. ${(kpi?.monthlySpend ?? 0).toLocaleString()}`,
      sub: loading ? "Loading..." : `Limit: Rs. 150,000`,
      icon: CreditCard,
      iconBg: "bg-red-50",
      iconColor: "text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div key={s.label} className="bg-white rounded-xl p-5 flex items-start justify-between shadow-sm border border-gray-100 animate-fade-in">
          <div>
            <p className="text-sm text-gray-500 font-medium">{s.label}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.iconBg}`}>
            <s.icon size={20} className={s.iconColor} />
          </div>
        </div>
      ))}
    </div>
  );
}
import { ProKpiDashboardResponse } from "@/services/proJobService";

interface MonthlyBudgetProps {
  kpi: ProKpiDashboardResponse | null;
  loading: boolean;
}

export default function MonthlyBudget({ kpi, loading }: MonthlyBudgetProps) {
  const total = 150000;
  const spent = loading ? 0 : (kpi?.monthlySpend ?? 0);
  const remaining = Math.max(0, total - spent);

  // Calculate widths for progress bar
  const spentPct = Math.min(100, (spent / total) * 100);
  const remainingPct = Math.max(0, 100 - spentPct);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between h-full">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-5">Budget Tracker</h2>

        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-400 font-medium text-base">Total Budget Limit</span>
          <span className="text-slate-900 font-bold text-base">Rs. {total.toLocaleString()}</span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex mb-6">
          <div
            className="bg-[#1e3a8a] h-full transition-all duration-1000"
            style={{ width: `${spentPct}%` }}
          />
          <div
            className="bg-slate-200 h-full transition-all duration-1000"
            style={{ width: `${remainingPct}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1e3a8a] shrink-0" />
            <span className="text-sm font-medium text-slate-400">Total Spent</span>
          </div>
          <p className="text-base font-bold text-slate-900">
            Rs. {loading ? "..." : spent.toLocaleString()}
          </p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200 shrink-0" />
            <span className="text-sm font-medium text-slate-400">Remaining</span>
          </div>
          <p className="text-base font-bold text-slate-900">
            Rs. {loading ? "..." : remaining.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
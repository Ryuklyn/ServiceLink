import { Users, ShieldCheck } from "lucide-react";
import { ProKpiDashboardResponse } from "@/services/proJobService";

interface ProviderHealthSummaryProps {
  kpi: ProKpiDashboardResponse | null;
  loading: boolean;
}

export default function ProviderHealthSummary({ kpi, loading }: ProviderHealthSummaryProps) {
  const activeCount = loading ? 0 : (kpi?.activeProviders ?? 0);
  const pendingCount = loading ? 0 : (kpi?.pendingApprovals ?? 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between h-full">
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-5">Platform Workforce Status</h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-3 bg-[#1e3a8a]/5 rounded-xl border border-[#1e3a8a]/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1e3a8a]/10 flex items-center justify-center">
                <Users size={20} className="text-[#1e3a8a]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Total Pool Providers</p>
                <p className="text-xs text-slate-500 font-medium">Verified & active in your network</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-[#1e3a8a]">{loading ? "..." : activeCount}</p>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded border border-emerald-100">
                ACTIVE
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#e8683f]/5 rounded-xl border border-[#e8683f]/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#e8683f]/10 flex items-center justify-center">
                <ShieldCheck size={20} className="text-[#e8683f]" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">Pending KYB Review</p>
                <p className="text-xs text-slate-500 font-medium">Applicants waiting for approval</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-[#e8683f]">{loading ? "..." : pendingCount}</p>
              <span className="text-[10px] bg-amber-50 text-amber-600 font-bold px-1.5 py-0.5 rounded border border-amber-100">
                PENDING
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
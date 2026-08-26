import { ProKpiDashboardResponse } from "@/services/proJobService";

interface SLAPerformanceProps {
  kpi: ProKpiDashboardResponse | null;
  loading: boolean;
}

export default function SLAPerformance({ kpi, loading }: SLAPerformanceProps) {
  const onTimePct = loading ? 100.0 : (kpi?.slaComplianceRate ?? 100.0);
  const expected = kpi?.expectedToday ?? 0;
  const present = kpi?.presentToday ?? 0;
  const late = kpi?.lateToday ?? 0;
  const missing = kpi?.missingToday ?? 0;

  const metrics = [
    { label: "Present Today", value: present.toString(), color: "text-[#1e3a8a]", bar: "bg-[#1e3a8a]", pct: expected > 0 ? (present / expected) * 100 : 0 },
    { label: "Late Today", value: late.toString(), color: "text-[#e8683f]", bar: "bg-[#e8683f]", pct: expected > 0 ? (late / expected) * 100 : 0 },
    { label: "Missing Today", value: missing.toString(), color: "text-red-500", bar: "bg-red-500", pct: expected > 0 ? (missing / expected) * 100 : 0 },
  ];

  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference * (1 - onTimePct / 100);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm flex flex-col justify-between h-full">
      <div>
        <h2 className="text-base font-bold text-gray-800 mb-5">SLA Performance</h2>

        <div className="flex justify-center mb-6">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="#f1f5f9" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">
                {loading ? "..." : `${onTimePct.toFixed(1)}%`}
              </span>
              <span className="text-xs text-gray-400 font-medium mt-0.5">On-time</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between gap-4">
            <span className="text-sm font-medium text-gray-600 w-28 shrink-0">{m.label}</span>
            <div className="flex-1 bg-slate-100 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${m.bar}`}
                style={{ width: `${m.pct}%` }}
              />
            </div>
            <span className={`text-sm font-bold w-8 text-right ${m.color}`}>{m.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
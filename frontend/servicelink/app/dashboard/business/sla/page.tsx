"use client";

import React, { useEffect, useState } from "react";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Target,
} from "lucide-react";
import { proJobService, ProSlaDashboardResponse } from "@/services/proJobService";

const NAVY = "#1e3a8a";
const ORANGE = "#e8683f";

const getStatusStyles = (status: string) => {
  if (status === "Excellent") return "bg-emerald-50 text-emerald-700";
  if (status === "Good") return "bg-blue-50 text-[#1e3a8a]";
  if (status === "Needs Improvement") return "bg-amber-50 text-amber-700";
  return "bg-slate-100 text-slate-600";
};

export default function SlaPage() {
  const [slaData, setSlaData] = useState<ProSlaDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSla() {
      try {
        const res = await proJobService.getSlaDashboard();
        setSlaData(res);
      } catch (err) {
        console.error("Failed to load SLA stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSla();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a8a]"></div>
        <p className="text-gray-400 text-sm font-medium">Loading SLA performance insights...</p>
      </div>
    );
  }

  const kpis = [
    {
      label: "Overall Compliance",
      value: `${(slaData?.overallCompliance ?? 100).toFixed(1)}%`,
      delta: "Target: 95.0%",
      deltaDirection: "up",
      valueColor: "text-slate-900",
    },
    {
      label: "Avg Response Time",
      value: slaData?.avgResponseTime ?? "N/A",
      delta: "Arrival delay difference",
      deltaDirection: "neutral",
      valueColor: "text-slate-900",
    },
    {
      label: "Overdue Jobs",
      value: (slaData?.overdueJobs ?? 0).toString(),
      delta: "Needs immediate assignment",
      deltaDirection: "warn",
      valueColor: "text-red-600",
    },
    {
      label: "Cancel Rate",
      value: `${(slaData?.cancelRate ?? 0).toFixed(1)}%`,
      delta: "Target < 5%",
      deltaDirection: "neutral",
      valueColor: "",
      valueColorHex: ORANGE,
    },
  ];

  const trendData = slaData?.trend || [];
  const maxTrend = 100;
  const highlightFromIndex = trendData.length - 2;

  return (
    <main className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-50/40 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-200/60 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">SLA & Compliance</h1>
          <p className="text-sm text-slate-500 mt-0.5">Service level performance across providers and categories</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-slate-500 font-medium">{kpi.label}</p>
            <p
              className={`text-3xl font-extrabold mt-2 ${kpi.valueColor}`}
              style={kpi.valueColorHex ? { color: kpi.valueColorHex } : undefined}
            >
              {kpi.value}
            </p>
            <div className="flex items-center gap-1.5 mt-2">
              {kpi.deltaDirection === "up" && <TrendingUp size={13} className="text-emerald-500" />}
              {kpi.deltaDirection === "warn" && <AlertTriangle size={13} className="text-red-500" />}
              {kpi.deltaDirection === "neutral" && <Target size={13} className="text-slate-400" />}
              <p
                className={`text-xs font-medium ${
                  kpi.deltaDirection === "up"
                    ? "text-emerald-600"
                    : kpi.deltaDirection === "warn"
                    ? "text-red-500"
                    : "text-slate-400"
                }`}
              >
                {kpi.delta}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Trend chart + Category performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SLA Compliance Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-6">SLA Compliance Trend</h2>
          <div className="flex items-stretch gap-2">
            <div className="flex flex-col justify-between text-xs text-slate-400 font-medium pr-2 pb-6">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>
            <div className="flex-1 grid grid-cols-6 gap-3 sm:gap-5 items-end h-64 border-b border-gray-100">
              {trendData.map((d, idx) => (
                <div key={d.month} className="flex flex-col items-center justify-end h-full">
                  <div
                    className="w-full max-w-[56px] rounded-t-md transition-all"
                    style={{
                      height: `${(d.value / maxTrend) * 100}%`,
                      backgroundColor: idx >= highlightFromIndex ? NAVY : "#64748b",
                    }}
                    title={`${d.value}%`}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-6 gap-3 sm:gap-5 mt-2 pl-8">
            {trendData.map((d) => (
              <span key={d.month} className="text-xs text-slate-400 font-medium text-center">
                {d.month}
              </span>
            ))}
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-5">Category Performance</h2>
          <div className="space-y-5">
            {slaData?.categories.length === 0 ? (
              <p className="text-xs text-slate-400 italic text-center py-10">No category SLA calculations logged.</p>
            ) : (
              slaData?.categories.map((cat) => (
                <div key={cat.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-slate-700">{cat.label}</span>
                    <span className="text-sm font-bold text-slate-900">{cat.value.toFixed(1)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${cat.value}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Provider SLA Performance table */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-4">Provider SLA Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Provider</th>
                <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Category</th>
                <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Total Jobs</th>
                <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">On-Time %</th>
                <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">SLA Breaches</th>
                <th className="py-2.5 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {slaData?.providers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                    No provider SLA metrics calculated yet.
                  </td>
                </tr>
              ) : (
                slaData?.providers.map((row, idx) => (
                  <tr
                    key={row.provider}
                    className={`border-b border-gray-50 hover:bg-slate-50/60 transition-colors ${
                      idx === (slaData?.providers.length ?? 0) - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="py-3 pr-4 font-semibold" style={{ color: NAVY }}>
                      {row.provider}
                    </td>
                    <td className="py-3 pr-4 text-slate-600 font-medium">{row.category}</td>
                    <td className="py-3 pr-4 text-slate-600 font-medium">{row.totalJobs}</td>
                    <td className="py-3 pr-4 font-bold text-slate-900">{row.onTime.toFixed(1)}%</td>
                    <td className="py-3 pr-4 text-slate-600 font-medium">{row.breaches}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${getStatusStyles(row.status)}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
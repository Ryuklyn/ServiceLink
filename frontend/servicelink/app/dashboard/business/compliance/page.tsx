"use client";

import React, { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, ShieldX, Download } from "lucide-react";
import { proJobService, ProComplianceDashboardResponse } from "@/services/proJobService";

const NAVY = "#1e3a8a";

const getKybStyles = (status: string) => {
  if (status === "APPROVED" || status === "VERIFIED") return "bg-emerald-50 text-emerald-600";
  if (status === "PENDING" || status === "UNDER_REVIEW") return "bg-amber-50 text-amber-600";
  if (status === "REJECTED" || status === "DECLINED") return "bg-red-50 text-red-500";
  return "bg-slate-100 text-slate-600";
};

const getLogStatusStyles = (status: string) => {
  if (status === "VERIFIED" || status === "APPROVED") return "bg-slate-100 text-slate-600";
  if (status === "PENDING") return "bg-amber-50 text-amber-600";
  if (status === "FLAGGED" || status === "LATE" || status === "REJECTED") return "bg-red-50 text-red-500";
  return "bg-slate-100 text-slate-600";
};

export default function CompliancePage() {
  const [compData, setCompData] = useState<ProComplianceDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCompliance() {
      try {
        const res = await proJobService.getComplianceDashboard();
        setCompData(res);
      } catch (err) {
        console.error("Failed to load compliance details:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCompliance();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a8a]"></div>
        <p className="text-gray-400 text-sm font-medium">Loading compliance and audit trail...</p>
      </div>
    );
  }

  const kybSummary = {
    approved: compData?.approvedCount ?? 0,
    pending: compData?.pendingCount ?? 0,
    rejected: compData?.rejectedCount ?? 0,
  };

  const providers = compData?.providers || [];
  const auditLogs = compData?.auditLogs || [];

  return (
    <main className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-50/40 min-h-screen">
      {/* Page heading + export action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/60 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Compliance</h1>
          <p className="text-sm text-slate-500 mt-0.5">Provider verification and platform audit trail</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors self-end sm:self-auto">
          <Download size={15} />
          Export Logs
        </button>
      </div>

      {/* KYB summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4 animate-fade-in">
          <div className="w-11 h-11 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
            <ShieldCheck size={22} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">KYB Approved</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{kybSummary.approved}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4 animate-fade-in">
          <div className="w-11 h-11 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <ShieldAlert size={22} className="text-amber-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Verification Pending</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{kybSummary.pending}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex items-center gap-4 animate-fade-in">
          <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <ShieldX size={22} className="text-red-500" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">KYB Rejected / Declined</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{kybSummary.rejected}</p>
          </div>
        </div>
      </div>

      {/* Provider Verification Status table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm animate-fade-in">
        <div className="px-6 pt-5 pb-1">
          <h2 className="text-sm font-bold text-slate-900">Provider Verification Status</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="py-3 pl-6 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Provider</th>
                <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Category</th>
                <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">KYB Status</th>
                <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Joined Date</th>
                <th className="py-3 pr-6 font-semibold text-slate-400 text-xs uppercase tracking-wide text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {providers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 italic">
                    No pool providers verified yet.
                  </td>
                </tr>
              ) : (
                providers.map((p, idx) => (
                  <tr
                    key={p.name}
                    className={`border-b border-gray-50 hover:bg-slate-50/60 transition-colors ${
                      idx === providers.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="py-3.5 pl-6 pr-4 font-semibold text-slate-800">{p.name}</td>
                    <td className="py-3.5 pr-4 text-slate-600 font-medium">{p.category}</td>
                    <td className="py-3.5 pr-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-md uppercase ${getKybStyles(p.status)}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-500 font-medium">{p.joinedDate}</td>
                    <td className="py-3.5 pr-6 text-right">
                      <button className="text-sm font-bold hover:underline" style={{ color: NAVY }}>
                        View Docs
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Logs table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm animate-fade-in">
        <div className="px-6 pt-5 pb-1 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Audit Logs</h2>
          <span className="text-xs text-slate-400 font-medium">Showing last {auditLogs.length} events</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left">
                <th className="py-3 pl-6 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Timestamp</th>
                <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Action</th>
                <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Subject / Details</th>
                <th className="py-3 pr-4 font-semibold text-slate-400 text-xs uppercase tracking-wide">Performed By</th>
                <th className="py-3 pr-6 font-semibold text-slate-400 text-xs uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 italic">
                    No compliance audit log events recorded yet.
                  </td>
                </tr>
              ) : (
                auditLogs.map((log, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-gray-50 hover:bg-slate-50/60 transition-colors ${
                      idx === auditLogs.length - 1 ? "border-b-0" : ""
                    }`}
                  >
                    <td className="py-3.5 pl-6 pr-4 font-medium text-xs text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 pr-4 font-semibold text-slate-800">{log.action}</td>
                    <td className="py-3.5 pr-4 text-slate-600 font-medium text-xs">{log.subject}</td>
                    <td className="py-3.5 pr-4 text-slate-600 font-medium">{log.performedBy}</td>
                    <td className="py-3.5 pr-6">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase ${getLogStatusStyles(log.status)}`}>
                        {log.status}
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
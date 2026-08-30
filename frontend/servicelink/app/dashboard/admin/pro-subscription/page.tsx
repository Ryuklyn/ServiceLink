"use client";

import React, { useEffect, useState } from "react";
import {
  CreditCard,
  Search,
  RefreshCw,
  Clock,
  Shield,
  ArrowUpRight,
  TrendingUp,
  X,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Download,
  Building2,
  CheckCircle2,
  HelpCircle,
  XCircle,
  FileText
} from "lucide-react";
import {
  adminProSubscriptionApi,
  ProSubscriptionStats,
  ProSubscriptionRow,
  ProSubscriptionHistory
} from "@/lib/api/adminProSubscriptionApi";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";

const NAVY = "#1e3a8a";
const ORANGE = "#e8683f";

type ModalState =
  | { type: "none" }
  | { type: "history"; row: ProSubscriptionRow }
  | { type: "extend"; row: ProSubscriptionRow }
  | { type: "cancel"; row: ProSubscriptionRow };

export default function ProSubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProSubscriptionStats | null>(null);
  const [subscriptions, setSubscriptions] = useState<ProSubscriptionRow[]>([]);
  
  // Search & filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");

  // Modals state
  const [modal, setModal] = useState<ModalState>({ type: "none" });
  const [historyData, setHistoryData] = useState<ProSubscriptionHistory | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Extend form state
  const [extendDays, setExtendDays] = useState("30");
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, listRes] = await Promise.all([
        adminProSubscriptionApi.getStats(),
        adminProSubscriptionApi.listSubscriptions()
      ]);
      setStats(statsRes);
      setSubscriptions(listRes);
    } catch (err) {
      console.error("Failed to load Pro subscriptions:", err);
      toast.error("Failed to sync Pro subscriptions data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const closeModal = () => {
    setModal({ type: "none" });
    setHistoryData(null);
    setExtendDays("30");
  };

  // Open Details Modal & fetch history
  const handleOpenHistory = async (row: ProSubscriptionRow) => {
    setModal({ type: "history", row });
    setLoadingHistory(true);
    try {
      const res = await adminProSubscriptionApi.getHistory(row.workspaceId);
      setHistoryData(res);
    } catch (err) {
      console.error(`Failed to load history for workspace #${row.workspaceId}:`, err);
      toast.error("Failed to load subscription history logs.");
    } finally {
      setLoadingHistory(false);
    }
  };

  // Cancel subscription action
  const handleConfirmCancel = async () => {
    if (modal.type !== "cancel") return;
    setSubmittingAction(true);
    try {
      const updated = await adminProSubscriptionApi.cancelSubscription(modal.row.workspaceId);
      setSubscriptions(prev => prev.map(s => s.workspaceId === updated.workspaceId ? updated : s));
      toast.success(`Subscription for "${modal.row.organizationName}" cancelled successfully.`);
      closeModal();
      fetchDashboardData(); // update stats
    } catch (err) {
      console.error("Cancellation failed:", err);
      toast.error("Failed to cancel subscription.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Extend subscription action
  const handleConfirmExtend = async () => {
    if (modal.type !== "extend") return;
    const days = parseInt(extendDays);
    if (isNaN(days) || days <= 0) {
      toast.error("Please enter a valid number of days.");
      return;
    }
    setSubmittingAction(true);
    try {
      const updated = await adminProSubscriptionApi.extendSubscription(modal.row.workspaceId, days);
      setSubscriptions(prev => prev.map(s => s.workspaceId === updated.workspaceId ? updated : s));
      toast.success(`Subscription for "${modal.row.organizationName}" extended by ${days} days.`);
      closeModal();
      fetchDashboardData(); // update stats
    } catch (err) {
      console.error("Extension failed:", err);
      toast.error("Failed to extend subscription.");
    } finally {
      setSubmittingAction(false);
    }
  };

  // Generate Report & PDF download
  const handleGenerateReportPDF = (row: ProSubscriptionRow) => {
    try {
      const doc = new jsPDF();
      
      // Header styling
      doc.setFontSize(22);
      doc.setTextColor(30, 58, 138); // Navy
      doc.setFont("helvetica", "bold");
      doc.text("ServiceLink Pro", 14, 20);
      
      doc.setFontSize(13);
      doc.setTextColor(100, 116, 139);
      doc.text("B2B Subscription Audit Report", 14, 28);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Reference ID: ${row.referenceId || "N/A"}`, 14, 34);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);
      
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 44, 196, 44);

      // Section: Subscriber details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text("1. Account Details", 14, 52);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Organization Name: ${row.organizationName}`, 14, 60);
      doc.text(`Workspace ID: ws-${row.workspaceId}`, 14, 66);
      doc.text(`Current Plan Tier: ${row.planType}`, 14, 72);
      doc.text(`Subscription Status: ${row.status}`, 14, 78);
      doc.text(`Started Date: ${row.createdAt ? new Date(row.createdAt).toLocaleDateString() : "N/A"}`, 14, 84);
      doc.text(`Renewal / Expiry Date: ${row.currentPeriodEnd ? new Date(row.currentPeriodEnd).toLocaleDateString() : row.trialEndsAt ? new Date(row.trialEndsAt).toLocaleDateString() + " (Trial)" : "N/A"}`, 14, 90);

      doc.line(14, 96, 196, 96);

      // Section: Transaction history
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("2. Billing Period & Payout Settlement Logs", 14, 104);

      doc.line(14, 107, 196, 107);
      
      // Transactions Table Headers
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Txn Ref ID", 14, 114);
      doc.text("Completed Date", 65, 114);
      doc.text("Gateway", 115, 114);
      doc.text("Amount", 145, 114);
      doc.text("Status", 175, 114);

      doc.line(14, 117, 196, 117);

      doc.setFont("helvetica", "normal");
      let y = 124;

      if (historyData && historyData.transactions.length > 0) {
        historyData.transactions.forEach((tx) => {
          doc.text(tx.referenceId, 14, y);
          doc.text(tx.completedAt ? new Date(tx.completedAt).toLocaleDateString() : "—", 65, y);
          doc.text(tx.gateway || "N/A", 115, y);
          doc.text(`NPR ${tx.amountNpr.toLocaleString()}`, 145, y);
          doc.text(tx.status, 175, y);
          y += 7;
        });
      } else {
        doc.text("No transaction logs recorded for this subscriber account.", 14, y);
        y += 10;
      }

      // Summary
      doc.line(14, y + 2, 196, y + 2);
      doc.setFont("helvetica", "bold");
      doc.text(`Total Billing Volume: NPR ${(row.amountNpr || 0).toLocaleString()}/month`, 14, y + 10);
      
      doc.save(`Pro_Subscription_Report_ws_${row.workspaceId}.pdf`);
      toast.success("PDF audit report generated successfully.");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate subscription PDF.");
    }
  };

  // Get status color mappings
  const getStatusStyles = (status: string) => {
    if (status === "ACTIVE") return "bg-emerald-50 text-emerald-600 border border-emerald-100";
    if (status === "TRIAL") return "bg-sky-50 text-sky-600 border border-sky-100";
    if (status === "PAST_DUE") return "bg-amber-50 text-amber-600 border border-amber-100";
    if (status === "EXPIRED") return "bg-rose-50 text-rose-500 border border-rose-100";
    if (status === "CANCELLED") return "bg-slate-100 text-slate-500 border border-slate-200";
    return "bg-slate-50 text-slate-400";
  };

  // Filter lists
  const filteredSubscriptions = subscriptions.filter(s => {
    const matchesSearch =
      s.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.referenceId && s.referenceId.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === "All" || s.status === statusFilter;
    const matchesPlan = planFilter === "All" || s.planType === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  return (
    <main className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-50/40 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/60 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Pro Subscriptions Manager</h1>
          <p className="text-sm text-slate-500 mt-0.5">Audit corporate B2B ServiceLink Pro subscriptions, manage plans, and review billing logs.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors self-end sm:self-auto"
        >
          <RefreshCw size={15} />
          Sync Data
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a8a]"></div>
          <p className="text-gray-400 text-sm font-medium">Reconciling B2B payment transactions and active licenses...</p>
        </div>
      ) : (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Pro</p>
                <p className="text-2xl font-black text-slate-950 mt-1">{stats?.activeCount ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Trial</p>
                <p className="text-2xl font-black text-slate-950 mt-1">{stats?.trialCount ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                <Clock size={18} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiring Soon</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{stats?.expiringSoonCount ?? 0}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Monthly Revenue</p>
                <p className="text-2xl font-black text-[#1e3a8a] mt-1">NPR {(stats?.monthlyRevenue ?? 0).toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#1e3a8a] flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Toolbar Filters */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex flex-wrap items-center gap-3">
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none bg-slate-50"
                >
                  <option value="All">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="TRIAL">Trial</option>
                  <option value="PAST_DUE">Past Due</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>

                {/* Plan filter */}
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-700 font-semibold focus:outline-none bg-slate-50"
                >
                  <option value="All">All Plans</option>
                  <option value="STARTER">Starter</option>
                  <option value="GROWTH">Growth</option>
                  <option value="ENTERPRISE">Enterprise</option>
                </select>
              </div>

              {/* Search bar */}
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search by company or ref ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-slate-700 font-semibold"
                />
              </div>
            </div>

            {/* Subscriptions Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-gray-100 text-left bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 pl-6 pr-4">Organization / Workspace</th>
                    <th className="py-3.5 pr-4">Plan Tier</th>
                    <th className="py-3.5 pr-4">Renewal / Expiry</th>
                    <th className="py-3.5 pr-4 text-right">Billing amount</th>
                    <th className="py-3.5 pr-4">Status</th>
                    <th className="py-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-semibold">
                  {filteredSubscriptions.map((row) => (
                    <tr key={row.workspaceId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 pl-6 pr-4">
                        <div>
                          <p className="font-extrabold text-slate-900">{row.organizationName}</p>
                          <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                            ws-{row.workspaceId} {row.referenceId ? `(${row.referenceId})` : ""}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-slate-800 text-[11px] font-bold uppercase">{row.planType}</span>
                      </td>
                      <td className="py-4 pr-4 font-medium text-slate-500">
                        {row.status === "TRIAL" && row.trialEndsAt ? (
                          <span>{new Date(row.trialEndsAt).toLocaleDateString()} (Trial)</span>
                        ) : row.currentPeriodEnd ? (
                          <span>{new Date(row.currentPeriodEnd).toLocaleDateString()}</span>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-right font-black text-slate-900">
                        NPR {(row.amountNpr ?? 0).toLocaleString()}
                      </td>
                      <td className="py-4 pr-4">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${getStatusStyles(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => handleOpenHistory(row)}
                            className="px-2.5 py-1 text-[10px] font-extrabold text-[#1e3a8a] border border-[#1e3a8a]/20 bg-[#1e3a8a]/5 rounded-lg hover:bg-[#1e3a8a]/10 transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => setModal({ type: "extend", row })}
                            className="px-2.5 py-1 text-[10px] font-extrabold text-emerald-600 border border-emerald-600/20 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                          >
                            Extend
                          </button>
                          {row.status !== "CANCELLED" && (
                            <button
                              onClick={() => setModal({ type: "cancel", row })}
                              className="px-2.5 py-1 text-[10px] font-extrabold text-red-500 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredSubscriptions.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                        No Pro B2B subscriptions match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Subscription Details & Timeline History Modal */}
      {modal.type === "history" && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl animate-scale-in max-h-[85vh] overflow-y-auto relative">
            <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
              <span>Pro Subscription Statement</span>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${getStatusStyles(modal.row.status)}`}>
                {modal.row.status}
              </span>
            </h3>

            {loadingHistory ? (
              <div className="flex items-center justify-center py-10 gap-2">
                <RefreshCw className="animate-spin text-slate-400" size={16} />
                <span className="text-xs text-slate-400 font-semibold">Loading subscription timelines...</span>
              </div>
            ) : historyData ? (
              <div className="space-y-5 text-xs font-semibold text-slate-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase tracking-wider">Subscriber</span>
                    <span className="font-extrabold text-slate-900 text-sm">{modal.row.organizationName}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase tracking-wider">Workspace Ref</span>
                    <span className="font-mono text-slate-800">ws-{modal.row.workspaceId}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase tracking-wider">Plan tier</span>
                    <span className="font-bold text-slate-900 uppercase">{modal.row.planType} Plan</span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase tracking-wider">Billing Amount</span>
                    <span className="font-bold text-[#1e3a8a]">NPR {modal.row.amountNpr.toLocaleString()} / mo</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase tracking-wider">Start Date</span>
                    <span className="text-slate-600">
                      {modal.row.createdAt ? new Date(modal.row.createdAt).toLocaleDateString() : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[9px] text-slate-400 uppercase tracking-wider">Renewal Date</span>
                    <span className="text-slate-600">
                      {modal.row.currentPeriodEnd ? new Date(modal.row.currentPeriodEnd).toLocaleDateString() : modal.row.trialEndsAt ? new Date(modal.row.trialEndsAt).toLocaleDateString() + " (Trial)" : "—"}
                    </span>
                  </div>
                </div>

                {/* Payments Section */}
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment Audit logs</p>
                  {historyData.transactions.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">No payments logged yet.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {historyData.transactions.map((tx) => (
                        <div key={tx.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex justify-between items-center text-[10px]">
                          <div>
                            <p className="font-bold text-slate-800">NPR {tx.amountNpr.toLocaleString()} via {tx.gateway}</p>
                            <p className="text-[8px] text-slate-400 mt-0.5">Ref: {tx.referenceId}</p>
                          </div>
                          <span className="font-bold text-emerald-600">{tx.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* History Timeline */}
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Subscription Timeline History</p>
                  <div className="relative border-l border-slate-200 pl-4 space-y-4">
                    {historyData.events.map((evt, idx) => (
                      <div key={idx} className="relative">
                        <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#1e3a8a] border border-white" />
                        <div className="text-[10px]">
                          <p className="font-bold text-slate-800">{evt.type.replace("_", " ")}</p>
                          <p className="text-slate-500 mt-0.5">{evt.description}</p>
                          <span className="text-[9px] text-slate-400 block mt-0.5">
                            {new Date(evt.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-red-500 font-bold">Failed to load history logs. Close and try again.</p>
            )}

            {/* Actions */}
            <div className="border-t border-slate-100 pt-4 mt-6 flex justify-between items-center">
              {historyData && (
                <button
                  type="button"
                  onClick={() => handleGenerateReportPDF(modal.row)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                >
                  <Download size={13} />
                  Generate Report
                </button>
              )}
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Modal */}
      {modal.type === "extend" && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
            <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4">Extend Subscription</h3>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed mb-4">
              Extend the active ServiceLink Pro license period for <span className="text-slate-800 font-bold">&quot;{modal.row.organizationName}&quot;</span>.
            </p>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Extend Duration (Days)</label>
              <input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(e.target.value)}
                className="w-full border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={submittingAction}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmExtend}
                disabled={submittingAction}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {submittingAction ? "Extending..." : "Confirm Extension"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {modal.type === "cancel" && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-red-500">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800">Cancel Pro Subscription?</h3>
                <p className="text-xs text-slate-500 mt-1 font-semibold leading-relaxed">
                  Are you sure you want to cancel the Pro license for <span className="font-bold text-slate-800">&quot;{modal.row.organizationName}&quot;</span>? They will immediately lose access to team management and jobs creation capabilities.
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={submittingAction}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={submittingAction}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50"
              >
                {submittingAction ? "Cancelling..." : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

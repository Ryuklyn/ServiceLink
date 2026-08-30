"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import PermissionGate from "@/components/business/PermissionGate";
import {
  FileText,
  Download,
  RefreshCw,
  Search,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowLeft
} from "lucide-react";
import { proJobService, ProJobTicketResponse, ProJobDetailResponse } from "@/services/proJobService";
import { toast } from "react-toastify";
import { jsPDF } from "jspdf";

const NAVY = "#1e3a8a";
const ORANGE = "#e8683f";

interface PaymentItem {
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference: string;
}

interface LocalBillingData {
  paidAmount: number;
  status: "OWED" | "PARTIALLY PAID" | "PAID" | "OVERDUE";
  payments: PaymentItem[];
}

interface BillingRow {
  id: string; // "BILL-jobId-providerId"
  jobId: number;
  jobReference: string;
  jobTitle: string;
  providerId: number;
  providerName: string;
  serviceCategory: string;
  pricingModel: string;
  rate: number;
  pricingUnit: string;
  quantity: number;
  durationDays: number;
  subtotal: number;
  dueDate: string;
  status: "OWED" | "PARTIALLY PAID" | "PAID" | "OVERDUE";
  paidAmount: number;
  payments: PaymentItem[];
  originalJob: ProJobDetailResponse;
}

interface TransactionItem {
  transactionId: string;
  jobReference: string;
  jobTitle: string;
  providerName: string;
  amount: number;
  paymentMethod: string;
  paymentDate: string;
  status: string;
  referenceNote: string;
}

const TABS = ["All", "Owed", "Paid", "Overdue"];

function BillingPageInner() {
  const { role } = useSelector((state: RootState) => state.proSession);
  const isWritable = role === "ADMIN" || role === "FINANCE";

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"invoices" | "transactions">("invoices");

  // Main UI rows mapped from completed jobs + local storage overrides
  const [billingRows, setBillingRows] = useState<BillingRow[]>([]);

  // Detailed view modal state
  const [selectedRow, setSelectedRow] = useState<BillingRow | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Payment form state
  const [payAmount, setPayAmount] = useState("");
  const [payDate, setPayDate] = useState("");
  const [payMethod, setPayMethod] = useState("Cash");
  const [payReference, setPayReference] = useState("");

  // Transaction filter states
  const [txStartDate, setTxStartDate] = useState("");
  const [txEndDate, setTxEndDate] = useState("");
  const [txProviderQuery, setTxProviderQuery] = useState("");
  const [txMethodFilter, setTxMethodFilter] = useState("All");

  const parseInstructionsAndWorkforce = (instructionsText: string | null) => {
    if (!instructionsText) return { instructions: "", requirements: [] };
    const parts = instructionsText.split("\n\n---WORKFORCE_REQUIREMENTS---\n");
    if (parts.length > 1) {
      try {
        const requirements = JSON.parse(parts[1]) as {
          skill: string;
          workersRequired: number;
          pricingModel?: "PER_JOB" | "PER_DAY" | "PER_HOUR" | "PER_SQ_FT";
          price?: number;
        }[];
        const normalized = requirements.map(r => ({
          skill: r.skill,
          workersRequired: r.workersRequired,
          pricingModel: r.pricingModel || "PER_JOB",
          price: r.price || 0
        }));
        return { instructions: parts[0], requirements: normalized };
      } catch (e) {
        return { instructions: instructionsText, requirements: [] };
      }
    }
    return { instructions: instructionsText, requirements: [] };
  };

  const loadBillingAndCompletedJobs = async () => {
    setLoading(true);
    try {
      // 1. Fetch all jobs
      const jobsRes = await proJobService.getJobs(undefined, 0, 100);
      const completedJobs = jobsRes.content.filter(j => j.status === "COMPLETED");

      // 2. Fetch full details for all completed jobs to get assignments and attendance logs
      const detailsList = await Promise.all(
        completedJobs.map(async (job) => {
          try {
            return await proJobService.getJobDetails(job.id);
          } catch {
            return null;
          }
        })
      );
      const validDetails = detailsList.filter(Boolean) as ProJobDetailResponse[];

      // 3. Build billing rows per assigned provider
      const rows: BillingRow[] = [];

      validDetails.forEach((job) => {
        const parsed = parseInstructionsAndWorkforce(job.instructions);
        const acceptedAssignments = job.assignments.filter(a => a.status === "ACCEPTED");

        acceptedAssignments.forEach((assign) => {
          // Find matching workforce requirement to pull rates and pricing units
          const req = parsed.requirements.find(
            r => r.skill.toLowerCase() === (assign.requiredSkill || "").toLowerCase()
          );

          const pricingModel = req?.pricingModel || job.pricingModel || "PER_JOB";
          const rate = req?.price || 1000;

          // Compute duration in days if model is per-day
          let durationDays = 1;
          if (job.endDate && job.startDate) {
            const startLdt = new Date(job.startDate);
            const endLdt = new Date(job.endDate);
            const diffTime = Math.abs(endLdt.getTime() - startLdt.getTime());
            durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
          }

          // In standard billing: final amount is computed based on checked-in records or duration parameters
          let quantity = 1;
          let pricingUnitLabel = "Job";

          if (pricingModel === "PER_DAY") {
            quantity = durationDays;
            pricingUnitLabel = "Day";
          } else if (pricingModel === "PER_HOUR") {
            // Fallback to hours from job details or default to 8 hours
            quantity = 8;
            pricingUnitLabel = "Hour";
          } else if (pricingModel === "PER_SQ_FT") {
            quantity = 100; // default square feet
            pricingUnitLabel = "Sq. Ft.";
          }

          const subtotal = rate * quantity;
          const dueDateString = job.endDate || job.startDate;

          // Check if localStorage has payment overrides
          const storageKey = `billing_record_${job.id}_${assign.providerId}`;
          const localDataRaw = localStorage.getItem(storageKey);

          let paidAmount = 0;
          let status: "OWED" | "PARTIALLY PAID" | "PAID" | "OVERDUE" = "OWED";
          let payments: PaymentItem[] = [];

          if (localDataRaw) {
            try {
              const parsedLocal = JSON.parse(localDataRaw) as LocalBillingData;
              paidAmount = parsedLocal.paidAmount;
              status = parsedLocal.status;
              payments = parsedLocal.payments || [];
            } catch (err) {
              console.error("Failed to parse local billing cache:", err);
            }
          } else {
            // Check if overdue: past dueDate and unpaid
            const now = new Date();
            const due = new Date(dueDateString);
            if (now > due && paidAmount < subtotal) {
              status = "OVERDUE";
            }
          }

          rows.push({
            id: `BILL-${job.id}-${assign.providerId}`,
            jobId: job.id,
            jobReference: job.reference,
            jobTitle: job.title,
            providerId: assign.providerId,
            providerName: assign.fullName,
            serviceCategory: assign.requiredSkill || job.category,
            pricingModel,
            rate,
            pricingUnit: pricingUnitLabel,
            quantity,
            durationDays,
            subtotal,
            dueDate: dueDateString,
            status,
            paidAmount,
            payments,
            originalJob: job
          });
        });
      });

      setBillingRows(rows);
    } catch (err) {
      console.error("Failed to load billing records:", err);
      toast.error("Failed to fetch billing statements from API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingAndCompletedJobs();
  }, []);

  // Filter main billing list rows
  const filteredRows = billingRows.filter((row) => {
    const matchesSearch =
      row.jobReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.providerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "All") return true;
    if (activeTab === "Owed") return row.status === "OWED" || row.status === "PARTIALLY PAID";
    if (activeTab === "Paid") return row.status === "PAID";
    if (activeTab === "Overdue") return row.status === "OVERDUE";
    return true;
  });

  // Calculate transaction list globally from all billing row logs
  const allTransactions: TransactionItem[] = [];
  billingRows.forEach((row) => {
    row.payments.forEach((pay, idx) => {
      allTransactions.push({
        transactionId: `TXN-${row.jobId}-${row.providerId}-${idx + 1}`,
        jobReference: row.jobReference,
        jobTitle: row.jobTitle,
        providerName: row.providerName,
        amount: pay.amount,
        paymentMethod: pay.paymentMethod,
        paymentDate: pay.paymentDate,
        status: "PAID",
        referenceNote: pay.reference || ""
      });
    });
  });

  // Filtered transactions for report view
  const filteredTransactions = allTransactions.filter((tx) => {
    const matchesProvider = tx.providerName.toLowerCase().includes(txProviderQuery.toLowerCase()) ||
      tx.jobReference.toLowerCase().includes(txProviderQuery.toLowerCase());
    
    const matchesMethod = txMethodFilter === "All" || tx.paymentMethod === txMethodFilter;

    let matchesDate = true;
    if (txStartDate) {
      matchesDate = matchesDate && new Date(tx.paymentDate) >= new Date(txStartDate);
    }
    if (txEndDate) {
      matchesDate = matchesDate && new Date(tx.paymentDate) <= new Date(txEndDate);
    }

    return matchesProvider && matchesMethod && matchesDate;
  });

  // Sum statistics based on all billing rows
  const totalOwed = billingRows
    .filter(r => r.status !== "PAID")
    .reduce((sum, r) => sum + (r.subtotal - r.paidAmount), 0);

  const totalPaid = billingRows.reduce((sum, r) => sum + r.paidAmount, 0);

  const totalOverdue = billingRows
    .filter(r => r.status === "OVERDUE")
    .reduce((sum, r) => sum + (r.subtotal - r.paidAmount), 0);

  // Open Payment dialog
  const handleOpenRecordPayment = () => {
    if (!selectedRow) return;
    const remaining = selectedRow.subtotal - selectedRow.paidAmount;
    setPayAmount(remaining.toString());
    setPayDate(new Date().toISOString().split("T")[0]);
    setPayMethod("Cash");
    setPayReference("");
    setShowPaymentForm(true);
  };

  // Submit recorded payment
  const handleSavePayment = () => {
    if (!selectedRow) return;
    const amountVal = parseFloat(payAmount);
    if (isNaN(amountVal) || amountVal <= 0) {
      toast.error("Please enter a valid payment amount.");
      return;
    }

    const remaining = selectedRow.subtotal - selectedRow.paidAmount;
    if (amountVal > remaining) {
      toast.error(`Payment amount cannot exceed the remaining balance of Rs. ${remaining.toLocaleString()}`);
      return;
    }

    const newPayment: PaymentItem = {
      amount: amountVal,
      paymentDate: payDate || new Date().toISOString().split("T")[0],
      paymentMethod: payMethod,
      reference: payReference
    };

    const newPaidAmt = selectedRow.paidAmount + amountVal;
    let newStatus: "OWED" | "PARTIALLY PAID" | "PAID" | "OVERDUE" = "OWED";

    if (newPaidAmt === selectedRow.subtotal) {
      newStatus = "PAID";
    } else {
      newStatus = "PARTIALLY PAID";
    }

    const updatedPayments = [...selectedRow.payments, newPayment];

    // Save locally
    const storageKey = `billing_record_${selectedRow.jobId}_${selectedRow.providerId}`;
    const localData: LocalBillingData = {
      paidAmount: newPaidAmt,
      status: newStatus,
      payments: updatedPayments
    };
    localStorage.setItem(storageKey, JSON.stringify(localData));

    // Update in-memory state
    const updatedRows = billingRows.map((r) => {
      if (r.id === selectedRow.id) {
        const u = { ...r, paidAmount: newPaidAmt, status: newStatus, payments: updatedPayments };
        setSelectedRow(u); // update currently selected modal record
        return u;
      }
      return r;
    });

    setBillingRows(updatedRows);
    setShowPaymentForm(false);
    toast.success("Payment recorded successfully.");
  };

  // Generate local PDF transaction report using jsPDF
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      
      // Page styling
      doc.setFontSize(22);
      doc.setTextColor(30, 58, 138); // Navy
      doc.setFont("helvetica", "bold");
      doc.text("ServiceLink Pro", 14, 20);
      
      doc.setFontSize(14);
      doc.setTextColor(100, 116, 139);
      doc.text("Transaction Audit Report", 14, 28);
      
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Report Period: ${txStartDate || "All Time"} to ${txEndDate || "Present"}`, 14, 34);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 40);
      
      // Draw border separator line
      doc.setDrawColor(226, 232, 240);
      doc.line(14, 44, 196, 44);
      
      // Table headers
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text("Date", 14, 52);
      doc.text("Job Ref", 38, 52);
      doc.text("Provider", 68, 52);
      doc.text("Amount", 120, 52);
      doc.text("Method", 152, 52);
      doc.text("Status", 180, 52);
      
      doc.line(14, 55, 196, 55);
      
      // Rows
      doc.setFont("helvetica", "normal");
      doc.setTextColor(51, 65, 85);
      let y = 63;
      
      filteredTransactions.forEach((t) => {
        if (y > 275) {
          doc.addPage();
          y = 20;
          doc.setFont("helvetica", "bold");
          doc.text("Date", 14, y);
          doc.text("Job Ref", 38, y);
          doc.text("Provider", 68, y);
          doc.text("Amount", 120, y);
          doc.text("Method", 152, y);
          doc.text("Status", 180, y);
          doc.line(14, y + 3, 196, y + 3);
          y += 10;
          doc.setFont("helvetica", "normal");
        }
        doc.text(t.paymentDate, 14, y);
        doc.text(t.jobReference, 38, y);
        doc.text(t.providerName, 68, y);
        doc.text(`Rs. ${t.amount.toLocaleString()}`, 120, y);
        doc.text(t.paymentMethod, 152, y);
        doc.text(t.status, 180, y);
        y += 8;
      });
      
      // Totals Audit box at the bottom
      y += 10;
      if (y > 265) {
        doc.addPage();
        y = 20;
      }
      doc.line(14, y - 5, 196, y - 5);
      doc.setFont("helvetica", "bold");
      doc.text(`Total Payments Settled: Rs. ${totalPaid.toLocaleString()}`, 14, y);
      doc.text(`Total Outstanding: Rs. ${totalOwed.toLocaleString()}`, 14, y + 7);
      doc.text(`Total Transactions Logged: ${filteredTransactions.length}`, 14, y + 14);
      
      doc.save("ServiceLink_Pro_Transaction_Report.pdf");
      toast.success("Transaction report PDF downloaded successfully.");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("Failed to generate PDF report.");
    }
  };

  const getStatusStyles = (status: string) => {
    if (status === "PAID") return "bg-emerald-50 text-emerald-600";
    if (status === "PARTIALLY PAID") return "bg-sky-50 text-sky-600";
    if (status === "OWED") return "bg-amber-50 text-amber-600";
    if (status === "OVERDUE") return "bg-red-50 text-red-500";
    return "bg-slate-100 text-slate-600";
  };

  return (
    <main className="space-y-6 max-w-7xl mx-auto p-4 sm:p-6 bg-slate-50/40 min-h-screen">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/60 pb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Billing Console</h1>
          <p className="text-sm text-slate-500 mt-0.5">Budget ledger, payouts settlement, and transaction auditing</p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {viewMode === "invoices" ? (
            <button
              onClick={() => setViewMode("transactions")}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1e3a8a] text-white text-sm font-bold hover:bg-[#152e72] transition-colors"
            >
              <FileText size={15} />
              Transaction Report
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
                disabled={filteredTransactions.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                <Download size={15} />
                Download PDF
              </button>
              <button
                onClick={() => setViewMode("invoices")}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft size={15} />
                Back to Billing
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1e3a8a]"></div>
          <p className="text-gray-400 text-sm font-medium">Reconciling corporate accounts ledger...</p>
        </div>
      ) : viewMode === "invoices" ? (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Owed</p>
              <p className="text-2xl font-black text-slate-900 mt-2">Rs. {totalOwed.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm border-l-4 border-l-emerald-500">
              <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Total Paid</p>
              <p className="text-2xl font-black text-slate-900 mt-2">Rs. {totalPaid.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm border-l-4 border-l-red-500">
              <p className="text-xs text-red-500 font-bold uppercase tracking-wider">Overdue</p>
              <p className="text-2xl font-black text-red-600 mt-2">Rs. {totalOverdue.toLocaleString()}</p>
            </div>
          </div>

          {/* Invoices List Grid */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Toolbar Filters */}
            <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                {TABS.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTab(t)}
                    className={`pb-1.5 relative ${activeTab === t ? "text-[#1e3a8a]" : "hover:text-slate-800"}`}
                  >
                    {t}
                    {activeTab === t && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#1e3a8a]" />
                    )}
                  </button>
                ))}
              </div>
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  type="text"
                  placeholder="Search by ID, title, or provider..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/20 focus:border-[#1e3a8a] text-slate-700 font-semibold"
                />
              </div>
            </div>

            {/* Invoices Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-left bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 pl-6 pr-4">Job Ticket</th>
                    <th className="py-3.5 pr-4">Provider</th>
                    <th className="py-3.5 pr-4 text-right">Amount</th>
                    <th className="py-3.5 pr-4">Payment Due</th>
                    <th className="py-3.5 pr-4">Status</th>
                    <th className="py-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-semibold">
                  {filteredRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pl-6 pr-4">
                        <div>
                          <span className="text-[#1e3a8a] font-extrabold">{row.jobReference}</span>
                          <span className="block text-[10px] text-slate-400 truncate max-w-[200px] mt-0.5">{row.jobTitle}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4">
                        <div>
                          <span className="text-slate-800 font-black">{row.providerName}</span>
                          <span className="block text-[10px] text-[#e8683f] mt-0.5">{row.serviceCategory}</span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 text-right font-black text-slate-900">
                        Rs. {row.subtotal.toLocaleString()}
                      </td>
                      <td className="py-3.5 pr-4 text-slate-500 font-medium">
                        {row.dueDate}
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${getStatusStyles(row.status)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-6 text-right">
                        <button
                          onClick={() => setSelectedRow(row)}
                          className="px-2.5 py-1 text-[10px] font-extrabold text-[#1e3a8a] border border-[#1e3a8a]/20 bg-[#1e3a8a]/5 rounded-lg hover:bg-[#1e3a8a]/10 transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 italic">
                        No billing statements found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Transactions Report view */
        <div className="space-y-6">
          {/* Audit filters */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Start Date</label>
              <input
                type="date"
                value={txStartDate}
                onChange={(e) => setTxStartDate(e.target.value)}
                className="w-full border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">End Date</label>
              <input
                type="date"
                value={txEndDate}
                onChange={(e) => setTxEndDate(e.target.value)}
                className="w-full border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Search Ref / Provider</label>
              <input
                type="text"
                placeholder="Search provider or job ref..."
                value={txProviderQuery}
                onChange={(e) => setTxProviderQuery(e.target.value)}
                className="w-full border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-800 focus:outline-none placeholder-slate-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Method</label>
              <select
                value={txMethodFilter}
                onChange={(e) => setTxMethodFilter(e.target.value)}
                className="w-full border border-slate-200 px-3 py-1.5 rounded-xl text-xs text-slate-800 focus:outline-none"
              >
                <option value="All">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="eSewa">eSewa</option>
                <option value="Khalti">Khalti</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Transactions list */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-left bg-slate-50/70 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3.5 pl-6 pr-4">Transaction ID</th>
                    <th className="py-3.5 pr-4">Job Ticket</th>
                    <th className="py-3.5 pr-4">Provider</th>
                    <th className="py-3.5 pr-4 text-right">Amount Paid</th>
                    <th className="py-3.5 pr-4">Payment Method</th>
                    <th className="py-3.5 pr-4">Payment Date</th>
                    <th className="py-3.5 pr-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700 font-semibold">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.transactionId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 pl-6 pr-4 font-mono text-[10px] text-slate-500">
                        {tx.transactionId}
                      </td>
                      <td className="py-3.5 pr-4 text-[#1e3a8a] font-extrabold">{tx.jobReference}</td>
                      <td className="py-3.5 pr-4 font-black">{tx.providerName}</td>
                      <td className="py-3.5 pr-4 text-right font-black text-emerald-600">Rs. {tx.amount.toLocaleString()}</td>
                      <td className="py-3.5 pr-4 text-slate-500">{tx.paymentMethod}</td>
                      <td className="py-3.5 pr-4 text-slate-500">{tx.paymentDate}</td>
                      <td className="py-3.5 pr-6">
                        <span className="text-[9px] font-black bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded uppercase">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 italic">
                        No transactions recorded for selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Centered Billing Details Modal */}
      {selectedRow && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in max-h-[85vh] overflow-y-auto relative">
            <h3 className="text-base font-black text-slate-800 border-b border-slate-100 pb-3 mb-4 flex justify-between items-center">
              <span>Billing Payout Statement</span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${getStatusStyles(selectedRow.status)}`}>
                {selectedRow.status}
              </span>
            </h3>

            {/* Content info */}
            <div className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Job Ticket Details</p>
                <p className="font-extrabold text-slate-900 mt-0.5">{selectedRow.jobReference} — {selectedRow.jobTitle}</p>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Provider Payout Info</p>
                <p className="font-extrabold text-slate-900 mt-0.5">{selectedRow.providerName}</p>
                <p className="text-[10px] text-[#e8683f] mt-0.5">{selectedRow.serviceCategory}</p>
              </div>

              {/* Pricing breakdown */}
              <div className="border-t border-slate-100 pt-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Pricing Breakdown</p>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2 text-slate-600">
                  <div className="flex justify-between items-center">
                    <span>Base Service Category:</span>
                    <span className="font-bold text-slate-800">{selectedRow.serviceCategory}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Pricing Model:</span>
                    <span className="font-bold text-slate-800">{selectedRow.pricingModel.replace("_", " ")}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rate:</span>
                    <span className="font-bold text-slate-800">Rs. {selectedRow.rate.toLocaleString()} / {selectedRow.pricingUnit}</span>
                  </div>
                  {selectedRow.pricingModel === "PER_DAY" && (
                    <div className="flex justify-between items-center">
                      <span>Duration (Days):</span>
                      <span className="font-bold text-slate-800">{selectedRow.durationDays} days</span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-slate-200/80 pt-2 flex justify-between items-center text-slate-800 font-extrabold">
                    <span>Subtotal Owed:</span>
                    <span>Rs. {selectedRow.subtotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment ledger summary */}
              <div className="border-t border-slate-100 pt-3">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Settlement Summary</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span>Owed Amount:</span>
                    <span className="font-bold text-slate-800">Rs. {selectedRow.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Total Paid:</span>
                    <span className="font-bold text-emerald-600">Rs. {selectedRow.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center font-extrabold text-slate-900 border-t border-slate-100 pt-1.5">
                    <span>Remaining Balance:</span>
                    <span>Rs. {(selectedRow.subtotal - selectedRow.paidAmount).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment history list */}
              {selectedRow.payments.length > 0 && (
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Payment History Logs</p>
                  <div className="space-y-1.5">
                    {selectedRow.payments.map((p, idx) => (
                      <div key={idx} className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-100 flex justify-between items-center text-[11px]">
                        <div>
                          <p className="font-bold text-slate-700">{p.paymentMethod} — {p.paymentDate}</p>
                          {p.reference && <p className="text-[9px] text-slate-400 mt-0.5">Ref: {p.reference}</p>}
                        </div>
                        <span className="font-black text-emerald-600">Rs. {p.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="border-t border-slate-100 pt-4 mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setSelectedRow(null)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Close
              </button>
              {selectedRow.status !== "PAID" && isWritable && (
                <button
                  type="button"
                  onClick={handleOpenRecordPayment}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
                >
                  Record Payment
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Record Payment Form Modal */}
      {showPaymentForm && selectedRow && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center z-[60] animate-fade-in">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-scale-in">
            <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-3 mb-4">Record Provider Payout</h3>

            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Amount (Rs.)</label>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Date</label>
                <input
                  type="date"
                  value={payDate}
                  onChange={(e) => setPayDate(e.target.value)}
                  className="w-full border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Payment Method</label>
                <select
                  value={payMethod}
                  onChange={(e) => setPayMethod(e.target.value)}
                  className="w-full border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="eSewa">eSewa</option>
                  <option value="Khalti">Khalti</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Reference / Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Bank slip reference number"
                  value={payReference}
                  onChange={(e) => setPayReference(e.target.value)}
                  className="w-full border border-slate-200 px-3.5 py-2 rounded-xl text-xs text-slate-700 focus:outline-none placeholder-slate-400"
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mt-6 flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePayment}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function BillingPage() {
  return (
    <PermissionGate allowedRoles={["ADMIN", "MANAGER", "FINANCE"]}>
      <BillingPageInner />
    </PermissionGate>
  );
}
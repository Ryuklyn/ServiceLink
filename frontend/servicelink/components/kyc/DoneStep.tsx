"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Check, Clipboard, ClipboardCheck, ArrowRight, Eye, Download, RotateCcw } from "lucide-react";
import ReceiptModal from "./ReceiptModal";

interface DoneStepProps {
  onRestart?: () => void;
  allData?: Record<string, any>;
  referenceNumber?: string;
}

export default function DoneStep({ onRestart, allData, referenceNumber }: DoneStepProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const fallbackRef = useRef(
      "SVC-2026-" + Math.random().toString(36).substring(2, 8).toUpperCase()
  );
  const displayRef = referenceNumber || fallbackRef.current;
  const submittedAt = useRef(new Date());

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleCopy = () => {
    navigator.clipboard?.writeText(displayRef);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = submittedAt.current.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formattedTime = submittedAt.current.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const applicantName = allData?.personal?.fullName || "—";
  const applicantEmail = allData?.personal?.email || "—";

  return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center px-4 py-6 sm:py-12 relative font-sans antialiased">
        <div
            className={`w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          {/* Branded Success Banner Layout */}
          <div className="bg-[#1e3a8a] text-white px-6 py-8 sm:px-8 sm:py-10 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#e8683f] opacity-[0.08] rounded-full blur-2xl pointer-events-none transform translate-x-6 -translate-y-6" />

            <div className="flex flex-col items-center sm:items-start gap-3">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-900/30 animate-bounce">
                <Check className="w-6 h-6 text-white stroke-[3px]" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Application Submitted <span className="text-[#e8683f] italic font-normal block sm:inline">Successfully</span>
                </h1>
                <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto sm:mx-0">
                  Your KYC verification documentation has been securely indexed.
                </p>
              </div>
            </div>

            <div className="shrink-0 flex flex-row sm:flex-col items-center justify-center sm:items-end gap-2 border-t border-white/10 sm:border-t-0 pt-3 sm:pt-0">
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-300 block">Status</span>
              <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-white px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
                Under Review
              </div>
            </div>
          </div>

          {/* Core Layout Split */}
          <div className="p-5 sm:p-8">

            {/* Structured Metric Blocks */}
            <div className="space-y-3 mb-6">

              {/* Stacked Pattern: Reference Code Row Container */}
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Reference Code</span>
                  <span className="font-mono text-sm text-[#1e3a8a] font-bold block truncate tracking-tight">{displayRef}</span>
                </div>
                <button
                    onClick={handleCopy}
                    className="shrink-0 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                >
                  {copied ? <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5 text-slate-400" />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Side-by-Side Unified Row: Submitted On | Review Estimate */}
              <div className="grid grid-cols-2 bg-slate-50 border border-slate-200 rounded-xl divide-x divide-slate-200">
                <div className="p-4">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Submitted On</span>
                  <span className="text-xs font-bold text-slate-700 block">{formattedDate}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{formattedTime}</span>
                </div>
                <div className="p-4 pl-4 sm:pl-6">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Estimated Review</span>
                  <span className="text-xs font-bold text-slate-700 block">2–3 Days</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Alert via email</span>
                </div>
              </div>

              {/* Highlighted Row: Free Tier Details */}
              <div className="bg-[#fff3ed] border border-[#ffedd5] p-4 rounded-xl flex items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#e8683f] block mb-0.5">Included Program Tier</span>
                  <span className="text-sm font-bold text-slate-800 block">30-Day Free Trial</span>
                </div>
                <span className="text-[10px] bg-white text-[#e8683f] border border-[#ffedd5] px-2.5 py-1 rounded-md font-bold uppercase tracking-wide shrink-0">
                  $0.00 Due
                </span>
              </div>
            </div>

            {/* Smart Responsive Journey Map */}
            <div className="mb-6 bg-[#eef4ff]/30 border border-[#eef4ff] rounded-xl p-4 sm:p-5">
              <p className="text-[10px] uppercase font-extrabold tracking-widest text-[#1e3a8a] mb-4 text-center sm:text-left">Verification Journey Map</p>

              {/* Horizontal layout on Desktop, Stacked vertical cards on Mobile */}
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 relative">
                <div className="hidden sm:block absolute left-4 right-4 top-[15px] h-[2px] bg-slate-200 z-0" />
                <div className="hidden sm:block absolute left-4 w-1/4 top-[15px] h-[2px] bg-[#1e3a8a] z-0" />

                {/* Step 1 */}
                <div className="flex sm:flex-col items-center gap-3 sm:gap-2 relative z-10 bg-white/40 sm:bg-transparent p-2 sm:p-0 rounded-lg border border-slate-100 sm:border-0 sm:text-center flex-1">
                  <div className="w-7 h-7 rounded-full bg-[#1e3a8a] text-white flex items-center justify-center text-xs font-bold ring-4 ring-blue-50 shrink-0">✓</div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800">Submitted</p>
                    <p className="text-[9px] text-slate-400 truncate">Logs Captured</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex sm:flex-col items-center gap-3 sm:gap-2 relative z-10 bg-white/40 sm:bg-transparent p-2 sm:p-0 rounded-lg border border-slate-100 sm:border-0 sm:text-center flex-1">
                  <div className="w-7 h-7 rounded-full bg-white border-2 border-[#e8683f] text-[#e8683f] flex items-center justify-center text-xs font-bold animate-pulse ring-4 ring-orange-50 shrink-0">●</div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800">Data Scan</p>
                    <p className="text-[9px] text-slate-400 truncate">Automated Checks</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex sm:flex-col items-center gap-3 sm:gap-2 relative z-10 bg-white/40 sm:bg-transparent p-2 sm:p-0 rounded-lg border border-slate-100 sm:border-0 sm:text-center flex-1">
                  <div className="w-7 h-7 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center text-xs font-medium shrink-0">○</div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">Admin Sign-off</p>
                    <p className="text-[9px] text-slate-400 truncate">Manual Audit</p>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex sm:flex-col items-center gap-3 sm:gap-2 relative z-10 bg-white/40 sm:bg-transparent p-2 sm:p-0 rounded-lg border border-slate-100 sm:border-0 sm:text-center flex-1">
                  <div className="w-7 h-7 rounded-full bg-white border-2 border-slate-200 text-slate-400 flex items-center justify-center text-xs font-medium shrink-0">○</div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">Trial Active</p>
                    <p className="text-[9px] text-slate-400 truncate">30 Days Open</p>
                  </div>
                </div>

              </div>
            </div>

            <hr className="my-5 border-slate-200" />

            {/* Actions Panel Group */}
            <div className="flex flex-col gap-2.5">
              <div className="grid grid-cols-2 gap-2.5">
                <button
                    onClick={() => setShowModal(true)}
                    className="w-full border border-slate-300 text-slate-700 bg-white rounded-xl py-2.5 text-xs font-semibold hover:border-[#1e3a8a] hover:bg-slate-50 transition flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <Eye className="w-4 h-4 text-slate-400" />
                  View Receipt
                </button>
                <button
                    onClick={() => {
                      setShowModal(true);
                      setTimeout(() => {
                        const downloadBtn = document.querySelector('[disabled]:not([className*="opacity-50"])') || document.querySelector('button[className*="bg-[#1e3a8a]"]');
                        if (downloadBtn) (downloadBtn as HTMLButtonElement).click();
                      }, 300);
                    }}
                    className="w-full border border-slate-300 text-slate-700 bg-white rounded-xl py-2.5 text-xs font-semibold hover:border-[#1e3a8a] hover:bg-slate-50 transition flex items-center justify-center gap-1.5 active:scale-[0.98]"
                >
                  <Download className="w-4 h-4 text-slate-400" />
                  Download PDF
                </button>
              </div>

              <button
                  onClick={() => router.push("/login")}
                  className="w-full bg-[#1e3a8a] hover:bg-[#162a63] text-white py-3 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-900/10 transition active:scale-[0.98] flex items-center justify-center gap-1.5 mt-1"
              >
                Login to ServiceLink
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Optional Application Reset Trigger */}
            {onRestart && (
                <button
                    onClick={onRestart}
                    className="mt-5 w-full text-center text-[11px] text-slate-400 hover:text-[#e8683f] flex items-center justify-center gap-1 transition underline"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Submit another application
                </button>
            )}
          </div>
        </div>

        {/* Modal Window Sheet */}
        {showModal && (
            <ReceiptModal
                onClose={() => setShowModal(false)}
                referenceNumber={displayRef}
                formattedDate={formattedDate}
                formattedTime={formattedTime}
                applicantName={applicantName}
                applicantEmail={applicantEmail}
            />
        )}
      </div>
  );
}
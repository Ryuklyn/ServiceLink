"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

type DecisionAction = "approve" | "reject";

interface KycDecisionModalProps {
    action: DecisionAction;
    targetName: string;
    busy?: boolean;
    error?: string | null;
    onCancel: () => void;
    onConfirm: (note: string) => void;
}

/**
 * Confirmation dialog used for both Approve and Reject decisions.
 * Approve: note is optional (stored as reviewNotes if provided).
 * Reject: note is required (stored as reviewNotes, also sent to the applicant).
 */
export default function KycDecisionModal({
                                             action, targetName, busy = false, error = null, onCancel, onConfirm,
                                         }: KycDecisionModalProps) {
    const [note, setNote] = useState("");
    const isApprove = action === "approve";
    const canConfirm = isApprove || note.trim().length > 0;

    return (
        <div className="fixed inset-0 z-[60] bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl ring-1 ring-slate-200/70 p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isApprove ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                    }`}>
                        {isApprove ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                    </div>
                    <div>
                        <h4 className="text-[15px] font-semibold text-slate-900">
                            {isApprove ? "Approve Provider" : "Reject Application"}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {isApprove
                                ? `${targetName} will be verified and provisioned as a provider.`
                                : `${targetName} will be notified with the reason below.`}
                        </p>
                    </div>
                </div>

                <div>
                    <label className="text-[11px] font-medium uppercase tracking-wide text-slate-400 block mb-1.5">
                        {isApprove ? "Note (optional)" : "Reason (required)"}
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder={
                            isApprove
                                ? "Add an internal note for this approval…"
                                : "Explain why the application was declined — this will be sent to the applicant."
                        }
                        rows={3}
                        autoFocus
                        className={`w-full text-[12.5px] bg-slate-50 border rounded-xl p-3 focus:outline-none focus:ring-2 text-slate-800 placeholder:text-slate-400 ${
                            isApprove
                                ? "border-slate-200 focus:ring-emerald-300"
                                : "border-rose-200 focus:ring-rose-300"
                        }`}
                    />
                </div>

                {error && (
                    <div className="text-[12px] text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 flex items-start gap-2">
                        <AlertCircle size={14} className="text-rose-500 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="flex justify-end gap-2 pt-1">
                    <button
                        onClick={onCancel}
                        disabled={busy}
                        className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-[12.5px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(note.trim())}
                        disabled={busy || !canConfirm}
                        className={`px-4 py-2 rounded-lg text-white text-[12.5px] font-semibold disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${
                            isApprove
                                ? "bg-emerald-600 hover:bg-emerald-700 focus-visible:ring-emerald-300"
                                : "bg-rose-600 hover:bg-rose-700 focus-visible:ring-rose-300"
                        }`}
                    >
                        {busy ? "Submitting…" : isApprove ? "Confirm Approval" : "Confirm Rejection"}
                    </button>
                </div>
            </div>
        </div>
    );
}
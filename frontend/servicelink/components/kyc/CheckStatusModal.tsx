"use client";

import { useState } from "react";
import { X, Search, Loader2, AlertCircle } from "lucide-react";
import { kycApi } from "@/lib/api/kycApi";

interface CheckStatusModalProps {
    onClose: () => void;
    onValidReference: (referenceNumber: string) => void;
}

export default function CheckStatusModal({ onClose, onValidReference }: CheckStatusModalProps) {
    const [refInput, setRefInput] = useState("");
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState("");

    const handleCheck = async () => {
        const ref = refInput.trim().toUpperCase();
        if (!ref) {
            setError("Please enter your reference number.");
            return;
        }

        setError("");
        setChecking(true);

        try {
            // Validate against the backend BEFORE navigating, so the user never
            // lands on a "reference not found" page — they get the error right
            // here in the modal instead, with a chance to correct a typo.
            await kycApi.getKycStatusByReference(ref);
            onValidReference(ref);
        } catch (err) {
            setError("We couldn't find an application with that reference number. Please check and try again.");
        } finally {
            setChecking(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") handleCheck();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl border border-stone-100 p-6">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-lg font-bold text-[#1e3a8a] mb-1">Check Application Status</h2>
                <p className="text-xs text-stone-500 mb-5">
                    Enter the reference number from your confirmation email.
                </p>

                <input
                    type="text"
                    value={refInput}
                    onChange={(e) => {
                        setRefInput(e.target.value);
                        if (error) setError("");
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="SVC-2026-XXXXXXXX"
                    autoFocus
                    disabled={checking}
                    className="w-full text-slate-900 font-mono text-sm border border-stone-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition disabled:opacity-50 disabled:bg-stone-50"
                />

                {error && (
                    <div className="flex items-start gap-1.5 mt-2.5 text-xs text-red-600">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>{error}</span>
                    </div>
                )}

                <button
                    onClick={handleCheck}
                    disabled={checking}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3 bg-[#1e3a8a] text-white rounded-xl font-semibold text-sm hover:bg-[#162a63] active:scale-[0.98] transition disabled:opacity-60"
                >
                    {checking ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" /> Checking...
                        </>
                    ) : (
                        <>
                            <Search className="w-4 h-4" /> Check Status
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
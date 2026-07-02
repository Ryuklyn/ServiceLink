"use client";

import React, { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import ReceiptContent from "@/components/kyc/ReceiptContent";
import { generateReceiptPDF } from "@/components/kyc/ReceiptPDF";

function ReceiptPageCore() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const referenceNumber = searchParams.get("ref") || "SVC-2026-UNKNOWN";
    const tsParam = searchParams.get("ts");
    const parsedDate = tsParam ? new Date(tsParam) : new Date();

    const applicantName = searchParams.get("name") || "—";
    const applicantEmail = searchParams.get("email") || "—";

    const formattedDate = parsedDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    const formattedTime = parsedDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return (
        <div className="min-h-screen bg-slate-100 py-8 px-4">
            <div className="max-w-[794px] mx-auto flex justify-between items-center mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1 text-xs font-bold text-slate-600 bg-white border border-slate-300 px-3 py-2 rounded-lg hover:bg-slate-50 transition"
                >
                    <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                    onClick={() => generateReceiptPDF("receipt-print-area", referenceNumber)}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#1e3a8a] hover:bg-[#162a63] px-4 py-2 rounded-lg transition shadow-sm"
                >
                    <Download className="w-4 h-4" /> Download Statement PDF
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                <ReceiptContent
                    referenceNumber={referenceNumber}
                    formattedDate={formattedDate}
                    formattedTime={formattedTime}
                    applicantName={applicantName}
                    applicantEmail={applicantEmail}
                />
            </div>
        </div>
    );
}

export default function Page() {
    return (
        <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Loading Receipt Document Engine...</div>}>
            <ReceiptPageCore />
        </Suspense>
    );
}
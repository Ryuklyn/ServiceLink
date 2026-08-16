"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Download } from "lucide-react";
import ReceiptContent from "@/components/kyc/ReceiptContent";
import { generateReceiptPDF } from "@/components/kyc/ReceiptPDF";
import { KycStatus } from "@/lib/api/kycApi";

interface KycStatusResponse {
    referenceNumber: string;
    status: KycStatus;
    submittedAt: string;
    reviewedAt: string | null;
    reviewNotes: string | null;
    fullName: string;
    email: string;
}

function ReceiptPageCore() {
    const searchParams = useSearchParams();
    const router = useRouter();

    // Fallback only — server-confirmed fullName/email (once loaded) take priority.
    const fallbackName = searchParams.get("name") || "—";
    const fallbackEmail = searchParams.get("email") || "—";

    const [statusData, setStatusData] = useState<KycStatusResponse | null>(null);
    const [loadingStatus, setLoadingStatus] = useState(true);
    const [fetchError, setFetchError] = useState(false);

    useEffect(() => {
        let cancelled = false;
        const providerToken = localStorage.getItem("providerToken");

        fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/kyc/status`, {
            headers: providerToken ? { "X-Provider-Token": providerToken } : {},
            credentials: "include", // works even when a JWT session cookie is present
        })
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch status");
                return res.json();
            })
            .then((data: KycStatusResponse) => {
                if (!cancelled) setStatusData(data);
            })
            .catch(() => {
                if (!cancelled) setFetchError(true);
            })
            .finally(() => {
                if (!cancelled) setLoadingStatus(false);
            });

        return () => { cancelled = true; };
    }, []);

    if (loadingStatus) {
        return <div className="p-12 text-center text-sm text-slate-500">Loading receipt...</div>;
    }

    if (fetchError || !statusData) {
        return (
            <div className="p-12 text-center text-sm text-red-500">
                Unable to load your KYC status. Please log in again or contact support.
            </div>
        );
    }

    const submittedDate = new Date(statusData.submittedAt);
    const isValidSubmittedDate = !isNaN(submittedDate.getTime());

    const formattedDate = isValidSubmittedDate
        ? submittedDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
        : "—";

    const formattedTime = isValidSubmittedDate
        ? submittedDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
        : "—";

    const applicantName = statusData.fullName || fallbackName;
    const applicantEmail = statusData.email || fallbackEmail;

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
                    onClick={() => {
                        generateReceiptPDF("receipt-print-area", statusData.referenceNumber).catch(() => {
                            alert("Failed to generate PDF. Please try again.");
                        });
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#1e3a8a] hover:bg-[#162a63] px-4 py-2 rounded-lg transition shadow-sm"
                >
                    <Download className="w-4 h-4" /> Download Statement PDF
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                <ReceiptContent
                    referenceNumber={statusData.referenceNumber}
                    formattedDate={formattedDate}
                    formattedTime={formattedTime}
                    applicantName={applicantName}
                    applicantEmail={applicantEmail}
                    status={statusData.status}
                    reviewNotes={statusData.reviewNotes}
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
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import DoneStep from "@/components/kyc/DoneStep";

function KycStatusInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const ref = searchParams.get("ref");

    return (
        <DoneStep
            referenceNumber={ref ?? null}
            onRestart={() => router.push("/register")}
        />
    );
}

export default function KycStatusPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Loading KYC details...</div>}>
            <KycStatusInner />
        </Suspense>
    );
}
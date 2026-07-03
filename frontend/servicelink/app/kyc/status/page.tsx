"use client";

import { useSearchParams, useRouter } from "next/navigation";
import DoneStep from "@/components/kyc/DoneStep";

export default function KycStatusPage() {
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
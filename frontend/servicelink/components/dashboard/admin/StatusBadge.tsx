"use client";

import { CheckCircle2, Clock, Video, XCircle } from "lucide-react";
import type { VerificationStatus } from "@/store/slices/features/kyc/kycTypes";

const STYLES: Record<VerificationStatus, {
    bg: string; text: string; label: string; Icon: any;
}> = {
    verified:     { bg: "bg-emerald-50", text: "text-emerald-700", label: "Verified",         Icon: CheckCircle2 },
    manual_audit: { bg: "bg-indigo-50",  text: "text-indigo-700",  label: "Manual Audit",     Icon: Video },
    pending_kyc:  { bg: "bg-amber-50",   text: "text-amber-700",   label: "Pending KYC",      Icon: Clock },
    suspended:    { bg: "bg-red-50",     text: "text-red-700",     label: "Suspended/Reject", Icon: XCircle },
};

export default function StatusBadge({
                                        status, className = "",
                                    }: { status: VerificationStatus; className?: string }) {
    const c = STYLES[status];
    if (!c) return null;
    const { Icon } = c;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${c.bg} ${c.text} ${className}`}>
            <Icon size={12} /> {c.label}
        </span>
    );
}

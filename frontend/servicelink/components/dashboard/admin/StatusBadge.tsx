import { CheckCircle2, Clock, Video, Ban } from "lucide-react";
import type { VerificationStatus } from "./types";

const STATUS_CONFIG: Record<
    VerificationStatus,
    { label: string; classes: string; dot: string; Icon: typeof CheckCircle2 }
> = {
    verified: {
        label: "Verified",
        classes: "bg-emerald-100 text-emerald-800",
        dot: "bg-emerald-500",
        Icon: CheckCircle2,
    },
    pending_kyc: {
        label: "Pending KYC",
        classes: "bg-amber-100 text-amber-800",
        dot: "bg-amber-500",
        Icon: Clock,
    },
    manual_audit: {
        label: "Video Audit Needed",
        classes: "bg-blue-100 text-blue-800",
        dot: "bg-blue-500",
        Icon: Video,
    },
    suspended: {
        label: "Suspended",
        classes: "bg-red-100 text-red-800",
        dot: "bg-red-500",
        Icon: Ban,
    },
};

export default function StatusBadge({ status }: { status: VerificationStatus }) {
    const config = STATUS_CONFIG[status];

    if (!config) return null; // Safe fallback if an invalid status is passed

    const Icon = config.Icon;

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.classes}`}
        >
            <Icon size={12} />
            {config.label}
        </span>
    );
}
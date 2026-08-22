// src/components/dashboard/admin/subscription/utils.tsx
import type { PlanType, SubscriptionStatus, TransactionStatus, PaymentGateway } from "@/store/slices/features/admin-subscription/adminSubscriptionTypes";

export function formatCurrency(amount: number): string {
    return `Rs. ${amount.toLocaleString("en-IN")}`;
}

export function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function formatDateTime(iso: string): string {
    return new Date(iso).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export function formatValidityWindow(start: string, end: string): string {
    return `${formatDate(start)} – ${formatDate(end)}`;
}

/**
 * Derives up to 2 uppercase initials from a display name. Defensive against
 * undefined/empty/whitespace-only names — the backend's AdminSubscriptionRowDTO
 * doesn't send a precomputed avatarInitials field, so this always derives it
 * client-side rather than trusting the API to supply one.
 */
export function getInitials(name?: string | null): string {
    if (!name || !name.trim()) return "?";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    const first = parts[0]?.[0] ?? "";
    const second = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : parts[0]?.[1] ?? "";
    const initials = `${first}${second}`.toUpperCase();
    return initials || "?";
}

export function initialsAvatarColor(initials: string): string {
    const palette = [
        "bg-slate-700",
        "bg-red-600",
        "bg-amber-500",
        "bg-pink-500",
        "bg-indigo-600",
        "bg-emerald-600",
    ];
    const safe = initials && initials.length > 0 ? initials : "?";
    const code = safe.charCodeAt(0) + (safe.charCodeAt(1) ?? 0);
    return palette[code % palette.length];
}

const PLAN_STYLES: Record<PlanType, string> = {
    FREE_TRIAL: "bg-slate-100 text-slate-600",
    MONTHLY: "bg-blue-50 text-blue-700",
    QUARTERLY: "bg-purple-50 text-purple-700",
    YEARLY: "bg-amber-50 text-amber-700",
};

const PLAN_LABELS: Record<PlanType, string> = {
    FREE_TRIAL: "FREE TRIAL",
    MONTHLY: "MONTHLY",
    QUARTERLY: "QUARTERLY",
    YEARLY: "YEARLY",
};

export function PlanBadge({ plan }: { plan: PlanType }) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${PLAN_STYLES[plan]}`}
        >
      {PLAN_LABELS[plan]}
    </span>
    );
}

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
    ACTIVE: "bg-emerald-50 text-emerald-700",
    EXPIRED: "bg-red-50 text-red-600",
    CANCELLED: "bg-slate-100 text-slate-500",
};

export function StatusBadge({ status }: { status: SubscriptionStatus }) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${STATUS_STYLES[status]}`}
        >
      {status}
    </span>
    );
}

const TX_STATUS_STYLES: Record<TransactionStatus, string> = {
    SUCCESS: "bg-emerald-50 text-emerald-700",
    FAILED: "bg-red-50 text-red-600",
    INITIATED: "bg-amber-50 text-amber-700",
};

export function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${TX_STATUS_STYLES[status]}`}
        >
      {status}
    </span>
    );
}

const GATEWAY_STYLES: Record<PaymentGateway, string> = {
    ESEWA: "bg-emerald-50 text-emerald-700",
    KHALTI: "bg-purple-50 text-purple-700",
    BANK_TRANSFER: "bg-slate-100 text-slate-500",
};

const GATEWAY_LABELS: Record<PaymentGateway, string> = {
    ESEWA: "eSewa",
    KHALTI: "Khalti",
    BANK_TRANSFER: "Bank Transfer",
};

export function GatewayBadge({ gateway }: { gateway: PaymentGateway }) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold ${GATEWAY_STYLES[gateway]}`}
        >
      {GATEWAY_LABELS[gateway]}
    </span>
    );
}

/** Days remaining rendered red once overdue (subscription lapsed but not yet swept) */
export function DaysRemainingCell({ days }: { days: number }) {
    return (
        <span className={days < 0 ? "text-red-600 font-semibold" : "text-slate-700"}>{days}</span>
    );
}
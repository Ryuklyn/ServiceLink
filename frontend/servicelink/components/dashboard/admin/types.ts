export type VerificationStatus =
    | "verified"
    | "pending_kyc"
    | "manual_audit"
    | "suspended";

export interface UserRow {
    id: string;
    name: string;
    email: string;
    initials: string;
    avatarUrl?: string | null;
    roleOrService: string;
    status: VerificationStatus;
    joinedDate: string;
    avatarTone: "slate" | "amber";
}

export interface KpiCard {
    id: string;
    label: string;
    value: string;
    delta?: string;
    deltaTone?: "positive" | "neutral" | "warning";
    sublabel?: string;
}

export interface NavItem {
    id: string;
    label: string;
    href: string;
    icon: "dashboard" | "users" | "categories" | "b2b" | "pro-subscription" | "subscription";
}

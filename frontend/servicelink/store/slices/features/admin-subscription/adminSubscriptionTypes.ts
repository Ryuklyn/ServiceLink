// src/store/slices/features/admin-subscription/adminSubscriptionTypes.ts
//
// Mirrors the backend domain model in the Provider Subscription System spec
// (ProviderSubscription, SubscriptionPlanType, PaymentTransaction,
// PaymentGateway), shaped for the ADMIN surface. Colocated with the slice
// and api module, same as features/kyc/kycTypes.ts.

export type PlanType = "FREE_TRIAL" | "MONTHLY" | "QUARTERLY" | "YEARLY";

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export type PaymentGateway = "ESEWA" | "KHALTI" | "BANK_TRANSFER";

export type TransactionStatus = "INITIATED" | "SUCCESS" | "FAILED";

export interface ProviderSubscriptionRow {
    providerId: string;
    providerName: string;
    email: string;
    category: string;
    planType: PlanType;
    status: SubscriptionStatus;
    startDate: string; // ISO instant
    endDate: string; // ISO instant
    daysRemaining: number; // derived live server-side, can be negative pre-sweep
    verifiedReferrals: number;
    referralGoal: number;
    referralBonusDaysTotal: number;
}

export interface SubscriptionStats {
    totalRevenue: number;
    revenueGrowthPct: number;
    activePaidSubscriptions: number;
    activePaidGrowthPct: number;
    trialConversionPct: number;
    trialConversionGrowthPct: number;
    expiringSoonCount: number;
    expiringSoonWindowDays: number;
}

export interface PaymentTransactionRow {
    id: string;
    referenceId: string; // SLP-{year}-{6 digits}
    providerId: string;
    providerName: string;
    gateway: PaymentGateway;
    amount: number;
    status: TransactionStatus;
    description: string;
    createdAt: string;
}

export interface SystemEventRow {
    id: string;
    type:
        | "SUBSCRIPTION_EXTENDED"
        | "REFERRAL_BONUS_AWARDED"
        | "PAYMENT_SUCCESS"
        | "PAYMENT_FAILED"
        | "KYC_VERIFIED"
        | "SUBSCRIPTION_REVOKED"
        | "TRIAL_ISSUED";
    description: string;
    createdAt: string;
    source: "SYSTEM" | "ADMIN";
}

export interface SubscriptionHistory {
    subscription: ProviderSubscriptionRow;
    transactions: PaymentTransactionRow[];
    events: SystemEventRow[];
}

export interface PagedResult<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
}

export interface SubscriptionListFilters {
    search: string;
    status: SubscriptionStatus | "ALL";
    planType: PlanType | "ALL";
    page: number;
    size: number;
}

export interface AuditLogFilters {
    gateway: PaymentGateway | "ALL";
    status: TransactionStatus | "ALL";
    search: string;
    page: number;
    size: number;
}

export interface ExtendSubscriptionPayload {
    providerId: string;
    days: number;
    reason: string;
}

export interface RevokeSubscriptionPayload {
    providerId: string;
    reason: string;
}
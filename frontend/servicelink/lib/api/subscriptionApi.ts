import api from "@/utils/axios";

// ─── Types ────────────────────────────────────────────────────────────────────
export type SubscriptionPlanType = "FREE_TRIAL" | "MONTHLY" | "QUARTERLY" | "YEARLY";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";
export type PaymentGateway = "ESEWA" | "KHALTI";

export interface SubscriptionStatusDTO {
    planType: SubscriptionPlanType;
    status: SubscriptionStatus;
    startDate: string;
    endDate: string;
    daysRemaining: number;
    isActive: boolean;
    trialUsed: boolean;
    referralBonusDaysTotal: number;
}

// Mirrors backend PaymentTransactionResponse field-for-field (id, referenceId,
// gatewayTransactionId, gateway, status, amountNpr, initiatedAt, completedAt).
// Field names here MUST match the DTO's Lombok-generated JSON keys exactly —
// TypeScript won't catch a mismatch against the real runtime shape, only
// against how this interface is declared.
export interface BillingRecord {
    id: number;
    referenceId: string;
    gatewayTransactionId: string | null;
    gateway: PaymentGateway;
    status: string;
    amountNpr: number;
    initiatedAt: string | null;
    completedAt: string | null;
}

export interface CheckoutResponse {
    referenceId: string;
    gatewayRedirectUrl: string;
    gatewayMethod: "GET" | "POST";
    gatewayFormFields?: Record<string, string>;
    gateway: string;
    status: string;
}

export interface VerifyPaymentPayload {
    referenceId: string;
    gatewayTransactionId?: string;
    gatewayResponseData?: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────
export const subscriptionApi = {
    getMySubscription: async (): Promise<SubscriptionStatusDTO> => {
        const { data } = await api.get<SubscriptionStatusDTO>("/providers/me/subscription");
        return data;
    },

    getTransactions: async (): Promise<BillingRecord[]> => {
        const { data } = await api.get<BillingRecord[]>("/providers/me/subscription/transactions");
        return data;
    },

    checkout: async (
        planType: SubscriptionPlanType,
        paymentGateway: PaymentGateway,
    ): Promise<CheckoutResponse> => {
        const { data } = await api.post<CheckoutResponse>("/providers/me/subscription/checkout", {
            subscriptionPlanType: planType,
            paymentGateway,
        });
        return data;
    },

    verify: async (payload: VerifyPaymentPayload): Promise<{ paymentStatus: string }> => {
        const { data } = await api.post<{ paymentStatus: string }>(
            "/providers/me/subscription/verify",
            payload,
        );
        return data;
    },
};
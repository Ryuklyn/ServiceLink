import apiClient from "@/lib/api/client";

export interface ProSubscriptionStats {
    activeCount: number;
    trialCount: number;
    expiringSoonCount: number;
    monthlyRevenue: number;
}

export interface ProSubscriptionRow {
    workspaceId: number;
    organizationName: string;
    referenceId: string;
    planType: "STARTER" | "GROWTH" | "ENTERPRISE";
    status: "TRIAL" | "ACTIVE" | "PAST_DUE" | "CANCELLED" | "EXPIRED";
    trialEndsAt: string | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    amountNpr: number;
    createdAt: string;
}

export interface PaymentTransactionResponse {
    id: number;
    referenceId: string;
    gatewayTransactionId: string | null;
    gateway: string;
    status: string;
    amountNpr: number;
    initiatedAt: string | null;
    completedAt: string | null;
}

export interface SystemEventResponse {
    id: string;
    type: string;
    description: string;
    createdAt: string;
    source: string;
}

export interface ProSubscriptionHistory {
    subscription: ProSubscriptionRow;
    transactions: PaymentTransactionResponse[];
    events: SystemEventResponse[];
}

export const adminProSubscriptionApi = {
    async getStats(): Promise<ProSubscriptionStats> {
        const { data } = await apiClient.get<ProSubscriptionStats>("/admin/subscriptions/pro/stats");
        return data;
    },

    async listSubscriptions(): Promise<ProSubscriptionRow[]> {
        const { data } = await apiClient.get<ProSubscriptionRow[]>("/admin/subscriptions/pro");
        return data;
    },

    async getHistory(workspaceId: number): Promise<ProSubscriptionHistory> {
        const { data } = await apiClient.get<ProSubscriptionHistory>(
            `/admin/subscriptions/pro/${workspaceId}/history`
        );
        return data;
    },

    async cancelSubscription(workspaceId: number): Promise<ProSubscriptionRow> {
        const { data } = await apiClient.post<ProSubscriptionRow>(
            `/admin/subscriptions/pro/${workspaceId}/cancel`
        );
        return data;
    },

    async extendSubscription(workspaceId: number, days: number): Promise<ProSubscriptionRow> {
        const { data } = await apiClient.post<ProSubscriptionRow>(
            `/admin/subscriptions/pro/${workspaceId}/extend`,
            null,
            { params: { days } }
        );
        return data;
    },
};

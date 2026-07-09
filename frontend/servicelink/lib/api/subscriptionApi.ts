import api from "@/utils/axios";

export type SubscriptionPlanType = "FREE_TRIAL" | "MONTHLY" | "QUARTERLY" | "YEARLY";
export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

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

export const subscriptionApi = {
    getMySubscription: async (): Promise<SubscriptionStatusDTO> => {
        const { data } = await api.get<SubscriptionStatusDTO>("/providers/me/subscription");
        return data;
    },
};
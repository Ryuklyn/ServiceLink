import api from "@/utils/axios";

// ─── Types ──────────────────────────────────────────────────────────────────
export interface OnboardingStatus {
    hasCompletedOnboarding: boolean;
    hasProfilePicture: boolean;
    hasBio: boolean;
    hasServiceArea: boolean;
    hasAtLeastOneService: boolean;

    subscriptionDaysRemaining: number;
    subscriptionPlanType: "FREE_TRIAL" | "MONTHLY" | "QUARTERLY" | "YEARLY";
    subscriptionActive: boolean;

    referralCode: string;
}

// Mirrors a catalog/sub-service entry for the provider's category
export interface CatalogItem {
    id: number;
    subServiceName: string;
    basePrice: number;
    pricingUnit?: string | null;
}

// What gets sent to /providers/me/services/batch
export interface ProviderServiceSelection {
    catalogId: number;
    isAvailable: boolean;
    customPrice: number;
}

// ─── API ────────────────────────────────────────────────────────────────────

export const onboardingApi = {
    getStatus: async (): Promise<OnboardingStatus> => {
        const { data } = await api.get<OnboardingStatus>("/providers/me/onboarding-status");
        return data;
    },

    getCatalog: async (category: string): Promise<CatalogItem[]> => {
        const { data } = await api.get<CatalogItem[]>("/providers/catalog", {
            params: { category },
        });
        return data;
    },

    saveServices: async (selections: ProviderServiceSelection[]): Promise<void> => {
        await api.post("/providers/me/services/batch", selections);
    },

    completeOnboarding: async (): Promise<void> => {
        await api.post("/providers/me/complete-onboarding");
    },
};
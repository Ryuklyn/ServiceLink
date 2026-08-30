import api from "@/utils/axios";

export interface AnalyticsSummary {
    totalBookings: number;
    acceptanceRate: number;
    repeatCustomerRate: number;
    averageResponseTime: number;
}

export interface TrendItem {
    label: string;
    value: number;
}

export interface CategoryItem {
    name: string;
    value: number;
    color: string;
}

export interface RatingItem {
    star: number;
    pct: number;
}

export interface RatingsInfo {
    average: number;
    totalReviews: number;
    distribution: RatingItem[];
}

export interface CoverageItem {
    lat: number;
    lng: number;
    label: string;
}

export interface ProviderAnalyticsResponse {
    summary: AnalyticsSummary;
    bookingTrend: TrendItem[];
    serviceCategories: CategoryItem[];
    peakHours: number[][];
    ratings: RatingsInfo;
    coverage: CoverageItem[];
}

export interface EarningsSummary {
    totalEarned: number;
    completedJobs: number;
    averagePerJob: number;
    pendingAmount: number;
}

export interface RevenueTrendItem {
    month: string;
    amount: number;
}

export interface TopServiceItem {
    name: string;
    value: number;
    color: string;
}

export interface PaymentItem {
    id: string;
    customer: string;
    service: string;
    date: string;
    amount: string;
    status: "Paid" | "Pending" | "Unpaid" | "Refunded" | string;
}

export interface ProviderEarningsResponse {
    summary: EarningsSummary;
    revenueTrend: RevenueTrendItem[];
    topServices: TopServiceItem[];
    recentPayments: PaymentItem[];
}

export const insightsApi = {
    getAnalytics: async (range: string): Promise<ProviderAnalyticsResponse> => {
        const { data } = await api.get<ProviderAnalyticsResponse>(
            `/providers/analytics?range=${encodeURIComponent(range)}`
        );
        return data;
    },

    getEarnings: async (range: string): Promise<ProviderEarningsResponse> => {
        const { data } = await api.get<ProviderEarningsResponse>(
            `/providers/earnings?range=${encodeURIComponent(range)}`
        );
        return data;
    }
};

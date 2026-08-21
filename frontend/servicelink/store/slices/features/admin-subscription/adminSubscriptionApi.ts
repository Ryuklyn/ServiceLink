// src/store/slices/features/admin-subscription/adminSubscriptionApi.ts
//
// Colocated with the slice and types, mirroring your existing
// features/kyc/ folder (kycAdminApi.ts + kycAdminSlice.ts + kycTypes.ts).
// Thin functions built on the default `api` instance from lib/api/client.ts,
// so the admin-vs-user token routing, refresh-token queue, and ApiError
// normalization already configured there apply here automatically.
//
// BACKEND CONTRACT — not yet in your Provider Subscription System doc, which
// only covers /api/providers/me/subscription/*. Add these admin-gated
// (hasRole('ADMIN')) endpoints backed by the same ProviderSubscription /
// PaymentTransaction tables. Full public routes (baseURL already ends in
// /api, so the calls below omit that prefix — see apiClient.baseURL in
// lib/api/client.ts):
//
//   GET  /api/admin/subscriptions/stats
//   GET  /api/admin/subscriptions?search=&status=&planType=&page=&size=
//   GET  /api/admin/subscriptions/{providerId}/history
//   GET  /api/admin/subscriptions/transactions?gateway=&status=&search=&page=&size=
//   POST /api/admin/subscriptions/{providerId}/extend   { days, reason }
//   POST /api/admin/subscriptions/{providerId}/revoke   { reason }
//
// extend -> should reuse ProviderSubscriptionService.extend() (stacks on
// remaining time, revives EXPIRED -> ACTIVE) and log a SUBSCRIPTION_EXTENDED
// system event carrying the admin's justification.
// revoke  -> status = CANCELLED, Provider.isActive = false, and (mirroring
// the daily expiry sweep) ProviderScheduleSettings.acceptsProOrders -> false.

// Uses the default-exported `api` instance from lib/api/client.ts — not
// authClient from utils/axios.ts. This one matters specifically because it
// auto-detects admin routes via isAdminContext() (checks the URL for
// "/admin" — matches our /dashboard/admin/subscription route) and attaches
// adminAccessToken instead of the regular user accessToken, with its own
// refresh-token queue and redirect to /admin/login on a failed refresh.
// Renamed to apiClient on import only for local readability.
import apiClient, { ApiError } from "@/lib/api/client";
import type {
    AuditLogFilters,
    ExtendSubscriptionPayload,
    PagedResult,
    PaymentTransactionRow,
    ProviderSubscriptionRow,
    RevokeSubscriptionPayload,
    SubscriptionHistory,
    SubscriptionListFilters,
    SubscriptionStats,
} from "./adminSubscriptionTypes";

function cleanParams<T extends object>(params: T): Partial<T> {
    return Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "" && v !== "ALL")
    ) as Partial<T>;
}

export const adminSubscriptionApi = {
    async getStats(): Promise<SubscriptionStats> {
        const { data } = await apiClient.get<SubscriptionStats>("/admin/subscriptions/stats");
        return data;
    },

    async listSubscriptions(
        filters: SubscriptionListFilters
    ): Promise<PagedResult<ProviderSubscriptionRow>> {
        const { data } = await apiClient.get<PagedResult<ProviderSubscriptionRow>>(
            "/admin/subscriptions",
            { params: cleanParams(filters) }
        );
        return data;
    },

    async getHistory(providerId: string): Promise<SubscriptionHistory> {
        const { data } = await apiClient.get<SubscriptionHistory>(
            `/admin/subscriptions/${providerId}/history`
        );
        return data;
    },

    async listTransactions(
        filters: AuditLogFilters
    ): Promise<PagedResult<PaymentTransactionRow>> {
        const { data } = await apiClient.get<PagedResult<PaymentTransactionRow>>(
            "/admin/subscriptions/transactions",
            { params: cleanParams(filters) }
        );
        return data;
    },

    async extendSubscription(
        payload: ExtendSubscriptionPayload
    ): Promise<ProviderSubscriptionRow> {
        const { data } = await apiClient.post<ProviderSubscriptionRow>(
            `/admin/subscriptions/${payload.providerId}/extend`,
            { days: payload.days, reason: payload.reason }
        );
        return data;
    },

    async revokeSubscription(
        payload: RevokeSubscriptionPayload
    ): Promise<ProviderSubscriptionRow> {
        const { data } = await apiClient.post<ProviderSubscriptionRow>(
            `/admin/subscriptions/${payload.providerId}/revoke`,
            { reason: payload.reason }
        );
        return data;
    },
};
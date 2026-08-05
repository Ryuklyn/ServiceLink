import { statusClient } from "@/utils/axios";
import type {
    KycDetail,
    KycListItem,
    ScheduleVideoAuditRequest,
    KycStatusRaw,
} from "./kycTypes";

export interface ListKycParams {
    status?: KycStatusRaw | "all";
    search?: string;
}

/**
 * Admin pipeline. Uses your existing `statusClient` (which sends Bearer +
 * X-Provider-Token) — single source of truth for HTTP, no new axios instance.
 * `statusClient` deliberately has NO 401 hard-redirect, which is correct
 * here: if an admin session token expires mid-decision, we want the
 * error to surface in the modal, NOT force-navigate the admin to /login.
 */
export const kycAdminApi = {

    // list: (params: ListKycParams = {}) =>
    //     statusClient
    //         .get<KycListItem[]>("/admin/kyc/pending", { params })
    //         .then((r) => r.data),

    list: (params: ListKycParams = {}) =>
        statusClient
            .get<KycListItem[]>("/admin/kyc", { params })
            .then((r) => r.data),

    detail: (id: number) =>
        statusClient
            .get<KycDetail>(`/admin/kyc/${id}`)
            .then((r) => r.data),

    approve: (id: number, reviewNotes?: string) =>
        statusClient
            .post(`/admin/kyc/${id}/approve`, { reviewNotes: reviewNotes ?? null })
            .then((r) => r.data),

    reject: (id: number, reviewNotes: string) =>
        statusClient
            .post(`/admin/kyc/${id}/reject`, { reviewNotes })
            .then((r) => r.data),

    scheduleVideoAudit: (id: number, body: ScheduleVideoAuditRequest) =>
        statusClient
            .post(`/admin/kyc/${id}/schedule-video-audit`, body)
            .then((r) => r.data),
};

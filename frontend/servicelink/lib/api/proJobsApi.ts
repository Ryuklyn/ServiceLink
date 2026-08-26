import api from "@/utils/axios";

export type ProJobStatus =
    | "DRAFT" | "REQUESTED" | "ASSIGNING" | "PARTIALLY_ASSIGNED" | "ASSIGNED"
    | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ESCALATED" | "UNFULFILLED";
export type ProPricingModel = "PER_DAY" | "PER_JOB";

export interface ProJobTicket {
    id: number;
    reference: string;
    title: string;
    serviceCatalogId: number;
    category: string;
    service: string;
    workersRequired: number;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    location: string;
    instructions?: string | null;
    pricingModel: ProPricingModel;
    businessPrice: number;
    providerEarning: number;
    status: ProJobStatus;
    createdAt: string;
}

export interface CreateProJobTicket {
    serviceCatalogId: number;
    title: string;
    workersRequired: number;
    scheduledDate: string;
    startTime: string;
    endTime: string;
    location: string;
    latitude?: number;
    longitude?: number;
    instructions?: string;
    pricingModel: ProPricingModel;
    businessPrice: number;
    providerEarning: number;
}

export interface Page<T> { content: T[]; totalElements: number; totalPages: number; number: number; size: number; }

export const proJobsApi = {
    list: (params?: { status?: ProJobStatus; page?: number; size?: number }) =>
        api.get<Page<ProJobTicket>>("/pro/jobs", { params }),
    create: (payload: CreateProJobTicket) => api.post<ProJobTicket>("/pro/jobs", payload),
};

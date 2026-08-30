import api from "@/utils/axios";

export interface ProviderKycDocument {
    name: string;
    url: string;
}

export interface ProviderKycDetail {
    status: "PENDING" | "UNDER_REVIEW" | "APPROVED" | "REJECTED";
    submittedAt: string | null;
    reviewedAt: string | null;
    reviewNotes: string | null;
    documents: ProviderKycDocument[];
}

export const providerKycApi = {
    getMyKyc: async (): Promise<ProviderKycDetail> => {
        const { data } = await api.get<ProviderKycDetail>("/kyc/me");
        return data;
    },
};

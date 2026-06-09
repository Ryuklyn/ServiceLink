// import { authClient } from "./client";
//
// // ─── Request types ────────────────────────────────────────────────────────────
//
// // (FormData is used directly for the multipart submission)
//
// // ─── Response types ───────────────────────────────────────────────────────────
//
// export interface KycSubmitResponse {
//   referenceNumber: string;
//   status: string;
//   submittedAt: string;
//   applicantName: string;
//   applicantEmail: string;
//   message: string;
// }
//
// export interface KycStatusResponse {
//   referenceNumber: string;
//   status: "PENDING" | "APPROVED" | "REJECTED";
//   submittedAt: string;
//   reviewedAt: string | null;
//   reviewNotes: string | null;
// }
//
// // ─── KYC API ──────────────────────────────────────────────────────────────────
//
// export const kycApi = {
//   submitKyc: async (
//     formData: FormData,
//   ): Promise<KycSubmitResponse> => {
//     const headers: Record<string, string> = {};
//
//     if (providerToken) {
//       headers["X-Provider-Token"] = providerToken;
//     }
//
//     const { data } = await authClient.post<KycSubmitResponse>(
//       "/kyc/submit",
//       formData,
//       { headers },
//     );
//
//     return data;
//   },
//
//   /** Get KYC application status for the current user/applicant. */
//   getKycStatus: async (providerToken?: string): Promise<KycStatusResponse> => {
//     const headers: Record<string, string> = {};
//     if (providerToken) headers["X-Provider-Token"] = providerToken;
//
//     const { data } = await authClient.get<KycStatusResponse>("/kyc/status", {
//       headers,
//     });
//     return data;
//   },
// };


import { authClient } from "./client";

// ─── Response types ───────────────────────────────────────────────────────────

export interface KycSubmitResponse {
  referenceNumber: string;
  status: string;
  submittedAt: string;
  applicantName: string;
  applicantEmail: string;
  message: string;
}

export interface KycStatusResponse {
  referenceNumber: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  submittedAt: string;
  reviewedAt: string | null;
  reviewNotes: string | null;
}

// ─── KYC API ──────────────────────────────────────────────────────────────────

export const kycApi = {
  submitKyc: async (formData: FormData): Promise<KycSubmitResponse> => {
    const { data } = await authClient.post<KycSubmitResponse>(
        "/kyc/submit",
        formData,
    );
    return data;
  },

  getKycStatus: async (): Promise<KycStatusResponse> => {
    const { data } = await authClient.get<KycStatusResponse>("/kyc/status");
    return data;
  },
};
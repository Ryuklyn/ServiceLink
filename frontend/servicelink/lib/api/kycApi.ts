import { authClient } from "./client";

// ─── Request types ────────────────────────────────────────────────────────────

// (FormData is used directly for the multipart submission)

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
  /**
   * Submit KYC form data.
   *
   * Auth strategy (priority order):
   *  1. `providerToken` (from OTP verify) → sent as X-Provider-Token header
   *  2. Standard Bearer token (for logged-in users)
   */
  submitKyc: async (
    formData: FormData,
    providerToken?: string,
  ): Promise<KycSubmitResponse> => {
    const headers: Record<string, string> = {
      // Let the browser set Content-Type (multipart/form-data + boundary)
      "Content-Type": "multipart/form-data",
    };
    if (providerToken) {
      headers["X-Provider-Token"] = providerToken;
    }

    const { data } = await authClient.post<KycSubmitResponse>(
      "/kyc/submit",
      formData,
      { headers },
    );
    return data;
  },

  /** Get KYC application status for the current user/applicant. */
  getKycStatus: async (providerToken?: string): Promise<KycStatusResponse> => {
    const headers: Record<string, string> = {};
    if (providerToken) headers["X-Provider-Token"] = providerToken;

    const { data } = await authClient.get<KycStatusResponse>("/kyc/status", {
      headers,
    });
    return data;
  },
};

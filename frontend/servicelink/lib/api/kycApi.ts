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
//
// export const kycApi = {
//   submitKyc: async (formData: FormData): Promise<KycSubmitResponse> => {
//     const { data } = await authClient.post<KycSubmitResponse>(
//         "/kyc/submit",
//         formData,
//     );
//     return data;
//   },
//
//   getKycStatus: async (): Promise<KycStatusResponse> => {
//     const { data } = await authClient.get<KycStatusResponse>("/kyc/status");
//     return data;
//   },
// };

export interface KycSubmitPayload {
  applicantIdentifier?: string;
  fullName?: string;
  dob?: string;
  gender?: string;
  phone?: string;
  email?: string;
  province?: string;
  district?: string;
  municipality?: string;
  ward?: string;
  tole?: string;
  primaryService?: string;
  otherService?: string;
  additionalServices?: string[];
  experienceYears?: number;
  primaryDistrict?: string;
  secondaryDistricts?: string[];
  travelRadius?: string;
  bio?: string;
  profilePhotoUrl?: string | null;
  citizenshipFrontUrl?: string | null;
  citizenshipBackUrl?: string | null;
  photoUrl?: string | null;
  panUrl?: string | null;
  professionalCertUrls?: string[];
  draftSessionId?: string | null;
}

export const kycApi = {
  submitKyc: async (payload: KycSubmitPayload): Promise<KycSubmitResponse> => {
    const { data } = await authClient.post<KycSubmitResponse>(
        "/kyc/submit",
        payload, // ✅ FormData होइन, plain JSON
    );
    return data;
  },
  getKycStatus: async (): Promise<KycStatusResponse> => {
    const { data } = await authClient.get<KycStatusResponse>("/kyc/status");
    return data;
  },
};
import { statusClient, publicClient } from "./client";

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

// Public, token-independent status shape — same fields as KycStatusResponse,
// kept as a separate type in case the backend intentionally omits fields
// (e.g. reviewNotes) from the public endpoint later.
export type PublicKycStatusResponse = KycStatusResponse;

// ─── KYC API ──────────────────────────────────────────────────────────────────
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
  // Was authClient — that has the 401 -> hard redirect to /login interceptor,
  // which silently wiped out submissions from applicants whose short-lived
  // provider token had expired while filling the form (no error shown, no
  // DB row created). statusClient sends the same auth headers but has no
  // redirect interceptor, so a stale-token failure now surfaces as a normal
  // rejected promise that ReviewDone's catch block can show to the user.
  submitKyc: async (payload: KycSubmitPayload): Promise<KycSubmitResponse> => {
    const { data } = await statusClient.post<KycSubmitResponse>("/kyc/submit", payload);
    return data;
  },

  // Token-based status — works for logged-in users, or applicants still
  // within their 15-minute provider-token window. Kept for future use
  // (e.g. a logged-in "My Applications" dashboard).
  getKycStatus: async (): Promise<KycStatusResponse> => {
    const { data } = await statusClient.get<KycStatusResponse>("/kyc/status");
    return data;
  },

  // Token-independent status lookup by reference number. Used by the
  // post-submission confirmation page (DoneStep) and the receipt view,
  // which must keep working long after the applicant's short-lived
  // provider token has expired.
  getKycStatusByReference: async (referenceNumber: string): Promise<PublicKycStatusResponse> => {
    const { data } = await publicClient.get<PublicKycStatusResponse>(
        "/kyc/status/by-reference",
        { params: { ref: referenceNumber } }
    );
    return data;
  },
};
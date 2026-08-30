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

export const KYC_STATUSES = ["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED"] as const;
export type KycStatus = (typeof KYC_STATUSES)[number];

// Authenticated status shape — tied to a real session (provider token or
// login), so it's safe to include PII here.
export interface KycStatusResponse {
  referenceNumber: string;
  status: KycStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewNotes: string | null;
  fullName: string;
  email: string;
}

// Public, token-independent status shape. Deliberately narrower than
// KycStatusResponse — this endpoint is queryable by anyone holding a
// reference number string, with no auth, so the backend correctly omits
// PII (fullName, email) from it. Callers (DoneStep, the receipt views)
// already fall back to locally-held form data when these are absent.
export interface PublicKycStatusResponse {
  referenceNumber: string;
  status: KycStatus;
  submittedAt: string;
  reviewedAt: string | null;
  reviewNotes: string | null;
  fullName?: string;
  email?: string;
}

// ─── Runtime validation ────────────────────────────────────────────────────────
// TypeScript's generic on axios.get<T>() is a compile-time-only assertion —
// it does not validate the response body. Without this check, a backend typo,
// a new status value, or a malformed payload would silently produce an object
// that TypeScript believes matches the response type but doesn't, and the
// failure would only surface downstream (e.g. STATUS_META[currentStatus]
// being undefined in DoneStep). Fail fast at the API boundary instead.
//
// Two separate checks because the two endpoints have genuinely different
// contracts: the authenticated endpoint always includes PII, the public one
// deliberately may not. Validating the public response against the stricter
// (PII-required) shape is what caused it to falsely reject a real,
// well-formed "UNDER_REVIEW" response — the fields it flagged as missing
// were never supposed to be there in the first place.
function hasCommonFields(data: any): boolean {
  return (
      !!data &&
      typeof data.referenceNumber === "string" &&
      typeof data.status === "string" &&
      (KYC_STATUSES as readonly string[]).includes(data.status) &&
      typeof data.submittedAt === "string"
  );
}

function isValidKycStatusResponse(data: any): data is KycStatusResponse {
  return (
      hasCommonFields(data) &&
      typeof data.fullName === "string" &&
      typeof data.email === "string"
  );
}

function isValidPublicKycStatusResponse(data: any): data is PublicKycStatusResponse {
  // fullName/email are optional here — only type-check them if present.
  return (
      hasCommonFields(data) &&
      (data.fullName === undefined || typeof data.fullName === "string") &&
      (data.email === undefined || typeof data.email === "string")
  );
}

function assertKycStatusResponse(data: any): asserts data is KycStatusResponse {
  if (!isValidKycStatusResponse(data)) {
    throw new Error(
        `Invalid KYC status response from API: ${JSON.stringify(data)}`
    );
  }
}

function assertPublicKycStatusResponse(data: any): asserts data is PublicKycStatusResponse {
  if (!isValidPublicKycStatusResponse(data)) {
    throw new Error(
        `Invalid public KYC status response from API: ${JSON.stringify(data)}`
    );
  }
}

// ─── KYC API ──────────────────────────────────────────────────────────────────
export interface KycSubmitPayload {
  applicantIdentifier?: string;
  referralCode?: string;
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
  // primaryService?: string;
  primaryCategoryId?: number;
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
  verifyReferralCode: async (code: string): Promise<{ valid: boolean; providerName?: string; profilePictureUrl?: string; serviceCategory?: string }> => {
    const { data } = await publicClient.get("/providers/referrals/verify", { params: { code } });
    return data;
  },
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
  // (e.g. a logged-in "My Applications" dashboard). Includes PII since the
  // caller is authenticated.
  getKycStatus: async (): Promise<KycStatusResponse> => {
    const { data } = await statusClient.get<KycStatusResponse>("/kyc/status");
    assertKycStatusResponse(data);
    return data;
  },

  // Token-independent status lookup by reference number. Used by the
  // post-submission confirmation page (DoneStep), the receipt view, and
  // CheckStatusModal — all of which must keep working long after the
  // applicant's short-lived provider token has expired, and none of which
  // are authenticated, so PII is intentionally not guaranteed here.
  getKycStatusByReference: async (referenceNumber: string): Promise<PublicKycStatusResponse> => {
    const { data } = await publicClient.get<PublicKycStatusResponse>(
        "/kyc/status/by-reference",
        { params: { ref: referenceNumber } }
    );
    assertPublicKycStatusResponse(data);
    return data;
  },
};

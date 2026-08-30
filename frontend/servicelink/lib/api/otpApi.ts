import { publicApi } from "./public";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * KYC  — used during provider registration (applicant doesn't exist yet).
 * LOGIN — used on the login page; backend validates the phone/email belongs
 *         to an EXISTING provider before sending/verifying an OTP.
 */
export type OtpPurpose = "KYC" | "LOGIN";

export interface OtpSendResponse {
  message: string;
  deliveryMethod: "SMS" | "EMAIL" | "WHATSAPP_LINK" | "WHATSAPP_API";
  whatsappLink: string | null;
}

export interface OtpVerifyResponse {
  verified: boolean;
  message: string;
  /**
   * On success:
   *  - KYC purpose   → short-lived JWT to authenticate KYC submission
   *  - LOGIN purpose → short-lived JWT providerToken
   */
  providerToken: string | null;
  /** LOGIN purpose only — present alongside providerToken on success. */
  refreshToken?: string | null;
  email?: string | null;
  pinExists?: boolean;
}

// ─── Endpoint map ─────────────────────────────────────────────────────────────

const ENDPOINTS = {
  KYC: {
    sendPhone: "/auth/send-phone-otp",
    sendEmail: "/auth/send-email-otp",
    verifyPhone: "/auth/verify-phone-otp",
    verifyEmail: "/auth/verify-email-otp",
  },
  LOGIN: {
    sendPhone: "/auth/provider/send-phone-otp",
    sendEmail: "/auth/provider/send-email-otp",
    verifyPhone: "/auth/provider/verify-phone-otp",
    verifyEmail: "/auth/provider/verify-email-otp",
  },
} as const;

// ─── OTP API ─────────────────────────────────────────────────────────────────

export const otpApi = {
  /** Send OTP to phone number (E.164 format: +9779XXXXXXXX). */
  sendPhoneOtp: async (
      phone: string,
      purpose: OtpPurpose = "KYC",
  ): Promise<OtpSendResponse> => {
    const { data } = await publicApi.post<OtpSendResponse>(
        ENDPOINTS[purpose].sendPhone,
        { phone },
    );
    return data;
  },

  /** Send OTP to email address. */
  sendEmailOtp: async (
      email: string,
      purpose: OtpPurpose = "KYC",
  ): Promise<OtpSendResponse> => {
    const { data } = await publicApi.post<OtpSendResponse>(
        ENDPOINTS[purpose].sendEmail,
        { email },
    );
    return data;
  },

  /**
   * Verify phone OTP.
   * - KYC purpose:   backend returns { verified, message, providerToken } directly.
   * - LOGIN purpose: backend returns AuthResponseDTO { token, refreshToken, email }
   *                  on success (200). We normalize that into the same
   *                  OtpVerifyResponse shape so callers don't need to branch.
   */
  verifyPhoneOtp: async (
      phone: string,
      otp: string,
      purpose: OtpPurpose = "KYC",
  ): Promise<OtpVerifyResponse> => {
    if (purpose === "KYC") {
      const { data } = await publicApi.post<OtpVerifyResponse>(
          ENDPOINTS.KYC.verifyPhone,
          { phone, otp },
      );
      return data;
    }

    const { data } = await publicApi.post<{
      verified: boolean;
      message: string;
      providerToken: string;
      pinExists: boolean;
    }>(ENDPOINTS.LOGIN.verifyPhone, { phone, otp });

    return {
      verified: data.verified,
      message: data.message,
      providerToken: data.providerToken,
      pinExists: data.pinExists,
    };
  },

  /** Verify email OTP. Same KYC/LOGIN normalization as verifyPhoneOtp. */
  verifyEmailOtp: async (
      email: string,
      otp: string,
      purpose: OtpPurpose = "KYC",
  ): Promise<OtpVerifyResponse> => {
    if (purpose === "KYC") {
      const { data } = await publicApi.post<OtpVerifyResponse>(
          ENDPOINTS.KYC.verifyEmail,
          { email, otp },
      );
      return data;
    }

    const { data } = await publicApi.post<{
      verified: boolean;
      message: string;
      providerToken: string;
      pinExists: boolean;
    }>(ENDPOINTS.LOGIN.verifyEmail, { email, otp });

    return {
      verified: data.verified,
      message: data.message,
      providerToken: data.providerToken,
      pinExists: data.pinExists,
    };
  },
};
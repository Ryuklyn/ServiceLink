import { publicApi } from "./public";

// ─── Response types ──────────────────────────────────────────────────────────

export interface OtpSendResponse {
  message: string;
  deliveryMethod: "SMS" | "EMAIL" | "WHATSAPP_LINK";
  whatsappLink: string | null;
}

export interface OtpVerifyResponse {
  verified: boolean;
  message: string;
  /** Short-lived JWT to authenticate KYC submission — present on success only. */
  providerToken: string | null;
}

// ─── OTP API ─────────────────────────────────────────────────────────────────

export const otpApi = {
  /** Send OTP to phone number (E.164 format: +9779XXXXXXXX). */
  sendPhoneOtp: async (phone: string): Promise<OtpSendResponse> => {
    const { data } = await publicApi.post<OtpSendResponse>(
      "/auth/send-phone-otp",
      { phone },
    );
    return data;
  },

  /** Send OTP to email address. */
  sendEmailOtp: async (email: string): Promise<OtpSendResponse> => {
    const { data } = await publicApi.post<OtpSendResponse>(
      "/auth/send-email-otp",
      { email },
    );
    return data;
  },

  /**
   * Verify phone OTP.
   * On success the response contains a short-lived `providerToken`.
   */
  verifyPhoneOtp: async (
    phone: string,
    otp: string,
  ): Promise<OtpVerifyResponse> => {
    const { data } = await publicApi.post<OtpVerifyResponse>(
      "/auth/verify-phone-otp",
      { phone, otp },
    );
    return data;
  },

  /** Verify email OTP. */
  verifyEmailOtp: async (
    email: string,
    otp: string,
  ): Promise<OtpVerifyResponse> => {
    const { data } = await publicApi.post<OtpVerifyResponse>(
      "/auth/verify-email-otp",
      { email, otp },
    );
    return data;
  },
};

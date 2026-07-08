import { publicApi } from "./public";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SetPinResponse {
    accessToken: string;
    refreshToken?: string;
}

export interface SkipPinResponse {
    accessToken: string;
    refreshToken?: string;
}

export interface VerifyPinResponse {
    verified: boolean;
    message: string;
    expired?: boolean;
    accessToken: string | null;
    refreshToken?: string | null;
    /** Present on failed attempts so the UI can show a live countdown. */
    attemptsLeft?: number;
}

export interface CheckDeviceResponse {
    pinExists: boolean;
}

// ─── PIN API ──────────────────────────────────────────────────────────────────

export const pinApi = {
    /**
     * Called on app load, before deciding whether to show PhoneStep or PinStep.
     * No auth required — deviceId alone isn't sensitive.
     */
    checkDevice: async (deviceId: string): Promise<CheckDeviceResponse> => {
        const { data } = await publicApi.post<CheckDeviceResponse>(
            "/providers/auth/check-device",
            { deviceId },
        );
        return data;
    },

    /**
     * Called once, right after OTP verification succeeds on a new device.
     * providerToken is the short-lived LOGIN token from otpApi.verifyPhoneOtp/
     * verifyEmailOtp — it authorizes binding a PIN to this provider+device.
     */
    setPin: async (
        providerToken: string,
        deviceId: string,
        pin: string,
    ): Promise<SetPinResponse> => {
        const { data } = await publicApi.post<SetPinResponse>(
            "/providers/auth/set-pin",
            { deviceId, pin },
            { headers: { "X-Provider-Token": providerToken } },
        );
        return data;
    },

    /**
     * Called if the provider declines to set a PIN on this device.
     * Just exchanges the short-lived providerToken for a full session,
     * same tokens set-pin would have returned.
     */
    skipPin: async (providerToken: string): Promise<SkipPinResponse> => {
        const { data } = await publicApi.post<SkipPinResponse>(
            "/providers/auth/skip-pin",
            {},
            { headers: { "X-Provider-Token": providerToken } },
        );
        return data;
    },

    /** The fast, day-to-day login path — no OTP involved. */
    verifyPin: async (
        deviceId: string,
        pin: string,
    ): Promise<VerifyPinResponse> => {
        const { data } = await publicApi.post<VerifyPinResponse>(
            "/providers/auth/verify-pin",
            { deviceId, pin },
        );
        return data;
    },
};
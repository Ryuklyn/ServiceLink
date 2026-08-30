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

export interface CheckAccountResponse {
    pinExists: boolean;
    maskedContact: string;
    email: string;
}

// ─── PIN API ──────────────────────────────────────────────────────────────────

export const pinApi = {
    /** Legacy device lookup retained for compatible clients. */
    checkDevice: async (deviceId: string): Promise<CheckDeviceResponse> => {
        const { data } = await publicApi.post<CheckDeviceResponse>(
            "/providers/auth/check-device",
            { deviceId },
        );
        return data;
    },

    checkAccount: async (payload: { email?: string; phone?: string }): Promise<CheckAccountResponse> => {
        const { data } = await publicApi.post<CheckAccountResponse>(
            "/providers/auth/check-account",
            payload,
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

    /** Legacy PIN-skip endpoint retained for compatible clients. */
    skipPin: async (providerToken: string): Promise<SkipPinResponse> => {
        const { data } = await publicApi.post<SkipPinResponse>(
            "/providers/auth/skip-pin",
            {},
            { headers: { "X-Provider-Token": providerToken } },
        );
        return data;
    },

    /** PIN verification after the provider has identified their account. */
    verifyPin: async (
        deviceId: string,
        pin: string,
        providerToken?: string,
        email?: string,
        phone?: string,
    ): Promise<VerifyPinResponse> => {
        const headers: Record<string, string> = {};
        if (providerToken) {
            headers["X-Provider-Token"] = providerToken;
        }
        const { data } = await publicApi.post<VerifyPinResponse>(
            "/providers/auth/verify-pin",
            { deviceId, pin, email, phone },
            { headers },
        );
        return data;
    },
};

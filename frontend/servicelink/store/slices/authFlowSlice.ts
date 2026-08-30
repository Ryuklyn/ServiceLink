import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ContactMode } from "@/components/kyc/PhoneStep";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthFlowPhase =
    | "checking"     // establishing the device ID on mount
    | "otp"          // PhoneStep -> OtpStep
    | "setPin"       // shown once, right after first-time OTP success
    | "pinEntry"     // fast path on a known device
    | "authenticated";

interface AuthFlowState {
    phase: AuthFlowPhase;
    deviceId: string;
    contact: string;
    contactMode: ContactMode;
    whatsappLink?: string;
    /** The short-lived LOGIN providerToken from OTP verify — needed by set-pin/skip-pin. */
    pendingProviderToken?: string;
    isForgotPin?: boolean;
}

const initialState: AuthFlowState = {
    phase: "checking",
    deviceId: "",
    contact: "",
    contactMode: "phone",
    whatsappLink: undefined,
    pendingProviderToken: undefined,
    isForgotPin: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const authFlowSlice = createSlice({
    name: "authFlow",
    initialState,
    reducers: {
        setDeviceId(state, action: PayloadAction<string>) {
            state.deviceId = action.payload;
        },
        setPhase(state, action: PayloadAction<AuthFlowPhase>) {
            state.phase = action.payload;
        },
        otpSent(
            state,
            action: PayloadAction<{ contact: string; mode: ContactMode; whatsappLink?: string }>,
        ) {
            state.contact = action.payload.contact;
            state.contactMode = action.payload.mode;
            state.whatsappLink = action.payload.whatsappLink;
            state.phase = "otp";
        },
        otpVerified(state, action: PayloadAction<{ providerToken: string }>) {
            state.pendingProviderToken = action.payload.providerToken;
            // OTP is deliberately sent only for a provider without a PIN or for
            // a PIN reset. Both cases must end by creating/replacing the PIN.
            state.phase = "setPin";
            state.isForgotPin = false;
        },
        directPinEntry(
            state,
            action: PayloadAction<{ contact: string; mode: ContactMode }>,
        ) {
            state.contact = action.payload.contact;
            state.contactMode = action.payload.mode;
            state.phase = "pinEntry";
        },
        resetToOtp(state, action: PayloadAction<{ isForgotPin?: boolean } | undefined>) {
            // Used by both "Forgot PIN" and PIN-lockout fallback.
            state.contact = "";
            state.whatsappLink = undefined;
            state.pendingProviderToken = undefined;
            state.phase = "otp";
            state.isForgotPin = action.payload?.isForgotPin ?? false;
        },
        authenticated(state) {
            state.pendingProviderToken = undefined;
            state.phase = "authenticated";
            state.isForgotPin = false;
        },
    },
});

export const {
    setDeviceId,
    setPhase,
    otpSent,
    otpVerified,
    directPinEntry,
    resetToOtp,
    authenticated,
} = authFlowSlice.actions;

export default authFlowSlice.reducer;

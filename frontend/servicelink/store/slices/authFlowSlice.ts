import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ContactMode } from "@/components/kyc/PhoneStep";

// ─── Types ────────────────────────────────────────────────────────────────────

export type AuthFlowPhase =
    | "checking"     // deciding pinEntry vs otp on mount
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
}

const initialState: AuthFlowState = {
    phase: "checking",
    deviceId: "",
    contact: "",
    contactMode: "phone",
    whatsappLink: undefined,
    pendingProviderToken: undefined,
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
            // Don't go to dashboard yet — first-time device needs a PIN set first.
            state.pendingProviderToken = action.payload.providerToken;
            state.phase = "setPin";
        },
        resetToOtp(state) {
            // Used by both "Forgot PIN" and PIN-lockout fallback.
            state.contact = "";
            state.whatsappLink = undefined;
            state.pendingProviderToken = undefined;
            state.phase = "otp";
        },
        authenticated(state) {
            state.pendingProviderToken = undefined;
            state.phase = "authenticated";
        },
    },
});

export const {
    setDeviceId,
    setPhase,
    otpSent,
    otpVerified,
    resetToOtp,
    authenticated,
} = authFlowSlice.actions;

export default authFlowSlice.reducer;
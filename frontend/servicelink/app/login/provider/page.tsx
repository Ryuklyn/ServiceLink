"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import PhoneStep from "@/components/kyc/PhoneStep";
import OtpStep from "@/components/kyc/OTPStep";
import SetPinStep from "@/components/provider/auth/SetPinStep";
import PinStep from "@/components/provider/auth/PinStep";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setDeviceId,
    setPhase,
    otpSent,
    otpVerified,
    resetToOtp,
    authenticated,
} from "@/store/slices/authFlowSlice";
import { getOrCreateDeviceId } from "@/lib/api/device";
import { pinApi } from "@/lib/api/pinApi";

// utils/axios.ts keeps its own token helpers private (not exported), but it
// reads/writes these exact two localStorage keys — so we mirror that here
// rather than importing a `storage` export that doesn't exist.
const getRefreshToken = () =>
    typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;

/**
 * Login Page  (/login)
 *
 * Flow:
 *  checking   -> silently decides pinEntry vs otp based on refreshToken + check-device
 *  otp        -> PhoneStep -> OtpStep (first login, new device, forgot-PIN, or lockout)
 *  setPin     -> shown ONCE right after a first-time OTP success on this device
 *  pinEntry   -> fast daily path: PIN only, no phone/email re-entry
 *  authenticated -> redirect to /dashboard/provider
 */
export default function LoginPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { phase, contact, contactMode, whatsappLink, deviceId, pendingProviderToken } =
        useAppSelector((s) => s.authFlow);

    // ── On mount: establish device identity, decide starting phase ───────────
    useEffect(() => {
        const id = getOrCreateDeviceId();
        dispatch(setDeviceId(id));

        const decideStartingPhase = async () => {
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
                dispatch(setPhase("otp"));
                return;
            }
            try {
                const { pinExists } = await pinApi.checkDevice(id);
                dispatch(setPhase(pinExists ? "pinEntry" : "otp"));
            } catch {
                // Fail safe: never strand the user on a blank screen
                dispatch(setPhase("otp"));
            }
        };

        decideStartingPhase();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Redirect once authenticated ───────────────────────────────────────────
    useEffect(() => {
        if (phase === "authenticated") {
            router.push("/dashboard/provider");
        }
    }, [phase, router]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const handleOtpSent = useCallback(
        (c: string, mode: typeof contactMode, waLink?: string) => {
            dispatch(otpSent({ contact: c, mode, whatsappLink: waLink }));
        },
        [dispatch],
    );

    /**
     * OtpStep (LOGIN purpose) hands us the short-lived providerToken.
     * We don't persist real session tokens yet — that only happens after
     * set-pin / skip-pin, which is what actually issues the full session.
     */
    const handleOtpVerified = useCallback(
        (providerToken: string) => {
            dispatch(otpVerified({ providerToken }));
        },
        [dispatch],
    );

    const handleChangeContact = useCallback(() => {
        dispatch(resetToOtp());
    }, [dispatch]);

    const persistSessionAndFinish = useCallback(
        (accessToken: string, refreshToken?: string) => {
            localStorage.setItem("accessToken", accessToken);
            if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
            dispatch(authenticated());
        },
        [dispatch],
    );

    // ── Render by phase ─────────────────────────────────────────────────────────
    if (phase === "checking") {
        return (
            <div className="min-h-[100dvh] w-full flex items-center justify-center bg-[#f0f4ff]">
                <div className="w-10 h-10 border-4 border-[#1e3a8a]/20 border-t-[#1e3a8a] rounded-full animate-spin" />
            </div>
        );
    }

    if (phase === "pinEntry") {
        return (
            <PinStep
                deviceId={deviceId}
                onVerified={persistSessionAndFinish}
                onFallbackToOtp={() => dispatch(resetToOtp())}
            />
        );
    }

    if (phase === "setPin" && pendingProviderToken) {
        return (
            <SetPinStep
                providerToken={pendingProviderToken}
                deviceId={deviceId}
                onComplete={persistSessionAndFinish}
            />
        );
    }

    // phase === "otp"
    if (!contact) {
        return (
            <PhoneStep
                onOtpSent={handleOtpSent}
                purpose="LOGIN"
                footerPrompt="Don't have an account?"
                footerLinkLabel="Register here"
                footerLinkHref="/register"
            />
        );
    }

    return (
        <OtpStep
            contact={contact}
            mode={contactMode}
            whatsappLink={whatsappLink}
            onVerified={handleOtpVerified}
            onChangeContact={handleChangeContact}
            purpose="LOGIN"
        />
    );
}
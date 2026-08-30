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
    directPinEntry,
    resetToOtp,
    authenticated,
} from "@/store/slices/authFlowSlice";
import { getOrCreateDeviceId } from "@/lib/api/device";
import { pinApi } from "@/lib/api/pinApi";

/**
 * Provider login (/login/provider)
 *
 * Flow:
 *  checking   -> establishes a stable device ID
 *  otp        -> phone/email lookup; PIN accounts go to pinEntry, others receive OTP
 *  setPin     -> required after OTP verification for a first PIN or PIN reset
 *  pinEntry   -> PIN verified against the entered provider account
 *  authenticated -> redirect to /dashboard/provider
 */
export default function LoginPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { phase, contact, contactMode, whatsappLink, deviceId, pendingProviderToken, isForgotPin } =
        useAppSelector((s) => s.authFlow);

    // ── On mount: establish device identity, then always ask who is logging in.
    // A stored session never bypasses the provider identifier step.
    useEffect(() => {
        const id = getOrCreateDeviceId();
        dispatch(setDeviceId(id));
        dispatch(setPhase("otp"));
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

    const handleSubmitContact = useCallback(
        async (c: string, mode: typeof contactMode) => {
            if (isForgotPin) {
                return false; // let PhoneStep proceed with sending OTP normally
            }
            try {
                const payload = mode === "phone" ? { phone: c } : { email: c };
                const res = await pinApi.checkAccount(payload);
                if (res.pinExists) {
                    dispatch(directPinEntry({ contact: c, mode }));
                    return true; // handled, bypass OTP sending
                }
            } catch (e) {
                console.error("Account status check failed", e);

                // A 404 is the expected "no provider PIN account" result, so
                // PhoneStep may continue to the server's normal OTP validation.
                // Any other error (for example a stale backend security rule)
                // must not silently send an OTP for a PIN-enabled provider.
                if ((e as { status?: number })?.status !== 404) {
                    throw new Error(
                        "We couldn't check your provider sign-in status. Please try again in a moment.",
                    );
                }
            }
            return false; // proceed with OTP
        },
        [dispatch, isForgotPin],
    );

    /**
     * OtpStep (LOGIN purpose) hands us the short-lived providerToken.
     * We don't persist real session tokens yet — that only happens after
     * set-pin, which is what actually issues the full session.
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

            try {
                const history = JSON.parse(localStorage.getItem("servicelink:provider:login-history") || "[]");
                const ua = navigator.userAgent;
                let browser = "Chrome";
                let os = "Windows";
                if (ua.includes("Firefox")) browser = "Firefox";
                else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari";
                else if (ua.includes("Edg")) browser = "Edge";
                if (ua.includes("Macintosh")) os = "macOS";
                else if (ua.includes("Linux")) os = "Linux";
                else if (ua.includes("Android")) os = "Android";
                else if (ua.includes("iPhone")) os = "iOS";

                history.unshift({
                    device: os,
                    type: browser,
                    location: "Kathmandu, Nepal",
                    time: new Date().toLocaleString(),
                    status: "Success"
                });
                localStorage.setItem("servicelink:provider:login-history", JSON.stringify(history.slice(0, 50)));
            } catch (e) {
                console.error("Failed to log login history", e);
            }

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
                providerToken={pendingProviderToken}
                contact={contact}
                contactMode={contactMode}
                onVerified={persistSessionAndFinish}
                onFallbackToOtp={() => dispatch(resetToOtp({ isForgotPin: true }))}
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
                onSubmitContact={handleSubmitContact}
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

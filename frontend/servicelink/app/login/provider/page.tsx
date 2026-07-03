"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ContactMode } from "@/components/kyc/PhoneStep";

import PhoneStep from "@/components/kyc/PhoneStep";
import OtpStep from "@/components/kyc/OTPStep";

// ─── Types ────────────────────────────────────────────────────────────────────

type OtpPhase = "phone" | "otp";

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Login Page  (/login)
 *
 * Responsibilities:
 *  1. Collect the provider's registered phone / e-mail and dispatch a login OTP (PhoneStep)
 *  2. Verify the OTP with the backend — backend validates the contact belongs
 *     to an existing PROVIDER before issuing any token                        (OtpStep)
 *  3. Persist the resulting session JWT + refresh token to localStorage,
 *     under the SAME keys utils/axios.ts reads ("accessToken"/"refreshToken"),
 *     so every subsequent request through the shared `api` instance is
 *     authenticated automatically.
 *  4. Redirect to the provider dashboard                                     (/dashboard/provider)
 */
export default function LoginPage() {
    const router = useRouter();

    const [phase, setPhase] = useState<OtpPhase>("phone");
    const [verifiedContact, setVerifiedContact] = useState("");
    const [contactMode, setContactMode] = useState<ContactMode>("phone");
    const [whatsappLink, setWhatsappLink] = useState<string | undefined>();

    const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    /** Called by PhoneStep once a login OTP has been dispatched to the contact. */
    const handleOtpSent = useCallback(
        (contact: string, mode: ContactMode, waLink?: string) => {
            setVerifiedContact(contact);
            setContactMode(mode);
            setWhatsappLink(waLink);
            setPhase("otp");
            scrollTop();
        },
        [],
    );

    /**
     * Called by OtpStep after the backend verifies the OTP and returns
     * real session tokens (LOGIN purpose — see otpApi.ts normalization).
     */
    const handleOtpVerified = useCallback(
        (accessToken: string, refreshToken?: string) => {
            localStorage.setItem("accessToken", accessToken);
            if (refreshToken) {
                localStorage.setItem("refreshToken", refreshToken);
            }

            router.push("/dashboard/provider");
        },
        [router],
    );

    /** Go back to phone / email entry from the OTP screen. */
    const handleChangeContact = useCallback(() => {
        setVerifiedContact("");
        setWhatsappLink(undefined);
        setPhase("phone");
        scrollTop();
    }, []);

    if (phase === "phone") {
        return (
            <PhoneStep
                onOtpSent={handleOtpSent}
                purpose="LOGIN"
                heading="Welcome back"
                subheading="Enter your registered phone number or email to receive a one-time code."
                ctaLabel="Send login code"
                footerPrompt="Don't have an account?"
                footerLinkLabel="Register here"
                footerLinkHref="/register"
            />
        );
    }

    return (
        <OtpStep
            contact={verifiedContact}
            mode={contactMode}
            whatsappLink={whatsappLink}
            onVerified={handleOtpVerified}
            onChangeContact={handleChangeContact}
            purpose="LOGIN"
            heading="Check your messages"
            subheading="We sent a one-time login code to"
            resendLabel="Resend login code"
        />
    );
}
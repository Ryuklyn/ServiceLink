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
 *  1. Collect the provider's registered phone / e-mail and dispatch an OTP  (PhoneStep)
 *  2. Verify the OTP with the backend                                        (OtpStep)
 *  3. Persist the resulting session JWT to sessionStorage
 *  4. Redirect to the provider dashboard                                     (/dashboard)
 *
 * sessionStorage keys written on success:
 *   "provider_token"   – session JWT string
 *   "verified_contact" – phone/email string used to log in
 *   "contact_mode"     – "phone" | "email"
 */
export default function LoginPage() {
  const router = useRouter();

  /* ── Phase ────────────────────────────────────────────────────────────────── */
  const [phase, setPhase] = useState<OtpPhase>("phone");

  /* ── Contact info ─────────────────────────────────────────────────────────── */
  const [verifiedContact, setVerifiedContact] = useState("");
  const [contactMode, setContactMode] = useState<ContactMode>("phone");
  const [whatsappLink, setWhatsappLink] = useState<string | undefined>();

  // ── Scroll helper ────────────────────────────────────────────────────────────
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  /* ═══════════════════════════════════════════════════════════════════════════
     HANDLERS
  ═══════════════════════════════════════════════════════════════════════════ */

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
   * Called by OtpStep after the backend verifies the OTP and returns a session JWT.
   * Writes the session to sessionStorage, then navigates to the dashboard.
   */
  const handleOtpVerified = useCallback(
    (token: string) => {
      sessionStorage.setItem("provider_token", token);
      sessionStorage.setItem("verified_contact", verifiedContact);
      sessionStorage.setItem("contact_mode", contactMode);

      router.push("/dashboard/provider");
    },
    [verifiedContact, contactMode, router],
  );

  /** Go back to phone / email entry from the OTP screen. */
  const handleChangeContact = useCallback(() => {
    setVerifiedContact("");
    setWhatsappLink(undefined);
    setPhase("phone");
    scrollTop();
  }, []);

  /* ═══════════════════════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════════════════════ */

  if (phase === "phone") {
    return (
      <PhoneStep
        onOtpSent={handleOtpSent}
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
      heading="Check your messages"
      subheading="We sent a one-time login code to"
      resendLabel="Resend login code"
    />
  );
}

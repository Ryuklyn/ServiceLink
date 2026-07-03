"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Phone,
  Mail,
  Clock,
  ChevronLeft,
  ShieldCheck,
  ExternalLink,
  LogIn,
} from "lucide-react";
import { OtpInput } from "@/components/kyc/OtpInput";
import { otpSchema } from "@/lib/validators/kyc.schemas";
import { otpApi, OtpPurpose } from "@/lib/api/otpApi";
import type { ContactMode } from "@/components/kyc/PhoneStep";

// ─── Constants ────────────────────────────────────────────────────────────────

const OTP_TTL = 600;
const RESEND_WAIT = 30;
const MAX_RESENDS = 3;

// ─── Props ────────────────────────────────────────────────────────────────────

interface OtpStepProps {
  contact: string;
  mode: ContactMode;
  whatsappLink?: string;
  /**
   * Called after successful verification.
   * - KYC: providerToken is the short-lived KYC-submission JWT; refreshToken is undefined.
   * - LOGIN: providerToken is the real access token; refreshToken is also present.
   */
  onVerified: (providerToken: string, refreshToken?: string) => void;
  onChangeContact: () => void;
  /** "KYC" (default) for registration, "LOGIN" for the login page. */
  purpose?: OtpPurpose;
  heading?: string;
  subheading?: string;
  resendLabel?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OtpStep({
                                  contact,
                                  mode,
                                  whatsappLink,
                                  onVerified,
                                  onChangeContact,
                                  purpose = "KYC",
                                }: OtpStepProps) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(OTP_TTL);
  const [resendWait, setResendWait] = useState(RESEND_WAIT);
  const [resendCount, setResendCount] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => Math.max(c - 1, 0));
      setResendWait((c) => Math.max(c - 1, 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (s: number) =>
      `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Verify ──────────────────────────────────────────────────────────────────
  const handleVerify = useCallback(async () => {
    const parsed = otpSchema.safeParse({ otp });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (countdown <= 0) {
      setError("Login code has expired. Please request a new one.");
      return;
    }

    setVerifying(true);
    try {
      const res =
          mode === "phone"
              ? await otpApi.verifyPhoneOtp(contact, otp, purpose)
              : await otpApi.verifyEmailOtp(contact, otp, purpose);

      if (!res.verified || !res.providerToken) {
        setError(res.message ?? "Invalid code. Please try again.");
        setOtp("");
        return;
      }
      onVerified(res.providerToken, res.refreshToken ?? undefined);
    } catch (err: any) {
      // LOGIN purpose throws (403/422) on bad OTP or non-provider — surface
      // the backend's message here so the user sees the real reason.
      const backendMessage =
          err?.response?.data?.message ?? err?.response?.data?.error;
      setError(backendMessage ?? err?.message ?? "Invalid code. Please try again.");
      setOtp("");
    } finally {
      setVerifying(false);
    }
  }, [otp, countdown, contact, mode, purpose, onVerified]);

  // ── Resend ──────────────────────────────────────────────────────────────────
  const handleResend = useCallback(async () => {
    if (resendWait > 0 || resendCount >= MAX_RESENDS) return;
    setResending(true);
    try {
      if (mode === "phone") {
        await otpApi.sendPhoneOtp(contact, purpose);
      } else {
        await otpApi.sendEmailOtp(contact, purpose);
      }
      setCountdown(OTP_TTL);
      setResendWait(RESEND_WAIT);
      setResendCount((c) => c + 1);
      setOtp("");
      setError("");
    } catch (err: any) {
      const backendMessage =
          err?.response?.data?.message ?? err?.response?.data?.error;
      setError(backendMessage ?? err?.message ?? "Failed to resend login code.");
    } finally {
      setResending(false);
    }
  }, [resendWait, resendCount, contact, mode, purpose]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const isExpired = countdown <= 0;
  const isComplete = otp.length === 6;
  const canResend = resendWait === 0 && resendCount < MAX_RESENDS && !isExpired;
  const btnDisabled = !isComplete || isExpired || verifying;

  return (
      <div className="h-screen w-screen flex flex-col lg:flex-row bg-white overflow-hidden">
        <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] items-center justify-center text-white p-12">
          <div className="text-center max-w-sm">
            <div className="w-24 h-24 bg-[#e8683f] rounded-3xl flex items-center justify-center mb-10 mx-auto">
              <LogIn className="w-12 h-12" aria-hidden />
            </div>
            <h1 className="text-4xl font-bold mb-4">One Step Away</h1>
            <p className="text-white/80">
              Enter the login code sent to your {mode} to access your provider
              dashboard.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center bg-[#f0f4ff] px-4 lg:px-16 overflow-y-auto">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-100">
            <div className="p-6 border-b flex items-center gap-3">
              <ShieldCheck className="text-[#1e3a8a]" aria-hidden />
              <div>
                <h2 className="font-bold text-[#1e3a8a]">
                  Enter Your Login Code
                </h2>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  {mode === "phone" ? (
                      <Phone size={12} className="text-[#1e3a8a]" aria-hidden />
                  ) : (
                      <Mail size={12} className="text-[#1e3a8a]" aria-hidden />
                  )}
                  <span>
                  Code sent to:{" "}
                    <strong className="text-[#1e3a8a]">{contact}</strong>
                </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-6 space-y-5">
              {whatsappLink && (
                  <a
                  href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-50 border border-green-200
                text-green-800 px-4 py-3 rounded-xl text-sm font-medium hover:bg-green-100 transition"
                >
                <ExternalLink size={14} aria-hidden />
                Didn't receive your login code? Re-open WhatsApp
                </a>
                )}

              <div>
                <p className="text-xs font-semibold text-[#1e3a8a] mb-3 uppercase tracking-wide">
                  6-Digit Login Code
                </p>
                <OtpInput
                    value={otp}
                    onChange={(v) => {
                      setOtp(v);
                      setError("");
                    }}
                    error={error}
                />
              </div>

              <div role="status" aria-live="polite" aria-atomic="true">
                {isExpired ? (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                      <Clock className="w-4 h-4" aria-hidden />
                      <span>Login code expired. Please request a new one.</span>
                    </div>
                ) : (
                    <span className="text-gray-600 text-sm">
                  Login code expires in <strong>{formatTime(countdown)}</strong>
                </span>
                )}
              </div>

              <button
                  onClick={handleVerify}
                  disabled={btnDisabled}
                  aria-busy={verifying}
                  className={`w-full py-3 rounded-xl flex items-center justify-center gap-2
                transition-all text-base font-semibold
                ${
                      btnDisabled
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-[#e8683f] text-white hover:bg-[#d95a2f] active:scale-[0.98]"
                  }`}
              >
                <LogIn className="w-5 h-5" aria-hidden />
                {verifying
                    ? "Logging in…"
                    : !isComplete
                        ? "Enter your 6-digit code"
                        : "Log In"}
              </button>

              <hr className="border-stone-100" />

              <div className="text-center space-y-1">
                <p className="text-xs text-gray-400">
                  Didn't receive a login code?
                </p>
                {resendCount >= MAX_RESENDS ? (
                    <p className="text-xs text-red-400">Maximum resends reached.</p>
                ) : canResend ? (
                    <button
                        onClick={handleResend}
                        disabled={resending}
                        className="text-[#e8683f] hover:underline font-semibold text-sm"
                    >
                      {resending ? "Sending…" : "Resend Login Code"}
                    </button>
                ) : (
                    <p className="text-gray-400 text-xs">
                      Resend in{" "}
                      <strong className="text-[#1e3a8a]">{resendWait}s</strong>
                      {resendCount > 0 &&
                          ` · ${MAX_RESENDS - resendCount} remaining`}
                    </p>
                )}
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-400">
                  Used the wrong {mode === "phone" ? "number" : "email"}?
                </p>
                <button
                    onClick={onChangeContact}
                    className="mt-1 text-sm text-[#1e3a8a] flex items-center justify-center
                  gap-1 mx-auto font-semibold hover:underline"
                >
                  <ChevronLeft size={14} aria-hidden />
                  Use a different{" "}
                  {mode === "phone" ? "phone number" : "email address"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
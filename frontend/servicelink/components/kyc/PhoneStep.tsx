"use client";

import { useState, useCallback } from "react";
import { Phone, Mail, Info, ArrowRight, LogIn, HardHat, ExternalLink } from "lucide-react";
import { phoneSchema, emailSchema } from "@/lib/validators/kyc.schemas";
import { otpApi, OtpSendResponse } from "@/lib/api/otpApi";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContactMode = "phone" | "email";

interface PhoneStepProps {
  /** Called once the OTP has been dispatched successfully. */
  onOtpSent: (contact: string, mode: ContactMode, whatsappLink?: string) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PHONE_PREFIX = "+977";

function normalizeContact(value: string, mode: ContactMode): string {
  return mode === "phone" ? `${PHONE_PREFIX}${value}` : value.trim();
}

function sanitizeInput(value: string, mode: ContactMode): string {
  return mode === "phone"
    ? value.replace(/\D/g, "").slice(0, 10)
    : value.slice(0, 254);
}

function isReady(value: string, mode: ContactMode): boolean {
  return mode === "phone" ? value.length === 10 : value.includes("@");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PhoneStep({ onOtpSent }: PhoneStepProps) {
  const [mode, setMode]   = useState<ContactMode>("phone");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  // WhatsApp link returned by the backend when SMS credits aren't available
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);

  // ── Mode switch ────────────────────────────────────────────────────────────
  const switchMode = useCallback((next: ContactMode) => {
    if (loading) return;
    setMode(next);
    setValue("");
    setError("");
    setWhatsappLink(null);
  }, [loading]);

  // ── Input ──────────────────────────────────────────────────────────────────
  const handleInput = useCallback((raw: string) => {
    if (loading) return;
    setValue(sanitizeInput(raw, mode));
    if (error) setError("");
  }, [loading, mode, error]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    const contact = normalizeContact(value, mode);

    // Client-side validation
    const schema = mode === "phone" ? phoneSchema : emailSchema;
    const key    = mode === "phone" ? "phone" : "email";
    const result = schema.safeParse({ [key]: contact });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    setError("");
    setWhatsappLink(null);
    setLoading(true);

    try {
      let res: OtpSendResponse;
      if (mode === "phone") {
        res = await otpApi.sendPhoneOtp(contact);
      } else {
        res = await otpApi.sendEmailOtp(contact);
      }

      if (res.deliveryMethod === "WHATSAPP_LINK" && res.whatsappLink) {
        // Surface the WhatsApp link before advancing so user can tap it
        setWhatsappLink(res.whatsappLink);
      } else {
        onOtpSent(contact, mode);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Derived ────────────────────────────────────────────────────────────────
  const inputId    = `${mode}-input`;
  const errorId    = `${mode}-error`;
  const hintId     = `${mode}-hint`;
  const isDisabled = loading || !isReady(value, mode);
  const borderCls  = error
    ? "border-red-400"
    : loading
      ? "border-[#1E3A8A]/10 opacity-70"
      : "border-[#1E3A8A]/20 focus-within:border-[#E8683F]";

  return (
    <div className="min-h-[100dvh] w-full flex flex-col lg:flex-row bg-white overflow-hidden">

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#1E3A8A] to-[#2563eb] items-center justify-center p-12 text-center text-white">
        {/* Glow blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500 opacity-20 blur-3xl rounded-full" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-400 opacity-20 blur-3xl rounded-full" />

        <div className="relative z-10 max-w-sm flex flex-col items-center">
          <div className="w-24 h-24 bg-[#E8683F] rounded-3xl flex items-center justify-center mb-10 shadow-lg">
            <HardHat className="w-12 h-12 text-white" aria-hidden />
          </div>
          <h1 className="text-4xl font-bold mb-4">Become a Provider</h1>
          <p className="text-blue-100 text-lg">
            Join ServiceLink Nepal and start offering your services to customers near you.
          </p>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 bg-[#f0f4ff] overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">

          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-blue-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center">
              {mode === "phone"
                ? <Phone size={20} className="text-[#1E3A8A]" aria-hidden />
                : <Mail  size={20} className="text-[#1E3A8A]" aria-hidden />}
            </div>
            <div>
              <h2 className="text-[#1E3A8A] font-bold text-base">Verify Your Identity</h2>
              <p className="text-gray-400 text-xs">Enter your phone or email to continue</p>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-5">

            {/* ── Mode tabs ── */}
            <div className="flex bg-[#f0f4ff] p-1 rounded-xl gap-1" role="tablist" aria-label="Contact method">
              {(["phone", "email"] as ContactMode[]).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => switchMode(m)}
                  disabled={loading}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold
                    transition-all duration-200 disabled:cursor-not-allowed
                    ${mode === m ? "bg-[#1E3A8A] text-white shadow" : "text-gray-500 hover:text-[#1E3A8A]"}`}
                >
                  {m === "phone" ? <><Phone size={14} aria-hidden /> Phone</> : <><Mail size={14} aria-hidden /> Email</>}
                </button>
              ))}
            </div>

            {/* ── Input ── */}
            <div>
              <label htmlFor={inputId} className="text-xs font-semibold text-[#1E3A8A] mb-1.5 uppercase tracking-wide block">
                {mode === "phone" ? "Mobile Number" : "Email Address"}
              </label>

              <div className={`flex items-center border-2 rounded-xl overflow-hidden transition-colors ${borderCls}`}>
                {mode === "phone" && (
                  <span className="bg-[#1E3A8A] text-white text-sm font-bold px-4 py-3.5 select-none whitespace-nowrap">
                    +977
                  </span>
                )}
                {mode === "email" && (
                  <span className="bg-[#1E3A8A] text-white px-4 py-3.5 flex items-center">
                    <Mail size={16} aria-hidden />
                  </span>
                )}

                <input
                  id={inputId}
                  type={mode === "phone" ? "tel" : "email"}
                  inputMode={mode === "phone" ? "numeric" : "email"}
                  pattern={mode === "phone" ? "[0-9]*" : undefined}
                  placeholder={mode === "phone" ? "98XXXXXXXX" : "you@example.com"}
                  autoComplete={mode === "phone" ? "tel" : "email"}
                  value={value}
                  onChange={(e) => handleInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !isDisabled && handleSend()}
                  disabled={loading}
                  maxLength={mode === "phone" ? 10 : 254}
                  autoFocus
                  aria-invalid={!!error}
                  aria-describedby={error ? errorId : hintId}
                  className={`flex-1 px-4 py-3.5 text-[#1E3A8A] text-base font-semibold outline-none
                    placeholder:text-gray-300 placeholder:font-normal disabled:cursor-not-allowed
                    ${mode === "phone" ? "font-mono tracking-widest" : "tracking-normal"}`}
                />

                {mode === "phone" && (
                  <span
                    aria-hidden
                    className={`pr-4 text-xs font-mono tabular-nums transition-colors
                      ${value.length === 10 ? "text-green-500" : value.length > 0 ? "text-[#1E3A8A]/50" : "text-gray-300"}`}
                  >
                    {value.length}/10
                  </span>
                )}
              </div>

              {error ? (
                <p id={errorId} role="alert" className="text-red-500 text-xs mt-1.5">{error}</p>
              ) : (
                <span id={hintId} className="sr-only">
                  {mode === "phone" ? "Enter your 10-digit Nepali mobile number" : "Enter your email address"}
                </span>
              )}
            </div>

            {/* ── Info box ── */}
            <div role="note" className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <Info size={15} className="text-[#1E3A8A] mt-0.5 shrink-0" aria-hidden />
              <p className="text-[#1E3A8A]/70 text-xs leading-relaxed">
                {mode === "phone" ? (
                  <>A 6-digit code will be sent via <strong className="text-[#1E3A8A]">SMS</strong>{" "}
                    or <strong className="text-[#1E3A8A]">WhatsApp</strong>. Expires in{" "}
                    <strong className="text-[#1E3A8A]">10 minutes</strong>. Up to{" "}
                    <strong className="text-[#1E3A8A]">3 resends</strong> per session.</>
                ) : (
                  <>A 6-digit code will be sent to your <strong className="text-[#1E3A8A]">email</strong>.
                    Expires in <strong className="text-[#1E3A8A]">10 minutes</strong>.
                    Check your spam folder if it doesn't arrive.</>
                )}
              </p>
            </div>

            {/* ── WhatsApp link (shown when SMS not available) ── */}
            {whatsappLink && (
              <div className="rounded-xl border-2 border-green-300 bg-green-50 p-4 space-y-3">
                <p className="text-green-800 text-sm font-semibold">📱 OTP via WhatsApp</p>
                <p className="text-green-700 text-xs leading-relaxed">
                  SMS is temporarily unavailable. Tap the button below to open WhatsApp —
                  your OTP will appear in the message compose box.
                </p>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-green-500
                    hover:bg-green-600 text-white font-semibold rounded-xl text-sm transition-colors"
                >
                  <ExternalLink size={15} aria-hidden /> Open WhatsApp
                </a>
                <button
                  onClick={() => onOtpSent(normalizeContact(value, mode), mode, whatsappLink)}
                  className="w-full text-xs text-green-700 underline underline-offset-2 hover:text-green-900"
                >
                  I've noted my OTP → Continue to verify
                </button>
              </div>
            )}

            {/* ── Send button ── */}
            {!whatsappLink && (
              <button
                onClick={handleSend}
                disabled={isDisabled}
                aria-busy={loading}
                aria-disabled={isDisabled}
                className={`w-full flex items-center justify-center gap-2 font-bold
                  py-3.5 rounded-xl transition-all duration-200 shadow-md
                  ${isDisabled
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    : "bg-[#E8683F] text-white hover:bg-[#d45a32] hover:shadow-lg active:scale-[0.98]"
                  }`}
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" aria-hidden />
                    <span>Sending OTP…</span>
                  </>
                ) : (
                  <>
                    {mode === "phone" ? <Phone size={17} aria-hidden /> : <Mail size={17} aria-hidden />}
                    <span>Send OTP</span>
                    <ArrowRight size={16} aria-hidden />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 space-y-3">
            <div className="border-t border-gray-100 pt-4">
              <p className="text-center text-xs text-gray-400 mb-2">Already registered?</p>
              <a
                href="/login"
                className="w-full flex items-center justify-center gap-2 border-2 border-[#1E3A8A]
                  text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white font-semibold py-2.5
                  rounded-xl transition-all duration-200 text-sm"
              >
                <LogIn size={15} aria-hidden />
                Login to Your Account
              </a>
            </div>
            <p className="text-center text-xs text-gray-400">
              Need help?{" "}
              <a href="mailto:support@servicelink.np" className="text-[#E8683F] hover:underline font-medium">
                support@servicelink.np
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

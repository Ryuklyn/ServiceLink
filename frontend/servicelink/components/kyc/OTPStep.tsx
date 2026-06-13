// "use client";

// import { useState, useEffect, useCallback } from "react";
// import { Phone, Mail, Clock, ChevronLeft, ShieldCheck, ExternalLink } from "lucide-react";
// import { OtpInput } from "@/components/kyc/OtpInput";
// import { otpSchema } from "@/lib/validators/kyc.schemas";
// import { otpApi } from "@/lib/api/otpApi";
// import type { ContactMode } from "@/components/kyc/PhoneStep";

// // ─── Constants ────────────────────────────────────────────────────────────────

// const OTP_TTL      = 600;   // 10 min — matches backend
// const RESEND_WAIT  = 30;    // seconds between resend attempts
// const MAX_RESENDS  = 3;

// // ─── Props ────────────────────────────────────────────────────────────────────

// interface OtpStepProps {
//   /** The normalized contact value (E.164 phone or email). */
//   contact: string;
//   mode: ContactMode;
//   /** WhatsApp fallback link if that was the delivery method. */
//   whatsappLink?: string;
//   /** Called after successful OTP verification — receives the providerToken. */
//   onVerified: (providerToken: string) => void;
//   /** Go back to phone/email entry. */
//   onChangeContact: () => void;
// }

// // ─── Component ────────────────────────────────────────────────────────────────

// export default function OtpStep({
//   contact,
//   mode,
//   whatsappLink,
//   onVerified,
//   onChangeContact,
// }: OtpStepProps) {
//   const [otp,         setOtp]         = useState("");
//   const [error,       setError]       = useState("");
//   const [verifying,   setVerifying]   = useState(false);
//   const [resending,   setResending]   = useState(false);
//   const [countdown,   setCountdown]   = useState(OTP_TTL);
//   const [resendWait,  setResendWait]  = useState(RESEND_WAIT);
//   const [resendCount, setResendCount] = useState(0);

//   // Single interval ticks both countdowns
//   useEffect(() => {
//     const t = setInterval(() => {
//       setCountdown((c)  => Math.max(c - 1, 0));
//       setResendWait((c) => Math.max(c - 1, 0));
//     }, 1000);
//     return () => clearInterval(t);
//   }, []);

//   const formatTime = (s: number) =>
//     `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

//   // ── Verify ──────────────────────────────────────────────────────────────────
//   const handleVerify = useCallback(async () => {
//     // Client-side format validation
//     const parsed = otpSchema.safeParse({ otp });
//     if (!parsed.success) {
//       setError(parsed.error.errors[0].message);
//       return;
//     }
//     if (countdown <= 0) {
//       setError("OTP has expired. Please request a new one.");
//       return;
//     }

//     setVerifying(true);
//     try {
//       const res = mode === "phone"
//         ? await otpApi.verifyPhoneOtp(contact, otp)
//         : await otpApi.verifyEmailOtp(contact, otp);

//       if (!res.verified || !res.providerToken) {
//         setError(res.message ?? "Invalid OTP. Please try again.");
//         setOtp("");
//         return;
//       }
//       onVerified(res.providerToken);
//     } catch (err: any) {
//       setError(err?.message ?? "Invalid OTP. Please try again.");
//       setOtp("");
//     } finally {
//       setVerifying(false);
//     }
//   }, [otp, countdown, contact, mode, onVerified]);

//   // ── Resend ──────────────────────────────────────────────────────────────────
//   const handleResend = useCallback(async () => {
//     if (resendWait > 0 || resendCount >= MAX_RESENDS) return;
//     setResending(true);
//     try {
//       if (mode === "phone") {
//         await otpApi.sendPhoneOtp(contact);
//       } else {
//         await otpApi.sendEmailOtp(contact);
//       }
//       setCountdown(OTP_TTL);
//       setResendWait(RESEND_WAIT);
//       setResendCount((c) => c + 1);
//       setOtp("");
//       setError("");
//     } catch (err: any) {
//       setError(err?.message ?? "Failed to resend OTP.");
//     } finally {
//       setResending(false);
//     }
//   }, [resendWait, resendCount, contact, mode]);

//   // ── Derived ─────────────────────────────────────────────────────────────────
//   const isExpired  = countdown <= 0;
//   const isComplete = otp.length === 6;
//   const canResend  = resendWait === 0 && resendCount < MAX_RESENDS && !isExpired;
//   const btnDisabled = !isComplete || isExpired || verifying;

//   const displayContact = mode === "phone"
//     ? contact   // already E.164
//     : contact;

//   return (
//     <div className="h-screen w-screen flex flex-col lg:flex-row bg-white overflow-hidden">

//       {/* ── Left panel ── */}
//       <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] items-center justify-center text-white p-12">
//         <div className="text-center max-w-sm">
//           <div className="w-24 h-24 bg-[#e8683f] rounded-3xl flex items-center justify-center mb-10 mx-auto">
//             <ShieldCheck className="w-12 h-12" aria-hidden />
//           </div>
//           <h1 className="text-4xl font-bold mb-4">Secure Verification</h1>
//           <p className="text-white/80">
//             Enter the OTP sent to your {mode} to continue securely.
//           </p>
//         </div>
//       </div>

//       {/* ── Right panel ── */}
//       <div className="flex-1 flex items-center justify-center bg-[#f0f4ff] px-4 lg:px-16 overflow-y-auto">
//         <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-100">

//           {/* Header */}
//           <div className="p-6 border-b flex items-center gap-3">
//             <ShieldCheck className="text-[#1e3a8a]" aria-hidden />
//             <div>
//               <h2 className="font-bold text-[#1e3a8a]">Enter Verification Code</h2>
//               <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
//                 {mode === "phone"
//                   ? <Phone size={12} className="text-[#1e3a8a]" aria-hidden />
//                   : <Mail  size={12} className="text-[#1e3a8a]" aria-hidden />}
//                 <span>Sent to: <strong className="text-[#1e3a8a]">{displayContact}</strong></span>
//               </div>
//             </div>
//           </div>

//           {/* Body */}
//           <div className="px-6 py-6 space-y-5">

//             {/* WhatsApp reminder banner */}
//             {whatsappLink && (
//               <a
//                 href={whatsappLink}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="flex items-center gap-2 bg-green-50 border border-green-200
//                   text-green-800 px-4 py-3 rounded-xl text-sm font-medium hover:bg-green-100 transition"
//               >
//                 <ExternalLink size={14} aria-hidden />
//                 Didn't get the code? Tap to re-open WhatsApp
//               </a>
//             )}

//             {/* OTP Inputs */}
//             <div>
//               <p className="text-xs font-semibold text-[#1e3a8a] mb-3 uppercase tracking-wide">
//                 6-Digit Code
//               </p>
//               <OtpInput
//                 value={otp}
//                 onChange={(v) => { setOtp(v); setError(""); }}
//                 error={error}
//               />
//             </div>

//             {/* Live countdown */}
//             <div role="status" aria-live="polite" aria-atomic="true">
//               {isExpired ? (
//                 <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
//                   <Clock className="w-4 h-4" aria-hidden />
//                   <span>Code expired. Please request a new one.</span>
//                 </div>
//               ) : (
//                 <span className="text-gray-600 text-sm">
//                   Expires in <strong>{formatTime(countdown)}</strong>
//                 </span>
//               )}
//             </div>

//             {/* Verify button */}
//             <button
//               onClick={handleVerify}
//               disabled={btnDisabled}
//               aria-busy={verifying}
//               className={`w-full py-3 rounded-xl flex items-center justify-center gap-2
//                 transition-all text-base font-semibold
//                 ${btnDisabled
//                   ? "bg-gray-300 text-gray-600 cursor-not-allowed"
//                   : "bg-[#e8683f] text-white hover:bg-[#d95a2f] active:scale-[0.98]"
//                 }`}
//             >
//               <ShieldCheck className="w-5 h-5" aria-hidden />
//               {verifying
//                 ? "Verifying…"
//                 : !isComplete
//                   ? "Enter 6-digit OTP"
//                   : "Verify OTP"}
//             </button>

//             <hr className="border-stone-100" />

//             {/* Resend */}
//             <div className="text-center space-y-1">
//               <p className="text-xs text-gray-400">Didn't receive the code?</p>
//               {resendCount >= MAX_RESENDS ? (
//                 <p className="text-xs text-red-400">Maximum resends reached.</p>
//               ) : canResend ? (
//                 <button
//                   onClick={handleResend}
//                   disabled={resending}
//                   className="text-[#e8683f] hover:underline font-semibold text-sm"
//                 >
//                   {resending ? "Sending…" : "Resend OTP"}
//                 </button>
//               ) : (
//                 <p className="text-gray-400 text-xs">
//                   Resend in{" "}
//                   <strong className="text-[#1e3a8a]">{resendWait}s</strong>
//                   {resendCount > 0 && ` · ${MAX_RESENDS - resendCount} remaining`}
//                 </p>
//               )}
//             </div>

//             {/* Change contact */}
//             <div className="text-center">
//               <p className="text-xs text-gray-400">
//                 Wrong {mode === "phone" ? "number" : "email"}?
//               </p>
//               <button
//                 onClick={onChangeContact}
//                 className="mt-1 text-sm text-[#1e3a8a] flex items-center justify-center
//                   gap-1 mx-auto font-semibold hover:underline"
//               >
//                 <ChevronLeft size={14} aria-hidden />
//                 Change {mode === "phone" ? "Phone Number" : "Email Address"}
//               </button>
//             </div>

//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

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
import { otpApi } from "@/lib/api/otpApi";
import type { ContactMode } from "@/components/kyc/PhoneStep";

// ─── Constants ────────────────────────────────────────────────────────────────

const OTP_TTL = 600; // 10 min — matches backend
const RESEND_WAIT = 30; // seconds between resend attempts
const MAX_RESENDS = 3;

// ─── Props ────────────────────────────────────────────────────────────────────

interface OtpStepProps {
  contact: string;
  mode: ContactMode;
  whatsappLink?: string;
  onVerified: (providerToken: string) => void;
  onChangeContact: () => void;
  heading?: string;        // ✅ Add these
  subheading?: string;     // ✅
  resendLabel?: string;    // ✅
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function OtpStep({
  contact,
  mode,
  whatsappLink,
  onVerified,
  onChangeContact,
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
      setError("Login code has expired. Please request a new one."); // ↓ Changed
      return;
    }

    setVerifying(true);
    try {
      const res =
        mode === "phone"
          ? await otpApi.verifyPhoneOtp(contact, otp)
          : await otpApi.verifyEmailOtp(contact, otp);

      if (!res.verified || !res.providerToken) {
        setError(res.message ?? "Invalid code. Please try again."); // ↓ Changed
        setOtp("");
        return;
      }
      onVerified(res.providerToken);
    } catch (err: any) {
      setError(err?.message ?? "Invalid code. Please try again."); // ↓ Changed
      setOtp("");
    } finally {
      setVerifying(false);
    }
  }, [otp, countdown, contact, mode, onVerified]);

  // ── Resend ──────────────────────────────────────────────────────────────────
  const handleResend = useCallback(async () => {
    if (resendWait > 0 || resendCount >= MAX_RESENDS) return;
    setResending(true);
    try {
      if (mode === "phone") {
        await otpApi.sendPhoneOtp(contact);
      } else {
        await otpApi.sendEmailOtp(contact);
      }
      setCountdown(OTP_TTL);
      setResendWait(RESEND_WAIT);
      setResendCount((c) => c + 1);
      setOtp("");
      setError("");
    } catch (err: any) {
      setError(err?.message ?? "Failed to resend login code."); // ↓ Changed
    } finally {
      setResending(false);
    }
  }, [resendWait, resendCount, contact, mode]);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const isExpired = countdown <= 0;
  const isComplete = otp.length === 6;
  const canResend = resendWait === 0 && resendCount < MAX_RESENDS && !isExpired;
  const btnDisabled = !isComplete || isExpired || verifying;

  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row bg-white overflow-hidden">
      {/* ── Left panel — ↓ Changed: login headline & body ── */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] items-center justify-center text-white p-12">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-[#e8683f] rounded-3xl flex items-center justify-center mb-10 mx-auto">
            <LogIn className="w-12 h-12" aria-hidden />{" "}
            {/* ↓ Changed: LogIn icon */}
          </div>
          <h1 className="text-4xl font-bold mb-4">One Step Away</h1>{" "}
          {/* ↓ Changed */}
          <p className="text-white/80">
            Enter the login code sent to your {mode} to access your provider
            dashboard. {/* ↓ Changed */}
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex items-center justify-center bg-[#f0f4ff] px-4 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-stone-100">
          {/* Header — ↓ Changed: "Login Code" framing */}
          <div className="p-6 border-b flex items-center gap-3">
            <ShieldCheck className="text-[#1e3a8a]" aria-hidden />
            <div>
              <h2 className="font-bold text-[#1e3a8a]">
                Enter Your Login Code
              </h2>{" "}
              {/* ↓ Changed */}
              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                {mode === "phone" ? (
                  <Phone size={12} className="text-[#1e3a8a]" aria-hidden />
                ) : (
                  <Mail size={12} className="text-[#1e3a8a]" aria-hidden />
                )}
                <span>
                  Code sent to:{" "}
                  <strong className="text-[#1e3a8a]">{contact}</strong>{" "}
                  {/* ↓ Changed label */}
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-5">
            {/* WhatsApp reminder banner — ↓ Changed: copy */}
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 bg-green-50 border border-green-200
                  text-green-800 px-4 py-3 rounded-xl text-sm font-medium hover:bg-green-100 transition"
              >
                <ExternalLink size={14} aria-hidden />
                Didn't receive your login code? Re-open WhatsApp{" "}
                {/* ↓ Changed */}
              </a>
            )}

            {/* OTP Inputs */}
            <div>
              <p className="text-xs font-semibold text-[#1e3a8a] mb-3 uppercase tracking-wide">
                6-Digit Login Code {/* ↓ Changed */}
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

            {/* Live countdown — ↓ Changed: "Login code" instead of "Code" */}
            <div role="status" aria-live="polite" aria-atomic="true">
              {isExpired ? (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                  <Clock className="w-4 h-4" aria-hidden />
                  <span>
                    Login code expired. Please request a new one.
                  </span>{" "}
                  {/* ↓ Changed */}
                </div>
              ) : (
                <span className="text-gray-600 text-sm">
                  Login code expires in <strong>{formatTime(countdown)}</strong>{" "}
                  {/* ↓ Changed */}
                </span>
              )}
            </div>

            {/* Verify button — ↓ Changed: "Log In" label */}
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
              <LogIn className="w-5 h-5" aria-hidden />{" "}
              {/* ↓ Changed: LogIn icon */}
              {verifying
                ? "Logging in…" // ↓ Changed
                : !isComplete
                  ? "Enter your 6-digit code" // ↓ Changed
                  : "Log In"}{" "}
              {/* ↓ Changed */}
            </button>

            <hr className="border-stone-100" />

            {/* Resend — ↓ Changed: "login code" copy */}
            <div className="text-center space-y-1">
              <p className="text-xs text-gray-400">
                Didn't receive a login code?
              </p>{" "}
              {/* ↓ Changed */}
              {resendCount >= MAX_RESENDS ? (
                <p className="text-xs text-red-400">Maximum resends reached.</p>
              ) : canResend ? (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-[#e8683f] hover:underline font-semibold text-sm"
                >
                  {resending ? "Sending…" : "Resend Login Code"}{" "}
                  {/* ↓ Changed */}
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

            {/* Change contact — ↓ Changed: copy */}
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
                {mode === "phone" ? "phone number" : "email address"}{" "}
                {/* ↓ Changed */}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

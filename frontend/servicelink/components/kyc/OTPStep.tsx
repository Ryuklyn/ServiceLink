"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  KeyboardEvent,
  ClipboardEvent,
} from "react";
import {
  Phone,
  Timer,
  Clock,
  RefreshCw,
  ChevronLeft,
  ShieldCheck,
  PhoneCall,
} from "lucide-react";

interface OtpStepProps {
  phone: string;
  onVerified: () => void;
  onChangePhone: () => void;
}

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 600;
const RESEND_COOLDOWN = 30;
const MAX_RESENDS = 3;

export default function OtpStep({
  phone,
  onVerified,
  onChangePhone,
}: OtpStepProps) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const [resendCount, setResendCount] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  /* ── Timers ───────────────────────── */
  useEffect(() => {
    const t = setInterval(() => {
      setCountdown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      setResendCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  /* ── Utils ───────────────────────── */
  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(
      2,
      "0",
    )}`;

  /* ── OTP Handlers ────────────────── */
  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);

    setOtp((prev) => {
      const next = [...prev];
      next[i] = digit;
      return next;
    });

    setError("");

    if (digit && i < OTP_LENGTH - 1) {
      inputRefs.current[i + 1]?.focus();
    }
  };

  const handleKeyDown = (i: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!otp[i] && i > 0) {
        inputRefs.current[i - 1]?.focus();
      }

      setOtp((prev) => {
        const next = [...prev];
        next[i] = "";
        return next;
      });
    }

    if (e.key === "Enter") handleVerify();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();

    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const next = [...otp];
    pasted.split("").forEach((d, idx) => {
      if (idx < OTP_LENGTH) next[idx] = d;
    });

    setOtp(next);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH) - 1]?.focus();
  };

  /* ── Verify ──────────────────────── */
  const handleVerify = useCallback(async () => {
    const code = otp.join("");

    if (code.length < OTP_LENGTH) {
      setError("Please enter all 6 digits.");
      return;
    }

    if (countdown <= 0) {
      setError("OTP has expired.");
      return;
    }

    setLoading(true);

    try {
      await new Promise((r) => setTimeout(r, 1000));
      onVerified();
    } catch {
      setError("Invalid OTP.");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }, [otp, countdown, onVerified]);

  /* ── Resend ─────────────────────── */
  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || resendCount >= MAX_RESENDS) return;

    setResending(true);

    try {
      await new Promise((r) => setTimeout(r, 800));

      setCountdown(COUNTDOWN_SECONDS);
      setResendCooldown(RESEND_COOLDOWN);
      setResendCount((c) => c + 1);
      setOtp(Array(OTP_LENGTH).fill(""));
      setError("");

      inputRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend OTP.");
    } finally {
      setResending(false);
    }
  }, [resendCooldown, resendCount]);

  /* ── Derived ────────────────────── */
  const isComplete = otp.every(Boolean);
  const isExpired = countdown <= 0;
  const canResend =
    resendCooldown === 0 && resendCount < MAX_RESENDS && !isExpired;

  /* ── UI ─────────────────────────── */
  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row bg-white overflow-hidden">
      {/* LEFT */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#1E3A8A] to-[#2563eb] items-center justify-center text-white p-12">
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 bg-orange-500 rounded-3xl flex items-center justify-center mb-10 mx-auto">
            <ShieldCheck className="w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Secure Verification</h1>
          <p className="text-blue-100">
            Enter the OTP sent to your phone to continue securely.
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex items-center justify-center bg-[#f0f4ff] px-4 lg:px-16 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border">
          {/* Header */}
          <div className="p-6 border-b flex items-center gap-3">
            <ShieldCheck className="text-[#1E3A8A]" />
            <div>
              <h2 className="font-bold text-[#1E3A8A]">
                Enter Verification Code
              </h2>

              <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                <Phone size={12} className="text-[#1E3A8A]" />
                <span>
                  Sent to:{" "}
                  <strong className="text-[#1E3A8A]">+977 {phone}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-6 space-y-6">
            {/* OTP */}
            <div>
              <p className="text-xs font-semibold text-[#1E3A8A] mb-3 uppercase">
                6-Digit Code
              </p>

              <div className="flex gap-2">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => (inputRefs.current[i] = el)}
                    type="tel"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className={`w-full aspect-square text-center text-xl font-bold rounded-xl border-2 text-[#1E3A8A] focus:border-[#E8683F] focus:bg-[#fff5f2] outline-none transition disabled:cursor-not-allowed
                    ${
                      error
                        ? "border-red-400 bg-red-50"
                        : digit
                          ? "border-[#E8683F] bg-[#fff5f2]"
                          : "border-gray-200"
                    }`}
                  />
                ))}
              </div>

              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>

            {/* Timer */}
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {/* <Timer size={14} /> */}
              {isExpired ? (
                <div className="flex items-center gap-2 w-full bg-red-200 border border-red-400 text-red-700 px-3 py-2 rounded-md text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Code expired. Please request a new one.</span>
                </div>
              ) : (
                <span className="text-gray-600 text-sm">
                  Expires in {formatTime(countdown)}
                </span>
              )}
            </div>

            {/* Button */}
            <button
              onClick={handleVerify}
              disabled={!isComplete || isExpired || loading}
              className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-all text-l font-semibold
                  ${
                    !isComplete || isExpired || loading
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-[#E8683F] text-white hover:bg-orange-600"
                  }
                `}
            >
              <ShieldCheck className="w-5 h-5" />

              {loading
                ? "Verifying..."
                : !isComplete
                  ? "Enter 6-digit OTP"
                  : "Verify OTP"}
            </button>

            <hr className="border-t my-4 mt-0" />

            <div className="text-center text-xs text-gray-400 mb-0">
              Didn't receive the code?
            </div>

            {/* Resend */}
            <div className="text-center text-sm mt-1">
              {/* {canResend ? (
                <button
                  onClick={handleResend}
                  className="text-orange-500 hover:underline text-center flex items-center justify-center gap-1 mx-auto text-semibold text-sm"
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-gray-400 text-xs">
                  Resend available in {resendCooldown}s
                </p>
              )} */}
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="text-orange-500 hover:underline text-center flex items-center justify-center gap-1 mx-auto font-semibold text-sm"
                >
                  Resend OTP
                </button>
              ) : (
                <p className="text-gray-400 text-xs text-center">
                  Resend available in{" "}
                  <span className="font-semibold text-[#1E3A8A]">
                    {resendCooldown}s
                  </span>
                </p>
              )}
            </div>

            {/* Change */}
            <div className="text-xs text-center text-gray-400 mt-4 mb-0">
              Wrong number?{" "}
            </div>
            <button
              onClick={onChangePhone}
              className="text-sm text-[#1E3A8A] flex items-center justify-center gap-1 text-center mx-auto text-extrabold mt-2"
            >
              <ChevronLeft size={14} />
              Change Phone Number
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

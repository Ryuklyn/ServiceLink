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
  CheckCircle,
  Phone,
  Timer,
  RefreshCw,
  ChevronLeft,
  ShieldCheck,
  HardHat,
} from "lucide-react";

interface OtpStepProps {
  phone: string;
  onVerified: () => void;
  onChangePhone: () => void;
}

const OTP_LENGTH = 6;
const COUNTDOWN_SECONDS = 600; // 10 min expiry
const RESEND_COOLDOWN = 30; // 30s cooldown
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

  const inputRefs = useRef<(HTMLInputElement | null)[]>(
    Array(OTP_LENGTH).fill(null),
  );

  /* ── Countdown Timer (OTP expiry) ──────── */
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  /* ── Resend Cooldown Timer ─────────────── */
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  /* ── Auto-focus first input ────────────── */
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  /* ── Format MM:SS ──────────────────────── */
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  /* ── OTP input handler ─────────────────── */
  const handleChange = (index: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    setError("");

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  /* ── Backspace handling ────────────────── */
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const next = [...otp];
      next[index - 1] = "";
      setOtp(next);
    }
    if (e.key === "Enter") handleVerify();
  };

  /* ── Paste handler ─────────────────────── */
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (pasted.length === OTP_LENGTH) {
      setOtp(pasted.split(""));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  /* ── Verify ────────────────────────────── */
  const handleVerify = useCallback(async () => {
    const code = otp.join("");
    if (code.length < OTP_LENGTH) {
      setError("Please enter all 6 digits.");
      return;
    }
    if (countdown <= 0) {
      setError("OTP has expired. Please request a new one.");
      return;
    }

    setLoading(true);
    try {
      // TODO: await api.post("/auth/otp/verify", { phone: `+977${phone}`, otp: code });
      await new Promise((r) => setTimeout(r, 1000)); // mock
      onVerified();
    } catch {
      setError("Invalid OTP. Please check and try again.");
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }, [otp, countdown, phone, onVerified]);

  /* ── Resend ────────────────────────────── */
  const handleResend = useCallback(async () => {
    if (resendCooldown > 0 || resendCount >= MAX_RESENDS) return;

    setResending(true);
    try {
      // TODO: await api.post("/auth/otp/resend", { phone: `+977${phone}` });
      await new Promise((r) => setTimeout(r, 800)); // mock
      setCountdown(COUNTDOWN_SECONDS);
      setResendCooldown(RESEND_COOLDOWN);
      setResendCount((c) => c + 1);
      setOtp(Array(OTP_LENGTH).fill(""));
      setError("");
      inputRefs.current[0]?.focus();
    } catch {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
    }
  }, [resendCooldown, resendCount, phone]);

  const isComplete = otp.every(Boolean);
  const isExpired = countdown <= 0;
  const canResend =
    resendCooldown <= 0 && resendCount < MAX_RESENDS && !isExpired;

  /* ── UI ─────────────────────────────────── */
  return (
    <div className="min-h-screen bg-[#f0f4ff] flex flex-col">
      {/* ── Header ─────────────────────────── */}
      <header className="bg-[#1E3A8A] px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#E8683F] flex items-center justify-center">
            <HardHat size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            ServiceLink Nepal
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 bg-white/10 text-white/80 text-xs px-3 py-1.5 rounded-full border border-white/20">
          <span>Provider Verification</span>
        </div>
      </header>

      {/* ── Hero Banner ─────────────────────── */}
      <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2d54c8] px-6 py-10 text-center">
        <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 rounded-full px-4 py-1.5 text-sm font-semibold mb-3">
          <CheckCircle size={15} />
          OTP Sent Successfully
        </div>
        <h1 className="text-white text-2xl md:text-3xl font-extrabold mb-2">
          Verify Your Phone Number
        </h1>
        <p className="text-blue-200 text-sm">
          Step 2 of 2 — Enter the 6-digit code
        </p>
      </div>

      {/* ── Card ─────────────────────────────── */}
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          {/* Card Header */}
          <div className="px-6 pt-6 pb-4 border-b border-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center">
                <ShieldCheck size={20} className="text-[#1E3A8A]" />
              </div>
              <div>
                <h2 className="text-[#1E3A8A] font-bold text-base">
                  Enter Verification Code
                </h2>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                  <Phone size={11} />
                  <span>
                    Sent to{" "}
                    <strong className="text-[#1E3A8A]">+977 {phone}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-6 py-6 space-y-6">
            {/* OTP Inputs */}
            <div>
              <p className="text-xs font-semibold text-[#1E3A8A] uppercase tracking-wide mb-3">
                6-Digit Code
              </p>
              <div className="flex gap-2 justify-between">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    className={`w-full aspect-square max-w-[52px] text-center text-xl font-bold rounded-xl border-2 outline-none transition-all duration-150 caret-transparent
                      ${
                        error
                          ? "border-red-400 bg-red-50 text-red-600 shake"
                          : digit
                            ? "border-[#E8683F] bg-[#fff5f2] text-[#E8683F]"
                            : "border-[#1E3A8A]/20 focus:border-[#1E3A8A] text-[#1E3A8A]"
                      }
                    `}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              {error && (
                <p className="mt-2 text-red-500 text-xs flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-500 mt-px" />
                  {error}
                </p>
              )}
            </div>

            {/* Timer */}
            <div
              className={`flex items-center gap-2 rounded-lg px-4 py-2.5 border ${
                isExpired
                  ? "bg-red-50 border-red-200 text-red-600"
                  : countdown <= 60
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-blue-50 border-blue-100 text-[#1E3A8A]"
              }`}
            >
              <Timer size={15} className="shrink-0" />
              {isExpired ? (
                <span className="text-sm font-medium">
                  Code expired. Please request a new one.
                </span>
              ) : (
                <span className="text-sm">
                  Code expires in{" "}
                  <strong className="font-mono tabular-nums">
                    {fmt(countdown)}
                  </strong>
                </span>
              )}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={loading || !isComplete || isExpired}
              className="w-full flex items-center justify-center gap-2 bg-[#E8683F] hover:bg-[#d45a32] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={17} />
                  <span>Verify OTP</span>
                </>
              )}
            </button>

            {/* Resend & Change Number */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              {/* Resend */}
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs text-gray-400">
                  Didn&apos;t receive the code?
                </p>
                {canResend ? (
                  <button
                    onClick={handleResend}
                    disabled={resending}
                    className="flex items-center gap-1.5 text-[#1E3A8A] hover:text-[#E8683F] font-semibold text-sm transition-colors"
                  >
                    {resending ? (
                      <span className="w-3.5 h-3.5 border-2 border-[#1E3A8A]/30 border-t-[#1E3A8A] rounded-full animate-spin" />
                    ) : (
                      <RefreshCw size={13} />
                    )}
                    Resend OTP
                    {resendCount > 0 && (
                      <span className="text-xs text-gray-400 font-normal">
                        ({MAX_RESENDS - resendCount} left)
                      </span>
                    )}
                  </button>
                ) : resendCount >= MAX_RESENDS ? (
                  <p className="text-xs text-red-500 font-medium">
                    Max resend limit reached for today.
                  </p>
                ) : (
                  <p className="text-xs text-gray-400">
                    Resend available in{" "}
                    <strong className="text-[#1E3A8A] font-mono">
                      {resendCooldown}s
                    </strong>
                  </p>
                )}
              </div>

              {/* Change Phone */}
              <div className="flex flex-col items-center gap-1">
                <p className="text-xs text-gray-400">Wrong number?</p>
                <button
                  onClick={onChangePhone}
                  className="flex items-center gap-1.5 text-[#1E3A8A] hover:text-[#E8683F] font-semibold text-sm transition-colors"
                >
                  <ChevronLeft size={14} />
                  Change Phone Number
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Shake animation */}
      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)}
          20%{transform:translateX(-4px)}
          40%{transform:translateX(4px)}
          60%{transform:translateX(-4px)}
          80%{transform:translateX(4px)}
        }
        .shake { animation: shake 0.4s ease; }
      `}</style>
    </div>
  );
}

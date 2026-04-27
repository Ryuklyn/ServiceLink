"use client";

import { useState } from "react";
import { Phone, Info, ArrowRight, LogIn, HardHat } from "lucide-react";

interface PhoneStepProps {
  onOtpSent: (phone: string) => void;
}

export default function PhoneStep({ onOtpSent }: PhoneStepProps) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── Validation ─────────────────────────── */
  const validate = (): boolean => {
    const cleaned = phone.trim();

    if (!cleaned) {
      setError("Phone number is required.");
      return false;
    }
    if (!/^(98|97|96)\d{8}$/.test(cleaned)) {
      setError(
        "Enter a valid 10-digit Nepali number starting with 97, 96 or 98.",
      );
      return false;
    }

    setError("");
    return true;
  };

  /* ── Submit ──────────────────────────────── */
  const handleSend = async () => {
    if (!validate()) return;

    setLoading(true);

    try {
      // TODO: await api.post("/auth/otp/send", { phone: `+977${phone}` });
      await new Promise((r) => setTimeout(r, 1000)); // mock delay
      onOtpSent(phone.trim());
    } catch {
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
    if (error) setError("");
  };

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
        <p className="text-[#93c5fd] text-sm font-medium uppercase tracking-widest mb-2">
          Step 1 of 2
        </p>
        <h1 className="text-white text-2xl md:text-3xl font-extrabold mb-2">
          Get Verified as a Service Provider
        </h1>
        <p className="text-blue-200 text-sm max-w-md mx-auto">
          Complete phone verification to start your provider registration on
          ServiceLink Nepal.
        </p>
      </div>

      {/* ── Card ─────────────────────────────── */}
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-blue-100 overflow-hidden">
          {/* Card Header */}
          <div className="px-6 pt-6 pb-4 border-b border-blue-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1E3A8A]/10 flex items-center justify-center">
              <Phone size={20} className="text-[#1E3A8A]" />
            </div>
            <div>
              <h2 className="text-[#1E3A8A] font-bold text-base">
                Enter Your Phone Number
              </h2>
              <p className="text-gray-400 text-xs">
                We will send a 6-digit OTP to verify
              </p>
            </div>
          </div>

          {/* Card Body */}
          <div className="px-6 py-6 space-y-5">
            {/* Country Badge */}
            <div className="flex items-center gap-2 bg-[#f0f4ff] border border-[#1E3A8A]/15 rounded-lg px-4 py-2.5 w-fit">
              <span className="text-base leading-none">NP</span>
              <span className="text-[#1E3A8A] font-semibold text-sm">
                Nepal
              </span>
              <span className="text-[#1E3A8A]/60 text-sm">+977</span>
            </div>

            {/* Input */}
            <div>
              <label className="block text-xs font-semibold text-[#1E3A8A] mb-1.5 uppercase tracking-wide">
                Mobile Number
              </label>
              <div
                className={`flex items-center border-2 rounded-xl overflow-hidden transition-colors ${
                  error
                    ? "border-red-400"
                    : "border-[#1E3A8A]/20 focus-within:border-[#E8683F]"
                }`}
              >
                <span className="bg-[#1E3A8A] text-white text-sm font-bold px-4 py-3.5 select-none whitespace-nowrap">
                  +977
                </span>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="98XXXXXXXX"
                  value={phone}
                  onChange={(e) => handleInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="flex-1 px-4 py-3.5 text-[#1E3A8A] text-base font-mono tracking-widest outline-none placeholder:text-gray-300 placeholder:font-normal placeholder:tracking-normal"
                  maxLength={10}
                  autoFocus
                />
                <span
                  className={`pr-4 text-xs font-mono tabular-nums ${
                    phone.length === 10 ? "text-green-500" : "text-gray-300"
                  }`}
                >
                  {phone.length}/10
                </span>
              </div>

              {error && (
                <p className="mt-1.5 text-red-500 text-xs flex items-center gap-1">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-500 mt-px" />
                  {error}
                </p>
              )}
            </div>

            {/* Info Note */}
            <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3">
              <Info size={15} className="text-[#1E3A8A] mt-0.5 shrink-0" />
              <p className="text-[#1E3A8A]/70 text-xs leading-relaxed">
                A 6-digit verification code will be sent via SMS. The code
                expires in{" "}
                <strong className="text-[#1E3A8A]">10 minutes</strong>. You may
                request a resend up to{" "}
                <strong className="text-[#1E3A8A]">3 times</strong> per 24
                hours.
              </p>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={loading || phone.length !== 10}
              className="w-full flex items-center justify-center gap-2 bg-[#E8683F] hover:bg-[#d45a32] disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  <span>Sending OTP...</span>
                </>
              ) : (
                <>
                  <Phone size={17} />
                  <span>Send OTP</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Card Footer */}
          <div className="px-6 pb-6 space-y-3">
            <div className="border-t border-gray-100 pt-4">
              <p className="text-center text-xs text-gray-400 mb-2">
                Already registered?
              </p>
              <a
                href="/login"
                className="w-full flex items-center justify-center gap-2 border-2 border-[#1E3A8A] text-[#1E3A8A] hover:bg-[#1E3A8A] hover:text-white font-semibold py-2.5 rounded-xl transition-all duration-200 text-sm"
              >
                <LogIn size={15} />
                Login to Your Account
              </a>
            </div>

            <p className="text-center text-xs text-gray-400">
              Need help?{" "}
              <a
                href="mailto:support@servicelink.np"
                className="text-[#E8683F] hover:underline font-medium"
              >
                support@servicelink.np
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

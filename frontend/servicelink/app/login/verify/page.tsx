"use client";

import { useSearchParams, useRouter } from "next/navigation";
import AuthLayout from "@/components/forgetpassword/AuthLayout";
import StepIndicator from "@/components/forgetpassword/StepIndicator";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import api from "@/utils/axios";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);

  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);

  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  // 🔥 Timer for resend OTP
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // 🔥 Auto focus first input
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // ================= OTP HANDLERS =================

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];

      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pasted)) return;

    const newOtp = Array(6).fill("");

    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });

    setOtp(newOtp);

    const nextIndex = Math.min(pasted.length, 5);
    inputsRef.current[nextIndex]?.focus();
  };

  // ================= VERIFY OTP =================

  const handleVerify = async () => {
    const code = otp.join("");

    if (code.length !== 6) {
      toast.error("Enter complete 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/verify-otp", {
        email,
        otp: code,
      });

      toast.success("OTP verified successfully");
      router.push(`/login/reset?email=${encodeURIComponent(email.trim())}`);

      // router.push("/login/reset");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // ================= RESEND OTP =================

  const handleResend = async () => {
    try {
      setCanResend(false);
      setTimer(59);

      await api.post("/auth/send-otp", { email });

      toast.success("OTP resent successfully");
    } catch (err: any) {
      toast.error("Failed to resend OTP");
    }
  };

  // ================= UI =================

  return (
    <AuthLayout>
      <StepIndicator step={2} />

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Enter Verification Code
      </h2>

      <p className="text-gray-500 mb-6">
        We sent a 6-digit code to{" "}
        <span className="font-bold text-[#1e3a8a]">{email}</span>
      </p>

      {/* OTP INPUTS */}
      <div className="flex gap-3 justify-center my-6">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => (inputsRef.current[i] = el)}
            value={digit}
            maxLength={1}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            className="w-12 h-14 text-center text-gray-900 border border-gray-300 rounded-xl text-lg font-semibold"
          />
        ))}
      </div>

      {/* VERIFY BUTTON */}
      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full py-3 bg-[#1e3a8a] text-white rounded-xl flex items-center justify-center gap-2 font-semibold disabled:opacity-60"
      >
        {loading ? "Verifying..." : "Verify Code"}
        <CheckCircle size={16} />
      </button>

      {/* RESEND */}
      <div className="text-center mt-4">
        {canResend ? (
          <button
            onClick={handleResend}
            className="text-[#1e3a8a] border-2 border-[#1e3a8a] rounded-xl py-2 px-4 text-sm font-semibold"
          >
            Resend Code
          </button>
        ) : (
          <p className="text-gray-500 text-sm">Resend in {timer}s</p>
        )}
      </div>

      {/* LINKS */}
      <div className="text-center mt-6 flex items-center justify-center gap-2 text-gray-500">
        <ArrowLeft size={14} />
        <Link href="/login/forgotpassword" className="text-sm hover:underline">
          Change email address
        </Link>
      </div>

      <div className="text-center mt-4 text-gray-500 text-sm">
        <p>
          Remembered your password?{" "}
          <Link
            href="/login"
            className="font-semibold text-[#1e3a8a] hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

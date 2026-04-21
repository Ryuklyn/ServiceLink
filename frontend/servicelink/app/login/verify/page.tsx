"use client";

import { useSearchParams } from "next/navigation";
import AuthLayout from "@/components/forgetpassword/AuthLayout";
import StepIndicator from "@/components/forgetpassword/StepIndicator";
import { useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);

  const [otp, setOtp] = useState(Array(6).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const hasRun = useRef(false);

  // ✅ toast + timer
  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    toast.info("Verification code sent to your email");

    const interval = setInterval(() => {
      setTimer((t) => {
        if (t === 1) {
          setCanResend(true);
          clearInterval(interval);
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ✅ auto focus first input
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  // ✅ handle input change
  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  // ✅ handle backspace properly
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
        newOtp[index - 1] = "";
        setOtp(newOtp);
      }
    }
  };

  // ✅ paste full OTP support
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pasted)) return;

    const newOtp = Array(6).fill("");

    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });

    setOtp(newOtp);

    const nextIndex = pasted.length < 6 ? pasted.length : 5;
    inputsRef.current[nextIndex]?.focus();
  };

  return (
    <AuthLayout>
      <StepIndicator step={2} />

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Enter Verification Code
      </h2>

      <p className="text-gray-500 mb-6">
        We have sent a code to{" "}
        <span className="font-bold text-[#1e3a8a]">{email}</span>
      </p>

      {/* OTP INPUTS */}
      <div className="flex gap-3 justify-center my-6">
        {otp.map((digit, i) => (
          <input
            key={i}
            ref={(el) => {
              inputsRef.current[i] = el;
            }}
            value={digit}
            maxLength={1}
            onChange={(e) => handleChange(e.target.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={handlePaste}
            className="w-12 h-14 text-center text-gray-900 border border-gray-300 rounded-xl"
          />
        ))}
      </div>

      {/* VERIFY BUTTON */}
      <button
        onClick={() => {
          toast.success("Code verified successfully");
          router.push("/login/reset");
        }}
        className="w-full py-3 bg-[#1e3a8a] text-white rounded-xl inline-flex items-center justify-center gap-2 font-semibold"
      >
        Verify Code
        <CheckCircle size={16} />
      </button>

      {/* RESEND */}
      <div className="text-center mt-4">
        {canResend ? (
          <button className="text-[#1e3a8a] border-2 border-[#1e3a8a] rounded-xl py-2 px-4 text-[14px] font-semibold">
            Resend Code
          </button>
        ) : (
          <p className="text-gray-500 text-sm">Resend in {timer}s</p>
        )}
      </div>

      {/* NAV LINKS */}
      <div className="text-center mt-4 flex items-center justify-center gap-2 text-gray-500">
        <ArrowLeft size={14} />
        <Link
          href="/login/forgotpassword"
          className="text-[14px] hover:underline"
        >
          Change email address
        </Link>
      </div>

      <div className="text-center mt-4 text-gray-500 text-[14px]">
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

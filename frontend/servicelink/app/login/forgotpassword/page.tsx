"use client";
import AuthLayout from "@/components/forgetpassword/AuthLayout";
import StepIndicator from "@/components/forgetpassword/StepIndicator";
import { Mail, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/utils/axios";
import { toast } from "react-toastify";

export default function Page() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/send-otp", {
        email: email.trim(),
      });

      toast.success("OTP sent successfully");

      router.push(`/login/verify?email=${encodeURIComponent(email.trim())}`);
    } catch (err: any) {
      console.error("OTP Error:", err);

      const message =
        err?.response?.data?.message || "Failed to send OTP. Please try again.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <AuthLayout>
      <StepIndicator step={1} />

      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Forgot Password?
      </h2>
      <p className="text-gray-500 mb-6">
        Enter your email to receive a verification code.
      </p>

      <form onSubmit={handleSendOtp} className="space-y-5">
        <label className="text-sm font-medium text-gray-700">
          Email Address
        </label>
        <div className="relative mt-1">
          <Mail className="absolute left-3 top-3 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full pl-10 py-3 border rounded-xl placeholder-gray-500"
          />
        </div>

        <button
          disabled={loading}
          className="w-full py-3 bg-[#1e3a8a] text-white rounded-xl inline-flex items-center justify-center gap-2 font-semibold"
        >
          {loading ? "Sending..." : "Send OTP"}
          <ArrowRight size={16} />
        </button>
      </form>
      <p className="text-[14px] text-gray-500 text-center mt-6">
        Remember your password?{" "}
        <Link
          href="/login"
          className="font-semibold text-[#1e3a8a] hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

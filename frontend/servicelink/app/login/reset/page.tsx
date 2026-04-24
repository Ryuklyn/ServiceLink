"use client";

import AuthLayout from "@/components/forgetpassword/AuthLayout";
import StepIndicator from "@/components/forgetpassword/StepIndicator";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";
import api from "@/utils/axios";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  // 🔥 Strength logic (0–4)
  const getStrength = (pass: string) => {
    let score = 0;

    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    return score;
  };

  const strength = getStrength(password);

  const strengthLabel = ["Weak", "Weak", "Medium", "Strong", "Very Strong"];

  // 🎨 dynamic bar color
  const getBarColor = (level: number) => {
    if (strength >= level) {
      if (strength === 1) return "bg-red-500";
      if (strength === 2) return "bg-orange-500";
      if (strength === 3) return "bg-blue-500";
      if (strength === 4) return "bg-green-500";
    }
    return "bg-gray-200";
  };

  const handleSubmit = async () => {
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (strength < 2) {
      toast.error("Password is too weak");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/reset-password", {
        email: searchParams.get("email"),
        newPassword: password,
      });

      toast.success("Password reset successfully");

      router.push("/login");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <StepIndicator step={3} />

      <h2 className="text-3xl font-bold mb-2 text-gray-900">
        Create New Password
      </h2>

      <p className="text-gray-500 mb-4">
        Enter a new password to secure your account.
      </p>

      {/* PASSWORD */}
      <div className="relative mb-3">
        <input
          type={showPass ? "text" : "password"}
          value={password}
          placeholder="Enter new password"
          onFocus={() => setShowHint(true)}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl pr-10 text-gray-900"
        />

        <button
          type="button"
          onClick={() => setShowPass(!showPass)}
          className="absolute right-3 top-3 text-gray-500"
        >
          {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* CONFIRM PASSWORD */}
      <div className="relative mb-2">
        <input
          type={showConfirm ? "text" : "password"}
          placeholder="Confirm password"
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-xl pr-10 text-gray-900"
        />

        <button
          type="button"
          onClick={() => setShowConfirm(!showConfirm)}
          className="absolute right-3 top-3 text-gray-500"
        >
          {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* HINT */}
      {showHint && (
        <p className="text-sm text-gray-500 mb-2">
          Minimum 8 characters, include uppercase & number
        </p>
      )}

      {/* STRENGTH LABEL */}
      <p className="text-sm mb-2 text-gray-500">
        Strength:{" "}
        <b
          className={
            strength === 1
              ? "text-red-500"
              : strength === 2
                ? "text-orange-500"
                : strength === 3
                  ? "text-blue-500"
                  : strength === 4
                    ? "text-green-500"
                    : "text-gray-500"
          }
        >
          {strengthLabel[strength]}
        </b>
      </p>

      {/* STRENGTH BAR */}
      <div className="flex gap-1 mb-5">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${getBarColor(
              level,
            )}`}
          />
        ))}
      </div>

      {/* SUBMIT */}
      <button
        onClick={handleSubmit}
        className="w-full py-3 bg-[#1e3a8a] text-white rounded-xl inline-flex items-center justify-center gap-2 font-semibold"
      >
        Reset Password <CheckCircle size={16} />
      </button>

      {/* NAV */}
      <div className="text-center mt-4 flex items-center justify-center gap-2 text-gray-500 text-[14px]">
        <ArrowLeft size={14} />
        <Link href="/login/verify" className="hover:underline">
          Back to Verify
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

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, Briefcase, User } from "lucide-react";
import api from "@/utils/axios";
import { toast } from "react-toastify";

export default function SignupPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // -----------------------------
  // VALIDATION
  // -----------------------------
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  // -----------------------------
  // PASSWORD STRENGTH LOGIC
  // -----------------------------
  const getPasswordStrength = (pwd: string) => {
    let score = 0;

    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    return score; // 0 - 4
  };

  // Memoized (prevents recalculation on unrelated renders)
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  // -----------------------------
  // EMAIL STEP
  // -----------------------------
  const handleEmailContinue = () => {
    if (!fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!isValidEmail(email)) {
      toast.error("Enter a valid email");
      return;
    }
    setStep(2);
  };

  // -----------------------------
  // SIGNUP HANDLER
  // -----------------------------
  const handleSignup = async () => {
    if (!password) {
      toast.error("Password is required");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });

      toast.success("Registration successful");

      router.push("/login?registered=true");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex flex-col lg:flex-row">
      {/* LEFT SIDE */}
      <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] items-center justify-center p-12 text-center text-white">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500 opacity-20 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-400 opacity-20 blur-3xl" />

        <div className="relative z-10 max-w-sm flex flex-col items-center">
          <div className="w-24 h-24 bg-orange-500 rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-orange-500/30">
            <Briefcase className="w-12 h-12 text-white" />
          </div>

          <h1 className="text-4xl font-bold mb-4">Join Us Today</h1>
          <p className="text-blue-100 text-lg">
            Create your account and start connecting with trusted services.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {/* HEADER */}
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Create your account
          </h2>

          {/* GOOGLE */}
          <button
            onClick={() =>
              (window.location.href =
                "http://localhost:8080/oauth2/authorization/google")
            }
            className="w-full flex items-center justify-center gap-3 py-3.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              className="w-5 h-5"
              alt="Google"
            />
            Continue with Google
          </button>

          {/* DIVIDER */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400">OR</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* FORM */}
          <div className="space-y-5">
            {/* FULL NAME */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>

              <div className="relative mt-2">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />

                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={step === 2}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>

              <div className="relative mt-2">
                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={step === 2}
                  className="w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="you@email.com"
                />

                {step === 2 && (
                  <button
                    onClick={() => setStep(1)}
                    className="absolute right-3 top-3 text-sm text-blue-600"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* PASSWORD */}
            {step === 2 && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>

                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Enter your password"
                  />

                  <Eye
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 w-5 h-5 text-gray-400 cursor-pointer"
                  />
                </div>

                {/* STRENGTH BAR */}
                <div className="mt-3">
                  <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-2 transition-all duration-300 ${
                        strength === 0
                          ? "w-0"
                          : strength === 1
                            ? "w-1/4 bg-red-500"
                            : strength === 2
                              ? "w-2/4 bg-orange-400"
                              : strength === 3
                                ? "w-3/4 bg-yellow-400"
                                : "w-full bg-green-500"
                      }`}
                    />
                  </div>

                  <p className="text-xs text-gray-500 mt-1">
                    {["", "Weak", "Fair", "Good", "Strong"][strength]}
                  </p>
                </div>
              </div>
            )}

            {/* BUTTON */}
            {step === 1 ? (
              <button
                onClick={handleEmailContinue}
                className="w-full py-3 rounded-xl bg-[#1e293b] text-white font-semibold hover:bg-[#1e3a8a]"
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleSignup}
                disabled={loading}
                className={`w-full py-3 rounded-xl font-semibold text-white transition ${
                  loading ? "bg-gray-400" : "bg-[#1e293b] hover:bg-[#1e3a8a]"
                }`}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            )}
          </div>

          {/* FOOTER */}
          <p className="mt-8 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="text-[#ea580c] font-semibold">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import { toast } from "react-toastify";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      console.log("Login Response:", data);

      // Save Access Token
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
      }

      // Save Refresh Token
      if (data.refreshToken) {
        localStorage.setItem("refreshToken", data.refreshToken);
      }

      console.log(
          "Stored Access Token:",
          localStorage.getItem("accessToken")
      );

      console.log(
          "Stored Refresh Token:",
          localStorage.getItem("refreshToken")
      );

      toast.success("Login successful!");

      router.replace("/dashboard/user");
    } catch (err: any) {
      console.error(err);

      toast.error(
          err?.response?.data?.message ??
          "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
        "http://localhost:8080/oauth2/authorization/google";
  };

  return (
      <div className="h-screen w-screen overflow-hidden bg-white flex flex-col lg:flex-row">
        <div className="w-full h-full flex flex-col lg:flex-row">
          {/* Left Side */}
          <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] items-center justify-center p-12 text-center text-white">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500 opacity-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-400 opacity-20 blur-3xl" />

            <div className="relative z-10 max-w-sm flex flex-col items-center">
              <div className="w-24 h-24 bg-[#e8683f] rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-[#e8683f]/30">
                <Briefcase className="w-12 h-12 text-white" strokeWidth={1.5} />
              </div>

              <h1 className="text-4xl font-bold mb-4">
                Welcome Back
              </h1>

              <p className="text-white/80 text-lg leading-relaxed">
                Sign in to manage your bookings, track services,
                and connect with professionals.
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 lg:py-16 overflow-y-auto">
            <div className="w-full max-w-md mx-auto">

              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Sign In
                </h2>

                <p className="text-gray-500">
                  Enter your credentials to access your account.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full pl-10 pr-3 py-3 text-slate-800 placeholder-text-slate-200 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] outline-none"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />

                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="w-full text-slate-800 placeholder-text-slate-200 pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1e3a8a] outline-none"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                      ) : (
                          <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <label className="flex items-center gap-2 text-gray-600">
                    <input type="checkbox" />
                    Remember me
                  </label>

                  <Link
                      href="/login/user/forgotpassword"
                      className="text-[#e8683f] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-[#1e3a8a] text-white font-bold hover:bg-[#17306f] disabled:opacity-70"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </button>
              </form>

              <div className="my-8 flex items-center">
                <div className="flex-1 border-t border-gray-200" />
                <span className="px-3 text-xs uppercase tracking-widest text-gray-400">
                OR CONTINUE WITH
              </span>
                <div className="flex-1 border-t border-gray-200" />
              </div>

              <button
                  onClick={handleGoogleLogin}
                  className="w-full flex text-gray-700 font-semibold justify-center items-center gap-2 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                <img
                    src="https://developers.google.com/identity/images/g-logo.png"
                    className="w-5 h-5"
                    alt="Google"
                />

                Sign in with Google
              </button>

              <p className="mt-8 text-center text-sm text-gray-500">
                Don't have an account?{" "}
                <Link
                    href="/register"
                    className="font-bold text-[#e8683f] hover:underline"
                >
                  Create one
                </Link>
              </p>

            </div>
          </div>
        </div>
      </div>
  );
}
"use client";

import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  Briefcase,
  User,
  Star,
  Shield,
  Building2,
  EyeOff,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import { toast } from "react-toastify";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      // 🔐 token save (if backend returns)
      // localStorage.setItem("token", res.data.token);
      console.log("FULL RESPONSE:", res.data);

      localStorage.setItem("token", res.data.token);

      console.log("Saved token:", localStorage.getItem("token"));

      toast.success("Login successful");
      console.log("Redirecting to dashboard...");

      // 👉 dashboard redirect
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-white flex flex-col lg:flex-row">
      <div className="w-full h-full flex flex-col lg:flex-row">
        {/* Left Side: Illustration / Welcome */}
        <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] items-center justify-center p-12 text-center text-white">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500 opacity-20 blur-3xl mix-blend-screen pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-blue-400 opacity-20 blur-3xl mix-blend-screen pointer-events-none"></div>

          <div className="relative z-10 max-w-sm flex flex-col items-center">
            {/* Main Icon */}
            <div className="w-24 h-24 bg-orange-500 rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-orange-500/30">
              <Briefcase className="w-12 h-12 text-white" strokeWidth={1.5} />
            </div>

            <h1 className="text-4xl font-bold mb-4 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              Sign in to manage your bookings, track services, and connect with
              professionals.
            </p>
          </div>
        </div>

        {/* Right Side: Sign In Form */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 lg:py-16 overflow-y-auto">
          <div className="w-full max-w-md mx-auto">
            {/* Header Content */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Sign In</h2>
              <p className="text-gray-500">
                Enter your credentials to access your account.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-5" onSubmit={handleLogin}>
              {/* Email */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900 transition-shadow outline-none"
                    placeholder="you@email.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder-gray-400 text-gray-900 transition-shadow outline-none"
                    placeholder="Enter your password"
                  />
                  <div
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between pt-1 pb-4">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#1e3a8a] focus:ring-[#1e3a8a] border-gray-300 rounded cursor-pointer"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-600 cursor-pointer"
                  >
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/login/forgotpassword"
                    className="font-medium text-[#ea580c] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#1e293b] hover:bg-[#1e3a8a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1e3a8a] transition-colors"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-8 relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-white text-gray-400 tracking-wider text-xs uppercase font-medium">
                  OR CONTINUE WITH
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <div className="mt-6">
              <button
                onClick={() =>
                  (window.location.href =
                    "http://localhost:8080/oauth2/authorization/google")
                }
                className="w-full flex items-center justify-center py-3.5 px-4 border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                  className="w-5 h-5 mr-2"
                />
                Sign in with Google
              </button>
            </div>

            <p className="mt-8 text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-bold text-[#ea580c] hover:underline"
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

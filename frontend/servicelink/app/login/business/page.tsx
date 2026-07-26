"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Wrench,
  Users,
  BarChart2,
  Clock,
  MessageCircle,
  Shield,
  Star,
  Building2,
} from "lucide-react";
import Link from "next/link";
import api from "@/utils/axios";
import { toast } from "react-toastify";

const FEATURES = [
  { icon: <Wrench size={16} />, label: "Service Provider Management" },
  { icon: <Users size={16} />, label: "Vendor Coordination" },
  { icon: <BarChart2 size={16} />, label: "Operations Analytics" },
  { icon: <Clock size={16} />, label: "Request Tracking" },
];

const STATS = [
  { value: "500+", label: "Enterprise Clients" },
  { value: "10K+", label: "Service Providers" },
  { value: "99.9%", label: "Uptime" },
];

export default function BusinessSignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!email.trim() || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", { email, password });
      const { token, role, fullName } = response.data;

      if (role !== "PRO") {
        toast.error("This account is not registered as a business account");
        return;
      }

      // Same key utils/jwt.ts's getProClaims() reads — keep in sync.
      localStorage.setItem("token", token);

      toast.success(`Welcome back, ${fullName}`);
      router.push("/dashboard/business");
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(
          error?.response?.data?.message ?? "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="min-h-screen flex">
        {/* ── LEFT PANEL ── */}
        <div
            className="hidden lg:flex lg:w-[52%] flex-col justify-between px-14 py-12 relative overflow-hidden"
            style={{
              background:
                  "linear-gradient(145deg, #1e3a8a 0%, #1e40af 40%, #2d3fc7 70%, #3b3fce 100%)",
            }}
        >
          <div
              className="absolute top-[-80px] right-[-80px] w-72 h-72 rounded-full opacity-20"
              style={{
                background: "radial-gradient(circle, #e8683f 0%, transparent 70%)",
              }}
          />
          <div
              className="absolute bottom-[-60px] left-[-60px] w-80 h-80 rounded-full opacity-15"
              style={{
                background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)",
              }}
          />
          <div
              className="absolute top-[45%] left-[55%] w-48 h-48 rounded-full opacity-10"
              style={{
                background: "radial-gradient(circle, #e8683f 0%, transparent 70%)",
              }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-16">
              <div className="w-11 h-11 rounded-xl bg-[#e8683f] flex items-center justify-center shadow-lg">
                <Building2 size={22} className="text-white" />
              </div>
              <span className="text-white text-xl font-bold tracking-tight">
              ServiceLink Pro
            </span>
            </div>

            <h1 className="text-4xl font-extrabold text-white leading-tight mb-5">
              Manage Services, Vendors
              <br />& Operations in One Place
            </h1>
            <p className="text-white/75 text-sm leading-relaxed max-w-sm mb-12">
              Streamline your enterprise operations with our comprehensive service
              management platform. Connect with verified providers, track
              requests, and optimize workflows.
            </p>

            <ul className="space-y-4">
              {FEATURES.map((f) => (
                  <li key={f.label} className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white/75 shrink-0">
                      {f.icon}
                    </div>
                    <span className="text-white text-sm font-medium">
                  {f.label}
                </span>
                  </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 flex items-end gap-10 mt-10">
            {STATS.map((s) => (
                <div key={s.label}>
                  <p className="text-white text-3xl font-extrabold leading-none">
                    {s.value}
                  </p>
                  <p className="text-white text-xs mt-1">{s.label}</p>
                </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="flex-1 bg-[#f0f4fb] flex flex-col items-center justify-between py-10 px-6">
          <form
              onSubmit={handleSubmit}
              className="w-full max-w-md bg-white rounded-2xl shadow-sm px-10 py-10 mt-auto mb-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-[#1e3a8a] mb-1">
                Welcome back
              </h2>
              <p className="text-sm text-gray-400">Sign in to your workspace</p>
            </div>

            <div className="mb-5">
              <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
                Work Email or Phone
              </label>
              <div className="relative">
                <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    disabled={loading}
                    className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a] transition bg-white disabled:opacity-50"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={loading}
                    className="w-full border border-gray-200 rounded-lg pl-10 pr-11 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a] transition bg-white disabled:opacity-50"
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <label
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setRemember(!remember)}
              >
                <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                        remember
                            ? "bg-[#1e3a8a] border-[#1e3a8a]"
                            : "bg-white border-gray-300"
                    }`}
                >
                  {remember && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path
                            d="M1 3.5L3.5 6L8 1"
                            stroke="white"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                      </svg>
                  )}
                </div>
                <span className="text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                  href="/forgot-password"
                  className="text-sm font-semibold text-[#e8683f] hover:text-[#d95a2f] transition"
              >
                Forgot Password?
              </Link>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#e8683f] hover:bg-[#d95a2f] text-white text-sm font-semibold py-3.5 rounded-lg transition mb-5 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"} <span>→</span>
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <button
                type="button"
                className="w-full flex items-center justify-center gap-2 border border-gray-200 bg-white hover:bg-gray-50 text-[#1e3a8a] text-sm font-semibold py-3.5 rounded-lg transition mb-7"
            >
              <MessageCircle size={16} className="text-gray-500" />
              Continue with OTP
            </button>

            <p className="text-center text-sm text-gray-400 mb-1">
              Don't have an organization account?
            </p>
            <p className="text-center">
              <Link
                  href="/register/business"
                  className="text-sm font-semibold text-[#e8683f] hover:text-[#d95a2f] transition"
              >
                Create Workspace
              </Link>
            </p>

            <div className="flex items-center justify-center gap-1.5 mt-6">
              <Shield size={13} className="text-gray-300" />
              <Link
                  href="/admin"
                  className="text-xs text-gray-400 hover:text-gray-600 transition"
              >
                Platform Admin Login
              </Link>
            </div>
          </form>

          <div className="flex items-center gap-6 mt-6">
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Star size={13} className="text-gray-400" />
              SOC 2 Certified
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Shield size={13} className="text-gray-400" />
              256-bit Encryption
            </div>
          </div>
        </div>
      </div>
  );
}
"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Eye, EyeOff, Wrench, Users, BarChart2, Clock, Shield, Star, Building2, ArrowLeft, CheckCircle2,
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

function BusinessResetPasswordPageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

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

    const getBarColor = (level: number) => {
        if (strength >= level) {
            if (strength === 1) return "bg-red-500";
            if (strength === 2 || strength === 3) return "bg-[#e8683f]";
            if (strength === 4) return "bg-green-500";
        }
        return "bg-gray-200";
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!email) {
            toast.error("Email missing. Please restart the process.");
            router.push("/login/business/forget-password");
            return;
        }

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

            await api.post("/auth/business/reset-password", {
                email,
                newPassword: password,
            });

            toast.success("Password reset successfully");
            router.push("/login/business");
        } catch (error: any) {
            console.error("Reset password error:", error);
            toast.error(error?.response?.data?.message ?? "Failed to reset password");
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
                    style={{ background: "radial-gradient(circle, #e8683f 0%, transparent 70%)" }}
                />
                <div
                    className="absolute bottom-[-60px] left-[-60px] w-80 h-80 rounded-full opacity-15"
                    style={{ background: "radial-gradient(circle, #60a5fa 0%, transparent 70%)" }}
                />
                <div
                    className="absolute top-[45%] left-[55%] w-48 h-48 rounded-full opacity-10"
                    style={{ background: "radial-gradient(circle, #e8683f 0%, transparent 70%)" }}
                />

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-11 h-11 rounded-xl bg-[#e8683f] flex items-center justify-center shadow-lg">
                            <Building2 size={22} className="text-white" />
                        </div>
                        <span className="text-white text-xl font-bold tracking-tight">ServiceLink Pro</span>
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
                                <span className="text-white text-sm font-medium">{f.label}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative z-10 flex items-end gap-10 mt-10">
                    {STATS.map((s) => (
                        <div key={s.label}>
                            <p className="text-white text-3xl font-extrabold leading-none">{s.value}</p>
                            <p className="text-white text-xs mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── RIGHT PANEL ── */}
            <div className="flex-1 bg-[#f0f4fb] flex flex-col items-center justify-between py-10 px-6">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-sm px-10 py-10 mt-auto mb-auto">
                    <Link
                        href="/login/business"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1e3a8a] transition mb-6"
                    >
                        <ArrowLeft size={15} />
                        Back to sign in
                    </Link>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-extrabold text-[#1e3a8a] mb-1">Create new password</h2>
                        <p className="text-sm text-gray-400">Enter a new password to secure your account</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="relative mb-3">
                            <input
                                type={showPass ? "text" : "password"}
                                value={password}
                                placeholder="Enter new password"
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={loading}
                                className="w-full border border-gray-200 rounded-lg pl-4 pr-11 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a] transition bg-white disabled:opacity-50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPass(!showPass)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <div className="relative mb-3">
                            <input
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                placeholder="Confirm password"
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                disabled={loading}
                                className="w-full border border-gray-200 rounded-lg pl-4 pr-11 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a] transition bg-white disabled:opacity-50"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                            >
                                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>

                        <p className="text-sm mb-2 text-gray-400">
                            Strength:{" "}
                            <b
                                className={
                                    strength === 1
                                        ? "text-red-500"
                                        : strength === 2 || strength === 3
                                            ? "text-[#e8683f]"
                                            : strength === 4
                                                ? "text-green-500"
                                                : "text-gray-400"
                                }
                            >
                                {strengthLabel[strength]}
                            </b>
                        </p>

                        <div className="flex gap-1 mb-6">
                            {[1, 2, 3, 4].map((level) => (
                                <div
                                    key={level}
                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${getBarColor(level)}`}
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-[#e8683f] hover:bg-[#d95a2f] text-white text-sm font-semibold py-3.5 rounded-lg transition mb-5 disabled:opacity-50"
                        >
                            {loading ? "Resetting..." : "Reset Password"}{" "}
                            {!loading && <CheckCircle2 size={16} />}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-400">
                        Remembered your password?{" "}
                        <Link href="/login/business" className="font-semibold text-[#e8683f] hover:text-[#d95a2f] transition">
                            Sign In
                        </Link>
                    </p>

                    <div className="flex items-center justify-center gap-1.5 mt-8">
                        <Shield size={13} className="text-gray-300" />
                        <span className="text-xs text-gray-400">Your data is always kept secure</span>
                    </div>
                </div>

                <div className="flex items-center gap-6 mt-6">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Star size={13} className="text-gray-400" /> SOC 2 Certified
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Shield size={13} className="text-gray-400" /> 256-bit Encryption
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function BusinessResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-slate-500">Loading password reset details...</div>}>
            <BusinessResetPasswordPageInner />
        </Suspense>
    );
}
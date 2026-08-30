"use client";

import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/axios";
import { toast } from "react-toastify";

export default function AdminLoginPage() {
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
                role: "ADMIN",
            });

            if (data.role !== "ADMIN") {
                toast.error("This account does not have admin access.");
                return;
            }

            if (data.token) {
                localStorage.setItem("adminAccessToken", data.token);
            }
            if (data.refreshToken) {
                localStorage.setItem("adminRefreshToken", data.refreshToken);
            }

            toast.success("Login successful!");
            router.replace("/dashboard/admin");
        } catch (err: any) {
            console.error(err);
            toast.error(
                err?.response?.data?.message ?? "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen overflow-hidden bg-white flex flex-col lg:flex-row">
            <div className="w-full h-full flex flex-col lg:flex-row">
                {/* Left Side */}
                <div className="hidden lg:flex flex-1 relative bg-gradient-to-br from-slate-900 to-slate-800 items-center justify-center p-12 text-center text-white">
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-slate-600 opacity-20 blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-slate-500 opacity-20 blur-3xl" />

                    <div className="relative z-10 max-w-sm flex flex-col items-center">
                        <div className="w-24 h-24 bg-[#e8683f] rounded-3xl flex items-center justify-center mb-10 shadow-lg shadow-[#e8683f]/30">
                            <ShieldCheck className="w-12 h-12 text-white" strokeWidth={1.5} />
                        </div>

                        <h1 className="text-4xl font-bold mb-4">Admin Panel</h1>

                        <p className="text-white/80 text-lg leading-relaxed">
                            Restricted access. Authorized staff only.
                        </p>
                    </div>
                </div>

                {/* Right Side */}
                <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-20 lg:py-16 overflow-y-auto">
                    <div className="w-full max-w-md mx-auto">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Admin Sign In
                            </h2>
                            <p className="text-gray-500">
                                Enter your admin credentials to continue.
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
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
                                        placeholder="admin@servicelink.com"
                                        className="w-full pl-10 pr-3 py-3 text-slate-800 placeholder-text-slate-200 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-800 outline-none"
                                    />
                                </div>
                            </div>

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
                                        className="w-full text-slate-800 placeholder-text-slate-200 pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-slate-800 outline-none"
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-70"
                            >
                                {loading ? "Signing In..." : "Sign In"}
                            </button>
                        </form>

                        <p className="mt-8 text-center text-sm text-gray-500">
                            Not an admin?{" "}
                            <Link href="/login/user" className="font-bold text-[#e8683f] hover:underline">
                                Go to user login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

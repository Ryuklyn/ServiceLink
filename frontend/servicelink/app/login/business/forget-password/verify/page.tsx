"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Wrench, Users, BarChart2, Clock, Shield, Star, Building2, ArrowLeft } from "lucide-react";
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

const OTP_LENGTH = 6;

export default function BusinessForgotPasswordVerifyPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timer, setTimer] = useState(59);
    const [canResend, setCanResend] = useState(false);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

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

    const handleOtpChange = (index: number, value: string) => {
        if (!/^[0-9]?$/.test(value)) return;
        const next = [...otp];
        next[index] = value;
        setOtp(next);
        if (value && index < OTP_LENGTH - 1) {
            inputsRef.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (e?: React.FormEvent) => {
        e?.preventDefault();

        const code = otp.join("");
        if (code.length !== OTP_LENGTH) {
            toast.error("Please enter the complete OTP");
            return;
        }

        if (!email) {
            toast.error("Email missing. Please restart the process.");
            router.push("/login/business/forget-password");
            return;
        }

        try {
            setLoading(true);

            await api.post("/auth/business/verify-email-otp", {
                email,
                otp: code,
            });

            toast.success("OTP verified successfully");

            router.push(
                `/login/business/forget-password/reset?email=${encodeURIComponent(email)}`,
            );
        } catch (error: any) {
            console.error("Verify OTP error:", error);
            toast.error(error?.response?.data?.message ?? "Invalid or expired OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!email) {
            toast.error("Email missing. Please restart the process.");
            router.push("/login/business/forget-password");
            return;
        }

        try {
            setResending(true);
            await api.post("/auth/business/send-email-otp", { email });
            setOtp(Array(OTP_LENGTH).fill(""));
            inputsRef.current[0]?.focus();
            setTimer(59);
            setCanResend(false);
            toast.success("OTP resent successfully");
        } catch (error: any) {
            toast.error(error?.response?.data?.message ?? "Could not resend OTP");
        } finally {
            setResending(false);
        }
    };

    // const handleResend = async () => {
    //     if (!email) {
    //         toast.error("Email missing. Please restart the process.");
    //         router.push("/login/business/forget-password");
    //         return;
    //     }
    //
    //     try {
    //         setResending(true);
    //         await api.post("/auth/send-email-otp", { email });
    //         setOtp(Array(OTP_LENGTH).fill(""));
    //         inputsRef.current[0]?.focus();
    //         setTimer(59);
    //         setCanResend(false);
    //         toast.success("OTP resent successfully");
    //     } catch (error: any) {
    //         toast.error(error?.response?.data?.message ?? "Could not resend OTP");
    //     } finally {
    //         setResending(false);
    //     }
    // };

    if (!email) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f0f4fb] px-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-sm px-10 py-10 text-center">
                    <p className="text-red-500 font-semibold mb-4">
                        Email missing. Please restart the process.
                    </p>
                    <Link
                        href="/login/business/forget-password"
                        className="inline-block bg-[#1e3a8a] text-white px-5 py-2.5 rounded-xl font-semibold"
                    >
                        Go Back
                    </Link>
                </div>
            </div>
        );
    }

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
                        href="/login/business/forget-password"
                        className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-[#1e3a8a] transition mb-6"
                    >
                        <ArrowLeft size={15} />
                        Change email address
                    </Link>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-extrabold text-[#1e3a8a] mb-1">
                            Enter verification code
                        </h2>
                        <p className="text-sm text-gray-400">
                            We sent a {OTP_LENGTH}-digit code to{" "}
                            <span className="font-semibold text-gray-600">{email}</span>
                        </p>
                    </div>

                    <form onSubmit={handleVerify}>
                        <div className="flex items-center justify-center gap-2.5 mb-7">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => {
                                        inputsRef.current[index] = el;
                                    }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    disabled={loading}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    className="w-11 h-13 text-center text-lg font-bold text-[#1e3a8a] border border-gray-200 rounded-lg py-3 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a] transition bg-white disabled:opacity-50"
                                />
                            ))}
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 bg-[#e8683f] hover:bg-[#d95a2f] text-white text-sm font-semibold py-3.5 rounded-lg transition mb-5 disabled:opacity-50"
                        >
                            {loading ? "Verifying..." : "Verify Code"} {!loading && <span>→</span>}
                        </button>
                    </form>

                    <div className="text-center">
                        {canResend ? (
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resending}
                                className="text-sm font-semibold text-[#e8683f] hover:text-[#d95a2f] transition disabled:opacity-50"
                            >
                                {resending ? "Resending..." : "Didn't get it? Resend OTP"}
                            </button>
                        ) : (
                            <p className="text-sm text-gray-400">Resend in {timer}s</p>
                        )}
                    </div>

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
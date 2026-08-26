"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, CheckCircle2, Shield } from "lucide-react";
import Link from "next/link";
import api from "@/utils/axios";
import { toast } from "react-toastify";

function AcceptInvitePageInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token") || "";

    const [loadingDetails, setLoadingDetails] = useState(true);
    const [invalid, setInvalid] = useState<string | null>(null);
    const [details, setDetails] = useState<{ fullName: string; email: string; workspaceName: string } | null>(null);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!token) {
            setInvalid("Invalid invitation link");
            setLoadingDetails(false);
            return;
        }
        (async () => {
            try {
                const { data } = await api.get(`/business/team/invite/${token}`);
                if (!data.valid) {
                    setInvalid(data.message ?? "Invalid invitation link");
                } else {
                    setDetails(data);
                }
            } catch {
                setInvalid("Invalid invitation link");
            } finally {
                setLoadingDetails(false);
            }
        })();
    }, [token]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }
        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setSubmitting(true);
            const { data } = await api.post("/business/team/accept-invite", { token, password });

            localStorage.setItem("accessToken", data.token);
            localStorage.setItem("refreshToken", data.refreshToken);

            toast.success("Welcome to the team!");
            router.push("/dashboard/business");
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? "Could not set password");
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingDetails) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f0f4fb]">
                <p className="text-slate-400 text-sm">Loading invitation...</p>
            </div>
        );
    }

    if (invalid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f0f4fb] px-6">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-sm px-10 py-10 text-center">
                    <p className="text-red-500 font-semibold mb-4">{invalid}</p>
                    <Link href="/login/business" className="inline-block bg-[#1e3a8a] text-white px-5 py-2.5 rounded-xl font-semibold">
                        Go to Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f0f4fb] px-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-sm px-10 py-10">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-extrabold text-[#1e3a8a] mb-1">
                        Join {details?.workspaceName}
                    </h2>
                    <p className="text-sm text-gray-400">
                        Hi <span className="font-semibold text-gray-600">{details?.fullName}</span>, set a password for{" "}
                        <span className="font-semibold text-gray-600">{details?.email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="relative mb-3">
                        <input
                            type={showPass ? "text" : "password"}
                            value={password}
                            placeholder="Create a password"
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={submitting}
                            className="w-full border border-gray-200 rounded-lg pl-4 pr-11 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a] transition bg-white disabled:opacity-50"
                        />
                        <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <div className="relative mb-6">
                        <input
                            type={showConfirm ? "text" : "password"}
                            value={confirmPassword}
                            placeholder="Confirm password"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            disabled={submitting}
                            className="w-full border border-gray-200 rounded-lg pl-4 pr-11 py-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]/30 focus:border-[#1e3a8a] transition bg-white disabled:opacity-50"
                        />
                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-2 bg-[#e8683f] hover:bg-[#d95a2f] text-white text-sm font-semibold py-3.5 rounded-lg transition disabled:opacity-50"
                    >
                        {submitting ? "Setting up..." : "Set Password & Continue"} {!submitting && <CheckCircle2 size={16} />}
                    </button>
                </form>

                <div className="flex items-center justify-center gap-1.5 mt-8">
                    <Shield size={13} className="text-gray-300" />
                    <span className="text-xs text-gray-400">Your data is always kept secure</span>
                </div>
            </div>
        </div>
    );
}

export default function AcceptInvitePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#f0f4fb]">Loading invitation details...</div>}>
            <AcceptInvitePageInner />
        </Suspense>
    );
}
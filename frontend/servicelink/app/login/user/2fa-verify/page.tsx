"use client";

import { useSearchParams, useRouter } from "next/navigation";
import AuthLayout from "@/components/forgetpassword/AuthLayout";
import { useEffect, useRef, useState, KeyboardEvent } from "react";
import { toast } from "react-toastify";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { verifyLoginTwoFactor, resendLoginTwoFactor } from "@/lib/api/authApi";
import { AxiosError } from "axios";

export default function TwoFactorLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const preAuthToken = searchParams.get("token") || "";
    const method = searchParams.get("method") || "TOTP";

    const [code, setCode] = useState<string[]>(Array(6).fill(""));
    const [useBackupCode, setUseBackupCode] = useState<boolean>(false);
    const [backupCode, setBackupCode] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [resending, setResending] = useState<boolean>(false);

    const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    const handleChange = (value: string, index: number) => {
        if (!/^\d*$/.test(value)) return;
        const next = [...code];
        next[index] = value.slice(-1);
        setCode(next);
        if (value && index < 5) inputsRef.current[index + 1]?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === "Backspace" && !code[index] && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handleVerify = async () => {
        if (!preAuthToken) {
            toast.error("Session expired. Please log in again.");
            router.push("/login");
            return;
        }

        const finalCode = useBackupCode ? backupCode.trim() : code.join("");

        if (!useBackupCode && finalCode.length !== 6) {
            toast.error("Enter the complete 6-digit code");
            return;
        }
        if (useBackupCode && !finalCode) {
            toast.error("Enter a backup code");
            return;
        }

        try {
            setLoading(true);
            await verifyLoginTwoFactor(preAuthToken, finalCode);
            toast.success("Login successful!");
            router.replace("/dashboard/user");
        } catch (err: unknown) {
            const error = err as AxiosError<{ message?: string }>;
            toast.error(error.response?.data?.message || "Invalid code");
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        try {
            setResending(true);
            await resendLoginTwoFactor(preAuthToken);
            toast.success("Code resent");
        } catch (err: unknown) {
            const error = err as AxiosError<{ message?: string }>;
            toast.error(error.response?.data?.message || "Failed to resend code");
        } finally {
            setResending(false);
        }
    };

    return (
        <AuthLayout>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Two-Factor Verification</h2>
            <p className="text-gray-500 mb-6">
                {method === "EMAIL"
                    ? "Enter the 6-digit code we sent to your email."
                    : "Enter the 6-digit code from your authenticator app."}
            </p>

            {!useBackupCode ? (
                <div className="flex gap-3 justify-center my-6">
                    {code.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => {
                                inputsRef.current[i] = el;
                            }}
                            value={digit}
                            maxLength={1}
                            onChange={(e) => handleChange(e.target.value, i)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            className="w-12 h-14 text-center text-gray-900 border border-gray-300 rounded-xl text-lg font-semibold"
                        />
                    ))}
                </div>
            ) : (
                <input
                    type="text"
                    value={backupCode}
                    onChange={(e) => setBackupCode(e.target.value)}
                    placeholder="XXXX-XXXX"
                    className="w-full text-center py-3 border border-gray-300 rounded-xl text-lg font-mono mb-6"
                />
            )}

            <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full py-3 bg-[#1e3a8a] text-white rounded-xl flex items-center justify-center gap-2 font-semibold disabled:opacity-60"
            >
                {loading ? "Verifying..." : "Verify"}
                <CheckCircle size={16} />
            </button>

            {method === "EMAIL" && !useBackupCode && (
                <button
                    onClick={handleResend}
                    disabled={resending}
                    className="w-full text-center mt-3 text-sm text-[#1e3a8a] hover:underline disabled:opacity-60"
                >
                    {resending ? "Resending..." : "Resend code"}
                </button>
            )}

            <button
                onClick={() => setUseBackupCode((v) => !v)}
                className="w-full text-center mt-4 text-sm text-[#1e3a8a] hover:underline"
            >
                {useBackupCode ? "Use verification code instead" : "Use a backup code instead"}
            </button>

            <div className="text-center mt-6">
                <Link href="/login" className="text-sm text-gray-500 hover:underline">
                    Back to Sign In
                </Link>
            </div>
        </AuthLayout>
    );
}
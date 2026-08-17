"use client";

import { useState } from "react";
import { X, Lock, ShieldCheck, CheckCircle2, Smartphone, Mail, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import api from "@/utils/axios";
import { useAppSelector } from "@/store/hooks";

type Step = "password" | "chooseMethod" | "totpScan" | "totpVerify" | "emailVerify" | "done";
type Method = "TOTP" | "EMAIL";

interface Props {
    onClose: () => void;
    onEnabled: () => void;
}

export default function TwoFactorSetupModal({ onClose, onEnabled }: Props) {
    const { data: user } = useAppSelector((state) => state.user);
    const [step, setStep] = useState<Step>("password");
    const [method, setMethod] = useState<Method | null>(null);

    const [password, setPassword] = useState("");
    const [qrCode, setQrCode] = useState("");
    const [manualKey, setManualKey] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    // ── Step 1: password re-verify, then show method choice ──
    const handlePasswordSubmit = async () => {
        if (!password) {
            toast.error("Enter your current password");
            return;
        }
        setStep("chooseMethod");
    };

    // ── Step 2a: Authenticator app chosen — request secret + QR ──
    const handleChooseTotp = async () => {
        try {
            setLoading(true);
            const { data } = await api.post(`/users/${user?.id}/2fa/init`, {
                currentPassword: password,
                method: "TOTP",
            });
            setQrCode(data.qrCodeImageBase64);
            setManualKey(data.manualSetupKey);
            setMethod("TOTP");
            setStep("totpScan");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to start 2FA setup");
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2b: Email OTP chosen — send a code to their registered email ──
    const handleChooseEmail = async () => {
        try {
            setLoading(true);
            await api.post(`/users/${user?.id}/2fa/init`, {
                currentPassword: password,
                method: "EMAIL",
            });
            toast.success(`Code sent to ${user?.email}`);
            setMethod("EMAIL");
            setStep("emailVerify");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to send code");
        } finally {
            setLoading(false);
        }
    };

    // ── Final verify — same endpoint for both methods, server checks by stored method ──
    const handleVerify = async () => {
        if (otp.length !== 6) {
            toast.error("Enter the complete 6-digit code");
            return;
        }
        try {
            setLoading(true);
            await api.post(`/users/${user?.id}/2fa/verify`, { otp });
            setStep("done");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Invalid or expired code");
        } finally {
            setLoading(false);
        }
    };

    const handleResendEmail = async () => {
        try {
            setLoading(true);
            await api.post(`/users/${user?.id}/2fa/init`, {
                currentPassword: password,
                method: "EMAIL",
            });
            toast.success("Code resent");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to resend code");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 relative">
                {step !== "done" && (
                    <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                        <X size={18} />
                    </button>
                )}

                {step === "password" && (
                    <>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Enable Two-Factor Authentication</h3>
                        <p className="text-sm text-gray-500 mb-5">Re-enter your password to start setup.</p>
                        <div className="relative mb-5">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Current password"
                                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#1e3a8a] outline-none"
                            />
                        </div>
                        <button
                            onClick={handlePasswordSubmit}
                            className="w-full py-3 rounded-xl bg-[#1e3a8a] text-white font-bold"
                        >
                            Continue
                        </button>
                    </>
                )}

                {step === "chooseMethod" && (
                    <>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Choose a Verification Method</h3>
                        <p className="text-sm text-gray-500 mb-5">
                            Pick how you'd like to receive codes when signing in.
                        </p>

                        <button
                            onClick={handleChooseTotp}
                            disabled={loading}
                            className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl mb-3 hover:border-[#1e3a8a] hover:bg-[#f0f4ff]/40 transition-colors text-left disabled:opacity-60"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#dbe4ff] flex items-center justify-center text-[#1e3a8a] shrink-0">
                                <Smartphone size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Authenticator App</p>
                                <p className="text-xs text-gray-500">Google Authenticator, Authy, 1Password — recommended</p>
                            </div>
                        </button>

                        <button
                            onClick={handleChooseEmail}
                            disabled={loading}
                            className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-[#1e3a8a] hover:bg-[#f0f4ff]/40 transition-colors text-left disabled:opacity-60"
                        >
                            <div className="w-10 h-10 rounded-full bg-[#dbe4ff] flex items-center justify-center text-[#1e3a8a] shrink-0">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Email Code</p>
                                <p className="text-xs text-gray-500">We'll send a code to {user?.email}</p>
                            </div>
                        </button>
                    </>
                )}

                {step === "totpScan" && (
                    <>
                        <button
                            onClick={() => setStep("chooseMethod")}
                            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 mb-3"
                        >
                            <ArrowLeft size={12} /> Choose a different method
                        </button>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Scan QR Code</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Scan this with Google Authenticator, Authy, or 1Password.
                        </p>
                        <div className="flex justify-center mb-4">
                            <img src={qrCode} alt="2FA QR Code" className="w-48 h-48 border border-gray-100 rounded-xl" />
                        </div>
                        <p className="text-xs text-gray-500 mb-1">Can't scan? Enter manually:</p>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 mb-3 text-center font-mono text-sm tracking-wider">
                            {manualKey}
                        </div>
                        <p className="text-[11px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 mb-5">
                            Don't close this window until you've verified — closing and reopening generates a new code and invalidates this scan.
                        </p>
                        <button
                            onClick={() => setStep("totpVerify")}
                            className="w-full py-3 rounded-xl bg-[#1e3a8a] text-white font-bold"
                        >
                            I've Scanned It
                        </button>
                    </>
                )}

                {(step === "totpVerify" || step === "emailVerify") && (
                    <>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Enter Verification Code</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            {step === "totpVerify"
                                ? "Enter the 6-digit code from your authenticator app."
                                : `Enter the 6-digit code we sent to ${user?.email}.`}
                        </p>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            placeholder="6-digit code"
                            className="w-full text-center tracking-[0.5em] text-lg font-semibold py-3 border border-gray-200 rounded-xl mb-5 focus:ring-2 focus:ring-[#1e3a8a] outline-none"
                        />
                        <button
                            onClick={handleVerify}
                            disabled={loading}
                            className="w-full py-3 rounded-xl bg-[#1e3a8a] text-white font-bold disabled:opacity-70"
                        >
                            {loading ? "Verifying..." : "Verify & Enable"}
                        </button>

                        {step === "emailVerify" && (
                            <button
                                onClick={handleResendEmail}
                                disabled={loading}
                                className="w-full mt-3 text-xs text-[#1e3a8a] hover:underline"
                            >
                                Resend code
                            </button>
                        )}
                    </>
                )}

                {step === "done" && (
                    <div className="text-center py-2">
                        <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                            <CheckCircle2 className="text-emerald-500" size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Two-Factor Authentication Enabled</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            {method === "TOTP"
                                ? "You'll be asked for a code from your authenticator app each time you sign in."
                                : "You'll be sent a code to your email each time you sign in."}
                        </p>
                        <button
                            onClick={() => {
                                onEnabled();
                                onClose();
                            }}
                            className="w-full py-3 rounded-xl bg-[#1e3a8a] text-white font-bold"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
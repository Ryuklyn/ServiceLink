"use client";

import { useState } from "react";
import { X, Phone, ShieldCheck, Loader2 } from "lucide-react";
import { sendPhoneOtp, verifyPhoneOtpForMe } from "@/lib/api/authApi";

interface AddPhoneModalProps {
    onClose: () => void;
    onVerified: (phone: string) => void;
}

export default function AddPhoneModal({ onClose, onVerified }: AddPhoneModalProps) {
    const [step, setStep] = useState<"phone" | "otp">("phone");
    const [phone, setPhone] = useState("+977");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSendOtp = async () => {
        setError(null);
        if (!/^\+[1-9]\d{6,14}$/.test(phone)) {
            setError("Enter a valid phone number, e.g. +9779812345678");
            return;
        }
        try {
            setLoading(true);
            await sendPhoneOtp(phone);
            setStep("otp");
        } catch (err: any) {
            setError(err?.response?.data?.message || "Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        setError(null);
        if (!/^\d{6}$/.test(otp)) {
            setError("Enter the 6-digit code");
            return;
        }
        try {
            setLoading(true);
            await verifyPhoneOtpForMe(phone, otp);
            onVerified(phone);
            onClose();
        } catch (err: any) {
            setError(err?.response?.data?.message || "Invalid or expired OTP");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={18} />
                </button>

                <div className="w-12 h-12 rounded-full bg-[#dbe4ff] flex items-center justify-center text-[#1e3a8a] mb-4">
                    <Phone size={20} />
                </div>

                {step === "phone" ? (
                    <>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Add Phone Number</h3>
                        <p className="text-xs text-gray-500 mb-5">
                            We'll send a 6-digit code to this number via WhatsApp.
                        </p>

                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                            Phone Number
                        </label>
                        <input
                            type="text"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+9779812345678"
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                        />

                        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

                        <button
                            onClick={handleSendOtp}
                            disabled={loading}
                            className="w-full mt-5 py-2.5 rounded-xl bg-[#1e3a8a] text-white text-sm font-bold hover:bg-[#1e3a8a]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            Send Code via WhatsApp
                        </button>
                    </>
                ) : (
                    <>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Enter Verification Code</h3>
                        <p className="text-xs text-gray-500 mb-5">
                            We sent a 6-digit code to{" "}
                            <span className="font-semibold text-gray-700">{phone}</span> via WhatsApp.
                        </p>

                        <label className="text-xs font-semibold text-gray-600 mb-1.5 block">
                            OTP Code
                        </label>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                            placeholder="123456"
                            maxLength={6}
                            className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm tracking-[0.3em] text-center font-bold focus:outline-none focus:ring-2 focus:ring-[#1e3a8a]"
                        />

                        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

                        <button
                            onClick={handleVerifyOtp}
                            disabled={loading}
                            className="w-full mt-5 py-2.5 rounded-xl bg-[#1e3a8a] text-white text-sm font-bold hover:bg-[#1e3a8a]/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            <ShieldCheck size={15} />
                            Verify
                        </button>

                        <button
                            onClick={() => setStep("phone")}
                            className="w-full mt-2 py-2 text-xs text-gray-500 hover:text-gray-700 font-medium"
                        >
                            Change number
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
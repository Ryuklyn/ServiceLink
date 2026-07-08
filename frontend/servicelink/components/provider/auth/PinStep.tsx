"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { KeyRound, ShieldCheck, ArrowRight, HelpCircle } from "lucide-react";
import { pinApi } from "@/lib/api/pinApi";

// ─── Props ────────────────────────────────────────────────────────────────────

interface PinStepProps {
    deviceId: string;
    /** Provider's masked contact, shown for reassurance ("Welcome back, 98••••210"). */
    maskedContact?: string;
    onVerified: (accessToken: string, refreshToken?: string) => void;
    /** Falls back to full OTP login — "Forgot PIN" and "lockout" both route here. */
    onFallbackToOtp: () => void;
}

const MAX_ATTEMPTS = 5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function digitsOnly(v: string): string {
    return v.replace(/\D/g, "").slice(0, 4);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PinStep({
                                    deviceId,
                                    maskedContact,
                                    onVerified,
                                    onFallbackToOtp,
                                }: PinStepProps) {
    const [pin, setPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    // ── Input ──────────────────────────────────────────────────────────────────
    const handleChange = useCallback(
        (raw: string) => {
            if (loading) return;
            setPin(digitsOnly(raw));
            if (error) setError("");
        },
        [loading, error],
    );

    // ── Verify ─────────────────────────────────────────────────────────────────
    const handleVerify = useCallback(async () => {
        if (pin.length !== 4) {
            setError("Enter your 4-digit PIN.");
            return;
        }

        setLoading(true);
        try {
            const res = await pinApi.verifyPin(deviceId, pin);

            if (!res.verified) {
                const remaining = res.attemptsLeft ?? attemptsLeft - 1;
                setAttemptsLeft(remaining);
                setPin("");
                inputRef.current?.focus();

                if (remaining <= 0) {
                    // Locked out — force a full re-verification, same as your OTP resend cap
                    onFallbackToOtp();
                    return;
                }
                setError(`Incorrect PIN. ${remaining} attempt${remaining === 1 ? "" : "s"} left.`);
                return;
            }

            onVerified(res.accessToken!, res.refreshToken ?? undefined);
        } catch (err: any) {
            // Expired PIN — distinct from wrong-PIN/lockout, must reset via OTP.
            // err here is a normalized ApiError (from client.ts), not a raw AxiosError —
            // so check err.expired / err.status / err.message, not err.response.*
            if (err?.expired) {
                onFallbackToOtp();
                return;
            }
            if (err?.status === 429 || err?.status === 410) {
                onFallbackToOtp();
                return;
            }
            setError(err?.message ?? "Something went wrong. Please try again.");
            setPin("");
        } finally {
            setLoading(false);
        }
    }, [pin, deviceId, attemptsLeft, onVerified, onFallbackToOtp]);

    // ── Derived ──────────────────────────────────────────────────────────────
    const isReady = pin.length === 4;

    return (
        <div className="min-h-[100dvh] w-full flex flex-col lg:flex-row bg-white overflow-hidden">
            {/* ── Left branding panel ── */}
            <div className="hidden lg:flex flex-1 relative bg-linear-to-br from-[#1e3a8a] to-[#2563eb] items-center justify-center p-12 text-center text-white">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500 opacity-20 blur-3xl rounded-full" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-400 opacity-20 blur-3xl rounded-full" />

                <div className="relative z-10 max-w-sm flex flex-col items-center">
                    <div className="w-24 h-24 bg-[#e8683f] rounded-3xl flex items-center justify-center mb-10 shadow-lg">
                        <ShieldCheck className="w-12 h-12 text-white" aria-hidden />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
                    <p className="text-white/80 text-lg">
                        Enter your PIN to jump straight into your ServiceLink provider
                        dashboard.
                    </p>
                </div>
            </div>

            {/* ── Right form panel ── */}
            <div className="flex-1 flex items-center justify-center px-4 py-10 bg-[#f0f4ff] overflow-y-auto">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#1e3a8a]/15 overflow-hidden">
                    <div className="px-6 pt-6 pb-4 border-b border-[#1e3a8a]/10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#1e3a8a]/10 flex items-center justify-center">
                            <KeyRound size={20} className="text-[#1e3a8a]" aria-hidden />
                        </div>
                        <div>
                            <h2 className="text-[#1e3a8a] font-bold text-base">
                                Enter Your PIN
                            </h2>
                            <p className="text-gray-400 text-xs">
                                {maskedContact
                                    ? <>Signed in as <strong className="text-[#1e3a8a]/70">{maskedContact}</strong></>
                                    : "This device is recognized"}
                            </p>
                        </div>
                    </div>

                    <div className="px-6 py-6 space-y-5">
                        <div>
                            <label
                                htmlFor="pin-entry-input"
                                className="text-xs font-semibold text-[#1e3a8a] mb-1.5 uppercase tracking-wide block"
                            >
                                4-Digit PIN
                            </label>
                            <input
                                id="pin-entry-input"
                                ref={inputRef}
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                autoComplete="off"
                                value={pin}
                                onChange={(e) => handleChange(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && isReady && !loading && handleVerify()
                                }
                                disabled={loading}
                                maxLength={4}
                                placeholder="••••"
                                aria-invalid={error ? "true" : "false"}
                                className={`w-full px-4 py-3.5 border-2 rounded-xl text-[#1e3a8a] text-2xl font-bold
                  tracking-[0.5em] text-center outline-none placeholder:text-gray-200
                  disabled:cursor-not-allowed transition-colors
                  ${error ? "border-red-400" : "border-[#1e3a8a]/20 focus:border-[#e8683f]"}`}
                            />
                            {error && (
                                <p role="alert" className="text-red-500 text-xs mt-1.5">
                                    {error}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleVerify}
                            disabled={!isReady || loading}
                            aria-busy={loading}
                            className={`w-full flex items-center justify-center gap-2 font-bold
                py-3.5 rounded-xl transition-all duration-200 shadow-md
                ${
                                !isReady || loading
                                    ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                                    : "bg-[#e8683f] text-white hover:bg-[#d95a2f] hover:shadow-lg active:scale-[0.98]"
                            }`}
                        >
                            {loading ? (
                                <>
                    <span
                        className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
                        aria-hidden
                    />
                                    <span>Verifying…</span>
                                </>
                            ) : (
                                <>
                                    <KeyRound size={17} aria-hidden />
                                    <span>Unlock Dashboard</span>
                                    <ArrowRight size={16} aria-hidden />
                                </>
                            )}
                        </button>

                        <div className="text-center pt-1">
                            <button
                                onClick={onFallbackToOtp}
                                disabled={loading}
                                className="text-sm text-[#1e3a8a] flex items-center justify-center
                    gap-1.5 mx-auto font-semibold hover:underline disabled:cursor-not-allowed"
                            >
                                <HelpCircle size={14} aria-hidden />
                                Forgot PIN? Log in with a code instead
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
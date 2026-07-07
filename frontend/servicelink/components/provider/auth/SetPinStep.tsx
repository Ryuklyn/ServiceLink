"use client";

import { useState, useCallback, useRef } from "react";
import { KeyRound, ShieldCheck, ArrowRight, SkipForward } from "lucide-react";
import { pinApi } from "@/lib/api/pinApi";

// ─── Props ────────────────────────────────────────────────────────────────────

interface SetPinStepProps {
    /** The providerToken returned by OtpStep's onVerified (LOGIN purpose). */
    providerToken: string;
    /** Stable per-device UUID from lib/device.ts's getOrCreateDeviceId(). */
    deviceId: string;
    /** Called with the final access/refresh tokens once PIN is set (or skipped). */
    onComplete: (accessToken: string, refreshToken?: string) => void;
    /** Whether "Skip for now" is allowed. Default true. */
    allowSkip?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function digitsOnly(v: string): string {
    return v.replace(/\D/g, "").slice(0, 4);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SetPinStep({
                                       providerToken,
                                       deviceId,
                                       onComplete,
                                       allowSkip = true,
                                   }: SetPinStepProps) {
    const [pin, setPin] = useState("");
    const [confirmPin, setConfirmPin] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [skipping, setSkipping] = useState(false);
    const confirmRef = useRef<HTMLInputElement>(null);

    // ── Input handlers ───────────────────────────────────────────────────────
    const handlePinChange = useCallback(
        (raw: string) => {
            if (loading) return;
            const v = digitsOnly(raw);
            setPin(v);
            if (error) setError("");
            if (v.length === 4) confirmRef.current?.focus();
        },
        [loading, error],
    );

    const handleConfirmChange = useCallback(
        (raw: string) => {
            if (loading) return;
            setConfirmPin(digitsOnly(raw));
            if (error) setError("");
        },
        [loading, error],
    );

    // ── Submit ───────────────────────────────────────────────────────────────
    const handleSetPin = async () => {
        if (pin.length !== 4) {
            setError("Enter a 4-digit PIN.");
            return;
        }
        if (pin !== confirmPin) {
            setError("PINs don't match. Please re-enter.");
            setConfirmPin("");
            confirmRef.current?.focus();
            return;
        }
        // Guard against trivially weak PINs — same spirit as your phone/email validators
        if (/^(\d)\1{3}$/.test(pin) || pin === "1234" || pin === "0000") {
            setError("Choose a less predictable PIN (avoid 1234, 0000, etc).");
            return;
        }

        setError("");
        setLoading(true);
        try {
            const res = await pinApi.setPin(providerToken, deviceId, pin);
            onComplete(res.accessToken, res.refreshToken);
        } catch (err: any) {
            const backendMessage =
                err?.response?.data?.message ?? err?.response?.data?.error;
            setError(backendMessage ?? err?.message ?? "Failed to set PIN. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // ── Skip ─────────────────────────────────────────────────────────────────
    const handleSkip = async () => {
        setSkipping(true);
        try {
            const res = await pinApi.skipPin(providerToken);
            onComplete(res.accessToken, res.refreshToken);
        } catch (err: any) {
            const backendMessage =
                err?.response?.data?.message ?? err?.response?.data?.error;
            setError(backendMessage ?? err?.message ?? "Something went wrong. Please try again.");
        } finally {
            setSkipping(false);
        }
    };

    // ── Derived ──────────────────────────────────────────────────────────────
    const isReady = pin.length === 4 && confirmPin.length === 4;
    const busy = loading || skipping;

    return (
        <div className="min-h-[100dvh] w-full flex flex-col lg:flex-row bg-white overflow-hidden">
            {/* ── Left branding panel ── */}
            <div className="hidden lg:flex flex-1 relative bg-linear-to-br from-[#1e3a8a] to-[#2563eb] items-center justify-center p-12 text-center text-white">
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-500 opacity-20 blur-3xl rounded-full" />
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-400 opacity-20 blur-3xl rounded-full" />

                <div className="relative z-10 max-w-sm flex flex-col items-center">
                    <div className="w-24 h-24 bg-[#e8683f] rounded-3xl flex items-center justify-center mb-10 shadow-lg">
                        <KeyRound className="w-12 h-12 text-white" aria-hidden />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Secure This Device</h1>
                    <p className="text-white/80 text-lg">
                        Set a 4-digit PIN so you can jump straight into your ServiceLink
                        dashboard next time — no waiting for a login code.
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
                                Set Your Login PIN
                            </h2>
                            <p className="text-gray-400 text-xs">
                                This PIN is only for this device — you can set a different one
                                on other devices
                            </p>
                        </div>
                    </div>

                    <div className="px-6 py-6 space-y-5">
                        {/* PIN */}
                        <div>
                            <label
                                htmlFor="pin-input"
                                className="text-xs font-semibold text-[#1e3a8a] mb-1.5 uppercase tracking-wide block"
                            >
                                4-Digit PIN
                            </label>
                            <input
                                id="pin-input"
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                autoComplete="off"
                                value={pin}
                                onChange={(e) => handlePinChange(e.target.value)}
                                disabled={busy}
                                maxLength={4}
                                autoFocus
                                placeholder="••••"
                                className={`w-full px-4 py-3.5 border-2 rounded-xl text-[#1e3a8a] text-2xl font-bold
                  tracking-[0.5em] text-center outline-none placeholder:text-gray-200
                  disabled:cursor-not-allowed transition-colors
                  ${error ? "border-red-400" : "border-[#1e3a8a]/20 focus:border-[#e8683f]"}`}
                            />
                        </div>

                        {/* Confirm PIN */}
                        <div>
                            <label
                                htmlFor="confirm-pin-input"
                                className="text-xs font-semibold text-[#1e3a8a] mb-1.5 uppercase tracking-wide block"
                            >
                                Confirm PIN
                            </label>
                            <input
                                id="confirm-pin-input"
                                ref={confirmRef}
                                type="password"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                autoComplete="off"
                                value={confirmPin}
                                onChange={(e) => handleConfirmChange(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === "Enter" && isReady && !busy && handleSetPin()
                                }
                                disabled={busy}
                                maxLength={4}
                                placeholder="••••"
                                className={`w-full px-4 py-3.5 border-2 rounded-xl text-[#1e3a8a] text-2xl font-bold
                  tracking-[0.5em] text-center outline-none placeholder:text-gray-200
                  disabled:cursor-not-allowed transition-colors
                  ${error ? "border-red-400" : "border-[#1e3a8a]/20 focus:border-[#e8683f]"}`}
                            />
                        </div>

                        {error && (
                            <p role="alert" className="text-red-500 text-xs -mt-2">
                                {error}
                            </p>
                        )}

                        <div
                            role="note"
                            className="flex items-start gap-2.5 bg-[#1e3a8a]/10 border border-[#1e3a8a]/15 rounded-lg px-4 py-3"
                        >
                            <ShieldCheck
                                size={15}
                                className="text-[#1e3a8a] mt-0.5 shrink-0"
                                aria-hidden
                            />
                            <p className="text-[#1e3a8a]/70 text-xs leading-relaxed">
                                You'll still get a login code by SMS or email if you ever forget
                                this PIN, or when you log in on a new device.
                            </p>
                        </div>

                        <button
                            onClick={handleSetPin}
                            disabled={!isReady || busy}
                            aria-busy={loading}
                            className={`w-full flex items-center justify-center gap-2 font-bold
                py-3.5 rounded-xl transition-all duration-200 shadow-md
                ${
                                !isReady || busy
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
                                    <span>Saving PIN…</span>
                                </>
                            ) : (
                                <>
                                    <KeyRound size={17} aria-hidden />
                                    <span>Set PIN & Continue</span>
                                    <ArrowRight size={16} aria-hidden />
                                </>
                            )}
                        </button>

                        {allowSkip && (
                            <button
                                onClick={handleSkip}
                                disabled={busy}
                                className="w-full flex items-center justify-center gap-1.5 text-xs
                    text-gray-400 hover:text-[#1e3a8a] font-medium py-1 transition-colors
                    disabled:cursor-not-allowed"
                            >
                                <SkipForward size={13} aria-hidden />
                                {skipping ? "Skipping…" : "Skip for now — use login code every time"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
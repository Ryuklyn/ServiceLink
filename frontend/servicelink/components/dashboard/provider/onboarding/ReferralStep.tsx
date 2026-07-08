"use client";

import { useState } from "react";
import { Gift, Copy, Check, ArrowLeft, Sparkles } from "lucide-react";

interface ReferralStepProps {
    referralCode: string;
    onFinish: () => void;
    onBack: () => void;
    finishing: boolean;
}

export default function ReferralStep({
                                         referralCode,
                                         onFinish,
                                         onBack,
                                         finishing,
                                     }: ReferralStepProps) {
    const [copied, setCopied] = useState(false);

    const referralLink =
        typeof window !== "undefined"
            ? `${window.location.origin}/register?ref=${referralCode}`
            : "";

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard API can fail on non-HTTPS/localhost edge cases — non-fatal.
        }
    };

    return (
        <div className="px-8 py-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#e8683f]/10 rounded-2xl flex items-center justify-center mb-5">
                <Gift className="w-8 h-8 text-[#e8683f]" aria-hidden />
            </div>

            <h2 className="text-xl font-bold text-[#1e3a8a] mb-2">
                Earn Free Months by Referring
            </h2>
            <p className="text-gray-500 text-sm max-w-sm mb-6">
                Invite other providers with your link. For every{" "}
                <strong className="text-[#1e3a8a]">5 referrals</strong> who complete
                KYC and get approved, you get{" "}
                <strong className="text-[#1e3a8a]">1 month free</strong> added to
                your subscription.
            </p>

            <div className="w-full max-w-sm bg-[#1e3a8a]/5 border border-[#1e3a8a]/15 rounded-xl px-4 py-3.5 mb-3">
                <p className="text-xs text-gray-400 mb-1 text-left">Your referral code</p>
                <p className="text-[#1e3a8a] font-mono font-bold text-lg tracking-wider text-left">
                    {referralCode}
                </p>
            </div>

            <button
                onClick={handleCopy}
                className="w-full max-w-sm flex items-center justify-center gap-2 font-semibold
            py-3 rounded-xl border-2 border-[#1e3a8a]/20 text-[#1e3a8a] hover:bg-[#1e3a8a]/5
            transition-colors mb-8"
            >
                {copied ? (
                    <>
                        <Check size={16} className="text-green-500" aria-hidden />
                        <span>Link Copied!</span>
                    </>
                ) : (
                    <>
                        <Copy size={16} aria-hidden />
                        <span>Copy Referral Link</span>
                    </>
                )}
            </button>

            <div className="flex items-center gap-3 w-full max-w-sm">
                <button
                    onClick={onBack}
                    disabled={finishing}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold
              text-[#1e3a8a] hover:bg-[#1e3a8a]/5 transition-colors disabled:cursor-not-allowed"
                >
                    <ArrowLeft size={15} aria-hidden />
                    Back
                </button>
                <button
                    onClick={onFinish}
                    disabled={finishing}
                    className="flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-xl
              transition-all duration-200 shadow-md bg-[#e8683f] text-white hover:bg-[#d95a2f]
              hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <Sparkles size={16} aria-hidden />
                    <span>{finishing ? "Finishing Up…" : "Go to My Dashboard"}</span>
                </button>
            </div>
        </div>
    );
}
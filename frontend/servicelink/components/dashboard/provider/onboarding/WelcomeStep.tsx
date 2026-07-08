"use client";

import { PartyPopper, Clock, ArrowRight } from "lucide-react";

interface WelcomeStepProps {
    trialDaysRemaining: number;
    onContinue: () => void;
}

export default function WelcomeStep({ trialDaysRemaining, onContinue }: WelcomeStepProps) {
    return (
        <div className="px-8 py-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#e8683f]/10 rounded-2xl flex items-center justify-center mb-5">
                <PartyPopper className="w-8 h-8 text-[#e8683f]" aria-hidden />
            </div>

            <h2 className="text-xl font-bold text-[#1e3a8a] mb-2">
                Welcome to ServiceLink!
            </h2>
            <p className="text-gray-500 text-sm max-w-sm mb-6">
                You're verified and ready to start getting bookings. Let's get your
                services set up — it only takes a minute.
            </p>

            <div className="w-full max-w-sm flex items-center gap-3 bg-[#1e3a8a]/5 border border-[#1e3a8a]/15 rounded-xl px-4 py-3.5 mb-8">
                <div className="w-9 h-9 rounded-full bg-[#1e3a8a] flex items-center justify-center flex-shrink-0">
                    <Clock size={16} className="text-white" aria-hidden />
                </div>
                <div className="text-left">
                    <p className="text-[#1e3a8a] font-bold text-sm">
                        {trialDaysRemaining} day{trialDaysRemaining === 1 ? "" : "s"} left on your free trial
                    </p>
                    <p className="text-gray-500 text-xs">
                        Full access to all provider features — no card needed yet.
                    </p>
                </div>
            </div>

            <button
                onClick={onContinue}
                className="w-full max-w-sm flex items-center justify-center gap-2 font-bold
            py-3.5 rounded-xl transition-all duration-200 shadow-md
            bg-[#e8683f] text-white hover:bg-[#d95a2f] hover:shadow-lg active:scale-[0.98]"
            >
                <span>Let's Get Started</span>
                <ArrowRight size={16} aria-hidden />
            </button>
        </div>
    );
}
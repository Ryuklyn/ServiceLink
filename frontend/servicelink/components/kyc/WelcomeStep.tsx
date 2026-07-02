"use client";

import { ShieldCheck, Clock, CreditCard, ArrowRight, CheckCircle2, Sparkles } from "lucide-react";

interface WelcomeStepProps {
    onStart: () => void;
}

const TRIAL_POINTS = [
    {
        icon: ShieldCheck,
        title: "Verify your identity",
        description: "Quick KYC — takes about 5–10 minutes to complete",
    },
    {
        icon: Clock,
        title: "30-day free trial starts on approval",
        description: "Full access to the platform, no restrictions",
    },
    {
        icon: CreditCard,
        title: "No payment required now",
        description: "You'll only choose a plan once your trial is ending",
    },
];

export default function WelcomeStep({ onStart }: WelcomeStepProps) {
    return (
        <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center px-4 py-6 sm:py-10">
            <div className="w-full max-w-xl bg-white rounded-2xl sm:rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                {/* Header — navy, brand-consistent */}
                <div className="relative bg-[#1e3a8a] text-white px-6 sm:px-8 py-9 sm:py-12 text-center overflow-hidden">
                    {/* subtle decorative glow */}
                    <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#e8683f]/20 blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-20 -left-10 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />

                    <div className="relative inline-flex items-center gap-1.5 bg-[#e8683f]/15 border border-[#e8683f]/40 text-[#ffb08a] text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-5">
                        <Sparkles className="w-3 h-3" />
                        30-Day Free Trial
                    </div>

                    <h1 className="relative text-2xl sm:text-3xl font-bold leading-tight">
                        Become a Verified <span className="text-[#e8683f]">Provider</span>
                    </h1>
                    <p className="relative text-sm text-blue-100/80 mt-3 max-w-sm mx-auto leading-relaxed">
                        Verify your profile to unlock your 30-day free trial — no payment required until it ends.
                    </p>
                </div>

                {/* Body */}
                <div className="px-5 sm:px-8 py-7 sm:py-8">
                    <div className="flex flex-col gap-4 sm:gap-5">
                        {TRIAL_POINTS.map((point) => (
                            <div key={point.title} className="flex gap-3.5 sm:gap-4 items-start">
                                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#e8683f]/10 flex items-center justify-center flex-shrink-0">
                                    <point.icon className="w-5 h-5 text-[#e8683f]" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-[#1e3a8a]">{point.title}</p>
                                    <p className="text-xs sm:text-[13px] text-stone-500 mt-0.5 leading-relaxed">
                                        {point.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Trial summary card */}
                    <div className="mt-6 bg-[#1e3a8a]/5 border border-[#1e3a8a]/10 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#1e3a8a] mb-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                            What happens after your trial
                        </div>
                        <p className="text-xs sm:text-[13px] text-stone-600 leading-relaxed">
                            Once your 30-day trial ends, you'll choose a plan starting from{" "}
                            <strong className="text-[#1e3a8a]">Rs. 500/month</strong> — Monthly, Quarterly, or
                            Yearly, all with the same full feature access. If your documents are ever rejected
                            during review, you won't be charged anything.
                        </p>
                        <a
                        href="/pricing"
                        className="inline-flex items-center gap-1 mt-2.5 text-xs font-semibold text-[#e8683f] hover:text-[#d95a2f] hover:underline"
                        >
                        View full pricing <ArrowRight className="w-3 h-3" />
                    </a>
                </div>

                {/* CTA */}
                <button
                    onClick={onStart}
                    className="w-full mt-6 sm:mt-7 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#e8683f] text-white rounded-xl font-semibold text-sm sm:text-base hover:bg-[#d95a2f] active:scale-[0.98] transition shadow-sm"
                >
                    Start KYC Application <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-center text-xs text-stone-400 mt-4">
                    Takes about 5–10 minutes · Documents reviewed within 2–3 business days
                </p>
            </div>
        </div>
</div>
);
}
"use client";

import { useRouter } from "next/navigation";
import { X, Phone, Ticket, ArrowRight } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { goToTier2, closeOnboarding } from "@/store/slices/onboardingSlice";
import { updateUserLocally } from "@/store/slices/userSlice";
import api from "@/utils/axios";

export default function OnboardingModal() {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const { isModalOpen, currentTier, pendingDestination } = useAppSelector(
        (state) => state.onboarding
    );
    const { data: user } = useAppSelector((state) => state.user); // ✅ थप्ने

    if (!isModalOpen || !currentTier) return null;

    const handleGoToProfile = () => dispatch(goToTier2({ destination: "profile" }));
    const handleLater = () => dispatch(goToTier2({ destination: null }));
    const handleClose = () => dispatch(closeOnboarding());

    const handleTier2Done = async () => {
        try {
            if (user?.id) {
                await api.patch(`/users/${user.id}/onboarding-seen`);
                dispatch(updateUserLocally({ hasSeenOnboarding: true }));
            } else {
                console.warn("No user id found — cannot persist onboarding state");
            }
        } catch (err) {
            console.error("Failed to mark onboarding as seen:", err);
        }

        dispatch(closeOnboarding());
        if (pendingDestination === "profile") {
            router.push("/dashboard/user/settings");
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                    <X size={20} />
                </button>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-2 pt-6">
          <span
              className={`h-1.5 rounded-full transition-all ${
                  currentTier === 1 ? "w-6 bg-[#1e3a8a]" : "w-1.5 bg-gray-200"
              }`}
          />
                    <span
                        className={`h-1.5 rounded-full transition-all ${
                            currentTier === 2 ? "w-6 bg-[#1e3a8a]" : "w-1.5 bg-gray-200"
                        }`}
                    />
                </div>

                {/* ── TIER 1: Phone Number ── */}
                {currentTier === 1 && (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-[#f0f4ff] flex items-center justify-center mb-5">
                            <Phone size={28} className="text-[#1e3a8a]" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">
                            Add your phone number
                        </h2>
                        <p className="text-sm text-gray-500 leading-relaxed mb-6">
                            Providers connect with you through WhatsApp. Add your number so
                            they can reach you once a booking is confirmed.
                        </p>

                        <div className="flex flex-col gap-2.5">
                            <button
                                onClick={handleGoToProfile}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1e3a8a] text-white font-semibold text-sm hover:bg-[#16296b] transition-colors"
                            >
                                Go to Profile
                                <ArrowRight size={16} />
                            </button>
                            <button
                                onClick={handleLater}
                                className="w-full py-3 rounded-xl text-gray-500 font-medium text-sm hover:bg-gray-50 transition-colors"
                            >
                                I&apos;ll do it later
                            </button>
                        </div>
                    </div>
                )}

                {/* ── TIER 2: Token Info ── */}
                {currentTier === 2 && (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-[#fff2ee] flex items-center justify-center mb-5">
                            <Ticket size={28} className="text-[#e8683f] rotate-45" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-2">
                            You&apos;ve got Flex Tokens
                        </h2>
                        <p className="text-sm text-gray-500 leading-relaxed mb-5">
                            For genuine emergencies, use a Flex Token to reschedule or
                            cancel a booking without the usual late charge.
                        </p>

                        <div className="flex gap-3 mb-6">
                            <div className="flex-1 bg-[#f0f4ff]/60 border border-[#dbe4ff] rounded-xl py-3">
                                <p className="text-2xl font-black text-[#1e3a8a]">3</p>
                                <p className="text-[11px] text-gray-500 font-medium">Reschedule</p>
                            </div>
                            <div className="flex-1 bg-[#fff2ee]/60 border border-[#ffe3da] rounded-xl py-3">
                                <p className="text-2xl font-black text-[#e8683f]">2</p>
                                <p className="text-[11px] text-gray-500 font-medium">Cancel</p>
                            </div>
                        </div>

                        <p className="text-[11px] text-gray-400 mb-6">
                            Tokens reset every year. You can check your balance anytime
                            from your profile.
                        </p>

                        <button
                            onClick={handleTier2Done}
                            className="w-full py-3 rounded-xl bg-[#1e3a8a] text-white font-semibold text-sm hover:bg-[#16296b] transition-colors"
                        >
                            Got it
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
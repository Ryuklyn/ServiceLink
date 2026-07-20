"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import type { RootState, AppDispatch } from "@/store";
import {
    fetchOnboardingStatus,
    markWelcomeSeen,
    markReferralSeen,
    goToStep,
    goBack,
    deriveEntryStep,
    completeProviderOnboarding,
} from "@/store/slices/providerOnboardingSlice";
import WelcomeStep from "./WelcomeStep";
import SubServicesStep from "./SubServicesStep";
import ReferralStep from "./ReferralStep";

const STEP_ORDER = ["welcome", "services", "referral"] as const;

interface OnboardingWizardProps {
    // category: string;
    categories: string[];
    /** Called once the parent should re-check hasCompletedOnboarding (layout owns that fetch). */
    onComplete: () => void;
}

export default function OnboardingWizard({ categories, onComplete }: OnboardingWizardProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { currentStep, status, loadingStatus, finishing } = useSelector(
        (s: RootState) => s.providerOnboarding,
    );

    // Fetch once on mount, then derive the correct entry step from real data
    // (hasAtLeastOneService) + localStorage seen-flags — same logic as before,
    // just centralized in the slice instead of a component-local callback.
    useEffect(() => {
        dispatch(fetchOnboardingStatus())
            .unwrap()
            .then(() => dispatch(deriveEntryStep()))
            .catch(() => {
                /* error surfaced via state.providerOnboarding.error if you want to show it */
            });
    }, [dispatch]);

    const handleWelcomeContinue = () => {
        dispatch(markWelcomeSeen());
        dispatch(goToStep(status?.hasAtLeastOneService ? "referral" : "services"));
    };

    const handleServicesNext = () => {
        dispatch(goToStep("referral"));
    };

    const handleFinish = async () => {
        dispatch(markReferralSeen());
        const result = await dispatch(completeProviderOnboarding());
        if (completeProviderOnboarding.fulfilled.match(result)) {
            onComplete();
        }
        // on rejection, the slice's own rejected-case already bounces
        // currentStep back to "services" — nothing to do here.
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-center gap-2 pt-6">
                    {STEP_ORDER.map((s) => (
                        <span
                            key={s}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                s === currentStep
                                    ? "w-8 bg-[#e8683f]"
                                    : STEP_ORDER.indexOf(s) < STEP_ORDER.indexOf(currentStep)
                                        ? "w-1.5 bg-[#e8683f]/40"
                                        : "w-1.5 bg-gray-200"
                            }`}
                        />
                    ))}
                </div>

                {loadingStatus || !status ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3">
                        <Loader2 className="w-6 h-6 text-[#1e3a8a] animate-spin" aria-hidden />
                        <p className="text-gray-400 text-sm">Setting things up…</p>
                    </div>
                ) : (
                    <>
                        {currentStep === "welcome" && (
                            <WelcomeStep
                                trialDaysRemaining={status.subscriptionDaysRemaining}
                                onContinue={handleWelcomeContinue}
                            />
                        )}
                        {currentStep === "services" && (
                            <SubServicesStep
                                // category={category}
                                categories={categories}
                                onNext={handleServicesNext}
                                onBack={() => dispatch(goBack())}
                            />
                        )}
                        {currentStep === "referral" && (
                            <ReferralStep
                                referralCode={status.referralCode}
                                onFinish={handleFinish}
                                onBack={() => dispatch(goBack())}
                                finishing={finishing}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setStep,
    savePersonalStep,
    saveProfessionalStep,
    loadDraftFromBrowser,
    resetKyc,
    KycPersonalData,
    KycProfessionalData,
} from "@/store/slices/kycSlice";
import type { KycSubmitResponse } from "@/lib/api/kycApi";

import StepIndicator from "@/components/kyc/StepIndicator";
import PersonalInfoStep from "@/components/kyc/PersonalInfoStep";
import ProfessionalInfoStep from "@/components/kyc/ProfessionalInfoStep";
import KYCStep, { type KYCFiles } from "@/components/kyc/KycStep";
import { ReviewDone } from "@/components/kyc/ReviewDone";
import DoneStep from "@/components/kyc/DoneStep";

const MAX_KYC_STEP = 4;
const EMPTY_KYC_FILES: KYCFiles = {
    citizenshipFront: null,
    citizenshipBack: null,
    pan: null,
    professional: [],
    photo: null,
};

type SubmittedSummary = {
    personal: Partial<KycPersonalData>;
    professional: Partial<KycProfessionalData>;
};

export default function KycPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    // const { currentStep, personal, professional, draftLoaded } =
    //     useAppSelector((state) => state.kyc);
    const { currentStep, personal, professional, draftLoaded, draftSessionId } =
        useAppSelector((state) => state.kyc);

    // Files Redux ma store garna mildaina (non-serializable)
    // Local state ma rakhincha, KYCStep + ReviewDone ma pass garcha
    const [kycFiles, setKycFiles] = useState<KYCFiles>(EMPTY_KYC_FILES);

    // Backend bata aako pura submit response (referenceNumber, submittedAt, etc.)
    const [submitResponse, setSubmitResponse] = useState<KycSubmitResponse | undefined>(undefined);
    const [submittedSummary, setSubmittedSummary] = useState<SubmittedSummary | undefined>(undefined);
    // ── SINGLE load point — KycPage mount huda ek palta matra ─────────────────
    useEffect(() => {
        if (!draftLoaded) {
            dispatch(loadDraftFromBrowser());
        }
    }, [dispatch, draftLoaded]);

    // ── Scroll helper ──────────────────────────────────────────────────────────
    const scrollTop = () => {
        if (typeof window !== "undefined") {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    // ── Navigation ─────────────────────────────────────────────────────────────
    const goTo = useCallback(
        (step: number) => {
            const newStep = Math.min(Math.max(step, 1), MAX_KYC_STEP + 1);
            dispatch(setStep(newStep));
            scrollTop();
        },
        [dispatch]
    );

    // ── Step handlers ──────────────────────────────────────────────────────────
    const handlePersonalNext = useCallback(
        (data: KycPersonalData) => {
            dispatch(savePersonalStep(data)); // Redux update + localStorage save
            goTo(2);
        },
        [dispatch, goTo]
    );

    const handleProfessionalNext = useCallback(
        (data: KycProfessionalData) => {
            dispatch(saveProfessionalStep(data)); // Redux update + localStorage save
            goTo(3);
        },
        [dispatch, goTo]
    );

    const handleKycDocsNext = useCallback(
        (data: KYCFiles) => {
            setKycFiles(data); // Files local state ma matra (non-serializable)
            goTo(4);
        },
        [goTo]
    );

    const handleSubmitSuccess = useCallback(
        (response?: KycSubmitResponse) => {
            if (response) setSubmitResponse(response);
            setSubmittedSummary({ personal, professional });
            dispatch(resetKyc()); // Redux clear + localStorage clear
            goTo(5);
        },
        [dispatch, goTo, personal, professional]
    );

    const resetFlow = useCallback(() => {
        dispatch(resetKyc());
        setKycFiles(EMPTY_KYC_FILES);
        setSubmitResponse(undefined);
        setSubmittedSummary(undefined);
        router.push("/register");
    }, [dispatch, router]);

    // ── Loading state (localStorage bata restore hune bela) ────────────────────
    if (!draftLoaded) {
        return (
            <div className="min-h-screen bg-[#f7f6f3] flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-[#e8683f] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm text-gray-500 font-medium">
                        Restoring your progress...
                    </p>
                </div>
            </div>
        );
    }

    // ── Step renderer ───────────────────────────────────────────────────────────
    const renderKycStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <PersonalInfoStep
                        initialData={personal}
                        onNext={handlePersonalNext}
                    />
                );
            case 2:
                return (
                    <ProfessionalInfoStep
                        initialData={professional}
                        onNext={handleProfessionalNext}
                        onBack={() => goTo(1)}
                        draftSessionId={draftSessionId}
                    />
                );
            case 3:
                return (
                    <KYCStep
                        initialData={kycFiles}
                        onNext={handleKycDocsNext}
                        onBack={() => goTo(2)}
                        draftSessionId={draftSessionId}
                    />
                );
            case 4:
                return (
                    <ReviewDone
                        allData={{
                            personal,
                            professional,
                            kyc: kycFiles,
                        }}
                        onSubmitSuccess={handleSubmitSuccess}
                        onBack={() => goTo(3)}
                        onGoToStep={goTo}
                        draftSessionId={draftSessionId}
                    />
                );
            case 5:
                return (
                    <DoneStep
                        onRestart={resetFlow}
                        referenceNumber={submitResponse?.referenceNumber}
                        allData={submittedSummary ?? { personal, professional }}
                    />
                );
            default:
                return null;
        }
    };

    // Step 5 (DoneStep) is a full-screen takeover — no header chrome, no card wrapper
    if (currentStep === 5) {
        return renderKycStep();
    }

    return (
        <div className="min-h-screen bg-[#f7f6f3]">
            <div className="max-w-3xl mx-auto px-4 pt-4">
                {/* Draft saved indicator - Step 2+ ma dekhaucha */}
                {currentStep > 1 && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Progress saved — you can safely close this tab
                    </div>
                )}
            </div>

            <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8">
                <StepIndicator currentStep={currentStep} />

                <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-5 sm:p-6 md:p-10 mt-4 sm:mt-6">
                    {renderKycStep()}
                </div>
            </div>

            <p className="text-center text-sm text-gray-500 mt-2 mb-8 px-4">
                Already have an account?{" "}
                <a
                href="/login"
                className="text-[#e8683f] font-medium hover:underline"
                >
                Log in here
            </a>
        </p>
</div>
);
}

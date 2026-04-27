"use client";

import { useState, useCallback } from "react";

/* ── OTP Phase Components ───────────────── */
import PhoneStep from "@/components/kyc/PhoneStep";
import OtpStep from "@/components/kyc/OTPStep";

/* ── KYC Phase Components ───────────────── */
import StepIndicator from "@/components/kyc/StepIndicator";
import PersonalInfoStep from "@/components/kyc/PersonalInfoStep";
import ProfessionalInfoStep from "@/components/kyc/ProfessionalInfoStep";
import KYCStep from "@/components/kyc/KycStep";
import { ReviewDone, DoneStep } from "@/components/kyc/ReviewDone";

/* =========================
   TYPES
========================= */

/**
 * "phone"  → Enter phone number (OTP phase 1)
 * "otp"    → Verify OTP         (OTP phase 2)
 * "kyc"    → KYC multi-step form (existing)
 */
type AppPhase = "phone" | "otp" | "kyc";

type StepKey = "personal" | "professional" | "kyc" | "payment";
type AllData = Partial<Record<StepKey, any>>;

const MAX_KYC_STEP = 6;

/* =========================
   COMPONENT
========================= */
export default function ProviderRegistrationPage() {
  /* ── App-level phase ──────────────────── */
  const [phase, setPhase] = useState<AppPhase>("phone");
  const [verifiedPhone, setVerifiedPhone] = useState<string>("");

  /* ── KYC step state ───────────────────── */
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [allData, setAllData] = useState<AllData>({});

  /* =========================
     OTP PHASE HANDLERS
  ========================= */

  /** Called by PhoneStep once OTP is dispatched */
  const handleOtpSent = useCallback((phone: string) => {
    setVerifiedPhone(phone);
    setPhase("otp");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /** Called by OtpStep on successful verification */
  const handleOtpVerified = useCallback(() => {
    setPhase("kyc");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /** Go back to phone entry from OTP screen */
  const handleChangePhone = useCallback(() => {
    setVerifiedPhone("");
    setPhase("phone");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* =========================
     KYC PHASE HANDLERS
  ========================= */

  const goTo = useCallback((step: number) => {
    const safeStep = Math.min(Math.max(step, 1), MAX_KYC_STEP);
    setCurrentStep(safeStep);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleNext = useCallback(
    (key: StepKey, data: any) => {
      setAllData((prev) => ({ ...prev, [key]: data }));
      goTo(currentStep + 1);
    },
    [currentStep, goTo],
  );

  const handleSubmit = useCallback(() => {
    console.log("Submitting KYC:", { phone: verifiedPhone, ...allData });
    // TODO: await api.post("/kyc/submit", { phone: verifiedPhone, ...allData });
    setCurrentStep(6);
  }, [allData, verifiedPhone]);

  const resetFlow = useCallback(() => {
    setAllData({});
    setCurrentStep(1);
    setVerifiedPhone("");
    setPhase("phone");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  /* =========================
     KYC STEP RENDER
  ========================= */
  const renderKycStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep onNext={(data) => handleNext("personal", data)} />
        );
      case 2:
        return (
          <ProfessionalInfoStep
            onNext={(data) => handleNext("professional", data)}
            onBack={() => goTo(1)}
          />
        );
      case 3:
        return (
          <KYCStep
            onNext={(data) => handleNext("kyc", data)}
            onBack={() => goTo(2)}
          />
        );
      //   case 4:
      // return (
      //   <PaymentStep
      //     onNext={(data) => handleNext("payment", data)}
      //     onBack={() => goTo(3)}
      //   />
      // );
      case 4:
        return (
          <ReviewDone
            allData={allData}
            onSubmit={handleSubmit}
            onBack={() => goTo(4)}
            onGoToStep={goTo}
          />
        );
      case 5:
        return <DoneStep onRestart={resetFlow} />;
      default:
        return null;
    }
  };

  /* =========================
     PHASE ROUTING
  ========================= */

  // OTP Phase — full-screen layouts (no shared wrapper needed)
  if (phase === "phone") {
    return <PhoneStep onOtpSent={handleOtpSent} />;
  }

  if (phase === "otp") {
    return (
      <OtpStep
        phone={verifiedPhone}
        onVerified={handleOtpVerified}
        onChangePhone={handleChangePhone}
      />
    );
  }

  // KYC Phase — existing layout preserved exactly
  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {currentStep < MAX_KYC_STEP && (
          <StepIndicator currentStep={currentStep} />
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 md:p-10">
          {renderKycStep()}
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 mt-2 mb-8">
        Already have an account?{" "}
        <a href="/login" className="text-amber-500 font-medium">
          Log in here
        </a>
      </p>
    </div>
  );
}

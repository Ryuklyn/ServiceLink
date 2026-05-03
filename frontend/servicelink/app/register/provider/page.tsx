"use client";

import { useState, useCallback } from "react";
import type { ContactMode } from "@/components/kyc/PhoneStep";

/* ── OTP Phase ──────────────────────────────────────────────────────────────── */
import PhoneStep      from "@/components/kyc/PhoneStep";
import OtpStep        from "@/components/kyc/OTPStep";

/* ── KYC Phase ──────────────────────────────────────────────────────────────── */
import StepIndicator      from "@/components/kyc/StepIndicator";
import PersonalInfoStep   from "@/components/kyc/PersonalInfoStep";
import ProfessionalInfoStep from "@/components/kyc/ProfessionalInfoStep";
import KYCStep            from "@/components/kyc/KycStep";
import { ReviewDone }     from "@/components/kyc/ReviewDone";
import DoneStep           from "@/components/kyc/DoneStep";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppPhase = "phone" | "otp" | "kyc";

type StepKey = "personal" | "professional" | "kyc";
type AllData = Partial<Record<StepKey, any>>;

const MAX_KYC_STEP = 4;   // steps: 1=Personal, 2=Professional, 3=KYC docs, 4=Review, 5=Done

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProviderRegistrationPage() {

  /* ── App-level phase ──────────────────────────────────────────────────────── */
  const [phase, setPhase] = useState<AppPhase>("phone");

  /* ── Contact info from OTP phase ─────────────────────────────────────────── */
  const [verifiedContact, setVerifiedContact] = useState("");
  const [contactMode,     setContactMode]     = useState<ContactMode>("phone");
  const [whatsappLink,    setWhatsappLink]     = useState<string | undefined>();

  /**
   * Short-lived JWT issued by the backend after successful OTP verification.
   * Passed to KycController via X-Provider-Token header.
   */
  const [providerToken, setProviderToken] = useState<string | undefined>();

  /* ── KYC step state ───────────────────────────────────────────────────────── */
  const [currentStep, setCurrentStep] = useState(1);
  const [allData, setAllData] = useState<AllData>({
    personal:     {},
    professional: {},
    kyc:          {},
  });

  // ── Scroll helper ────────────────────────────────────────────────────────────
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  /* ═══════════════════════════════════════════════════════════════════════════
     OTP PHASE HANDLERS
  ═══════════════════════════════════════════════════════════════════════════ */

  /** Called by PhoneStep once OTP has been dispatched. */
  const handleOtpSent = useCallback(
    (contact: string, mode: ContactMode, waLink?: string) => {
      setVerifiedContact(contact);
      setContactMode(mode);
      setWhatsappLink(waLink);
      setPhase("otp");
      scrollTop();
    },
    [],
  );

  /** Called by OtpStep after the backend verifies the OTP. */
  const handleOtpVerified = useCallback((token: string) => {
    setProviderToken(token);
    setPhase("kyc");
    scrollTop();
  }, []);

  /** Go back to phone/email entry from OTP screen. */
  const handleChangeContact = useCallback(() => {
    setVerifiedContact("");
    setWhatsappLink(undefined);
    setPhase("phone");
    scrollTop();
  }, []);

  /* ═══════════════════════════════════════════════════════════════════════════
     KYC PHASE HANDLERS
  ═══════════════════════════════════════════════════════════════════════════ */

  const goTo = useCallback((step: number) => {
    setCurrentStep(Math.min(Math.max(step, 1), MAX_KYC_STEP + 1));
    scrollTop();
  }, []);

  const handleNext = useCallback(
    (key: StepKey, data: any) => {
      setAllData((prev) => ({ ...prev, [key]: data }));
      goTo(currentStep + 1);
    },
    [currentStep, goTo],
  );

  const handleSubmitSuccess = useCallback(() => {
    setCurrentStep(5);   // show Done step
    scrollTop();
  }, []);

  const resetFlow = useCallback(() => {
    setAllData({ personal: {}, professional: {}, kyc: {} });
    setCurrentStep(1);
    setVerifiedContact("");
    setProviderToken(undefined);
    setWhatsappLink(undefined);
    setPhase("phone");
    scrollTop();
  }, []);

  /* ═══════════════════════════════════════════════════════════════════════════
     KYC STEP RENDER
  ═══════════════════════════════════════════════════════════════════════════ */

  const renderKycStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            initialData={allData.personal}
            onNext={(data) => handleNext("personal", data)}
          />
        );
      case 2:
        return (
          <ProfessionalInfoStep
            initialData={allData.professional}
            onNext={(data) => handleNext("professional", data)}
            onBack={() => goTo(1)}
          />
        );
      case 3:
        return (
          <KYCStep
            initialData={allData.kyc}
            onNext={(data) => handleNext("kyc", data)}
            onBack={() => goTo(2)}
          />
        );
      case 4:
        return (
          <ReviewDone
            allData={allData}
            providerToken={providerToken}
            onSubmitSuccess={handleSubmitSuccess}
            onBack={() => goTo(3)}
            onGoToStep={goTo}
          />
        );
      case 5:
        return <DoneStep onRestart={resetFlow} />;
      default:
        return null;
    }
  };

  /* ═══════════════════════════════════════════════════════════════════════════
     PHASE ROUTING
  ═══════════════════════════════════════════════════════════════════════════ */

  if (phase === "phone") {
    return <PhoneStep onOtpSent={handleOtpSent} />;
  }

  if (phase === "otp") {
    return (
      <OtpStep
        contact={verifiedContact}
        mode={contactMode}
        whatsappLink={whatsappLink}
        onVerified={handleOtpVerified}
        onChangeContact={handleChangeContact}
      />
    );
  }

  // KYC phase
  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Hide step indicator on the Done step */}
        {currentStep < 5 && (
          <StepIndicator currentStep={currentStep} />
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 md:p-10">
          {renderKycStep()}
        </div>
      </div>

      <p className="text-center text-sm text-gray-500 mt-2 mb-8">
        Already have an account?{" "}
        <a href="/login" className="text-amber-500 font-medium hover:underline">
          Log in here
        </a>
      </p>
    </div>
  );
}

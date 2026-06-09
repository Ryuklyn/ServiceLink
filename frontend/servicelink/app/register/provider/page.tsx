// "use client";
//
// import { useState, useCallback, useEffect } from "react";
// import { useRouter } from "next/navigation";
//
// import StepIndicator from "@/components/kyc/StepIndicator";
// import PersonalInfoStep from "@/components/kyc/PersonalInfoStep";
// import ProfessionalInfoStep from "@/components/kyc/ProfessionalInfoStep";
// import KYCStep from "@/components/kyc/KycStep";
// import { ReviewDone } from "@/components/kyc/ReviewDone";
// import DoneStep from "@/components/kyc/DoneStep";
//
// // ─── Types ────────────────────────────────────────────────────────────────────
//
// type StepKey = "personal" | "professional" | "kyc";
// type AllData = Partial<Record<StepKey, any>>;
//
// const MAX_KYC_STEP = 4; // 1=Personal, 2=Professional, 3=KYC docs, 4=Review, 5=Done
//
// // ─── Component ────────────────────────────────────────────────────────────────
//
// /**
//  * KYC Registration Page  (/register/kyc)
//  *
//  * Responsibilities:
//  *  1. Read the short-lived provider JWT from sessionStorage (written by /register)
//  *  2. Guard against direct navigation without completing OTP (redirect back)
//  *  3. Run the multi-step KYC form:
//  *       Step 1 – Personal Info
//  *       Step 2 – Professional Info
//  *       Step 3 – KYC Documents
//  *       Step 4 – Review & Submit
//  *       Step 5 – Done
//  *
//  * sessionStorage keys consumed (written by the OTP page):
//  *   "provider_token"   – JWT string
//  *   "verified_contact" – phone/email string
//  *   "contact_mode"     – "phone" | "email"
//  */
// export default function KycPage() {
//   const router = useRouter();
//
//   /* ── Bootstrap from sessionStorage ───────────────────────────────────────── */
//   const [providerToken, setProviderToken] = useState<string | undefined>();
//   const [hydrated, setHydrated] = useState(false);
//
//   useEffect(() => {
//     const token = sessionStorage.getItem("provider_token") ?? undefined;
//
//     if (!token) {
//       // OTP was never completed — send the user back to the start.
//       router.replace("/register");
//       return;
//     }
//
//     setProviderToken(token);
//     setHydrated(true);
//   }, [router]);
//
//   /* ── KYC step state ───────────────────────────────────────────────────────── */
//   const [currentStep, setCurrentStep] = useState(1);
//   const [allData, setAllData] = useState<AllData>({
//     personal: {},
//     professional: {},
//     kyc: {},
//   });
//
//   // ── Scroll helper ────────────────────────────────────────────────────────────
//   const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });
//
//   /* ═══════════════════════════════════════════════════════════════════════════
//      HANDLERS
//   ═══════════════════════════════════════════════════════════════════════════ */
//
//   const goTo = useCallback((step: number) => {
//     setCurrentStep(Math.min(Math.max(step, 1), MAX_KYC_STEP + 1));
//     scrollTop();
//   }, []);
//
//   const handleNext = useCallback(
//     (key: StepKey, data: any) => {
//       setAllData((prev) => ({ ...prev, [key]: data }));
//       goTo(currentStep + 1);
//     },
//     [currentStep, goTo],
//   );
//
//   const handleSubmitSuccess = useCallback(() => {
//     // Clear the JWT from sessionStorage — it's no longer needed.
//     sessionStorage.removeItem("provider_token");
//     sessionStorage.removeItem("verified_contact");
//     sessionStorage.removeItem("contact_mode");
//
//     setCurrentStep(5); // Done step
//     scrollTop();
//   }, []);
//
//   const resetFlow = useCallback(() => {
//     // Full restart: clear everything and go back to the OTP page.
//     sessionStorage.removeItem("provider_token");
//     sessionStorage.removeItem("verified_contact");
//     sessionStorage.removeItem("contact_mode");
//
//     router.push("/register");
//   }, [router]);
//
//   /* ═══════════════════════════════════════════════════════════════════════════
//      STEP RENDERER
//   ═══════════════════════════════════════════════════════════════════════════ */
//
//   const renderKycStep = () => {
//     switch (currentStep) {
//       case 1:
//         return (
//           <PersonalInfoStep
//             initialData={allData.personal}
//             onNext={(data) => handleNext("personal", data)}
//           />
//         );
//       case 2:
//         return (
//           <ProfessionalInfoStep
//             initialData={allData.professional}
//             onNext={(data) => handleNext("professional", data)}
//             onBack={() => goTo(1)}
//           />
//         );
//       case 3:
//         return (
//           <KYCStep
//             initialData={allData.kyc}
//             onNext={(data) => handleNext("kyc", data)}
//             onBack={() => goTo(2)}
//           />
//         );
//       case 4:
//         return (
//           <ReviewDone
//             allData={allData}
//             providerToken={providerToken}
//             onSubmitSuccess={handleSubmitSuccess}
//             onBack={() => goTo(3)}
//             onGoToStep={goTo}
//           />
//         );
//       case 5:
//         return <DoneStep onRestart={resetFlow} />;
//       default:
//         return null;
//     }
//   };
//
//   /* ═══════════════════════════════════════════════════════════════════════════
//      RENDER
//   ═══════════════════════════════════════════════════════════════════════════ */
//
//   // Avoid flash of content while reading sessionStorage on the client.
//   if (!hydrated) return null;
//
//   return (
//     <div className="min-h-screen bg-[#f7f6f3]">
//       <div className="max-w-3xl mx-auto px-4 py-8">
//         {/* Hide step indicator on the Done step */}
//         {currentStep < 5 && <StepIndicator currentStep={currentStep} />}
//
//         <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 md:p-10">
//           {renderKycStep()}
//         </div>
//       </div>
//
//       <p className="text-center text-sm text-gray-500 mt-2 mb-8">
//         Already have an account?{" "}
//         <a href="/login" className="text-[#e8683f] font-medium hover:underline">
//           Log in here
//         </a>
//       </p>
//     </div>
//   );
// }


"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import StepIndicator from "@/components/kyc/StepIndicator";
import PersonalInfoStep from "@/components/kyc/PersonalInfoStep";
import ProfessionalInfoStep from "@/components/kyc/ProfessionalInfoStep";
import KYCStep from "@/components/kyc/KycStep";
import { ReviewDone } from "@/components/kyc/ReviewDone";
import DoneStep from "@/components/kyc/DoneStep";

// ─── Types ────────────────────────────────────────────────────────────────────

type StepKey = "personal" | "professional" | "kyc";
type StepData = Record<string, unknown>;
type AllData = Record<StepKey, StepData>;

const MAX_KYC_STEP = 4; // 1=Personal, 2=Professional, 3=KYC docs, 4=Review, 5=Done

// ─── Component ────────────────────────────────────────────────────────────────

export default function KycPage() {
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [allData, setAllData] = useState<AllData>({
    personal: {},
    professional: {},
    kyc: {},
  });

  // ── Scroll helper ──────────────────────────────────────────────────────────
  const scrollTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const goTo = useCallback((step: number) => {
    setCurrentStep(Math.min(Math.max(step, 1), MAX_KYC_STEP + 1));
    scrollTop();
  }, []);

  const handleNext = useCallback(
      (key: StepKey, data: StepData) => {
        setAllData((prev) => ({ ...prev, [key]: data }));
        goTo(currentStep + 1);
      },
      [currentStep, goTo],
  );

  // ── Called by ReviewDone after successful API submission ───────────────────
  // const handleSubmitSuccess = useCallback((token?: string) => {
  //   if (token) sessionStorage.setItem("provider_token", token);
  //   setCurrentStep(5);
  //   scrollTop();
  // }, []);
  const handleSubmitSuccess = useCallback(() => {
    setCurrentStep(5);
    scrollTop();
  }, []);

  const resetFlow = useCallback(() => {
    router.push("/register");
  }, [router]);

  // ── Step renderer ──────────────────────────────────────────────────────────
  const renderKycStep = () => {
    switch (currentStep) {
      case 1:
        return (
            <PersonalInfoStep
                initialData={allData.personal}
                onNext={(data: StepData) => handleNext("personal", data)}
            />
        );
      case 2:
        return (
            <ProfessionalInfoStep
                initialData={allData.professional}
                onNext={(data: StepData) => handleNext("professional", data)}
                onBack={() => goTo(1)}
            />
        );
      case 3:
        return (
            <KYCStep
                initialData={allData.kyc}
                onNext={(data: StepData) => handleNext("kyc", data)}
                onBack={() => goTo(2)}
            />
        );
      case 4:
        return (
            <ReviewDone
                allData={allData}
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

  return (
      <div className="min-h-screen bg-[#f7f6f3]">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {currentStep < 5 && <StepIndicator currentStep={currentStep} />}

          <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 md:p-10">
            {renderKycStep()}
          </div>
        </div>

        <p className="text-center text-sm text-gray-500 mt-2 mb-8">
          Already have an account?{" "}
          <a href="/login" className="text-[#e8683f] font-medium hover:underline">
            Log in here
          </a>
        </p>
      </div>
  );
}
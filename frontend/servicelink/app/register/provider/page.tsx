"use client";

import { useState } from "react";
// import StepIndicator from "@/components/kyc/StepIndicator";
// import PersonalInfoStep from "@/components/kyc/PersonalInfoStep";
// import ProfessionalInfoStep from "@/components/kyc/ProfessionalInfoStep";
// import KYCStep from "@/components/kyc/KYCStep";
// import PaymentStep from "@/components/kyc/PaymentStep";
// import { ReviewStep, DoneStep } from "@/components/kyc/ReviewDoneStep";

export default function ProviderRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [allData, setAllData] = useState({});

  const goTo = (step) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = (stepKey, data) => {
    setAllData((prev) => ({ ...prev, [stepKey]: data }));
    goTo(currentStep + 1);
  };

  const handleSubmit = () => {
    // TODO: Call your API here with `allData`
    console.log("Submitting KYC:", allData);
    setCurrentStep(6);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Step indicator — only shown during active steps */}
        {currentStep < 6 && <StepIndicator currentStep={currentStep} />}

        {/* Form card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-6 md:p-10">
          {currentStep === 1 && (
            <PersonalInfoStep onNext={(data) => handleNext("personal", data)} />
          )}

          {currentStep === 2 && (
            <ProfessionalInfoStep
              onNext={(data) => handleNext("professional", data)}
              onBack={() => goTo(1)}
            />
          )}

          {currentStep === 3 && (
            <KYCStep
              onNext={(data) => handleNext("kyc", data)}
              onBack={() => goTo(2)}
            />
          )}

          {currentStep === 4 && (
            <PaymentStep
              onNext={(data) => handleNext("payment", data)}
              onBack={() => goTo(3)}
            />
          )}

          {currentStep === 5 && (
            <ReviewStep
              allData={allData}
              onSubmit={handleSubmit}
              onBack={() => goTo(4)}
              onGoToStep={goTo}
            />
          )}

          {currentStep === 6 && (
            <DoneStep
              onRestart={() => {
                setCurrentStep(1);
                setAllData({});
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

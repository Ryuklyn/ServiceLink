// "use client";

// import { useState } from "react";
// import StepIndicator, { Step } from "@/components/business/StepIndicator";
// import OrganizationStep from "@/components/business/OrganizationStep";
// import WorkspaceStep from "@/components/business/WorkspaceStep";
// import AdminStep from "@/components/business/AdminStep";
// import VerificationStep from "@/components/business/VerificationStep";
// import PlanStep from "@/components/business/PlanStep";

// const STEPS: Step[] = [
//   { id: 1, label: "Organization" },
//   { id: 2, label: "Workspace" },
//   { id: 3, label: "Admin" },
//   { id: 4, label: "Verification" },
//   { id: 5, label: "Plan" },
// ];

// export default function BusinessRegisterPage() {
//   const [currentStep, setCurrentStep] = useState(1);

//   const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
//   const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

//   return (
//     <div className="min-h-screen bg-[#e8edf5] flex flex-col items-center justify-start py-4 px-4">
//       {/* Step indicator bar */}
//       <div className="w-full max-w-3xl">
//         <StepIndicator steps={STEPS} currentStep={currentStep} />
//       </div>

//       {/* Card */}
//       <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm p-8 mt-2">
//         {currentStep === 1 && (
//           <OrganizationStep onContinue={goNext} onBack={goBack} />
//         )}
//         {currentStep === 2 && (
//           <WorkspaceStep onContinue={goNext} onBack={goBack} />
//         )}
//         {currentStep === 3 && <AdminStep onContinue={goNext} onBack={goBack} />}
//         {currentStep === 4 && (
//           <VerificationStep onContinue={goNext} onBack={goBack} />
//         )}
//         {currentStep === 5 && (
//           <PlanStep
//             onContinue={() => alert("Workspace created!")}
//             onBack={goBack}
//           />
//         )}
//       </div>

//       {/* Footer note */}
//       <p className="text-xs text-gray-500 mt-5">
//         By continuing you agree to our{" "}
//         <a href="#" className="underline hover:text-gray-700">
//           Terms
//         </a>{" "}
//         and{" "}
//         <a href="#" className="underline hover:text-gray-700">
//           Privacy Policy
//         </a>
//         .
//       </p>
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import StepIndicator, { Step } from "@/components/business/StepIndicator";
import OrganizationStep from "@/components/business/OrganizationStep";
import WorkspaceStep from "@/components/business/WorkspaceStep";
import AdminStep from "@/components/business/AdminStep";
import VerificationStep from "@/components/business/VerificationStep";
import PlanStep from "@/components/business/PlanStep";
import WorkspaceReady from "@/components/business/WorkspaceReady";

const STEPS: Step[] = [
  { id: 1, label: "Organization" },
  { id: 2, label: "Workspace" },
  { id: 3, label: "Admin" },
  { id: 4, label: "Verification" },
  { id: 5, label: "Plan" },
];

export default function BusinessRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [done, setDone] = useState(false);

  const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  // Show success page — no step indicator
  if (done) {
    return <WorkspaceReady workspaceName="Acme HQ" />;
  }

  return (
    <div className="min-h-screen bg-[#e8edf5] flex flex-col items-center justify-start py-4 px-4">
      {/* Step indicator bar */}
      <div className="w-full max-w-3xl">
        <StepIndicator steps={STEPS} currentStep={currentStep} />
      </div>

      {/* Card */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm p-8 mt-2">
        {currentStep === 1 && (
          <OrganizationStep onContinue={goNext} onBack={goBack} />
        )}
        {currentStep === 2 && (
          <WorkspaceStep onContinue={goNext} onBack={goBack} />
        )}
        {currentStep === 3 && <AdminStep onContinue={goNext} onBack={goBack} />}
        {currentStep === 4 && (
          <VerificationStep onContinue={goNext} onBack={goBack} />
        )}
        {currentStep === 5 && (
          <PlanStep onContinue={() => setDone(true)} onBack={goBack} />
        )}
      </div>

      {/* Footer note */}
      <p className="text-xs text-gray-500 mt-5">
        By continuing you agree to our{" "}
        <a href="#" className="underline hover:text-gray-700">
          Terms
        </a>{" "}
        and{" "}
        <a href="#" className="underline hover:text-gray-700">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";
// import StepIndicator, { Step } from "@/components/business/StepIndicator";
// import OrganizationStep from "@/components/business/OrganizationStep";
// import WorkspaceStep from "@/components/business/WorkspaceStep";
// import AdminStep from "@/components/business/AdminStep";
// import VerificationStep from "@/components/business/VerificationStep";
// import PlanStep, { PlanCheckout } from "@/components/business/PlanStep";
// import PaymentRedirecting from "@/components/business/payment/PaymentRedirecting";
// import PaymentSuccess from "@/components/business/payment/PaymentSuccess";

// const STEPS: Step[] = [
//   { id: 1, label: "Organization" },
//   { id: 2, label: "Workspace" },
//   { id: 3, label: "Admin" },
//   { id: 4, label: "Verification" },
//   { id: 5, label: "Plan" },
// ];

// export default function BusinessRegisterPage() {
//   const [currentStep, setCurrentStep] = useState(1);
//   const [paymentStatus, setPaymentStatus] = useState<
//     "idle" | "redirecting" | "success"
//   >("idle");
//   const [selectedPlan, setSelectedPlan] = useState<PlanCheckout | null>(null);
//   const [organizationId, setOrganizationId] = useState<string | null>(null);
//   const workspaceName = "TRukesh";
//   const referenceId = "SLP-2026-019502";

//   const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
//   const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
//   const handleOrganizationCreated = (orgId: string) => {
//     setOrganizationId(orgId);
//     goNext();
//   };

//   useEffect(() => {
//     if (paymentStatus !== "redirecting") {
//       return;
//     }

//     const timer = window.setTimeout(() => {
//       setPaymentStatus("success");
//     }, 2400);

//     return () => window.clearTimeout(timer);
//   }, [paymentStatus]);

//   const startPayment = (plan: PlanCheckout) => {
//     setSelectedPlan(plan);
//     setPaymentStatus("redirecting");
//   };

//   if (paymentStatus === "redirecting" && selectedPlan) {
//     return (
//       <PaymentRedirecting
//         plan={selectedPlan}
//         workspaceName={workspaceName}
//         referenceId={referenceId}
//       />
//     );
//   }

//   if (paymentStatus === "success" && selectedPlan) {
//     return (
//       <PaymentSuccess
//         plan={selectedPlan}
//         workspaceName={workspaceName}
//         referenceId={referenceId}
//       />
//     );
//   }

//   return (
//     <div className="flex min-h-screen flex-col items-center justify-start bg-[#e8edf5] px-4 py-4">
//       <div className="w-full max-w-3xl">
//         <StepIndicator steps={STEPS} currentStep={currentStep} />
//       </div>

//       <div className="mt-2 w-full max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
//         {currentStep === 1 && (
//           <OrganizationStep
//             onContinue={handleOrganizationCreated}
//             onBack={goBack}
//           />
//         )}
//         {currentStep === 2 && (
//           <WorkspaceStep
//             onContinue={goNext}
//             onBack={goBack}
//             organizationId={organizationId}
//           />
//         )}
//         {currentStep === 3 && <AdminStep onContinue={goNext} onBack={goBack} />}
//         {currentStep === 4 && (
//           <VerificationStep onContinue={goNext} onBack={goBack} />
//         )}
//         {currentStep === 5 && (
//           <PlanStep onContinue={startPayment} onBack={goBack} />
//         )}
//       </div>

//       <p className="mt-5 text-xs text-gray-500">
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

import { useEffect, useState } from "react";
import StepIndicator, { Step } from "@/components/business/StepIndicator";
import OrganizationStep from "@/components/business/OrganizationStep";
import WorkspaceStep from "@/components/business/WorkspaceStep";
import AdminStep from "@/components/business/AdminStep";
import VerificationStep from "@/components/business/VerificationStep";
import PlanStep, { PlanCheckout } from "@/components/business/PlanStep";
import PaymentRedirecting from "@/components/business/payment/PaymentRedirecting";
import PaymentSuccess from "@/components/business/payment/PaymentSuccess";

const STEPS: Step[] = [
  { id: 1, label: "Organization" },
  { id: 2, label: "Workspace" },
  { id: 3, label: "Admin" },
  { id: 4, label: "Verification" },
  { id: 5, label: "Plan" },
];

export default function BusinessRegisterPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "redirecting" | "success"
  >("idle");
  const [selectedPlan, setSelectedPlan] = useState<PlanCheckout | null>(null);

  // IDs accumulated across steps — passed as props, no context needed
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);

  // TODO: replace referenceId with a real value from the API
  const referenceId = "SLP-2026-019502";

  const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleOrganizationCreated = (orgId: string) => {
    setOrganizationId(orgId);
    goNext();
  };

  const handleWorkspaceCreated = (wsId: string, wsName: string) => {
    setWorkspaceId(wsId);
    setWorkspaceName(wsName);
    goNext();
  };

  const startPayment = (plan: PlanCheckout) => {
    setSelectedPlan(plan);
    setPaymentStatus("redirecting");
  };

  useEffect(() => {
    if (paymentStatus !== "redirecting") return;

    const timer = window.setTimeout(() => {
      setPaymentStatus("success");
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [paymentStatus]);

  // ─────────────────────────────────────────────────────
  // Payment screens
  // ─────────────────────────────────────────────────────
  if (paymentStatus === "redirecting" && selectedPlan) {
    return (
      <PaymentRedirecting
        plan={selectedPlan}
        workspaceName={workspaceName ?? "Your Workspace"}
        referenceId={referenceId}
      />
    );
  }

  if (paymentStatus === "success" && selectedPlan) {
    return (
      <PaymentSuccess
        plan={selectedPlan}
        workspaceName={workspaceName ?? "Your Workspace"}
        referenceId={referenceId}
      />
    );
  }

  // ─────────────────────────────────────────────────────
  // Main registration flow
  // ─────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-[#e8edf5] px-4 py-4">
      <div className="w-full max-w-3xl">
        <StepIndicator steps={STEPS} currentStep={currentStep} />
      </div>

      <div className="mt-2 w-full max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        {currentStep === 1 && (
          <OrganizationStep
            onContinue={handleOrganizationCreated}
            onBack={goBack}
          />
        )}
        {currentStep === 2 && (
          <WorkspaceStep
            onContinue={handleWorkspaceCreated}
            onBack={goBack}
            organizationId={organizationId}
          />
        )}
        {currentStep === 3 && (
          <AdminStep
            onContinue={goNext}
            onBack={goBack}
            workspaceId={workspaceId}
          />
        )}
        {currentStep === 4 && (
          <VerificationStep
            onContinue={goNext}
            onBack={goBack}
            organizationId={organizationId}
          />
        )}
        {currentStep === 5 && (
          <PlanStep
            onContinue={startPayment}
            onBack={goBack}
            workspaceId={workspaceId}
            workspaceName={workspaceName}
          />
        )}
      </div>

      <p className="mt-5 text-xs text-gray-500">
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

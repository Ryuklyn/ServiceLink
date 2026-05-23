"use client";

import { useState } from "react";
import { useBusinessSetup } from "@/hooks/useBusinessSetup";
import StepIndicator, { Step } from "@/components/business/StepIndicator";
import OrganizationStep from "@/components/business/OrganizationStep";
import WorkspaceStep from "@/components/business/WorkspaceStep";
import AdminStep from "@/components/business/AdminStep";
import VerificationStep from "@/components/business/VerificationStep";
import PlanStep from "@/components/business/PlanStep";
import { BusinessSetupProvider } from "@/contexts/BusinessSetupContext";

const STEPS: Step[] = [
  { id: 1, label: "Organization" },
  { id: 2, label: "Workspace" },
  { id: 3, label: "Admin" },
  { id: 4, label: "Verification" },
  { id: 5, label: "Plan" },
];

function BusinessRegisterContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const { data, setOrganization, setWorkspace } = useBusinessSetup();

  const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleOrganizationContinue = (
    orgId: string,
    organizationName: string,
  ) => {
    setOrganization(Number(orgId), organizationName);
    goNext();
  };

  const handleWorkspaceContinue = (
    workspaceId: string,
    workspaceName: string,
  ) => {
    setWorkspace(Number(workspaceId), workspaceName);
    goNext();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-[#e8edf5] px-4 py-4">
      <div className="w-full max-w-3xl">
        <StepIndicator steps={STEPS} currentStep={currentStep} />
      </div>

      <div className="mt-2 w-full max-w-3xl rounded-2xl bg-white p-8 shadow-sm">
        {currentStep === 1 && (
          <OrganizationStep
            onContinue={handleOrganizationContinue}
            onBack={goBack}
          />
        )}
        {currentStep === 2 && (
          <WorkspaceStep
            onContinue={handleWorkspaceContinue}
            onBack={goBack}
            organizationId={
              data.organizationId ? String(data.organizationId) : null
            }
          />
        )}
        {currentStep === 3 && (
          <AdminStep
            onContinue={goNext}
            onBack={goBack}
            workspaceId={data.workspaceId ? String(data.workspaceId) : null}
          />
        )}
        {currentStep === 4 && (
          <VerificationStep
            onContinue={goNext}
            onBack={goBack}
            organizationId={
              data.organizationId ? String(data.organizationId) : null
            }
          />
        )}
        {currentStep === 5 && (
          <PlanStep
            onContinue={() => goNext()}
            onBack={goBack}
            workspaceId={data.workspaceId ? String(data.workspaceId) : null}
            workspaceName={data.workspaceName}
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

export default function BusinessRegisterPage() {
  return (
    <BusinessSetupProvider>
      <BusinessRegisterContent />
    </BusinessSetupProvider>
  );
}

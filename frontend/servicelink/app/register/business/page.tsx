"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBusinessSetup } from "@/hooks/useBusinessSetup";
import StepIndicator, { Step } from "@/components/business/StepIndicator";
import OrganizationStep from "@/components/business/OrganizationStep";
import WorkspaceStep from "@/components/business/WorkspaceStep";
import AdminStep from "@/components/business/AdminStep";
import VerificationStep from "@/components/business/VerificationStep";
import PlanStep from "@/components/business/PlanStep";
import { BusinessSetupProvider } from "@/contexts/BusinessSetupContext";
import api from "@/utils/axios";

const STEPS: Step[] = [
  { id: 1, label: "Organization" },
  { id: 2, label: "Workspace" },
  { id: 3, label: "Admin" },
  { id: 4, label: "Verification" },
  { id: 5, label: "Plan" },
];

// Maps RegistrationSession.lastCompletedStep (set by the backend after each
// step's Redis update) to the wizard step the user should land on next.
const STEP_AFTER: Record<string, number> = {
  ORGANIZATION: 2,
  WORKSPACE: 3,
  ADMIN: 4,
  VERIFICATION: 5,
};

const RESUME_KEY = "business_org_id";

function BusinessRegisterContent() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [resuming, setResuming] = useState(true);
  const { data, setOrganization, setWorkspace, resetSetup } =
      useBusinessSetup();

  // On mount: if a previous session left an organization id behind, ask the
  // backend (Redis-backed) how far that signup got, and jump straight there
  // instead of restarting from Step 1.
  useEffect(() => {
    const savedOrgId = localStorage.getItem(RESUME_KEY);
    if (!savedOrgId) {
      setResuming(false);
      return;
    }

    api
        .get(`/business/registration/resume/${savedOrgId}`)
        .then((res) => {
          const session = res.data;

          if (session.organizationId) {
            setOrganization(session.organizationId, data.organizationName ?? "");
          }
          if (session.workspaceId) {
            setWorkspace(session.workspaceId, data.workspaceName ?? "");
          }

          setCurrentStep(STEP_AFTER[session.lastCompletedStep] ?? 1);
        })
        .catch(() => {
          // Session expired (24h TTL) or never existed — start fresh.
          localStorage.removeItem(RESUME_KEY);
        })
        .finally(() => setResuming(false));
    // Intentionally run once on mount only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goNext = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const goBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleOrganizationContinue = (
      orgId: string,
      organizationName: string,
  ) => {
    setOrganization(Number(orgId), organizationName);
    localStorage.setItem(RESUME_KEY, orgId);
    goNext();
  };

  const handleWorkspaceContinue = (
      workspaceId: string,
      workspaceName: string,
  ) => {
    setWorkspace(Number(workspaceId), workspaceName);
    goNext();
  };

  const handleSignupComplete = () => {
    // Registration finished — SubscriptionService already cleared the
    // Redis session server-side; clear the client-side resume pointer too.
    localStorage.removeItem(RESUME_KEY);
    resetSetup();
    router.push("/dashboard/business");
  };

  if (resuming) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-[#e8edf5]">
          <p className="text-sm text-gray-400">
            Checking for an in-progress setup...
          </p>
        </div>
    );
  }

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
                  organizationId={
                    data.organizationId ? String(data.organizationId) : null
                  }
              />
          )}
          {currentStep === 2 && (
              <WorkspaceStep
                  onContinue={handleWorkspaceContinue}
                  onBack={goBack}
                  organizationId={
                    data.organizationId ? String(data.organizationId) : null
                  }
                  workspaceId={data.workspaceId ? String(data.workspaceId) : null}
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
                  onContinue={handleSignupComplete}
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
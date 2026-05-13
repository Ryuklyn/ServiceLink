import { Check } from "lucide-react";

export type StepStatus = "completed" | "active" | "upcoming";

export interface Step {
  id: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

function getStatus(stepId: number, currentStep: number): StepStatus {
  if (stepId < currentStep) return "completed";
  if (stepId === currentStep) return "active";
  return "upcoming";
}

export default function StepIndicator({
  steps,
  currentStep,
}: StepIndicatorProps) {
  return (
    <div className="flex items-start justify-center w-full px-4 py-5">
      {steps.map((step, index) => {
        const status = getStatus(step.id, currentStep);

        return (
          <div key={step.id} className="flex items-start">
            {/* ── Step node (circle + label stacked) ── */}
            <div className="flex flex-col items-center gap-1.5">
              {/* ── Circle with optional halo ring ── */}
              {status === "active" ? (
                // Active: salmon halo ring → orange inner circle
                <div className="w-14 h-14 rounded-full bg-[#e8683f]/15 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-[#e8683f] flex items-center justify-center text-sm font-semibold text-white shadow-sm">
                    {step.id}
                  </div>
                </div>
              ) : status === "completed" ? (
                // Completed: navy circle, no halo
                <div className="w-14 h-14 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-[#1e3a8a] flex items-center justify-center shadow-sm">
                    <Check size={14} strokeWidth={3} className="text-white" />
                  </div>
                </div>
              ) : (
                // Upcoming: muted blue-gray circle, no halo
                <div className="w-14 h-14 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-[#1e3a8a]/10 flex items-center justify-center text-sm font-semibold text-[#1e3a8a]/45">
                    {step.id}
                  </div>
                </div>
              )}

              {/* ── Label below circle ── */}
              <span
                className={`
                  text-xs font-medium text-center leading-tight max-w-[72px]
                  ${status === "active" ? "text-[#1e3a8a] font-semibold" : ""}
                  ${status === "completed" ? "text-[#1e3a8a]" : ""}
                  ${status === "upcoming" ? "text-[#1e3a8a]/45" : ""}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* ── Connector line — vertically centred to the circle row ── */}
            {index < steps.length - 1 && (
              <div
                className={`
                  h-[2px] w-8 sm:w-14 mx-1
                  mt-7          /* aligns with vertical centre of the 56px (w-14) circle row */
                  ${step.id < currentStep ? "bg-[#1e3a8a]" : "bg-[#1e3a8a]/20"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

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
    <div className="flex items-center justify-center gap-0 w-full px-4 py-5">
      {steps.map((step, index) => {
        const status = getStatus(step.id, currentStep);
        return (
          <div key={step.id} className="flex items-center">
            {/* Step node */}
            <div className="flex items-center gap-2">
              {/* Circle */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${status === "completed" ? "bg-[#1e2d5a] text-white" : ""}
                  ${status === "active" ? "bg-[#f26522] text-white" : ""}
                  ${status === "upcoming" ? "bg-white border-2 border-gray-300 text-gray-400" : ""}
                `}
              >
                {status === "completed" ? (
                  <Check size={14} strokeWidth={3} />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              {/* Label */}
              <span
                className={`
                  text-sm font-medium hidden sm:block
                  ${status === "completed" ? "text-[#1e2d5a]" : ""}
                  ${status === "active" ? "text-[#1e2d5a] font-semibold" : ""}
                  ${status === "upcoming" ? "text-gray-400" : ""}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {index < steps.length - 1 && (
              <div
                className={`
                  w-8 sm:w-12 h-[2px] mx-2
                  ${step.id < currentStep ? "bg-[#1e2d5a]" : "bg-gray-300"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

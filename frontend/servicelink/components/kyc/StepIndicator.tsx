// "use client";

// import { Check } from "lucide-react";

// const steps = [
//   { id: 1, label: "Personal" },
//   { id: 2, label: "Professional" },
//   { id: 3, label: "KYC" },
//   { id: 4, label: "Review" },
//   { id: 5, label: "Done" },
// ];

// export default function StepIndicator({ currentStep = 1 }) {
//   return (
//     <div className="w-full flex justify-center">
//       {/* Step Row */}
//       <div className="inline-flex items-center gap-2">
//         {steps.map((step, index) => {
//           const isCompleted = step.id < currentStep;
//           const isActive = step.id === currentStep;

//           return (
//             <div key={step.id} className="flex items-center">
//               {/* Circle + Label */}
//               <div className="flex flex-col items-center relative z-10">
//                 <div
//                   className={`
//                     w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
//                     ${
//                       isActive
//                         ? "bg-amber-500 text-white shadow"
//                         : isCompleted
//                           ? "bg-amber-500 text-white"
//                           : "bg-stone-200 text-stone-500"
//                     }
//                   `}
//                 >
//                   {isCompleted ? (
//                     <Check className="w-4 h-4" strokeWidth={3} />
//                   ) : (
//                     step.id
//                   )}
//                 </div>

//                 <span
//                   className={`
//                     mt-2 text-xs font-medium mb-4
//                     ${
//                       isActive
//                         ? "text-amber-600"
//                         : isCompleted
//                           ? "text-amber-500"
//                           : "text-stone-400"
//                     }
//                   `}
//                 >
//                   {step.label}
//                 </span>
//               </div>
//               {/* Line */}
//               {/* {index !== steps.length - 1 && (
//                 <div className="flex-1 flex items-center">
//                   <div className="w-full h-[2px] bg-stone-200 relative">
//                     <div
//                       className={`
//           absolute top-0 left-0 h-full transition-all duration-300
//           ${step.id < currentStep ? "bg-amber-500 w-full" : "w-0"}
//         `}
//                     />
//                   </div>
//                 </div>
//               )} */}
//               {index !== steps.length - 1 && (
//                 <div className="flex items-center mx-4">
//                   <div className="w-16 h-[2px] bg-stone-200 relative">
//                     <div
//                       className={`absolute top-0 left-0 h-full transition-all duration-300
//                         ${step.id < currentStep ? "bg-amber-500 w-full" : "w-0"}
//                       `}
//                     />
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }

"use client";
import { memo } from "react";
import { Check } from "lucide-react";

const steps = [
  { id: 1, label: "Personal" },
  { id: 2, label: "Professional" },
  { id: 3, label: "KYC" },
  { id: 4, label: "Review" },
  { id: 5, label: "Done" },
];

const StepIndicator = memo(function StepIndicator({
  currentStep = 1,
}: {
  currentStep?: number;
}) {
  return (
    <nav
      aria-label="Registration progress"
      className="w-full flex justify-center mb-6"
    >
      <ol className="inline-flex items-center gap-2" role="list">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <li key={step.id} className="flex items-center">
              <div className="flex flex-col items-center relative z-10">
                <div
                  aria-current={isActive ? "step" : undefined}
                  aria-label={`${step.label}${isCompleted ? ", completed" : isActive ? ", current step" : ""}`}
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    transition-all duration-300
                    ${
                      isActive
                        ? "bg-amber-500 text-white shadow-sm shadow-amber-200"
                        : isCompleted
                          ? "bg-amber-500 text-white"
                          : "bg-stone-200 text-stone-500"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check
                      className="w-4 h-4"
                      strokeWidth={3}
                      aria-hidden="true"
                    />
                  ) : (
                    <span aria-hidden="true">{step.id}</span>
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium mb-4
                  ${
                    isActive
                      ? "text-amber-600"
                      : isCompleted
                        ? "text-amber-500"
                        : "text-stone-400"
                  }
                `}
                >
                  {step.label}
                </span>
              </div>

              {index !== steps.length - 1 && (
                <div className="flex items-center mx-4 mb-4" aria-hidden="true">
                  <div className="w-16 h-[2px] bg-stone-200 relative overflow-hidden">
                    <div
                      className={`
                      absolute inset-y-0 left-0 transition-all duration-500 ease-out
                      ${step.id < currentStep ? "w-full bg-amber-500" : "w-0"}
                    `}
                    />
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
});

export default StepIndicator;

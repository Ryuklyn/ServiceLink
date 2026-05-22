// "use client";

// import { useState } from "react";
// import { Check, CreditCard, Sparkles } from "lucide-react";
// import PaymentModal from "@/components/business/payment/PaymentModal";
// import { useBusinessSetup } from "@/hooks/useBusinessSetup";
// import api from "@/utils/axios";
// import { toast } from "react-toastify";

// export interface PlanCheckout {
//   id: string;
//   name: string;
//   price: string;
//   priceLabel: string;
//   amountNpr: number;
// }

// interface Plan extends PlanCheckout {
//   description: string;
//   features: string[];
//   popular?: boolean;
//   custom?: boolean;
// }

// const PLANS: Plan[] = [
//   {
//     id: "starter",
//     name: "Starter",
//     price: "NPR 1,999",
//     priceLabel: "per month",
//     amountNpr: 1999,
//     description: "For small teams getting started with service operations.",
//     features: [
//       "14-day free trial",
//       "1 branch location",
//       "Up to 3 team members",
//       "Basic service requests",
//       "Email notifications",
//     ],
//   },
//   {
//     id: "growth",
//     name: "Growth",
//     price: "NPR 4,999",
//     priceLabel: "per month",
//     amountNpr: 4999,
//     description: "Scaling operations with verified vendors and reporting.",
//     features: [
//       "Up to 20 team members",
//       "Up to 10 branch locations",
//       "Vendor verification",
//       "Analytics & reporting",
//       "Asset tracking",
//     ],
//     popular: true,
//   },
//   {
//     id: "enterprise",
//     name: "Enterprise",
//     price: "Custom",
//     priceLabel: "tailored pricing",
//     amountNpr: 0,
//     description: "Mission-critical operations with security and SSO.",
//     features: [
//       "Unlimited members",
//       "Unlimited branches",
//       "Dedicated Support",
//       "Advanced Analytics",
//       "Custom Integrations",
//     ],
//     custom: true,
//   },
// ];

// interface PlanStepProps {
//   onContinue: () => void;
//   onBack: () => void;
// }

// export default function PlanStep({ onContinue, onBack }: PlanStepProps) {
//   const { data, setSubscription } = useBusinessSetup();

//   const [selectedPlanId, setSelectedPlanId] = useState("growth");
//   const [isPaymentOpen, setIsPaymentOpen] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const selectedPlan =
//     PLANS.find((plan) => plan.id === selectedPlanId) ?? PLANS[0];

//   const openPayment = () => {
//     if (selectedPlan.custom) {
//       toast.error("Enterprise plan requires manual contact");
//       return;
//     }

//     // Create subscription first
//     handleCreateSubscription();
//   };

//   const handleCreateSubscription = async () => {
//     try {
//       setLoading(true);

//       if (!data.workspaceId) {
//         toast.error("Workspace ID not found");
//         return;
//       }

//       const payload = {
//         workspaceId: data.workspaceId,
//         planType: selectedPlan.id.toUpperCase(),
//         amountNpr: selectedPlan.amountNpr,
//       };

//       const response = await api.post(
//         "/business/payment/subscription",
//         payload,
//       );

//       console.log("Subscription Created:", response.data);

//       // Save to context
//       setSubscription(
//         response.data.id,
//         selectedPlan.id.toUpperCase(),
//         selectedPlan.amountNpr,
//       );

//       // Open payment modal
//       setIsPaymentOpen(true);
//     } catch (error: any) {
//       console.error("Create Subscription Error:", error);
//       const errorMessage =
//         error?.response?.data?.message ||
//         error?.message ||
//         "Failed to create subscription";
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const startPayment = () => {
//     setIsPaymentOpen(false);
//     onContinue();
//   };

//   return (
//     <div className="w-full">
//       <div className="mb-8 flex items-start gap-4">
//         <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8edf8]">
//           <Sparkles size={22} className="text-[#1e3a8a]" />
//         </div>
//         <div>
//           <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[#e8683f]">
//             Step 5 of 5
//           </p>
//           <h1 className="text-[28px] font-extrabold leading-tight text-[#1e3a8a]">
//             Choose your plan
//           </h1>
//           <p className="mt-1 text-sm text-gray-500">
//             Start free for 14 days. No credit card required. Change anytime.
//           </p>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
//         {PLANS.map((plan) => {
//           const isSelected = selectedPlanId === plan.id;
//           return (
//             <div
//               key={plan.id}
//               onClick={() => setSelectedPlanId(plan.id)}
//               className={`relative cursor-pointer rounded-xl border-2 p-5 transition ${
//                 isSelected
//                   ? "border-[#1e3a8a]"
//                   : "border-gray-200 hover:border-gray-300"
//               }`}
//             >
//               {plan.popular && (
//                 <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#e8683f] px-3 py-1 text-xs font-bold text-white">
//                   <Sparkles size={10} />
//                   POPULAR
//                 </div>
//               )}

//               <div className="mb-3 flex items-start justify-between">
//                 <h3 className="text-base font-bold text-[#1e3a8a]">
//                   {plan.name}
//                 </h3>
//                 <div
//                   className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
//                     isSelected
//                       ? "border-[#1e3a8a] bg-[#1e3a8a]"
//                       : "border-gray-300 bg-white"
//                   }`}
//                 >
//                   {isSelected && (
//                     <div className="h-2 w-2 rounded-full bg-white" />
//                   )}
//                 </div>
//               </div>

//               <div className="mb-1 flex flex-col">
//                 <span
//                   className={`font-extrabold text-[#1e3a8a] ${
//                     plan.custom ? "text-2xl" : "text-3xl"
//                   }`}
//                 >
//                   {plan.price}
//                 </span>
//                 <span className="mt-1 text-xs text-gray-500">
//                   {plan.priceLabel}
//                 </span>
//               </div>

//               <p className="mb-4 text-xs leading-snug text-gray-500">
//                 {plan.description}
//               </p>

//               <div className="mb-4 border-t border-gray-100" />

//               <ul className="space-y-2">
//                 {plan.features.map((feature) => (
//                   <li key={feature} className="flex items-start gap-2">
//                     <Check
//                       size={14}
//                       className="mt-0.5 shrink-0 text-[#1e3a8a]"
//                       strokeWidth={3}
//                     />
//                     <span className="text-xs text-gray-700">{feature}</span>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           );
//         })}
//       </div>

//       <div className="my-7 border-t border-gray-200" />

//       <div className="flex items-center justify-between">
//         <button
//           onClick={onBack}
//           className="flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-700"
//         >
//           <span aria-hidden="true">&larr;</span> Back
//         </button>
//         <button
//           onClick={openPayment}
//           disabled={selectedPlan.custom || loading}
//           className="flex items-center gap-2 rounded-lg bg-[#e8683f] px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(232,104,63,0.2)] transition hover:bg-[#d95a2f] disabled:cursor-not-allowed disabled:bg-gray-300"
//         >
//           <CreditCard size={16} />
//           {loading ? "Creating Subscription..." : "Proceed to Payment"}
//         </button>
//       </div>

//       <PaymentModal
//         isOpen={isPaymentOpen}
//         plan={selectedPlan}
//         workspaceName={data.workspaceName || "Your Workspace"}
//         subscriptionId={data.subscriptionId}
//         onClose={() => setIsPaymentOpen(false)}
//         onContinue={startPayment}
//       />
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { Check, CreditCard, Sparkles } from "lucide-react";
import PaymentModal from "@/components/business/payment/PaymentModal";
import api from "@/utils/axios";
import { toast } from "react-toastify";

export interface PlanCheckout {
  id: string;
  name: string;
  price: string;
  priceLabel: string;
  amountNpr: number;
}

interface Plan extends PlanCheckout {
  description: string;
  features: string[];
  popular?: boolean;
  custom?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "NPR 1,999",
    priceLabel: "per month",
    amountNpr: 1999,
    description: "For small teams getting started with service operations.",
    features: [
      "14-day free trial",
      "1 branch location",
      "Up to 3 team members",
      "Basic service requests",
      "Email notifications",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: "NPR 4,999",
    priceLabel: "per month",
    amountNpr: 4999,
    description: "Scaling operations with verified vendors and reporting.",
    features: [
      "Up to 20 team members",
      "Up to 10 branch locations",
      "Vendor verification",
      "Analytics & reporting",
      "Asset tracking",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    priceLabel: "tailored pricing",
    amountNpr: 0,
    description: "Mission-critical operations with security and SSO.",
    features: [
      "Unlimited members",
      "Unlimited branches",
      "Dedicated Support",
      "Advanced Analytics",
      "Custom Integrations",
    ],
    custom: true,
  },
];

interface PlanStepProps {
  onContinue: (plan: PlanCheckout) => void;
  onBack: () => void;
  workspaceId: string | null;
  workspaceName: string | null;
}

export default function PlanStep({
  onContinue,
  onBack,
  workspaceId,
  workspaceName,
}: PlanStepProps) {
  const [selectedPlanId, setSelectedPlanId] = useState("growth");
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId) ?? PLANS[0];

  // ─────────────────────────────────────────────────────
  // Handlers
  // ─────────────────────────────────────────────────────
  const openPayment = async () => {
    if (selectedPlan.custom) {
      toast.error("Enterprise plan requires manual contact");
      return;
    }

    if (!workspaceId) {
      toast.error("Workspace ID not found");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/business/payment/subscription", {
        workspaceId,
        planType: selectedPlan.id.toUpperCase(),
        amountNpr: selectedPlan.amountNpr,
      });

      setSubscriptionId(response.data.id);
      setIsPaymentOpen(true);
    } catch (error: any) {
      console.error("Create Subscription Error:", error);
      toast.error(
        error?.response?.data?.message ??
          error?.message ??
          "Failed to create subscription",
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirmed = () => {
    setIsPaymentOpen(false);
    onContinue(selectedPlan);
  };

  // ─────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────
  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e8edf8]">
          <Sparkles size={22} className="text-[#1e3a8a]" />
        </div>
        <div>
          <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-[#e8683f]">
            Step 5 of 5
          </p>
          <h1 className="text-[28px] font-extrabold leading-tight text-[#1e3a8a]">
            Choose your plan
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Start free for 14 days. No credit card required. Change anytime.
          </p>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PLANS.map((plan) => {
          const isSelected = selectedPlanId === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              className={`relative cursor-pointer rounded-xl border-2 p-5 transition ${
                isSelected
                  ? "border-[#1e3a8a]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-[#e8683f] px-3 py-1 text-xs font-bold text-white">
                  <Sparkles size={10} />
                  POPULAR
                </div>
              )}

              <div className="mb-3 flex items-start justify-between">
                <h3 className="text-base font-bold text-[#1e3a8a]">
                  {plan.name}
                </h3>
                <div
                  className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition ${
                    isSelected
                      ? "border-[#1e3a8a] bg-[#1e3a8a]"
                      : "border-gray-300 bg-white"
                  }`}
                >
                  {isSelected && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
              </div>

              <div className="mb-1 flex flex-col">
                <span
                  className={`font-extrabold text-[#1e3a8a] ${
                    plan.custom ? "text-2xl" : "text-3xl"
                  }`}
                >
                  {plan.price}
                </span>
                <span className="mt-1 text-xs text-gray-500">
                  {plan.priceLabel}
                </span>
              </div>

              <p className="mb-4 text-xs leading-snug text-gray-500">
                {plan.description}
              </p>

              <div className="mb-4 border-t border-gray-100" />

              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      size={14}
                      className="mt-0.5 shrink-0 text-[#1e3a8a]"
                      strokeWidth={3}
                    />
                    <span className="text-xs text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="my-7 border-t border-gray-200" />

      {/* Footer */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-gray-700"
        >
          <span aria-hidden="true">&larr;</span> Back
        </button>
        <button
          onClick={openPayment}
          disabled={selectedPlan.custom || loading}
          className="flex items-center gap-2 rounded-lg bg-[#e8683f] px-7 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(232,104,63,0.2)] transition hover:bg-[#d95a2f] disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <CreditCard size={16} />
          {loading ? "Creating Subscription..." : "Proceed to Payment"}
        </button>
      </div>

      <PaymentModal
        isOpen={isPaymentOpen}
        plan={selectedPlan}
        workspaceName={workspaceName ?? "Your Workspace"}
        subscriptionId={subscriptionId}
        onClose={() => setIsPaymentOpen(false)}
        onContinue={handlePaymentConfirmed}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import { Check, Sparkles } from "lucide-react";

interface Plan {
  id: string;
  name: string;
  price: string;
  priceLabel: string;
  description: string;
  features: string[];
  popular?: boolean;
  custom?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    priceLabel: "free for 14 days",
    description: "For small teams getting started with service operations.",
    features: [
      "Up to 5 team members",
      "1 branch location",
      "Basic request tracking",
      "Email support",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    price: "$249",
    priceLabel: "per month",
    description: "Scaling operations with verified vendors and reporting.",
    features: [
      "Up to 50 team members",
      "10 branch locations",
      "Vendor verification",
      "SLA tracking",
      "Priority support",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    priceLabel: "tailored pricing",
    description: "Mission-critical operations with security and SSO.",
    features: [
      "Unlimited members",
      "Unlimited branches",
      "SSO + SCIM",
      "Dedicated CSM",
      "99.9% SLA",
    ],
    custom: true,
  },
];

interface PlanStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function PlanStep({ onContinue, onBack }: PlanStepProps) {
  const [selectedPlan, setSelectedPlan] = useState("starter");

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#e8edf8] flex items-center justify-center shrink-0">
          <Sparkles size={22} className="text-[#1e3a8a]" />
        </div>
        <div>
          <p className="text-[#e8683f] text-sm font-semibold uppercase tracking-wide mb-1">
            Step 5 of 5
          </p>
          <h1 className="text-[28px] font-extrabold text-[#1e3a8a] leading-tight">
            Choose your plan
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Start free for 14 days. No credit card required. Change anytime.
          </p>
        </div>
      </div>

      {/* Plans grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const isSelected = selectedPlan === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`
                relative rounded-xl border-2 p-5 cursor-pointer transition
                ${isSelected ? "border-[#1e3a8a]" : "border-gray-200 hover:border-gray-300"}
              `}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e8683f] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles size={10} />
                  POPULAR
                </div>
              )}

              {/* Plan header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-base font-bold text-[#1e3a8a]">
                  {plan.name}
                </h3>
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 flex items-center justify-center transition
                    ${isSelected ? "border-[#1e3a8a] bg-[#1e3a8a]" : "border-gray-300 bg-white"}
                  `}
                >
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="mb-1">
                <span
                  className={`font-extrabold text-[#1e3a8a] ${plan.custom ? "text-2xl" : "text-3xl"}`}
                >
                  {plan.price}
                </span>{" "}
                <span className="text-xs text-gray-500">{plan.priceLabel}</span>
              </div>

              <p className="text-xs text-gray-500 mb-4 leading-snug">
                {plan.description}
              </p>

              {/* Divider */}
              <div className="border-t border-gray-100 mb-4" />

              {/* Features */}
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check
                      size={14}
                      className="text-[#1e3a8a] mt-0.5 shrink-0"
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
      <div className="border-t border-gray-200 my-7" />

      {/* Footer actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition"
        >
          <span>←</span> Back
        </button>
        <button
          onClick={onContinue}
          className="flex items-center gap-2 bg-[#e8683f] hover:bg-[#d95a2f] text-white text-sm font-semibold px-7 py-3 rounded-lg transition"
        >
          Create workspace <span>→</span>
        </button>
      </div>
    </div>
  );
}

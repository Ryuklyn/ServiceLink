// components/StepIndicator.tsx
"use client";

import { Mail, KeyRound, Shield } from "lucide-react";

export default function StepIndicator({ step }: { step: number }) {
  const base =
    "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium";

  const active = "bg-[#1e3a8a] text-white";
  const inactive = "bg-gray-200 text-gray-500";

  const lineBase = "flex-1 mx-2 transition-all duration-300";

  const activeLine = "bg-[#1e3a8a] h-[3px]"; // +1px thicker + blue
  const inactiveLine = "bg-gray-300 h-[2px]";

  return (
    <div className="flex items-center justify-between mb-8">
      {/* Email */}
      <div className={`${base} ${step >= 1 ? active : inactive}`}>
        <Mail size={16} /> Email
      </div>

      <div className={`${lineBase} ${step >= 2 ? activeLine : inactiveLine}`} />

      {/* Verify */}
      <div className={`${base} ${step >= 2 ? active : inactive}`}>
        <KeyRound size={16} /> Verify
      </div>

      <div className={`${lineBase} ${step >= 3 ? activeLine : inactiveLine}`} />

      {/* Reset */}
      <div className={`${base} ${step >= 3 ? active : inactive}`}>
        <Shield size={16} /> Reset
      </div>
    </div>
  );
}

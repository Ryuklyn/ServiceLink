"use client";

import { LockKeyhole, ShieldCheck } from "lucide-react";
import type { PlanCheckout } from "@/components/business/PlanStep";

interface PaymentRedirectingProps {
  plan: PlanCheckout;
  workspaceName: string;
  referenceId: string;
}

export default function PaymentRedirecting({
  plan,
  workspaceName,
  referenceId,
}: PaymentRedirectingProps) {
  return (
    <div className="min-h-screen bg-[#eef6fb] px-4 py-12">
      <div className="mx-auto mb-8 flex w-full max-w-md items-center justify-center gap-3">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-[#1e3a8a] text-sm font-extrabold text-white shadow-lg">
          SL
          <span className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#e8683f]" />
        </div>
        <div className="text-lg font-extrabold text-slate-950">
          ServiceLink <span className="text-[#e8683f]">Pro</span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col items-center rounded-2xl border border-slate-200 bg-white px-10 py-12 text-center shadow-[0_24px_60px_rgba(30,58,138,0.12)]">
        <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[#f4f7fc]">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#dce8fb] border-t-[#1e3a8a]" />
        </div>

        <div className="mt-4 flex items-center gap-2 rounded-full bg-[#fde8d8] px-4 py-1.5 text-xs font-semibold text-[#e8683f]">
          <LockKeyhole size={12} />
          Secure connection
        </div>

        <h1 className="mt-5 text-2xl font-extrabold text-slate-950">
          Redirecting to eSewa
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Finalizing your workspace activation...
        </p>

        <div className="mt-10 w-full rounded-2xl border border-slate-200 bg-[#f8fbff] px-5 py-4">
          <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-600">{plan.name} plan</span>
            <span className="font-extrabold text-slate-950">{plan.price}</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-4 text-xs">
            <span className="text-slate-500">Reference</span>
            <span className="font-mono text-slate-700">{referenceId}</span>
          </div>
        </div>

        <div className="mt-7 flex items-start gap-3 text-left text-xs leading-5 text-[#1e3a8a]">
          <ShieldCheck size={16} className="mt-0.5 shrink-0" />
          <p>
            Do not close this window. You&apos;ll be returned automatically once
            verification completes for {workspaceName}.
          </p>
        </div>
      </div>
    </div>
  );
}

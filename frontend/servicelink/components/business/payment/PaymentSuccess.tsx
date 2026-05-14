"use client";

import { ArrowRight, Check, Download, PartyPopper } from "lucide-react";
import { useRouter } from "next/navigation";
import type { PlanCheckout } from "@/components/business/PlanStep";

interface PaymentSuccessProps {
  plan: PlanCheckout;
  workspaceName: string;
  referenceId: string;
}

export default function PaymentSuccess({
  plan,
  workspaceName,
  referenceId,
}: PaymentSuccessProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#eef6fb] px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl flex-col items-center justify-center">
        <div className="w-full rounded-2xl border border-slate-200 bg-white px-8 py-10 text-center shadow-[0_24px_60px_rgba(30,58,138,0.12)] sm:px-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#1e3a8a] shadow-[0_18px_36px_rgba(30,58,138,0.24)]">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-white">
              <Check size={22} strokeWidth={3} />
            </div>
          </div>

          <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full bg-[#fde8d8] px-4 py-1.5 text-xs font-semibold text-[#e8683f]">
            <PartyPopper size={13} />
            Workspace Activated
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-slate-950">
            Payment successful
          </h1>
          <p className="mt-4 text-sm text-[#1e3a8a] sm:text-base">
            Welcome to ServiceLink Pro. Your{" "}
            <span className="font-extrabold">{plan.name}</span> subscription is
            now active.
          </p>

          <dl className="mx-auto mt-8 w-full max-w-xl rounded-2xl border border-slate-200 bg-[#f8fbff] px-5 py-4 text-sm">
            <div className="flex justify-between gap-4 py-1.5">
              <dt className="text-left text-slate-600">Workspace</dt>
              <dd className="font-extrabold text-slate-950">{workspaceName}</dd>
            </div>
            <div className="flex justify-between gap-4 py-1.5">
              <dt className="text-left text-slate-600">Plan</dt>
              <dd className="font-extrabold text-slate-950">{plan.name}</dd>
            </div>
            <div className="flex justify-between gap-4 py-1.5">
              <dt className="text-left text-slate-600">Amount</dt>
              <dd className="font-extrabold text-slate-950">{plan.price}</dd>
            </div>
            <div className="flex justify-between gap-4 py-1.5">
              <dt className="text-left text-slate-600">Reference ID</dt>
              <dd className="font-mono text-xs text-slate-950">{referenceId}</dd>
            </div>
          </dl>

          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              className="flex min-w-32 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:border-[#1e3a8a]/40"
            >
              <Download size={17} />
              Receipt
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="flex min-w-44 items-center justify-center gap-3 rounded-xl bg-[#e8683f] px-6 py-3 text-sm font-bold text-white shadow-[0_18px_30px_rgba(232,104,63,0.25)] transition hover:bg-[#d95a2f]"
            >
              Enter dashboard
              <ArrowRight size={17} />
            </button>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-[#1e3a8a]">
          A confirmation email has been sent to your work email.
        </p>
      </div>
    </div>
  );
}

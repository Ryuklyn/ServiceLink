"use client";

import { CheckCircle, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface WorkspaceReadyProps {
  workspaceName?: string;
}

export default function WorkspaceReady({
  workspaceName = "Acme HQ",
}: WorkspaceReadyProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#e8edf5] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm px-10 py-14 flex flex-col items-center text-center">
        {/* Check icon circle */}
        <div className="w-20 h-20 rounded-full bg-[#1e3a8a] flex items-center justify-center mb-5 shadow-lg">
          <CheckCircle size={38} className="text-white" strokeWidth={2} />
        </div>

        {/* Badge */}
        <div className="flex items-center gap-1.5 bg-[#fde8d8] text-[#d95a2f] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <Sparkles size={12} />
          Workspace ready
        </div>

        {/* Heading */}
        <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#1e3a8a] leading-tight mb-4 max-w-md">
          Your ServiceLink Pro workspace is ready
        </h1>

        {/* Subtext */}
        <p className="text-sm text-gray-500 mb-8 max-w-sm leading-relaxed">
          <span className="font-semibold text-[#1e3a8a]">{workspaceName}</span>{" "}
          is set up. Let's get your team running — we've prepared an onboarding
          checklist for you.
        </p>

        {/* CTA */}
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 bg-[#e8683f] hover:bg-[#d95a2f] text-white text-sm font-semibold px-8 py-3.5 rounded-lg transition"
        >
          Enter dashboard <span>→</span>
        </button>
      </div>
    </div>
  );
}

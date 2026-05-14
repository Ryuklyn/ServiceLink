"use client";

import { UserCircle, ShieldCheck } from "lucide-react";

interface AdminStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function AdminStep({ onContinue, onBack }: AdminStepProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#e8edf8] flex items-center justify-center shrink-0">
          <UserCircle size={22} className="text-[#1e3a8a]" />
        </div>
        <div>
          <p className="text-[#e8683f] text-sm font-semibold uppercase tracking-wide mb-1">
            Step 3 of 5
          </p>
          <h1 className="text-[28px] font-extrabold text-[#1e3a8a] leading-tight">
            Create your admin account
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            You'll be the workspace owner. You can invite teammates later.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Full name */}
        <div>
          <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            // defaultValue="Jane Cooper"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
            placeholder="Enter full name"
          />
        </div>

        {/* Password row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
              Confirm password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
              placeholder="Re-enter password"
            />
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-start gap-3 bg-[#f0f4fb] border border-[#dce5f5] rounded-lg px-4 py-3">
          <ShieldCheck size={18} className="text-[#1e3a8a] mt-0.5 shrink-0" />
          <p className="text-sm text-[#1e3a8a]">
            Your password is encrypted at rest. We recommend enabling SSO after
            setup.
          </p>
        </div>
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
          Continue <span>→</span>
        </button>
      </div>
    </div>
  );
}

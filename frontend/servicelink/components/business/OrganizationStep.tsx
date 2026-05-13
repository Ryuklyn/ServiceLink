"use client";

import { Building2, ChevronDown } from "lucide-react";

interface OrganizationStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function OrganizationStep({
  onContinue,
  onBack,
}: OrganizationStepProps) {
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#e8edf8] flex items-center justify-center shrink-0">
          <Building2 size={22} className="text-[#1e3a8a]" />
        </div>
        <div>
          <p className="text-[#e8683f] text-sm font-semibold uppercase tracking-wide mb-1">
            Step 1 of 5
          </p>
          <h1 className="text-[28px] font-extrabold text-[#1e3a8a] leading-tight">
            Tell us about your organization
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Just the essentials — you can refine the rest later.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Company name */}
          <div>
            <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
              Company name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              defaultValue="Acme Facilities Ltd."
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
              placeholder="Acme Facilities Ltd."
            />
          </div>

          {/* Business type */}
          <div>
            <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
              Business type <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-400 appearance-none focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition bg-white">
                <option value="">Select type</option>
                <option>Facility Management</option>
                <option>Property Management</option>
                <option>Construction</option>
                <option>Retail</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Company size */}
          <div>
            <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
              Company size <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-400 appearance-none focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition bg-white">
                <option value="">Choose size</option>
                <option>1–10 employees</option>
                <option>11–50 employees</option>
                <option>51–200 employees</option>
                <option>201–1000 employees</option>
                <option>1000+ employees</option>
              </select>
              <ChevronDown
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Work email */}
          <div>
            <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
              Work email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
              placeholder="ops@company.com"
            />
          </div>
        </div>

        {/* Phone number */}
        <div>
          <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
            Phone number
          </label>
          <input
            type="tel"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
            placeholder="+1 (555) 123-4567"
          />
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

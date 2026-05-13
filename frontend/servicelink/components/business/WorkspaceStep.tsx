"use client";

import { useState } from "react";
import { GitBranch } from "lucide-react";

const SERVICES = [
  "HVAC",
  "Electrical",
  "Plumbing",
  "Cleaning",
  "Security",
  "Landscaping",
  "IT Support",
  "Pest Control",
];

interface WorkspaceStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function WorkspaceStep({
  onContinue,
  onBack,
}: WorkspaceStepProps) {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (service: string) => {
    setSelected((prev) =>
      prev.includes(service)
        ? prev.filter((s) => s !== service)
        : [...prev, service],
    );
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#e8edf8] flex items-center justify-center shrink-0">
          <GitBranch size={22} className="text-[#1e3a8a]" />
        </div>
        <div>
          <p className="text-[#e8683f] text-sm font-semibold uppercase tracking-wide mb-1">
            Step 2 of 5
          </p>
          <h1 className="text-[28px] font-extrabold text-[#1e3a8a] leading-tight">
            Set up your workspace
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            This becomes the home base for your operations team.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Workspace name */}
          <div>
            <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
              Workspace name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              defaultValue="Acme HQ Operations"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
              placeholder="Acme HQ Operations"
            />
          </div>

          {/* Primary branch location */}
          <div>
            <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
              Primary branch location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              defaultValue="New York, NY"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
              placeholder="New York, NY"
            />
          </div>
        </div>

        {/* Preferred services */}
        <div>
          <label className="block text-sm font-semibold text-[#1e3a8a] mb-1">
            Preferred services
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Pick the categories you manage most often.
          </p>
          <div className="flex flex-wrap gap-2">
            {SERVICES.map((service) => {
              const isSelected = selected.includes(service);
              return (
                <button
                  key={service}
                  type="button"
                  onClick={() => toggle(service)}
                  className={`
                    px-4 py-2 rounded-full border text-sm font-medium transition
                    ${
                      isSelected
                        ? "bg-[#1e3a8a] text-white border-[#1e3a8a]"
                        : "bg-white text-[#1e3a8a] border-gray-300 hover:border-[#1e3a8a]/60"
                    }
                  `}
                >
                  {service}
                </button>
              );
            })}
          </div>
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

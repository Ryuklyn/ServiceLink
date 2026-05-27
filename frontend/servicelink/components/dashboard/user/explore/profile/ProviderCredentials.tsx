"use client";

import { Shield, Info, Medal } from "lucide-react";
import { ProviderData } from "./types";

interface ProviderCredentialsProps {
  provider: ProviderData;
}

export default function ProviderCredentials({
  provider,
}: ProviderCredentialsProps) {
  return (
    <div className="flex flex-col gap-6 max-w-4xl w-full">
      {/* CARD 1: Main Credentials & Registration Box */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        {/* Header */}
        <h2 className="font-bold text-[#0f172a] text-lg mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#1e3a8a]" strokeWidth={2.5} />
          Credentials & Registration
        </h2>

        {/* Two-column grid aligned with the design */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 mb-6">
          {/* Row 1 */}
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-400 font-normal">
              Registered Name
            </span>
            <span className="text-gray-900 font-semibold text-base">
              {provider.registeredName}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-400 font-normal">District</span>
            <span className="text-gray-900 font-semibold text-base">
              {provider.primaryDistrict || "Kathmandu"}
            </span>
          </div>

          {/* Row 2 */}
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-400 font-normal">
              Service Area
            </span>
            <span className="text-gray-900 font-semibold text-base">
              {provider.location || "Koteshwor-3, Kathmandu"}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-400 font-normal">
              KYC Reference
            </span>
            <span className="text-gray-900 font-semibold text-base">
              {provider.verificationId}
            </span>
          </div>
        </div>

        {/* Verified Skills Section */}
        <div className="mb-6">
          <h3 className="text-sm text-gray-400 font-normal mb-3">
            Verified Skills
          </h3>
          {provider.skills?.length > 0 && (
            <div className="flex flex-wrap gap-2.5">
              {provider.skills.map((skill) => (
                <span
                  key={skill}
                  className="bg-[#eff6ff] text-[#1e40af] text-sm font-medium px-4 py-1.5 rounded-lg border border-blue-100/50"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Multi-Category Inner Highlight Container */}
        <div className="bg-[#fffaf8] border border-[#fef2ec] rounded-xl p-4 flex items-start gap-3">
          <Medal
            className="w-5 h-5 text-[#e8683f] mt-0.5 shrink-0"
            strokeWidth={2.5}
          />
          <div>
            <h4 className="text-base font-semibold text-[#0f172a] mb-1">
              Multi-Category Certification
            </h4>
            <p className="text-sm text-gray-500 leading-relaxed">
              Certified to provide services in:{" "}
              {provider.categories?.join(", ") ||
                "Electrical Work, Carpentry Assistance, and Basic Painting"}
            </p>
          </div>
        </div>
      </div>

      {/* CARD 2: Separate "Verified Services Only" Bottom Card */}
      <div className="bg-[#f0f7ff] border border-[#dbeafe] rounded-2xl p-5 flex items-start gap-3.5 shadow-sm">
        <Info
          className="w-5 h-5 text-[#2563eb] mt-0.5 shrink-0"
          strokeWidth={2.5}
        />
        <div className="flex flex-col gap-0.5">
          <h3 className="text-base font-semibold text-[#1e40af]">
            Identity verified on {provider.identityVerifiedDate}
          </h3>
          <p className="text-sm text-[#3b82f6] leading-relaxed font-medium">
            {provider.certificateCount} professional certificates verified and
            on file. For security and privacy, actual documents are not
            displayed publicly.
          </p>
        </div>
      </div>
    </div>
  );
}

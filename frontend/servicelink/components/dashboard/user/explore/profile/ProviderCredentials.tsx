"use client";

import { ShieldCheck } from "lucide-react";
import { ProviderData } from "./types";

interface ProviderCredentialsProps {
  provider: ProviderData;
}

export default function ProviderCredentials({
  provider,
}: ProviderCredentialsProps) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <h2 className="font-bold text-gray-900 text-lg mb-6 flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-[#1e3a8a]" strokeWidth={2} />
        Provider Credentials
      </h2>

      {/* Two-column info grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
        {/* Registered Name */}
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-400 font-normal">
            Registered Name
          </span>
          <span className="text-gray-900 font-semibold text-sm">
            {provider.registeredName}
          </span>
        </div>

        {/* KYC Reference / Verification ID */}
        <div className="flex flex-col gap-1">
          <span className="text-sm text-gray-400 font-normal">
            KYC Reference
          </span>
          <span className="text-gray-400 text-sm">
            {provider.verificationId}
          </span>
        </div>

        {/* Primary District (optional extra field) */}
        {provider.primaryDistrict && (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-gray-400 font-normal">
              Primary District
            </span>
            <span className="text-gray-900 font-semibold text-sm">
              {provider.primaryDistrict}
            </span>
          </div>
        )}
      </div>

      {/* Skill tags */}
      {provider.skills?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-5">
          {provider.skills.map((skill) => (
            <span
              key={skill}
              className="bg-gray-100 text-gray-600 text-xs font-medium px-3 py-1 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Identity Verified Banner */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3">
        <ShieldCheck
          className="w-4 h-4 text-[#1e3a8a] mt-0.5 shrink-0"
          strokeWidth={2}
        />
        <div>
          <p className="text-sm font-semibold text-[#1e3a8a]">
            Identity verified on {provider.identityVerifiedDate}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            {provider.certificateCount} professional certificates verified and
            on file. For security and privacy, actual documents are not
            displayed publicly.
          </p>
        </div>
      </div>
    </div>
  );
}

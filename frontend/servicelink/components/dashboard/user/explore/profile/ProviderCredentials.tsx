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
      <div className="flex flex-col gap-4 sm:gap-6 max-w-4xl w-full">
        {/* CARD 1: Main Credentials & Registration Box */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 sm:p-6 shadow-sm">
          {/* Header */}
          <h2 className="font-bold text-[#0f172a] text-base sm:text-lg mb-4 sm:mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#1e3a8a] shrink-0" strokeWidth={2.5} />
            Credentials & Registration
          </h2>

          {/* Dynamic Column Grid Layout: Stacks naturally on mobile views */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 sm:gap-y-6 mb-6">
            {/* Row item 1 */}
            <div className="flex flex-col gap-0.5 sm:gap-1">
            <span className="text-xs sm:text-sm text-gray-400 font-normal">
              Registered Name
            </span>
              <span className="text-gray-900 font-semibold text-sm sm:text-base break-words">
              {provider.registeredName}
            </span>
            </div>

            {/* Row item 2 */}
            <div className="flex flex-col gap-0.5 sm:gap-1">
              <span className="text-xs sm:text-sm text-gray-400 font-normal">District</span>
              <span className="text-gray-900 font-semibold text-sm sm:text-base break-words">
              {provider.primaryDistrict || "Kathmandu"}
            </span>
            </div>

            {/* Row item 3 */}
            <div className="flex flex-col gap-0.5 sm:gap-1">
            <span className="text-xs sm:text-sm text-gray-400 font-normal">
              Service Area
            </span>
              <span className="text-gray-900 font-semibold text-sm sm:text-base break-words">
              {provider.location || "Koteshwor-3, Kathmandu"}
            </span>
            </div>

            {/* Row item 4 */}
            <div className="flex flex-col gap-0.5 sm:gap-1">
            <span className="text-xs sm:text-sm text-gray-400 font-normal">
              KYC Reference
            </span>
              <span className="text-gray-900 font-semibold text-sm sm:text-base break-all">
              {provider.verificationId}
            </span>
            </div>
          </div>

          {/* Verified Skills Section */}
          <div className="mb-6">
            <h3 className="text-xs sm:text-sm text-gray-400 font-normal mb-3">
              Verified Skills
            </h3>
            {provider.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 sm:gap-2.5">
                  {provider.skills.map((skill) => (
                      <span
                          key={skill}
                          className="bg-[#eff6ff] text-[#1e40af] text-xs sm:text-sm font-medium px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg border border-blue-100/50 whitespace-nowrap"
                      >
                  {skill}
                </span>
                  ))}
                </div>
            )}
          </div>

          {/* Multi-Category Inner Highlight Container */}
          <div className="bg-[#fffaf8] border border-[#fef2ec] rounded-xl p-3 sm:p-4 flex items-start gap-3">
            <Medal
                className="w-5 h-5 text-[#e8683f] mt-0.5 shrink-0"
                strokeWidth={2.5}
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-sm sm:text-base font-semibold text-[#0f172a] mb-0.5 sm:mb-1">
                Multi-Category Certification
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed break-words">
                Certified to provide services in:{" "}
                {provider.categories?.join(", ") ||
                    "Electrical Work, Carpentry Assistance, and Basic Painting"}
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: Separate "Verified Services Only" Bottom Card */}
        <div className="bg-[#f0f7ff] border border-[#dbeafe] rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-sm">
          <Info
              className="w-5 h-5 text-[#2563eb] mt-0.5 shrink-0"
              strokeWidth={2.5}
          />
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-semibold text-[#1e40af] break-words">
              Identity verified {provider.identityVerifiedDate ? `on ${provider.identityVerifiedDate}` : "successfully"}
            </h3>
            <p className="text-xs sm:text-sm text-[#3b82f6] leading-relaxed font-medium break-words">
              {provider.certificateCount} professional certificates verified and
              on file. For security and privacy, actual documents are not
              displayed publicly.
            </p>
          </div>
        </div>
      </div>
  );
}
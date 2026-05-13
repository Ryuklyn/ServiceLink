"use client";

import { useState } from "react";
import { FileText, Upload, CheckSquare } from "lucide-react";

interface VerificationStepProps {
  onContinue: () => void;
  onBack: () => void;
}

export default function VerificationStep({
  onContinue,
  onBack,
}: VerificationStepProps) {
  const [confirmed, setConfirmed] = useState(true);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-12 h-12 rounded-full bg-[#e8edf8] flex items-center justify-center shrink-0">
          <FileText size={22} className="text-[#1e3a8a]" />
        </div>
        <div>
          <p className="text-[#e8683f] text-sm font-semibold uppercase tracking-wide mb-1">
            Step 4 of 5
          </p>
          <h1 className="text-[28px] font-extrabold text-[#1e3a8a] leading-tight">
            Verify your business
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Verification unlocks vendor contracts and payouts. Takes ~1 business
            day.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* PAN / VAT / Tax ID */}
        <div>
          <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
            PAN / VAT / Tax ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400"
            placeholder="e.g. AAACA1234B"
          />
        </div>

        {/* Upload section */}
        <div>
          <label className="block text-sm font-semibold text-[#1e3a8a] mb-1">
            Upload business document
          </label>
          <p className="text-sm text-gray-500 mb-3">
            Registration certificate, trade license, or incorporation doc (PDF,
            PNG, JPG)
          </p>

          <label className="flex items-center gap-4 border-2 border-dashed border-gray-300 rounded-lg px-5 py-5 cursor-pointer hover:border-[#e8683f] transition group">
            <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-[#e8683f]/10 flex items-center justify-center transition shrink-0">
              <Upload
                size={18}
                className="text-gray-400 group-hover:text-[#e8683f] transition"
              />
            </div>
            <div className="flex-1">
              {fileName ? (
                <p className="text-sm font-medium text-[#1e3a8a]">{fileName}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-[#1e3a8a]">
                    Click to browse, or drop a file here
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">Max 10MB</p>
                </>
              )}
            </div>
            <span className="text-sm font-semibold text-[#e8683f] ml-auto">
              Browse
            </span>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* Confirmation checkbox */}
        <div
          className="flex items-start gap-3 cursor-pointer"
          onClick={() => setConfirmed(!confirmed)}
        >
          <div
            className={`
              w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition border
              ${confirmed ? "bg-[#1e3a8a] border-[#1e3a8a]" : "bg-white border-gray-300"}
            `}
          >
            {confirmed && (
              <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                <path
                  d="M1 4.5L4 7.5L10 1.5"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <p className="text-sm text-gray-700 leading-snug">
            I confirm I am authorized to register this organization and the
            information provided is accurate.
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

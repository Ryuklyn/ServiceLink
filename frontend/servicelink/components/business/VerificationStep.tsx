"use client";

import { useState, useEffect } from "react";
import { FileText, Upload, CheckCircle2 } from "lucide-react";
import api from "@/utils/axios";
import { toast } from "react-toastify";

interface VerificationStepProps {
  onContinue: () => void;
  onBack: () => void;
  organizationId: string | null;
}

type ApiError = {
  response?: { data?: { message?: string } };
  message?: string;
};

export default function VerificationStep({
                                           onContinue,
                                           onBack,
                                           organizationId,
                                         }: VerificationStepProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [taxId, setTaxId] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [existingStatus, setExistingStatus] = useState<string | null>(null);

  // Resume: if KYB is already submitted for this org, don't force a
  // re-submit — the backend rejects duplicates ("KYC ... already submitted").
  useEffect(() => {
    if (!organizationId) {
      setCheckingExisting(false);
      return;
    }
    api
        .get(`/business/kyb/organization/${organizationId}`)
        .then((res) => {
          setTaxId(res.data.taxId ?? "");
          setExistingStatus(res.data.status ?? null);
          setConfirmed(true);
          setAlreadySubmitted(true);
        })
        .catch(() => {
          // 404 — no KYB submitted yet, expected on first visit
        })
        .finally(() => setCheckingExisting(false));
  }, [organizationId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (alreadySubmitted) {
      onContinue();
      return;
    }

    if (!organizationId) {
      toast.error(
          "Organization ID not found - please go back and create an organization",
      );
      return;
    }
    if (!taxId.trim()) {
      toast.error("Tax ID is required");
      return;
    }
    if (!confirmed) {
      toast.error("Please confirm authorization");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      const kybData = {
        organizationId,
        taxId: taxId.trim(),
        authorizedConfirmed: true,
      };
      formData.append(
          "data",
          new Blob([JSON.stringify(kybData)], { type: "application/json" }),
      );
      if (selectedFile) {
        formData.append("document", selectedFile);
      }

      await api.post("/business/kyb/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Business verification submitted successfully!");
      onContinue();
    } catch (err: unknown) {
      console.error("Error submitting KYB:", err);
      const apiError = err as ApiError;
      toast.error(
          apiError.response?.data?.message ??
          apiError.message ??
          "Failed to submit verification",
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingExisting) {
    return (
        <div className="w-full py-20 text-center text-sm text-gray-400">
          Checking existing setup...
        </div>
    );
  }

  return (
      <div className="w-full">
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
              Verification unlocks vendor contracts and payouts. Takes ~1
              business day.
            </p>
          </div>
        </div>

        {alreadySubmitted ? (
            <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <CheckCircle2 size={18} className="text-green-600 mt-0.5 shrink-0" />
              <p className="text-sm text-green-800">
                Verification already submitted{" "}
                {existingStatus ? `(status: ${existingStatus})` : ""}. Continue to
                the next step.
              </p>
            </div>
        ) : (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-[#1e3a8a] mb-1.5">
                  PAN / VAT / Tax ID <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                    disabled={loading}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#e8683f]/40 focus:border-[#e8683f] transition placeholder-gray-400 disabled:opacity-50"
                    placeholder="e.g. AAACA1234B"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1e3a8a] mb-1">
                  Upload business document
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Registration certificate, trade license, or incorporation doc
                  (PDF, PNG, JPG)
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
                        <p className="text-sm font-medium text-[#1e3a8a]">
                          {fileName}
                        </p>
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

              <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => setConfirmed((prev) => !prev)}
              >
                <div
                    className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 transition border ${
                        confirmed
                            ? "bg-[#1e3a8a] border-[#1e3a8a]"
                            : "bg-white border-gray-300"
                    }`}
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
        )}

        <div className="border-t border-gray-200 my-7" />

        <div className="flex items-center justify-between">
          <button
              onClick={onBack}
              disabled={loading}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium transition disabled:opacity-50"
          >
            <span>←</span> Back
          </button>
          <button
              onClick={handleSubmit}
              disabled={loading || (!alreadySubmitted && !confirmed)}
              className="flex items-center gap-2 bg-[#e8683f] hover:bg-[#d95a2f] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-7 py-3 rounded-lg transition"
          >
            {loading ? "Submitting..." : "Continue"} <span>→</span>
          </button>
        </div>
      </div>
  );
}
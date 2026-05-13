"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface DoneStepProps {
  onRestart?: () => void;
  allData?: Record<string, any>;
}

export default function DoneStep({ onRestart, allData }: DoneStepProps) {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const referenceNumber = useRef(
    "SVC-" +
      new Date().getFullYear() +
      "-" +
      Math.random().toString(36).substring(2, 8).toUpperCase(),
  );

  const submittedAt = useRef(new Date());

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const handleDownload = () => {
    setDownloading(true);

    const params = new URLSearchParams({
      ref: referenceNumber.current,
      ts: submittedAt.current.toISOString(),
      ...(allData?.personal?.fullName && {
        name: allData.personal.fullName,
      }),
      ...(allData?.personal?.email && {
        email: allData.personal.email,
      }),
    });

    setTimeout(() => {
      router.push(`/kyc/receipt?${params.toString()}`);
      setDownloading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center px-4 py-10">
      <div
        className={`w-full max-w-xl bg-white rounded-2xl border shadow-lg overflow-hidden transition-all duration-500 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        {/* Header */}
        <div className="bg-black text-white px-8 py-10">
          <p className="text-xs uppercase tracking-widest text-[#e8683f] mb-4">
            Application Submitted
          </p>

          <h1 className="font-serif text-3xl leading-tight">
            You're all <span className="text-[#e8683f] italic">set.</span>
          </h1>

          <p className="text-sm text-neutral-400 mt-2">
            Your application has been received and is under review.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Under Review
          </div>
        </div>

        {/* Body */}
        <div className="px-8 py-8">
          {/* Reference */}
          <div className="flex justify-between items-center bg-stone-50 border rounded-xl px-4 py-3 mb-6">
            <div>
              <p className="text-xs uppercase text-neutral-500">
                Reference Number
              </p>
              <p className="font-serif text-lg">{referenceNumber.current}</p>
            </div>

            <button
              onClick={() =>
                navigator.clipboard?.writeText(referenceNumber.current)
              }
              className="text-sm border px-3 py-1 rounded-md hover:bg-black hover:text-white transition"
            >
              Copy
            </button>
          </div>

          {/* Timeline */}
          <div className="mb-8">
            <p className="text-xs uppercase text-neutral-500 mb-4">
              What happens next
            </p>

            <div className="space-y-4 text-sm">
              {/* Step 1 */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  ✓
                </div>
                <div>
                  <p className="font-medium">Application Received</p>
                  <p className="text-xs text-neutral-500">
                    {submittedAt.current.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#e8683f]/10 flex items-center justify-center text-[#d95a2f]">
                  ⏳
                </div>
                <div>
                  <p className="font-medium">Document Verification</p>
                  <p className="text-xs text-neutral-500">
                    Review in 2–3 business days
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#e8683f]/10 flex items-center justify-center text-[#d95a2f]">
                  ★
                </div>
                <div>
                  <p className="font-medium">Activation</p>
                  <p className="text-xs text-neutral-500">
                    You’ll receive onboarding via email
                  </p>
                </div>
              </div>
            </div>
          </div>

          <hr className="my-6" />

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full border rounded-lg py-3 text-sm font-medium hover:bg-stone-50 flex items-center justify-center gap-2"
            >
              {downloading ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Preparing Receipt...
                </>
              ) : (
                "Download Application Receipt"
              )}
            </button>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-black text-white py-3 rounded-lg text-sm font-semibold hover:bg-neutral-800"
            >
              Go to Dashboard →
            </button>
          </div>

          {/* Footer Note */}
          <div className="mt-6 bg-stone-50 border rounded-lg p-4 text-xs text-neutral-600">
            Save your reference number{" "}
            <strong>{referenceNumber.current}</strong> for tracking. You’ll
            receive an email confirmation shortly.
          </div>

          {/* Restart */}
          {onRestart && (
            <button
              onClick={onRestart}
              className="mt-4 text-xs underline text-neutral-500 hover:text-black"
            >
              Submit another application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

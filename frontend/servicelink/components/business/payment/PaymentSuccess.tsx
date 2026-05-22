"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckCircle2, Home, Copy, Check } from "lucide-react";
import { useBusinessSetup } from "@/hooks/useBusinessSetup";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data } = useBusinessSetup();
  const [copied, setCopied] = useState(false);

  const referenceId = searchParams.get("reference") || data.paymentReferenceId;
  const amount = searchParams.get("amount");
  const gateway = searchParams.get("gateway");

  useEffect(() => {
    // Auto-clear payment reference after 5 minutes
    const timer = setTimeout(
      () => {
        localStorage.removeItem("paymentReference");
      },
      5 * 60 * 1000,
    );

    return () => clearTimeout(timer);
  }, []);

  const handleCopyReference = () => {
    if (referenceId) {
      navigator.clipboard.writeText(referenceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with green gradient */}
          <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 px-6 py-12 flex flex-col items-center justify-center">
            <div className="mb-4 animate-bounce">
              <CheckCircle2 size={64} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white text-center">
              Payment Successful!
            </h1>
            <p className="text-emerald-100 mt-2 text-center">
              Your subscription is now active
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-8 space-y-6">
            {/* Order Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Workspace</p>
                <p className="text-lg font-bold text-[#1e3a8a]">
                  {data.workspaceName || "Your Workspace"}
                </p>
              </div>

              <div className="border-t border-gray-200 pt-3">
                <p className="text-sm text-gray-600 mb-1">Plan</p>
                <p className="text-lg font-bold text-[#1e3a8a]">
                  {data.planType || "Professional"} Plan
                </p>
              </div>

              {amount && (
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-sm text-gray-600 mb-1">Amount Paid</p>
                  <p className="text-lg font-bold text-emerald-600">
                    NPR {amount}
                  </p>
                </div>
              )}

              {gateway && (
                <div className="border-t border-gray-200 pt-3">
                  <p className="text-sm text-gray-600 mb-1">Payment Gateway</p>
                  <p className="text-lg font-bold text-[#1e3a8a]">{gateway}</p>
                </div>
              )}
            </div>

            {/* Reference ID */}
            {referenceId && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Reference ID</p>
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
                  <code className="text-sm font-mono font-bold text-[#1e3a8a] flex-1 break-all">
                    {referenceId}
                  </code>
                  <button
                    onClick={handleCopyReference}
                    className="shrink-0 p-2 hover:bg-blue-100 rounded-md transition"
                    title="Copy reference ID"
                  >
                    {copied ? (
                      <Check size={16} className="text-emerald-600" />
                    ) : (
                      <Copy size={16} className="text-blue-600" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Save this reference ID for your records
                </p>
              </div>
            )}

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-bold text-[#1e3a8a] mb-3">
                What&apos;s next?
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">1.</span>
                  <span>Your subscription is now active and ready to use</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">2.</span>
                  <span>
                    Check your email for setup instructions and account details
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">3.</span>
                  <span>Start managing your workspace from the dashboard</span>
                </li>
              </ul>
            </div>

            {/* Action Button */}
            <button
              onClick={handleDashboard}
              className="w-full flex items-center justify-center gap-2 bg-[#1e3a8a] hover:bg-[#152a5e] text-white font-bold py-3 rounded-lg transition"
            >
              <Home size={18} />
              Go to Dashboard
            </button>

            {/* Help Text */}
            <p className="text-xs text-gray-500 text-center">
              Need help?{" "}
              <a
                href="#"
                className="text-blue-600 hover:underline font-semibold"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 mt-6">
          Payment reference has been sent to your registered email
        </p>
      </div>
    </div>
  );
}

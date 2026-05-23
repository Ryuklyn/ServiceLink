"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { useBusinessSetup } from "@/hooks/useBusinessSetup";

export default function PaymentFailure() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data, setPayment } = useBusinessSetup();
  const failureRecorded = useRef(false);

  const referenceId = searchParams.get("reference") || data.paymentReferenceId;
  const reason = searchParams.get("reason") || "Payment was not completed";
  const errorCode = searchParams.get("error_code");

  useEffect(() => {
    if (failureRecorded.current) {
      return;
    }
    failureRecorded.current = true;

    // Keep the reference so the user can retry from the saved draft.
    if (referenceId) {
      setPayment(referenceId, "FAILED");
      localStorage.setItem("paymentReference", referenceId);
    }
  }, [referenceId, setPayment]);

  const handleRetry = () => {
    // Go back to plan selection
    router.back();
  };

  const handleDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Failure Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header with red gradient */}
          <div className="bg-gradient-to-r from-red-400 to-red-600 px-6 py-12 flex flex-col items-center justify-center">
            <div className="mb-4 animate-pulse">
              <AlertCircle size={64} className="text-white" />
            </div>
            <h1 className="text-3xl font-extrabold text-white text-center">
              Payment Failed
            </h1>
            <p className="text-red-100 mt-2 text-center">
              Your payment could not be processed
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-8 space-y-6">
            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Reason</p>
                <p className="text-base font-semibold text-red-700">{reason}</p>
              </div>

              {errorCode && (
                <div className="border-t border-red-200 pt-3">
                  <p className="text-sm text-gray-600 mb-1">Error Code</p>
                  <p className="text-sm font-mono text-red-600">{errorCode}</p>
                </div>
              )}

              {referenceId && (
                <div className="border-t border-red-200 pt-3">
                  <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                  <p className="text-sm font-mono text-red-600 break-all">
                    {referenceId}
                  </p>
                </div>
              )}
            </div>

            {/* Order Details */}
            {data.workspaceName || data.planType ? (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                {data.workspaceName && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Workspace</p>
                    <p className="text-base font-semibold text-[#1e3a8a]">
                      {data.workspaceName}
                    </p>
                  </div>
                )}

                {data.planType && (
                  <div
                    className={
                      data.workspaceName ? "border-t border-gray-200 pt-3" : ""
                    }
                  >
                    <p className="text-sm text-gray-600 mb-1">Plan</p>
                    <p className="text-base font-semibold text-[#1e3a8a]">
                      {data.planType} Plan
                    </p>
                  </div>
                )}

                {data.amountNpr && (
                  <div className="border-t border-gray-200 pt-3">
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="text-base font-semibold text-[#1e3a8a]">
                      NPR {data.amountNpr}
                    </p>
                  </div>
                )}
              </div>
            ) : null}

            {/* Troubleshooting Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-bold text-[#1e3a8a] mb-3">
                Troubleshooting Tips
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>Check your internet connection and try again</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>
                    Verify your payment method has sufficient funds or balance
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold mt-0.5">•</span>
                  <span>Try using a different payment method</span>
                </li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleRetry}
                className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 rounded-lg transition"
              >
                <ArrowLeft size={16} />
                Retry Payment
              </button>
              <button
                onClick={handleDashboard}
                className="flex items-center justify-center gap-2 border-2 border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white font-bold py-3 rounded-lg transition"
              >
                <Home size={16} />
                Dashboard
              </button>
            </div>

            {/* Help Text */}
            <p className="text-xs text-gray-500 text-center">
              Still having issues?{" "}
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
          Don&apos;t worry, your subscription plan selection has been saved
        </p>
      </div>
    </div>
  );
}

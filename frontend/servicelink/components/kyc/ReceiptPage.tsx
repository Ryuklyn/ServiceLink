"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useRef } from "react";

export default function ReceiptPage() {
  const params = useSearchParams();
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);

  const ref = params.get("ref") || "SVC-2025-XXXXXX";
  const ts = params.get("ts") ? new Date(params.get("ts")!) : new Date();
  const applicantName = params.get("name") || "—";
  const applicantEmail = params.get("email") || "—";

  const formattedDate = ts.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = ts.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-stone-100 px-4 py-8">
      {/* Topbar */}
      <div className="max-w-3xl mx-auto flex items-center justify-between mb-6 flex-wrap gap-2">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 border border-stone-300 px-3 py-1 rounded-md text-sm hover:bg-black hover:text-white transition"
        >
          ← Back
        </button>

        <p className="font-serif text-lg">Application Receipt</p>

        <button
          onClick={handlePrint}
          className="bg-black text-white px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-neutral-800"
        >
          Print
        </button>
      </div>

      {/* Card */}
      <div
        ref={printRef}
        className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-black text-white p-8 relative">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="font-serif text-lg">ServiceHub</h2>
              <p className="text-xs text-neutral-400">
                Provider Registration Portal
              </p>
            </div>

            <span className="bg-green-100 text-green-600 text-xs px-3 py-1 rounded-full font-semibold">
              Submitted
            </span>
          </div>

          <h1 className="font-serif text-2xl mt-6">
            Application <span className="text-[#e8683f] italic">Receipt</span>
          </h1>

          <div className="mt-3 text-sm text-neutral-300 flex gap-2 flex-wrap">
            <span className="uppercase text-xs tracking-wider">Reference:</span>
            <span className="text-[#e8683f] font-medium">{ref}</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>
        </div>

        {/* Section */}
        <div className="p-6 border-b">
          <p className="text-xs uppercase tracking-widest text-[#e8683f] mb-4">
            Applicant Info
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-500 text-xs">Full Name</p>
              <p>{applicantName}</p>
            </div>

            <div>
              <p className="text-neutral-500 text-xs">Email</p>
              <p>{applicantEmail}</p>
            </div>

            <div>
              <p className="text-neutral-500 text-xs">Date</p>
              <p>{formattedDate}</p>
            </div>

            <div>
              <p className="text-neutral-500 text-xs">Time</p>
              <p>{formattedTime}</p>
            </div>
          </div>
        </div>

        {/* Tracking */}
        <div className="p-6 bg-stone-50 border-b">
          <p className="text-xs uppercase tracking-widest text-[#e8683f] mb-4">
            Tracking
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-neutral-500 text-xs">Reference</p>
              <p className="font-serif">{ref}</p>
            </div>

            <div>
              <p className="text-neutral-500 text-xs">Type</p>
              <p>Service Provider KYC</p>
            </div>

            <div>
              <p className="text-neutral-500 text-xs">Portal</p>
              <p>Provider Registration v2</p>
            </div>

            <div>
              <p className="text-neutral-500 text-xs">Review Time</p>
              <p>2–3 days</p>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="p-6 border-b">
          <p className="text-xs uppercase tracking-widest text-[#e8683f] mb-4">
            Verification
          </p>

          <div className="space-y-3 text-sm">
            {[
              ["Personal Info", true],
              ["Professional Background", true],
              ["KYC Docs", true],
              ["Identity Verification", false],
              ["Background Check", false],
            ].map(([label, done], i) => (
              <div key={i} className="flex justify-between">
                <span className="text-neutral-600">{label}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    done
                      ? "bg-green-100 text-green-600"
                      : "bg-[#e8683f]/10 text-[#d95a2f]"
                  }`}
                >
                  {done ? "Done" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div className="p-6 bg-stone-50 border-b">
          <p className="text-xs uppercase tracking-widest text-[#e8683f] mb-4">
            Notes
          </p>

          <ul className="text-sm space-y-2 text-neutral-700">
            <li>Keep your reference number safe.</li>
            <li>Email confirmation within 24 hours.</li>
            <li>Review takes 2–3 business days.</li>
            <li>Do not resubmit.</li>
          </ul>
        </div>

        {/* Footer */}
        <div className="p-6 flex justify-between flex-wrap gap-3 text-xs text-neutral-500">
          <p>
            Auto-generated receipt. Contact support@servicehub.com with your
            reference.
          </p>

          <span className="text-[#e8683f] font-semibold">
            ✔ Verified Receipt
          </span>
        </div>
      </div>
    </div>
  );
}

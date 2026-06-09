// "use client";
//
// import {
//   ArrowLeft,
//   ArrowRight,
//   CheckCircle2,
//   Edit3,
//   Loader2,
// } from "lucide-react";
// import { useState } from "react";
// import { kycApi } from "@/lib/api/kycApi";
//
// // ─── Types ────────────────────────────────────────────────────────────────────
//
// type Address = {
//   tole?: string;
//   municipality?: string;
//   ward?: string;
//   district?: string;
//   province?: string;
// };
//
// type Personal = {
//   fullName?: string;
//   dob?: string;
//   gender?: string;
//   phone?: string;
//   email?: string;
//   currentAddress?: Address;
// };
//
// type Professional = {
//   primaryService?: string;
//   otherService?: string;
//   additionalServices?: string[];
//   experienceYears?: number;
//   primaryDistrict?: string;
//   secondaryDistricts?: string[];
//   travelRadius?: string;
//   bio?: string;
// };
//
// type KYC = {
//   citizenshipFront?: File | null;
//   citizenshipBack?: File | null;
//   pan?: File | null;
//   professional?: File[];
//   photo?: File | null;
// };
//
// type AllData = {
//   personal?: Personal;
//   professional?: Professional;
//   kyc?: KYC;
// };
//
// interface ReviewDoneProps {
//   allData: AllData;
//   providerToken?: string; // short-lived JWT from OTP verify
//   onSubmitSuccess?: () => void;
//   onBack?: () => void;
//   onGoToStep?: (step: number) => void;
// }
//
// // ─── Terms definition ────────────────────────────────────────────────────────
//
// const TERMS = [
//   { id: "tos", label: "I agree to ServiceLink Terms of Service" },
//   { id: "privacy", label: "I agree to Privacy Policy & Data Protection" },
//   {
//     id: "accurate",
//     label: "I confirm all information is accurate and truthful",
//   },
//   { id: "background", label: "I consent to background verification" },
//   { id: "video", label: "I agree to video call verification (if required)" },
// ];
//
// // ─── Sub-components ──────────────────────────────────────────────────────────
//
// function Row({ label, value }: { label: string; value?: string }) {
//   if (!value) return null;
//   return (
//     <div className="flex justify-between py-2 border-b border-stone-100 last:border-0">
//       <span className="text-xs font-semibold text-stone-400 uppercase w-40 shrink-0">
//         {label}
//       </span>
//       <span className="text-sm font-medium text-stone-700 text-right">
//         {value}
//       </span>
//     </div>
//   );
// }
//
// function Section({
//   title,
//   onEdit,
//   children,
// }: {
//   title: string;
//   onEdit?: () => void;
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden">
//       <div className="flex justify-between items-center px-4 py-3 bg-white border-b">
//         <h3 className="text-sm font-bold text-stone-700">{title}</h3>
//         {onEdit && (
//           <button
//             type="button"
//             onClick={onEdit}
//             className="flex items-center gap-1 text-xs text-[#d95a2f] hover:text-[#d95a2f]"
//           >
//             <Edit3 className="w-3.5 h-3.5" />
//             Edit
//           </button>
//         )}
//       </div>
//       <div className="px-4">{children}</div>
//     </div>
//   );
// }
//
// // ─── Build FormData ───────────────────────────────────────────────────────────
//
// function buildFormData(allData: AllData): FormData {
//   const fd = new FormData();
//   const { personal = {}, professional = {}, kyc = {} } = allData;
//   console.log(allData, "da");
//
//   const payload = {
//     fullName: personal.fullName,
//     dob: personal.dob,
//     gender: personal.gender,
//     phone: personal.phone,
//     email: personal.email,
//     province: personal.currentAddress?.province,
//     district: personal.currentAddress?.district,
//     municipality: personal.currentAddress?.municipality,
//     ward: personal.currentAddress?.ward,
//     tole: personal.currentAddress?.tole,
//     primaryService: professional.primaryService,
//     otherService: professional.otherService,
//     additionalServices: professional.additionalServices ?? [],
//     experienceYears: professional.experienceYears,
//     primaryDistrict: professional.primaryDistrict,
//     secondaryDistricts: professional.secondaryDistricts ?? [],
//     travelRadius: professional.travelRadius,
//     bio: professional.bio,
//   };
//
//   // fd.append("data", dataBlob);
//   fd.append(
//     "data",
//     new Blob([JSON.stringify(payload)], {
//       type: "application/json",
//     }),
//   );
//   console.log(payload, "blob");
//   // Mandatory files
//   if (kyc.citizenshipFront) fd.append("citizenshipFront", kyc.citizenshipFront);
//   if (kyc.citizenshipBack) fd.append("citizenshipBack", kyc.citizenshipBack);
//   if (kyc.photo) fd.append("photo", kyc.photo);
//
//   // Optional files
//   if (kyc.pan) fd.append("pan", kyc.pan);
//   if (kyc.professional?.length) {
//     kyc.professional.forEach((f) => fd.append("professionalCerts", f));
//   }
//
//   return fd;
// }
//
// // ─── Main component ───────────────────────────────────────────────────────────
//
// export function ReviewDone({
//   allData,
//   providerToken,
//   onSubmitSuccess,
//   onBack,
//   onGoToStep,
// }: ReviewDoneProps) {
//   const personal = allData.personal ?? {};
//   const professional = allData.professional ?? {};
//   const kyc = allData.kyc ?? {};
//
//   // Each term tracked individually
//   const [agreed, setAgreed] = useState<Record<string, boolean>>(
//     Object.fromEntries(TERMS.map((t) => [t.id, false])),
//   );
//   const [submitError, setSubmitError] = useState("");
//   const [submitting, setSubmitting] = useState(false);
//
//   const allAgreed = TERMS.every((t) => agreed[t.id]);
//
//   const toggleTerm = (id: string) =>
//     setAgreed((prev) => ({ ...prev, [id]: !prev[id] }));
//
//   const addr = personal.currentAddress ?? {};
//   const address = [
//     addr.tole,
//     addr.municipality,
//     addr.ward ? `Ward ${addr.ward}` : "",
//     addr.district,
//     addr.province,
//   ]
//     .filter(Boolean)
//     .join(", ");
//
//   // ── Submit ─────────────────────────────────────────────────────────────────
//   const handleSubmit = async () => {
//     if (!allAgreed) {
//       setSubmitError("Please agree to all terms before submitting.");
//       return;
//     }
//
//     // Validate required files present
//     if (!kyc.citizenshipFront || !kyc.citizenshipBack || !kyc.photo) {
//       setSubmitError(
//         "Missing required documents (citizenship + photo). Please go back to Step 3.",
//       );
//       return;
//     }
//
//     console.log(allData, "ja");
//     console.log(providerToken, "j5a");
//     setSubmitError("");
//     setSubmitting(true);
//     try {
//       const fd = buildFormData(allData);
//       await kycApi.submitKyc(fd, providerToken);
//       onSubmitSuccess?.();
//     } catch (err: any) {
//       setSubmitError(err?.message ?? "Submission failed. Please try again.");
//     } finally {
//       setSubmitting(false);
//     }
//   };
//
//   return (
//     <div className="w-full">
//       {/* Header */}
//       <div className="text-center mb-8">
//         <CheckCircle2 className="w-12 h-12 text-[#e8683f] mx-auto mb-3" />
//         <h1 className="text-2xl font-bold text-gray-900">
//           Review Your Details
//         </h1>
//         <p className="text-sm text-stone-500">
//           Confirm everything before submitting
//         </p>
//       </div>
//
//       <div className="flex flex-col gap-4">
//         {/* Personal */}
//         <Section title="Personal Info" onEdit={() => onGoToStep?.(1)}>
//           <Row label="Name" value={personal.fullName} />
//           <Row label="DOB" value={personal.dob} />
//           <Row label="Gender" value={personal.gender} />
//           <Row label="Phone" value={personal.phone} />
//           <Row label="Email" value={personal.email} />
//           <Row label="Address" value={address} />
//         </Section>
//
//         {/* Professional */}
//         <Section title="Professional" onEdit={() => onGoToStep?.(2)}>
//           <Row label="Primary Service" value={professional.primaryService} />
//           <Row
//             label="Experience"
//             value={
//               professional.experienceYears
//                 ? `${professional.experienceYears} years`
//                 : ""
//             }
//           />
//           <Row label="District" value={professional.primaryDistrict} />
//           <Row
//             label="Additional Services"
//             value={professional.additionalServices?.join(", ")}
//           />
//           <Row label="Bio" value={professional.bio || "Not provided"} />
//         </Section>
//
//         {/* KYC Documents */}
//         <Section title="KYC Documents" onEdit={() => onGoToStep?.(3)}>
//           <Row
//             label="Citizenship Front"
//             value={kyc.citizenshipFront ? "✓ Uploaded" : "⚠ Missing"}
//           />
//           <Row
//             label="Citizenship Back"
//             value={kyc.citizenshipBack ? "✓ Uploaded" : "⚠ Missing"}
//           />
//           <Row label="Photo" value={kyc.photo ? "✓ Uploaded" : "⚠ Missing"} />
//           <Row label="PAN" value={kyc.pan ? "✓ Uploaded" : "Not provided"} />
//         </Section>
//
//         {/* Terms */}
//         <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
//           <h3 className="text-sm font-bold text-stone-700 mb-3">
//             ⚖️ Terms &amp; Agreements
//           </h3>
//           <div className="flex flex-col gap-2.5">
//             {TERMS.map((term) => (
//               <label
//                 key={term.id}
//                 className="flex items-start gap-2.5 cursor-pointer group"
//               >
//                 <input
//                   type="checkbox"
//                   id={`term-${term.id}`}
//                   checked={agreed[term.id]}
//                   onChange={() => toggleTerm(term.id)}
//                   className="mt-0.5 accent-amber-500 w-4 h-4 cursor-pointer"
//                 />
//                 <span
//                   className={`text-sm leading-snug transition-colors
//                   ${agreed[term.id] ? "text-stone-700 font-medium" : "text-stone-500"}`}
//                 >
//                   {term.label}
//                 </span>
//               </label>
//             ))}
//           </div>
//
//           {!allAgreed && (
//             <p className="text-xs text-[#d95a2f] mt-3 font-medium">
//               ↑ Please check all boxes to enable submission.
//             </p>
//           )}
//         </div>
//
//         {/* Submit error */}
//         {submitError && (
//           <div
//             role="alert"
//             className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
//           >
//             {submitError}
//           </div>
//         )}
//
//         {/* Actions */}
//         <div className="flex justify-between pt-2">
//           <button
//             onClick={onBack}
//             disabled={submitting}
//             className="flex items-center gap-2 px-5 py-2.5 border border-stone-300
//               rounded-xl text-stone-600 hover:bg-stone-50 transition disabled:opacity-50"
//           >
//             <ArrowLeft className="w-4 h-4" /> Back
//           </button>
//
//           <button
//             onClick={handleSubmit}
//             disabled={submitting || !allAgreed}
//             aria-busy={submitting}
//             className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold
//               transition-all duration-200
//               ${
//                 submitting || !allAgreed
//                   ? "bg-gray-200 text-gray-400 cursor-not-allowed"
//                   : "bg-[#e8683f] text-white hover:bg-[#d95a2f] active:scale-[0.98] shadow-md"
//               }`}
//           >
//             {submitting ? (
//               <>
//                 <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
//               </>
//             ) : (
//               <>
//                 Submit Application <ArrowRight className="w-4 h-4" />
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client";

import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Edit3,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { kycApi } from "@/lib/api/kycApi";

// ─── Types ────────────────────────────────────────────────────────────────────

type Address = {
  tole?: string;
  municipality?: string;
  ward?: string;
  district?: string;
  province?: string;
};

type Personal = {
  fullName?: string;
  dob?: string;
  gender?: string;
  phone?: string;
  email?: string;
  currentAddress?: Address;
};

type Professional = {
  primaryService?: string;
  otherService?: string;
  additionalServices?: string[];
  experienceYears?: number;
  primaryDistrict?: string;
  secondaryDistricts?: string[];
  travelRadius?: string;
  bio?: string;
};

type KYC = {
  citizenshipFront?: File | null;
  citizenshipBack?: File | null;
  pan?: File | null;
  professional?: File[];
  photo?: File | null;
};

type AllData = {
  personal?: Personal;
  professional?: Professional;
  kyc?: KYC;
};

// interface ReviewDoneProps {
//   allData: AllData;
//   onSubmitSuccess?: (token?: string) => void; // token returned from API
//   onBack?: () => void;
//   onGoToStep?: (step: number) => void;
// }

interface ReviewDoneProps {
  allData: AllData;
  onSubmitSuccess?: () => void;  // no token param
  onBack?: () => void;
  onGoToStep?: (step: number) => void;
}

// ─── Terms ────────────────────────────────────────────────────────────────────

const TERMS = [
  { id: "tos", label: "I agree to ServiceLink Terms of Service" },
  { id: "privacy", label: "I agree to Privacy Policy & Data Protection" },
  { id: "accurate", label: "I confirm all information is accurate and truthful" },
  { id: "background", label: "I consent to background verification" },
  { id: "video", label: "I agree to video call verification (if required)" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
      <div className="flex justify-between py-2 border-b border-stone-100 last:border-0">
      <span className="text-xs font-semibold text-stone-400 uppercase w-40 shrink-0">
        {label}
      </span>
        <span className="text-sm font-medium text-stone-700 text-right">
        {value}
      </span>
      </div>
  );
}

function Section({
                   title,
                   onEdit,
                   children,
                 }: {
  title: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
      <div className="bg-stone-50 border border-stone-200 rounded-xl overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 bg-white border-b">
          <h3 className="text-sm font-bold text-stone-700">{title}</h3>
          {onEdit && (
              <button
                  type="button"
                  onClick={onEdit}
                  className="flex items-center gap-1 text-xs text-[#d95a2f] hover:text-[#d95a2f]"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit
              </button>
          )}
        </div>
        <div className="px-4">{children}</div>
      </div>
  );
}
function buildFormData(allData: AllData): FormData {
  const fd = new FormData();
  const { personal = {}, professional = {}, kyc = {} } = allData;

  // Normalize phone to E.164 (+977XXXXXXXXX), strip any accidental +977 prefix
  const normalizedPhone = personal.phone
      ? `+977${personal.phone.replace(/\s/g, "").replace(/^\+977/, "")}`
      : undefined;

  const payload = {
    applicantIdentifier: normalizedPhone ?? personal.email,
    fullName: personal.fullName,
    dob: personal.dob,
    gender: personal.gender,
    phone: normalizedPhone,
    email: personal.email,
    province: personal.currentAddress?.province,
    district: personal.currentAddress?.district,
    municipality: personal.currentAddress?.municipality,
    ward: personal.currentAddress?.ward,
    tole: personal.currentAddress?.tole,
    primaryService: professional.primaryService,
    otherService: professional.otherService,
    additionalServices: professional.additionalServices ?? [],
    experienceYears: professional.experienceYears,
    primaryDistrict: professional.primaryDistrict,
    secondaryDistricts: professional.secondaryDistricts ?? [],
    travelRadius: professional.travelRadius,
    bio: professional.bio,
  };

  fd.append("data", new Blob([JSON.stringify(payload)], { type: "application/json" }));

  if (kyc.citizenshipFront) fd.append("citizenshipFront", kyc.citizenshipFront);
  if (kyc.citizenshipBack) fd.append("citizenshipBack", kyc.citizenshipBack);
  if (kyc.photo) fd.append("photo", kyc.photo);
  if (kyc.pan) fd.append("pan", kyc.pan);
  if (kyc.professional?.length) {
    kyc.professional.forEach((f) => fd.append("professionalCerts", f));
  }

  return fd;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ReviewDone({
                             allData,
                             onSubmitSuccess,
                             onBack,
                             onGoToStep,
                           }: ReviewDoneProps) {
  const personal = allData.personal ?? {};
  const professional = allData.professional ?? {};
  const kyc = allData.kyc ?? {};

  const [agreed, setAgreed] = useState<Record<string, boolean>>(
      Object.fromEntries(TERMS.map((t) => [t.id, false])),
  );
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const allAgreed = TERMS.every((t) => agreed[t.id]);
  const toggleTerm = (id: string) =>
      setAgreed((prev) => ({ ...prev, [id]: !prev[id] }));

  const addr = personal.currentAddress ?? {};
  const address = [
    addr.tole,
    addr.municipality,
    addr.ward ? `Ward ${addr.ward}` : "",
    addr.district,
    addr.province,
  ]
      .filter(Boolean)
      .join(", ");

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!allAgreed) {
      setSubmitError("Please agree to all terms before submitting.");
      return;
    }
    if (!kyc.citizenshipFront || !kyc.citizenshipBack || !kyc.photo) {
      setSubmitError("Missing required documents (citizenship + photo). Please go back to Step 3.");
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    try {
      const fd = buildFormData(allData);
      await kycApi.submitKyc(fd);  // no token — public endpoint
      onSubmitSuccess?.();          // no token passed up either
    } catch (err: any) {
      setSubmitError(err?.message ?? "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="w-full">
        <div className="text-center mb-8">
          <CheckCircle2 className="w-12 h-12 text-[#e8683f] mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">Review Your Details</h1>
          <p className="text-sm text-stone-500">Confirm everything before submitting</p>
        </div>

        <div className="flex flex-col gap-4">
          <Section title="Personal Info" onEdit={() => onGoToStep?.(1)}>
            <Row label="Name" value={personal.fullName} />
            <Row label="DOB" value={personal.dob} />
            <Row label="Gender" value={personal.gender} />
            <Row label="Phone" value={personal.phone} />
            <Row label="Email" value={personal.email} />
            <Row label="Address" value={address} />
          </Section>

          <Section title="Professional" onEdit={() => onGoToStep?.(2)}>
            <Row label="Primary Service" value={professional.primaryService} />
            <Row
                label="Experience"
                value={professional.experienceYears ? `${professional.experienceYears} years` : ""}
            />
            <Row label="District" value={professional.primaryDistrict} />
            <Row label="Additional Services" value={professional.additionalServices?.join(", ")} />
            <Row label="Bio" value={professional.bio || "Not provided"} />
          </Section>

          <Section title="KYC Documents" onEdit={() => onGoToStep?.(3)}>
            <Row label="Citizenship Front" value={kyc.citizenshipFront ? "✓ Uploaded" : "⚠ Missing"} />
            <Row label="Citizenship Back" value={kyc.citizenshipBack ? "✓ Uploaded" : "⚠ Missing"} />
            <Row label="Photo" value={kyc.photo ? "✓ Uploaded" : "⚠ Missing"} />
            <Row label="PAN" value={kyc.pan ? "✓ Uploaded" : "Not provided"} />
          </Section>

          {/* Terms */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
            <h3 className="text-sm font-bold text-stone-700 mb-3">⚖️ Terms &amp; Agreements</h3>
            <div className="flex flex-col gap-2.5">
              {TERMS.map((term) => (
                  <label key={term.id} className="flex items-start gap-2.5 cursor-pointer group">
                    <input
                        type="checkbox"
                        checked={agreed[term.id]}
                        onChange={() => toggleTerm(term.id)}
                        className="mt-0.5 accent-amber-500 w-4 h-4 cursor-pointer"
                    />
                    <span
                        className={`text-sm leading-snug transition-colors
                    ${agreed[term.id] ? "text-stone-700 font-medium" : "text-stone-500"}`}
                    >
                  {term.label}
                </span>
                  </label>
              ))}
            </div>
            {!allAgreed && (
                <p className="text-xs text-[#d95a2f] mt-3 font-medium">
                  ↑ Please check all boxes to enable submission.
                </p>
            )}
          </div>

          {submitError && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {submitError}
              </div>
          )}

          <div className="flex justify-between pt-2">
            <button
                onClick={onBack}
                disabled={submitting}
                className="flex items-center gap-2 px-5 py-2.5 border border-stone-300
              rounded-xl text-stone-600 hover:bg-stone-50 transition disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button
                onClick={handleSubmit}
                disabled={submitting || !allAgreed}
                aria-busy={submitting}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold
              transition-all duration-200
              ${submitting || !allAgreed
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-[#e8683f] text-white hover:bg-[#d95a2f] active:scale-[0.98] shadow-md"
                }`}
            >
              {submitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
              ) : (
                  <>Submit Application <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
  );
}
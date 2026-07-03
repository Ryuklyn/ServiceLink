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
import type { KycSubmitResponse, KycSubmitPayload  } from "@/lib/api/kycApi";
import { toBackendServiceCategory } from "@/lib/constants/serviceCategory";

// ─── Types ──────────────────────────────────────────────────────────────────

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
  image?: string | null;
  photoConfirmed?: boolean;
};

type KYC = {
  citizenshipFront?: string | null;
  citizenshipBack?: string | null;
  pan?: string | null;
  professional?: string[];
  photo?: string | null;
};

type AllData = {
  personal?: Personal;
  professional?: Professional;
  kyc?: KYC;
};

interface ReviewDoneProps {
  allData: AllData;
  onSubmitSuccess?: (response?: KycSubmitResponse) => void;
  onBack?: () => void;
  onGoToStep?: (step: number) => void;
  draftSessionId?: string | null;
}

// ─── Terms ──────────────────────────────────────────────────────────────────

const TERMS = [
  { id: "tos", label: "I agree to ServiceLink Terms of Service" },
  { id: "privacy", label: "I agree to Privacy Policy & Data Protection" },
  { id: "accurate", label: "I confirm all information is accurate and truthful" },
  { id: "background", label: "I consent to background verification" },
  { id: "video", label: "I agree to video call verification (if required)" },
];

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }
  return "Submission failed. Please try again.";
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
      <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-stone-100 last:border-0 gap-0.5 sm:gap-2">
      <span className="text-[11px] sm:text-xs font-semibold text-stone-400 uppercase sm:w-40 shrink-0">
        {label}
      </span>
        <span className="text-sm font-medium text-stone-700 sm:text-right break-words">
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
                  className="flex items-center gap-1 text-xs text-[#d95a2f] hover:text-[#d95a2f] py-1 px-1"
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

// ─── Build FormData ─────────────────────────────────────────────────────────

function buildKycPayload(allData: AllData, draftSessionId?: string | null): KycSubmitPayload {
  const { personal = {}, professional = {}, kyc = {} } = allData;

  const normalizedPhone = personal.phone
      ? `+977${personal.phone.replace(/\s/g, "").replace(/^\+977/, "")}`
      : undefined;

  return {
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
    // primaryService: professional.primaryService,
    primaryService: toBackendServiceCategory(
        professional.primaryService
    ),
    otherService: professional.otherService,
    additionalServices: professional.additionalServices ?? [],
    experienceYears: professional.experienceYears,
    primaryDistrict: professional.primaryDistrict,
    secondaryDistricts: professional.secondaryDistricts ?? [],
    travelRadius: professional.travelRadius,
    bio: professional.bio,
    profilePhotoUrl: professional.image,
    citizenshipFrontUrl: kyc.citizenshipFront,
    citizenshipBackUrl: kyc.citizenshipBack,
    photoUrl: kyc.photo,
    panUrl: kyc.pan,
    professionalCertUrls: kyc.professional ?? [],
    draftSessionId,
  };
}
// ─── Main component ─────────────────────────────────────────────────────────

export function ReviewDone({
                             allData,
                             onSubmitSuccess,
                             onBack,
                             onGoToStep,
                             draftSessionId,
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
  const toggleTerm = (id: string) => setAgreed((prev) => ({ ...prev, [id]: !prev[id] }));

  const addr = personal.currentAddress ?? {};
  const address = [addr.tole, addr.municipality, addr.ward ? `Ward ${addr.ward}` : "", addr.district, addr.province]
      .filter(Boolean)
      .join(", ");

  // ── Submit ──────────────────────────────────────────────────────────────
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
      const payload = buildKycPayload(allData, draftSessionId);
      const res: KycSubmitResponse = await kycApi.submitKyc(payload);
      console.log("KYC submit response:", res);
      onSubmitSuccess?.(res);
    } catch (err: unknown) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="w-full pb-28 sm:pb-0">
        <div className="text-center mb-6 sm:mb-8">
          <CheckCircle2 className="w-11 h-11 sm:w-12 sm:h-12 text-[#e8683f] mx-auto mb-3" />
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Review Your Details</h1>
          <p className="text-xs sm:text-sm text-stone-500">Confirm everything before submitting</p>
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
            <Row label="Experience" value={professional.experienceYears ? `${professional.experienceYears} years` : ""} />
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
                        className="mt-0.5 accent-amber-500 w-4 h-4 cursor-pointer flex-shrink-0"
                    />
                    <span className={`text-sm leading-snug transition-colors ${agreed[term.id] ? "text-stone-700 font-medium" : "text-stone-500"}`}>
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

          {/* Actions — sticky on mobile */}
          <div
              className="
            fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-stone-100 p-4 flex gap-3
            sm:static sm:z-auto sm:bg-transparent sm:border-0 sm:p-0 sm:justify-between sm:pt-2
          "
          >
            <button
                onClick={onBack}
                disabled={submitting}
                className="flex items-center justify-center gap-2 px-5 py-3 sm:py-2.5 border border-stone-300
              rounded-xl text-stone-600 hover:bg-stone-50 transition disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <button
                onClick={handleSubmit}
                disabled={submitting || !allAgreed}
                aria-busy={submitting}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 rounded-xl font-semibold
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
